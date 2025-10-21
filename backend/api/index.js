const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("../config/db");
const postRoutes = require("../routes/posts");
const userRoutes = require("../routes/users");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../frontend")));
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Remove app.listen for Vercel
module.exports = app;
