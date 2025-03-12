const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { Question, MockExam } = require("./models/exam");

dbConnect().catch((err) => console.log(err));

async function dbConnect() {
  await mongoose.connect("mongodb://localhost:27017/exam-maker");
  console.log("Database Connected");
}

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
