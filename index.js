const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); // Correct way to serve static files

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});
