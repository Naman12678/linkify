import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { customAlphabet } from "nanoid";
import QRCode from "qrcode";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const jwtSecret = process.env.JWT_SECRET || "supersecretjwtkey";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 7);

app.use(cors({
  origin: "https://linkify-xi.vercel.app",
  //origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// --- Schemas ---
// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// URL schema
const urlSchema = new mongoose.Schema({
  shortCode: { type: String, required: true, unique: true },
  longUrl: { type: String, required: true },
  shortUrl: { type: String, required: true }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  clickDetails: [
    {
      ipAddress: String,
      userAgent: String,
      referrer: String,
      accessedAt: { type: Date, default: Date.now },
    },
  ],
});

const URL = mongoose.model("URL", urlSchema);

// --- Middleware ---
// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// --- Routes ---
// Health check
app.get("/", (req, res) => res.send("Welcome to Linkify! Shorten your URLs here."));

// Auth routes
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists with that email" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ email, passwordHash });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, {
      expiresIn: "7d",
    });

    res.json({ token, email: user.email });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, {
      expiresIn: "7d",
    });

    res.json({ token, email: user.email });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// URL routes
app.post("/shorten", authMiddleware, async (req, res) => {
  try {
    const { longUrl, customCode, expiresAt } = req.body;
    const userId = req.user.userId;

    if (!longUrl) return res.status(400).json({ error: "URL is required" });

    let shortCode = customCode || nanoid();

    if (customCode) {
      const exists = await URL.findOne({ shortCode });
      if (exists)
        return res.status(400).json({ error: "Custom code already in use" });
    }

    const shortUrl = `${backendUrl}/${shortCode}`;
    const newUrl = new URL({
      longUrl,
      shortCode,
      shortUrl,
      userId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    await newUrl.save();

    const qrCode = await QRCode.toDataURL(shortUrl);

    res.json({ shortUrl, qrCode });
  } catch (err) {
    console.error("Shorten error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const url = await URL.findOne({ shortCode });
    if (!url) return res.status(404).json({ error: "Short URL not found" });

    if (url.expiresAt && new Date() > url.expiresAt)
      return res.status(410).json({ error: "This URL has expired" });

    url.clicks += 1;
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const referrer = req.headers["referer"] || "Direct";

    url.clickDetails.push({ ipAddress, userAgent, referrer });
    await url.save();

    res.redirect(url.longUrl);
  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/:shortCode/analytics", authMiddleware, async (req, res) => {
  const { shortCode } = req.params;
  const userId = req.user.userId;
  const { timeRange = 'all' } = req.query;

  try {
    const url = await URL.findOne({ shortCode });

    if (!url) return res.status(404).json({ error: "URL not found" });
    if (url.userId.toString() !== userId)
      return res.status(403).json({ error: "Forbidden: You do not own this URL" });

    // Filter click details based on time range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const filteredClicks = url.clickDetails.filter(click => 
      new Date(click.accessedAt) >= startDate
    );

    // Process analytics data
    const analytics = processAnalyticsData(filteredClicks, url);

    res.json({
      shortCode: url.shortCode,
      longUrl: url.longUrl,
      totalClicks: url.clicks,
      filteredClicks: filteredClicks.length,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      timeRange,
      ...analytics
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Helper function to process analytics data
function processAnalyticsData(clickDetails, url) {
  if (!clickDetails || clickDetails.length === 0) {
    return {
      dailyClicks: [],
      hourlyClicks: [],
      topReferrers: [],
      topCountries: [],
      topDevices: [],
      topBrowsers: [],
      topOperatingSystems: []
    };
  }

  // Daily clicks over time
  const dailyClicks = generateDailyClicks(clickDetails);
  
  // Hourly distribution
  const hourlyClicks = generateHourlyDistribution(clickDetails);
  
  // Top referrers
  const topReferrers = generateTopReferrers(clickDetails);
  
  // Geographic data (basic IP analysis)
  const topCountries = generateTopCountries(clickDetails);
  
  // Device/Browser analysis
  const deviceData = analyzeUserAgents(clickDetails);
  
  return {
    dailyClicks,
    hourlyClicks,
    topReferrers,
    topCountries,
    topDevices: deviceData.devices,
    topBrowsers: deviceData.browsers,
    topOperatingSystems: deviceData.os
  };
}

function generateDailyClicks(clickDetails) {
  const dailyData = {};
  
  clickDetails.forEach(click => {
    const date = new Date(click.accessedAt).toISOString().split('T')[0];
    dailyData[date] = (dailyData[date] || 0) + 1;
  });
  
  // Convert to array format for charts
  return Object.entries(dailyData)
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function generateHourlyDistribution(clickDetails) {
  const hourlyData = Array(24).fill(0);
  
  clickDetails.forEach(click => {
    const hour = new Date(click.accessedAt).getHours();
    hourlyData[hour]++;
  });
  
  return hourlyData.map((clicks, hour) => ({ hour, clicks }));
}

function generateTopReferrers(clickDetails) {
  const referrerCounts = {};
  
  clickDetails.forEach(click => {
    let referrer = click.referrer || 'Direct';
    
    // Clean up referrer URLs
    if (referrer !== 'Direct' && referrer !== 'Unknown') {
      try {
        const url = new URL(referrer);
        referrer = url.hostname;
      } catch {
        // Keep original if URL parsing fails
      }
    }
    
    referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
  });
  
  return Object.entries(referrerCounts)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function generateTopCountries(clickDetails) {
  // Simple IP-based country detection (you can enhance this with a GeoIP service)
  const countryCounts = {};
  
  clickDetails.forEach(click => {
    // This is a simplified approach - in production, use a proper GeoIP service
    let country = 'Unknown';
    const ip = click.ipAddress;
    
    if (ip) {
      // Basic IP range detection (you should replace this with proper GeoIP)
      if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        country = 'Local Network';
      } else {
        country = 'International'; // Placeholder
      }
    }
    
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  
  return Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function analyzeUserAgents(clickDetails) {
  const devices = {};
  const browsers = {};
  const operatingSystems = {};
  
  clickDetails.forEach(click => {
    const userAgent = click.userAgent || '';
    
    // Device detection
    let device = 'Desktop';
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      if (/iPad/i.test(userAgent)) {
        device = 'Tablet';
      } else {
        device = 'Mobile';
      }
    }
    devices[device] = (devices[device] || 0) + 1;
    
    // Browser detection
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';
    browsers[browser] = (browsers[browser] || 0) + 1;
    
    // OS detection
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    operatingSystems[os] = (operatingSystems[os] || 0) + 1;
  });
  
  return {
    devices: Object.entries(devices)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count),
    browsers: Object.entries(browsers)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count),
    os: Object.entries(operatingSystems)
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count)
  };
}

app.delete("/:shortCode", authMiddleware, async (req, res) => {
  const { shortCode } = req.params;
  const userId = req.user.userId;

  try {
    const url = await URL.findOne({ shortCode });
    if (!url) return res.status(404).json({ error: "Short URL not found" });

    // Ensure the user owns the URL
    if (url.userId.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden: You do not own this URL" });
    }

    // Delete the URL
    await URL.deleteOne({ shortCode });
    res.json({ message: "URL deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/user/urls", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const urls = await URL.find({ userId });
    res.json({ urls });
  } catch (err) {
    console.error("Error fetching URLs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on ${backendUrl}`);
});
