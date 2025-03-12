const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const { Question, Exam } = require("./models/exam");

dbConnect().catch((err) => console.log(err));

async function dbConnect() {
  await mongoose.connect("mongodb://localhost:27017/exam-maker");
  console.log("Database Connected");
}

function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.redirect("/exams");
});

// READ -> 모의고사 목록
app.get("/exams", async (req, res) => {
  const exams = await Exam.find();
  exams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 내림차순 정렬
  res.render("exams/index", { exams, formatDate });
});

// UPDATE -> 모의고사 변경하기 form 제시
app.get("/exams/:id/modify", async (req, res) => {
  const { id } = req.params;
  // populate: id값을 이용해 Questions 모델에서 데이터를 한 번에 가져옴
  const exam = await Exam.findById(id).populate("questions");
  res.render("make/summary", { exam });
});

// READ -> 모의고사 채점 결과
// TODO
app.get("/exams/:id/results", async (req, res) => {});

// READ -> 각 모의고사 문제풀이
app.get("/exams/:id", async (req, res) => {
  const { id } = req.params;
  // populate: id값을 이용해 Questions 모델에서 데이터를 한 번에 가져옴
  const exam = await Exam.findById(id).populate("questions");
  res.render("exams/take", { exam });
});

// UPDATE -> 문제 변경하기 form 제시
app.get("/questions/:id/modify", async (req, res) => {});

// CREATE -> 모의고사 만들기
app.post("/exams/make", async (req, res) => {
  const newExam = new Exam(req.body);
  await newExam.save();
  res.redirect(`/exams/${newExam._id}/modify`);
});

// CREATE -> 문제 만들기
app.post("/exams/question", async (req, res) => {});

// READ -> 모의고사 채점 후 결과 보여주기
app.post("/exams/:id", async (req, res) => {
  const { id } = req.params;
  const exam = await Exam.findById(id).populate("questions");
  const report = {};
  let points = 0;

  for (let question of exam.questions) {
    const [key, value] = [question._id, req.body[question._id]];
    report[key] = value;
    if (req.body[key] === question.answer) {
      points++;
    }
  }

  // 세션은 아직 안 배웠으니까... 일단 여기서 바로 결과를 보여주는 걸로 하자.
  res.render("exams/result", { exam, report, points });
});

// UPDATE -> 모의고사 변경하기
app.put("/exams/:id/", async (req, res) => {
  const { id } = req.params;
  await Exam.findByIdAndUpdate(id, req.body);
  res.redirect("/exams");
});

// UPDATE -> 문제 변경하기

// DELETE -> 모의고사 삭제하기
app.delete("/exams/:id", async (req, res) => {
  const { id } = req.params;
  await Exam.findByIdAndDelete(id);
  res.redirect("/exams");
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
