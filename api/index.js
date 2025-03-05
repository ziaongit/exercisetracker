const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../db"); // Import database connection

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON body
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data

// Connect to MongoDB
connectDB();

// User Schema & Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
});

const User = mongoose.model("User", userSchema);

// Exercise Schema & Model
const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

// ✅ API Route: Create a new user
app.post("/api/users", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const newUser = new User({ username });
    await newUser.save();

    res.json({ _id: newUser._id, username: newUser.username });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ API Route: Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "_id username");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ API Route: Add an exercise
app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    if (!description || !duration) {
      return res.status(400).json({ message: "Description and duration are required" });
    }

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const exercise = new Exercise({
      userId: _id,
      description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date(),
    });

    await exercise.save();

    res.json({
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ API Route: Get user's exercise log
app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let filter = { userId: _id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    let exercises = Exercise.find(filter).select("description duration date -_id");
    if (limit) exercises = exercises.limit(parseInt(limit));

    const log = await exercises.exec();

    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log: log.map((ex) => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString(),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "index.html"));
});

// ✅ Check MongoDB connection status
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
