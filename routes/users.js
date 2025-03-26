const express = require("express");
const router = express.Router();
const passport = require("passport");
const { User } = require("../models/exam");
const { storeReturnTo } = require("../middleware");

// 로그인 창 (GET)
router.get("/login", (req, res) => {
  res.render("users/login");
});

// 로그인 (POST)
router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: "아이디나 비밀번호가 일치하지 않습니다.",
    failureRedirect: "/users/login",
  }),
  async (req, res, next) => {
    console.log(req.body);
    const result = await User.findOne({ username: req.body.username });
    req.flash("success", `안녕하세요, ${result.nickname}님!`);
    const redirectUrl = res.locals.returnTo || "/exams";
    res.redirect(redirectUrl);
  }
);

// 회원가입 창 (GET)
router.get("/register", (req, res) => {
  res.render("users/register");
});

// 회원가입 (POST)
router.post("/register", async (req, res, next) => {
  try {
    const { username, password, nickname, bio } = req.body;
    const user = new User({ nickname, bio, username });
    const registeredUser = await User.register(user, password); // 이 과정에서 hashing + salt 이루어짐

    // 회원가입 후 바로 로그인
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", `${nickname}님의 회원 가입이 완료됐습니다.`);
      res.redirect("/");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

// 로그아웃 (POST)
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash(
      "success",
      `${res.locals.currentUser.nickname}님의 계정이 로그아웃되었습니다.`
    );
    return res.redirect("/exams");
  });
});

// 중복 체크 (POST)
router.post("/dupcheck", async (req, res) => {
  try {
    const response = { user_msg: "", nick_msg: "" };
    const { username, nickname } = req.body;
    const [exists1, exists2] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ nickname }),
    ]);
    if (exists1) {
      response.user_msg = "동일 ID를 사용하는 계정이 있습니다.";
    }
    if (exists2) {
      response.nick_msg = "동일 닉네임을 사용하는 계정이 있습니다.";
    }
    res.send(response);
  } catch (e) {
    res.send({
      user_msg: "입력 ID에 오류가 있습니다.",
      nick_msg: "입력 닉네임에 오류가 있습니다.",
    });
  }
});

// 회원정보 수정 창 (GET)

// 회원정보 수정 (PUT)

// 회뭔 탈퇴 (DELETE)

module.exports = router;
