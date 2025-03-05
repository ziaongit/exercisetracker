const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
require("./db");

const app = express();

app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

const mongoose = require("mongoose");

app.get("/check-db", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ message: "✅ MongoDB connected", collections });
  } catch (error) {
    res.status(500).json({ message: "❌ MongoDB connection error", error });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});
