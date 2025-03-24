const express = require("express");
const router = express.Router();
const { Exam, Report } = require("../models/exam");

function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

// READ -> 모의고사 목록
router.get("/", async (req, res, next) => {
  const exams = await Exam.find().sort({ createdAt: -1 });
  res.render("exams/index", { exams, formatDate });
});

// READ -> 모의고사 결과 보여주기
router.get("/result/:id", async (req, res, next) => {
  const report = await Report.findById(req.params.id).populate({
    path: "exam",
    populate: { path: "questions" },
  });
  console.log(report);
  const { exam, selected, points } = report;
  console.log(exam.questions.entries());

  res.render("exams/result", { exam, selected, points });
});

// READ -> 각 모의고사 문제풀이
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  // populate: id값을 이용해 Questions 모델에서 데이터를 한 번에 가져옴
  const exam = await Exam.findById(id).populate("questions");
  res.render("exams/take", { exam });
});

// CREATE -> 모의고사 채점, 성적표 추가
router.post("/:id", async (req, res, next) => {
  const { id } = req.params;
  const exam = await Exam.findById(id).populate("questions");
  const selected = {};
  let points = 0;

  for (let question of exam.questions) {
    const [key, value] = [question._id, req.body[question._id]];
    selected[key] = value;
    if (req.body[key] === question.answer) {
      points++;
    }
  }

  const result = await Report.insertOne({ exam, selected, points });
  res.redirect(`/exams/result/${result._id}`);
});

module.exports = router;
