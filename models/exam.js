const mongoose = require("mongoose");

// 유저 스키마
const userSchema = new mongoose.Schema({
  username: { type: String, required: true }, // ID
  password: { type: String, required: true, minLength: 8 }, // 비밀번호
  bio: { type: String }, // 자기소개
  exams: [{ type: mongoose.Schema.Types.ObjectID, ref: "Exam" }], // 시험지 배열,
});

// 문제 스키마
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true }, // 문제
  options: { type: [String], required: true }, // 선지
  answer: { type: String, required: true }, // 정답 선지 번호
  explanation: { type: String }, // 해설
  order: { type: Number }, // Seeding 시 문제 정렬을 위한 번호
});

// 모의고사 스키마
const examSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 모의고사 이름
  createdBy: { type: String, required: true }, // 만든 사람
  createdAt: { type: Date, default: Date.now }, // 생성일
  questions: [{ type: mongoose.Schema.Types.ObjectID, ref: "Question" }], // 문제 배열
});

// 성적표 스키마
const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectID, ref: "User" },
  exam: { type: mongoose.Schema.Types.ObjectID, ref: "Exam" },
  selected: { type: Map, of: String },
  points: { type: Number, default: 0 },
});

const Exam = mongoose.model("Exam", examSchema);
const Question = mongoose.model("Question", questionSchema);
const User = mongoose.model("User", userSchema);
const Report = mongoose.model("Report", reportSchema);

module.exports = { User, Question, Exam, Report };
