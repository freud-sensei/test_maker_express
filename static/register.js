const form = document.querySelector("#registerForm");

const dupCheck = async function () {
  const username = document.querySelector("#username");
  const nickname = document.querySelector("#nickname");
  const password = document.querySelector("#password");
  const rePassword = document.querySelector("#rePassword");

  if (password.value !== rePassword.value) {
    rePassword.setCustomValidity("비밀번호가 일치하지 않습니다.");
  } else {
    rePassword.setCustomValidity("");
  }

  try {
    response = await axios.post("/users/dupCheck", {
      username: username.value,
      nickname: nickname.value,
    });
    const { user_msg, nick_msg } = response.data;
    username.setCustomValidity(user_msg);
    nickname.setCustomValidity(nick_msg);
  } catch (error) {
    username.setCustomValidity("입력 ID에 오류가 있습니다.");
    nickname.setCustomValidity("입력 닉네임에 오류가 있습니다.");
  }

  form.requestSubmit();
};

form.addEventListener("submit", (event) => {
  if (!form.checkValidity()) {
    form.querySelectorAll("input, textarea").forEach((elem) => {
      if (!elem.checkValidity()) {
        elem.classList.add("is-invalid");
        elem.parentElement.querySelector(".invalid-feedback").innerText =
          elem.validationMessage;
      } else {
        elem.classList.remove("is-invalid");
      }
    });
    event.preventDefault();
    event.stopPropagation();
  }
});
