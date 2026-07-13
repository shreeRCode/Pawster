const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("../config/db");
const postRoutes = require("../routes/posts");
const userRoutes = require("../routes/users");

const app = express();

// Behind Vercel's proxy, trust the first hop so req.ip and the rate limiter
// use the real client IP from the X-Forwarded-For header.
app.set("trust proxy", 1);

connectDB();

// Security: set sensible HTTP response headers (X-Content-Type-Options,
// Strict-Transport-Security, X-Frame-Options, etc.). The API is consumed by a
// separate frontend origin, so allow cross-origin resource access.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(express.json());

// CORS configuration - Allow all Vercel deployments
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://pawster-tndx.vercel.app",
    ];

    // Allow any Vercel preview deployment URL for pawster
    const isVercelPreview =
      origin.includes("pawster-") && origin.includes("vercel.app");

    if (allowedOrigins.indexOf(origin) !== -1 || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Rate limiting: cap requests per IP to blunt brute-force / abuse.
// Note: the default in-memory store is per serverless instance; a real
// distributed deploy would use a shared store (e.g. Redis).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ status: "Pawster API is running 🐾" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
