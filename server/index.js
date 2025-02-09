import express from "express";
import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import cors from "cors";
import connectDB from "./db.js";
import dotenv from "dotenv";
import QRCode from "qrcode";

// Configure dotenv
dotenv.config();

const app = express();
const PORT = 5000;

// Enable CORS
app.use(
    cors({
        origin: `https://linkify-xi.vercel.app`,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

// Nano ID alphabet for custom short codes (alphanumeric, case-sensitive)
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 7);

// MongoDB Schema
const urlSchema = new mongoose.Schema({
    shortCode: { type: String, required: true, unique: true },
    longUrl: { type: String, required: true },
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

app.use(express.json());

// Connect to MongoDB
connectDB();

// Base route
app.get("/", (req, res) => {
    res.send("Hello User, Shorten your URL!");
});

// Endpoint to shorten the URL
app.post("/", async (req, res) => {
    try {
        const { longUrl, customCode, expiresAt } = req.body;

        if (!longUrl) {
            return res.status(400).json({ error: "URL is required" });
        }

        let shortCode;

        if (customCode) {
            const existingCode = await URL.findOne({ shortCode: customCode });

            if (existingCode) {
                const suggestions = Array.from({ length: 3 }, () => customCode + nanoid(3));
                return res.status(400).json({
                    error: "Custom short code already in use",
                    suggestions,
                });
            }

            shortCode = customCode;
        } else {
            shortCode = nanoid();
        }

        const newUrl = new URL({
            shortCode,
            longUrl,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        });

        await newUrl.save();

        const shortUrl = `${process.env.BACKEND_URL}/${shortCode}`;
        const qrCodeData = await QRCode.toDataURL(shortUrl);

        res.json({ shortUrl, qrCode: qrCodeData });
    } catch (error) {
        console.error("Error in /shorten endpoint:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to redirect to the original URL and increment analytics
app.get("/:shortCode", async (req, res) => {
    try {
        const { shortCode } = req.params;
        const url = await URL.findOne({ shortCode });

        if (!url) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        if (url.expiresAt && new Date() > url.expiresAt) {
            return res.status(410).json({ error: "This URL has expired." });
        }

        url.clicks += 1;
        const userAgent = req.headers["user-agent"];
        const referrer = req.headers["referer"] || "Direct";
        const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        url.clickDetails.push({ ipAddress, userAgent, referrer });
        await url.save();

        res.redirect(url.longUrl);
    } catch (error) {
        console.error("Error in redirect endpoint:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to fetch analytics for a short URL
app.get("/:shortCode/analytics", async (req, res) => {
    try {
        const { shortCode } = req.params;
        const url = await URL.findOne({ shortCode });

        if (!url) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        res.json({
            shortCode: url.shortCode,
            longUrl: url.longUrl,
            clicks: url.clicks,
            createdAt: url.createdAt,
            expiresAt: url.expiresAt,
            clickDetails: url.clickDetails,
        });
    } catch (error) {
        console.error("Error in analytics endpoint:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => console.log(`Server running on ${process.env.BACKEND_URL}`));
