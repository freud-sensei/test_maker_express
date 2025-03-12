const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { Question, Exam } = require("./models/exam");

dbConnect().catch((err) => console.log(err));

async function dbConnect() {
  await mongoose.connect("mongodb://localhost:27017/exam-maker");
  console.log("Database Connected");
}

const app = express();
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.redirect("/exams");
});

// READ -> 모의고사 목록
app.get("/exams", async (req, res) => {
  const exams = await Exam.find();
  res.render("exams/index", { exams });
});

// READ -> 각 모의고사 문제풀이
app.get("/exams/:id", async (req, res) => {
  const { id } = req.params;
  // populate: id값을 이용해 Questions 모델에서 데이터를 한 번에 가져옴
  const exam = await Exam.findById(id).populate("questions");
  res.render("exams/take", { exam });
});

// READ -> 모의고사 채점 후 결과 보여주기
app.post("/exams/:id", async (req, res) => {
  const { id } = req.params;
  const report = {};
  console.log(req.body);
  const questions = [];

  // 정답, 오답 여부를 report 객체에 저장
  // TODO 1 - Promise.all()로 개선
  for (let [key, value] of Object.entries(req.body)) {
    const question = await Question.findById(key);
    if (value === question.answer) {
      report[key] = { correct: true, chosenAnswer: value };
    } else {
      report[key] = { correct: false, chosenAnswer: value };
    }
  }

  // 세션은 아직 안 배웠으니까... 일단 여기서 바로 결과를 보여주는 걸로 하자.
  res.render("exams/result", { report });

  // TODO 2 - report 보여주기
  // res.send(report);
});

// READ -> 모의고사 채점 결과
app.get("/exams/:id/results", async (req, res) => {});

// CREATE -> 모의고사 만들기 form 제시
app.get("/exams/make", async (req, res) => {});

// CREATE -> 모의고사 만들기
app.post("/exams", async (req, res) => {});

// UPDATE -> 모의고사 변경하기 form 제시
app.get("/exams/:id/modify", async (req, res) => {});

// UPDATE -> 모의고사 변경하기
app.put("/exams/:id", async (req, res) => {});

// DELETE -> 모의고사 삭제하기
app.delete("/exams/:id", async (req, res) => {});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
