const express = require("express");
const router = express.Router();
const { Exam, Question } = require("../models/exam");
const { readTxt, aiMakeQuiz } = require("../aiMakeQuiz");

// UPDATE -> 모의고사 변경하기 form 제시
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  // populate: id값을 이용해 Questions 모델에서 데이터를 한 번에 가져옴
  const exam = await Exam.findById(id).populate("questions");
  res.render("make/summary", { exam });
});

// CREATE -> 모의고사 만들기
router.post("/", async (req, res, next) => {
  const newExam = new Exam(req.body);
  await newExam.save();
  res.redirect(`/make/${newExam._id}`);
});

// CREATE -> 문제 만들기
router.post("/:id", async (req, res, next) => {
  const { id } = req.params;
  const newQuestion = new Question(req.body);
  await newQuestion.save();
  const exam = await Exam.findById(id);
  exam.questions.push(newQuestion._id);
  await exam.save();
  res.redirect(`/make/${id}`);
});

// CREATE -> AI 문제 생성 (aigen)
router.post("/:id/aigen", async (req, res, next) => {
  const { id } = req.params;
  console.log(req.body);
  const aiQuestions = await aiMakeQuiz(req.body);
  const newQuestions = await Question.insertMany(aiQuestions);

  // 질문의 id만 추출
  const questionIds = newQuestions.map((q) => q._id);

  // 그리고 exam에 넣어주기
  const exam = await Exam.findById(id);
  exam.questions.push(...questionIds);

  // 그리고 exam에 id로 지정도 해야겠지
  await exam.save();
  res.redirect(`/make/${id}`);
});

// UPDATE -> 문제 변경하기
router.put("/:id/q/:q_id", async (req, res, next) => {
  const { id, q_id } = req.params;
  await Question.findByIdAndUpdate(q_id, req.body);
  res.redirect(`/make/${id}`);
});

// UPDATE -> 모의고사 변경하기
router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  await Exam.findByIdAndUpdate(id, req.body);
  res.redirect(`/make/${id}`);
});

// DELETE -> 문제 삭제하기
router.delete("/:id/q/:q_id", async (req, res, next) => {
  const { id, q_id } = req.params;
  await Question.findByIdAndDelete(q_id);
  // 모의고사의 questions 배열에서도 연쇄 삭제
  await Exam.findByIdAndUpdate(id, { $pull: { questions: q_id } });
  res.redirect(`/make/${id}`);
});

// DELETE -> 모의고사 삭제하기
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const exam = await Exam.findByIdAndDelete(id);
  // 모의고사의 questions 배열에 있던 문제들도 연쇄 삭제
  await Question.deleteMany({ _id: { $in: exam.questions } });
  res.redirect("/exams");
});

module.exports = router;
