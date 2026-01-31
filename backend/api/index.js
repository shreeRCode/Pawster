const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../config/db");
const postRoutes = require("../routes/posts");
const userRoutes = require("../routes/users");

const app = express();

connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://pawster-2rfz.vercel.app"],
    // your actual frontend domain
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

module.exports = app;
