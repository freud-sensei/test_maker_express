// 로딩창
const aiButton = document.querySelector("#aiButton");

aiButton.addEventListener("click", function (e) {
  this.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`;
});
