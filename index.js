const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const { Question, Exam } = require("./models/exam");
const { readTxt, aiMakeQuiz } = require("./aiMakeQuiz");

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
app.use(express.static(path.join(__dirname, "static")));
app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist"))
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.redirect("/exams");
});

// READ -> 모의고사 목록
app.get("/exams", async (req, res) => {
  const exams = await Exam.find().sort({ createdAt: -1 });
  res.render("exams/index", { exams, formatDate });
});

// UPDATE -> 모의고사 변경하기 form 제시
app.get("/exams/:id/modify", async (req, res) => {
  const { id } = req.params;
  // populate: id값을 이용해 Questions 모델에서 데이터를 한 번에 가져옴
  const exam = await Exam.findById(id).populate("questions");
  res.render("make/summary", { exam });
});

// READ -> 각 모의고사 문제풀이
app.get("/exams/:id", async (req, res) => {
  const { id } = req.params;
  // populate: id값을 이용해 Questions 모델에서 데이터를 한 번에 가져옴
  const exam = await Exam.findById(id).populate("questions");
  res.render("exams/take", { exam });
});

// UPDATE -> 문제 변경하기 form 제시
app.get("/exams/:id/q/modify", async (req, res) => {});

// CREATE -> 모의고사 만들기
app.post("/exams/make", async (req, res) => {
  const newExam = new Exam(req.body);
  await newExam.save();
  res.redirect(`/exams/${newExam._id}/modify`);
});

// CREATE -> 문제 만들기
app.post("/exams/:id/q/make", async (req, res) => {
  const { id } = req.params;
  const newQuestion = new Question(req.body);
  await newQuestion.save();
  const exam = await Exam.findById(id);
  exam.questions.push(newQuestion._id);
  await exam.save();
  res.redirect(`/exams/${id}/modify`);
});

// CREATE -> AI 문제 생성 (aigen)
app.post("/exams/:id/q/aigen", async (req, res) => {
  const { id } = req.params;
  // req.body 사용하는 거 들어가야함
  const aiQuestions = await aiMakeQuiz("test", "Korean", 5);
  const newQuestions = await Question.insertMany(aiQuestions);

  // 질문의 id만 추출
  const questionIds = newQuestions.map((q) => q._id);

  // 그리고 exam에 넣어주기
  const exam = await Exam.findById(id);
  exam.questions.push(...questionIds);

  // 그리고 exam에 id로 지정도 해야겠지
  await exam.save();
  res.redirect(`/exams/${id}/modify`);
});

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
  res.render("exams/result", { exam, report, points });
});

// UPDATE -> 문제 변경하기
app.put("/exams/:id/q/:q_id", async (req, res) => {
  const { id, q_id } = req.params;
  await Question.findByIdAndUpdate(q_id, req.body);
  res.redirect(`/exams/${id}/modify`);
});

// UPDATE -> 모의고사 변경하기
app.put("/exams/:id/", async (req, res) => {
  const { id } = req.params;
  await Exam.findByIdAndUpdate(id, req.body);
  res.redirect(`/exams/${id}/modify`);
});

// DELETE -> 문제 삭제하기
app.delete("/exams/:id/q/:q_id", async (req, res) => {
  const { id, q_id } = req.params;
  const question = await Question.findByIdAndDelete(q_id);

  // 해당 question이 담긴 Exam에서도 삭제해 줘야 함
  // length 계산 오류를 막기 위함
  if (question) {
    // 해당 Exam에서 해당 question을 삭제
    await Exam.updateMany(
      { questions: q_id }, // 해당 question을 참조하는 모든 Exam을 찾음
      { $pull: { questions: q_id } } // question의 ID를 questions 배열에서 삭제
    );
  }

  res.redirect(`/exams/${id}/modify`);
});

// DELETE -> 모의고사 삭제하기
app.delete("/exams/:id", async (req, res) => {
  const { id } = req.params;
  await Exam.findByIdAndDelete(id);
  res.redirect("/exams");
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
