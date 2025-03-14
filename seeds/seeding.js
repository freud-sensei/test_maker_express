const mongoose = require("mongoose");
const { Question, Exam } = require("../models/exam.js");
const { questionArray } = require("./questionArray.js");

dbConnect().catch((err) => console.log(err));

async function dbConnect() {
  await mongoose.connect("mongodb://localhost:27017/exam-maker");
  console.log("Database Connected");
}

async function seedDB() {
  await Exam.deleteMany({});
  await Question.deleteMany({});

  // 각 문제를 비동기로 데이터베이스에 저장하되,
  // Promise.all() 사용해 모두 처리되기 전엔 안 넘어가도록 함.
  const questions = await Promise.all(
    questionArray.map((q, order) => {
      return new Question({
        ...q,
        order,
        questionNo: `q_${(order % 3) + 1}`,
      }).save();
    })
  );

  // 비동기 순서 꼬이는 문제 -> order 필드 순서대로 정렬
  questions.sort((a, b) => Number(a.order) - Number(b.order));
  console.log(questions);

  // 자동 생성된 id의 배열
  const questionIds = questions.map((q) => q._id);

  const examArray = [];

  for (let i = 1; i <= 3; i++) {
    examArray.push({
      title: `송상록 고사 ${i}`,
      createdBy: "송상록",
      questions: questionIds.slice(3 * (i - 1), 3 * i),
    });
  }

  // 각 모의고사를 비동기로 데이터베이스에 저장하되,
  // Promise.all() 사용해 모두 처리되기 전엔 안 넘어가도록 함.
  await Promise.all(
    examArray.map((m) => {
      return new Exam(m).save();
    })
  );

  console.log("데이터 시딩 완료");
}

seedDB()
  .then(() => mongoose.connection.close())
  .catch((e) => console.error("시딩 오류: ", e));
