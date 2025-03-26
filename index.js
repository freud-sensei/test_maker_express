const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("passport-local");
const examsRoutes = require("./routes/exams");
const makeRoutes = require("./routes/make");
const usersRoutes = require("./routes/users");
const reportsRoutes = require("./routes/reports");
const questionsRoutes = require("./routes/questions");
const { User } = require("./models/exam");

const sessionOptions = {
  secret: "thisisnotagoodsecret",
  resave: false, // 세션이 변경되지 않으면 저장하지 않음
  saveUninitialized: false, // 초기화되지 않은 세션은 저장하지 않음
  cookie: {
    // 프로덕션 환경에서만 secure true
    secure: process.env.NODE_ENV === "production",
    // JS에서 쿠키접근 금지
    httpOnly: true,
    // 3일 후 완료
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
  },
};

dbConnect().catch((err) => console.log(err));

async function dbConnect() {
  await mongoose.connect("mongodb://localhost:27017/exam-maker");
  console.log("Database Connected");
}

const app = express();

// 데이터 파싱
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// 경로 설정
app.use(express.static(path.join(__dirname, "static")));
app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist"))
);

// 세션, 플래시
app.use(session(sessionOptions));
app.use(flash());

// passport
app.use(passport.session()); // login session 관리
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser()); // 세선에 user data 저장
passport.deserializeUser(User.deserializeUser()); // 세션에서 user data 제거

// local data
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 라우터
app.use("/exams", examsRoutes);
app.use("/make", makeRoutes);
app.use("/make/:id/q", questionsRoutes);
app.use("/users", usersRoutes);
app.use("/reports", reportsRoutes);

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
