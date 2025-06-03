import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { customAlphabet } from "nanoid";
import QRCode from "qrcode";
import { createClient } from "redis";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const jwtSecret = process.env.JWT_SECRET || "supersecretjwtkey";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 7);

// Redis setup
//const redisClient = createClient();
//redisClient.on("error", (err) => console.error("Redis error:", err));
//await redisClient.connect();

app.use(cors({
  origin: "https://linkify-xi.vercel.app",
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

// User schema for auth
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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link URL to user
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

// Auth middleware to protect routes and get user from JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // { userId, email }
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// --- Routes ---

// Health check
app.get("/", (req, res) => res.send("Welcome to Linkify! Shorten your URLs here."));

// --- Auth Routes ---

// Register new user
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

    // Create JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, {
      expiresIn: "7d",
    });

    res.json({ token, email: user.email });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login user
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

// --- URL Routes ---

// Shorten URL (Authenticated route)
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

    const newUrl = new URL({
      longUrl,
      shortCode,
      userId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    await newUrl.save();

    const shortUrl = `${backendUrl}/${shortCode}`;
    const qrCode = await QRCode.toDataURL(shortUrl);

    res.json({ shortUrl, qrCode });
  } catch (err) {
    console.error("Shorten error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Redirect URL (public)
app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const cachedUrl = await redisClient.get(shortCode);
    if (cachedUrl) return res.redirect(cachedUrl);

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

    await redisClient.set(shortCode, url.longUrl, { EX: 3600 });

    res.redirect(url.longUrl);
  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Analytics (Authenticated route)
app.get("/:shortCode/analytics", authMiddleware, async (req, res) => {
  const { shortCode } = req.params;
  const userId = req.user.userId;

  try {
    const url = await URL.findOne({ shortCode });

    if (!url) return res.status(404).json({ error: "URL not found" });
    if (url.userId.toString() !== userId)
      return res.status(403).json({ error: "Forbidden: You do not own this URL" });

    res.json({
      shortCode: url.shortCode,
      longUrl: url.longUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      clickDetails: url.clickDetails,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Add to URL Routes ---
// Fetch all URLs for the authenticated user
app.get("/user/urls", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from auth middleware

    // Fetch URLs linked to the user
    const userUrls = await URL.find({ userId }).sort({ createdAt: -1 });

    res.json({ urls: userUrls });
  } catch (err) {
    console.error("Error fetching user URLs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on ${backendUrl}`);
});
