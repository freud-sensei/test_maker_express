const mongoose = require("mongoose");

// 문제 스키마
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true }, // 문제
  options: { type: [String], required: true }, // 선지
  answer: { type: String, required: true }, // 정답 선지 번호
  explanation: { type: String }, // 해설
  exam: { type: mongoose.Schema.Types.ObjectID, ref: "Exam" },
  order: { type: Number }, // Seeding 시 문제 정렬을 위한 번호
});

// 모의고사 스키마
const examSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 모의고사 이름
  createdBy: { type: String, required: true }, // 만든 사람
  createdAt: { type: Date, default: Date.now }, // 생성일
  questions: [{ type: mongoose.Schema.Types.ObjectID, ref: "Question" }], // 문제 배열
});

const Question = mongoose.model("Question", questionSchema);

const Exam = mongoose.model("Exam", examSchema);
module.exports = { Question, Exam };
