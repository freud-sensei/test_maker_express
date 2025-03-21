// 정말 ..하시겠습니까?
const forms = [
  {
    form: document.querySelector("#updateQuestionForm"),
    action: "수정",
  },
  {
    form: document.querySelector("#updateExamForm"),
    action: "수정",
  },
  {
    form: document.querySelector("#deleteQuestionForm"),
    action: "삭제",
  },
  {
    form: document.querySelector("#deleteExamForm"),
    action: "삭제",
  },
];
forms.forEach(({ form, action }) => {
  form.addEventListener("submit", function (e) {
    doubleCheck(e, action);
  });
});
// 확인 누를 때만 submit 진행
function doubleCheck(event, action) {
  const isConfirmed = confirm(`정말로 ${action}하시겠습니까?`);
  if (!isConfirmed) {
    event.preventDefault();
  }
}

// AI 문제 생성중...
document.querySelector("#aiForm").addEventListener("submit", function (e) {
  const alertPlaceholder = document.querySelector("#liveAlertPlaceholder");
  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-info alert-dismissible" role="alert">`,
    `   <div>AI로 문제 생성 중...</div>`,
    `<div class="spinner-grow d-inline" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`,
    "</div>",
  ].join("");
  alertPlaceholder.append(wrapper);
});

// 모달 처리
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("#updateQuestionModal");
  modal.addEventListener("show.bs.modal", (e) => {
    const button = e.relatedTarget; // modal을 띄운 버튼
    const question = JSON.parse(button.getAttribute("data-question"));
    const exam = JSON.parse(button.getAttribute("data-exam"));
    const q_index = JSON.parse(button.getAttribute("data-q_index"));

    // 제목 수정
    document.querySelector("#updateQuestionModalLabel").innerText = `문제 ${
      q_index + 1
    } 수정`;

    // Form 기본값 채우기
    document.querySelector("#question_update").value = question.question;

    for (let i = 0; i < 5; i++) {
      document
        .querySelector(`#options_${i}_update`)
        .setAttribute("value", question.options[i]);
      if (String(i) === question.answer) {
        document.querySelector(`#radio_${i}_update`).checked = true;
      }
    }

    document.querySelector("#explanation_update").value = question.explanation;

    // Form action 경로 채우기
    document
      .querySelector("#updateQuestionForm")
      .setAttribute(
        "action",
        `/exams/${exam._id}/q/${question._id}?_method=PUT`
      );

    document
      .querySelector("#deleteQuestionForm")
      .setAttribute(
        "action",
        `/exams/${exam._id}/q/${question._id}?_method=DELETE`
      );
  });
});
