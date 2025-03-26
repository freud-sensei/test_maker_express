const express = require("express");
const router = express.Router();
const { Exam, Report, User } = require("../models/exam");

function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

// READ -> 모의고사 목록
router.get("/", async (req, res, next) => {
  let exams;
  if (req.session.exams) {
    exams = req.session.exams;
    delete req.session.exams;
  } else {
    exams = await Exam.find().sort({ createdAt: -1 });
  }
  res.render("exams/index", { exams, formatDate });
});

// READ -> search 기능
router.post("/search", async (req, res, next) => {
  const query = {};
  if (req.body.title) {
    query.title = { $regex: req.body.title, $options: "i" };
  }
  if (req.body.createdBy) {
    query.createdBy = { $regex: req.body.createdBy, $options: "i" };
  }
  const exams = await Exam.find(query).sort({ createdAt: -1 });
  req.session.exams = exams;
  res.redirect("/exams");
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

  const report = { exam, selected, points };

  if (res.locals.currentUser) {
    const user = await User.findOne({
      username: res.locals.currentUser.username,
    });
    report.user = user._id;
  }

  const result = await Report.insertOne(report);
  res.redirect(`/reports/${result._id}`);
});

module.exports = router;
