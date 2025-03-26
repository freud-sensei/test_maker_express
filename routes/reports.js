const express = require("express");
const router = express.Router();
const { Report } = require("../models/exam");

// READ -> 모의고사 결과 보여주기
router.get("/:id", async (req, res, next) => {
  const report = await Report.findById(req.params.id)
    .populate({
      path: "exam",
      populate: { path: "questions" },
    })
    .populate("user");
  console.log(report);
  res.render("reports/show", { report });
});

module.exports = router;
