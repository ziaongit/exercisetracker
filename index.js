const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
app.use(cors());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://exercisetracker:exercisetracker@cluster0.0tjqf.mongodb.net/exercisetracker?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Check MongoDB connection status
app.get("/check-db", async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.json({ message: "✅ MongoDB is connected" });
  } else {
    return res.status(500).json({ message: "❌ MongoDB connection error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});
