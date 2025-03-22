const express = require("express");
const router = express.Router();
const { Exam } = require("../models/exam");

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

// READ -> 각 모의고사 문제풀이
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  // populate: id값을 이용해 Questions 모델에서 데이터를 한 번에 가져옴
  const exam = await Exam.findById(id).populate("questions");
  res.render("exams/take", { exam });
});

// READ -> 모의고사 채점 후 결과 보여주기
router.post("/:id", async (req, res, next) => {
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
  res.render("exams/result", { exam, report, points });
});

module.exports = router;
