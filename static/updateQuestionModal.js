// 우리가 리액트를 배워야 하는 이유

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
