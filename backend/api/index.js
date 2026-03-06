const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../config/db");
const postRoutes = require("../routes/posts");
const userRoutes = require("../routes/users");

const app = express();

connectDB();

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
