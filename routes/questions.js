const express = require("express");
const router = express.Router({ mergeParams: true });
const { Exam, Question } = require("../models/exam");
const { isLoggedIn } = require("../middleware");

// UPDATE -> 문제 변경하기
router.put("/:q_id", isLoggedIn, async (req, res, next) => {
  const { id, q_id } = req.params;
  await Question.findByIdAndUpdate(q_id, req.body);
  req.flash("success", `문제 변경 완료!`);
  res.redirect(`/make/${id}`);
});

// DELETE -> 문제 삭제하기
router.delete("/:q_id", isLoggedIn, async (req, res, next) => {
  const { id, q_id } = req.params;
  await Question.findByIdAndDelete(q_id);
  // 모의고사의 questions 배열에서도 연쇄 삭제
  await Exam.findByIdAndUpdate(id, { $pull: { questions: q_id } });
  req.flash("success", `문제 삭제 완료!`);
  res.redirect(`/make/${id}`);
});

module.exports = router;
