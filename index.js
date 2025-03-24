const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const examsRoutes = require("./routes/exams");
const makeRoutes = require("./routes/make");
const userRoutes = require("./routes/user");
const questionsRoutes = require("./routes/questions");

const sessionOptions = {
  secret: "thisisnotagoodsecret",
  resave: false, // 세션이 변경되지 않으면 저장하지 않음
  saveUninitialized: false, // 초기화되지 않은 세션은 저장하지 않음
  cookie: { secure: false }, // HTTPS에서만 세션쿠키를 보냄
};

dbConnect().catch((err) => console.log(err));

async function dbConnect() {
  await mongoose.connect("mongodb://localhost:27017/exam-maker");
  console.log("Database Connected");
}

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "static")));
app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist"))
);
app.use(session(sessionOptions));
app.use(flash());
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 플래시
app.use((req, res, next) => {
  res.locals.messages = req.flash("success");
  next();
});

// 라우터
app.use("/exams", examsRoutes);
app.use("/make", makeRoutes);
app.use("/make/:id/q", questionsRoutes);
app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.redirect("/exams");
});

// 404에러 라우트
app.all("*all", (req, res, next) => {
  const err = new Error(`페이지를 찾을 수 없습니다.`);
  err.statusCode = 404;
  throw err;
});

// 에러 처리
app.use((err, req, res, next) => {
  if (!err.message) {
    err.message = "Something went wrong!";
  }
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  console.log(err);
  res.status(err.statusCode).render("error/error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
