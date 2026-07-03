(function () {
  var AUTH_KEY = "shinnan-auth-ok";
  var PASSWORD_HASH = "5521b06506cb99a39cefbe9a5016e470078047c72533e9e48b241f750e1d303b";

  function hex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(function (b) { return b.toString(16).padStart(2, "0"); })
      .join("");
  }

  async function sha256(value) {
    var data = new TextEncoder().encode(value);
    var digest = await crypto.subtle.digest("SHA-256", data);
    return hex(digest);
  }

  function unlock() {
    document.body.classList.remove("auth-pending");
    document.body.classList.add("auth-ready");
    var overlay = document.querySelector(".auth-overlay");
    if (overlay) overlay.remove();
  }

  function buildOverlay() {
    var overlay = document.createElement("div");
    overlay.className = "auth-overlay";
    overlay.innerHTML = [
      '<div class="auth-card">',
      '<h1>限定公開ページ</h1>',
      '<p>閲覧にはパスワードの入力が必要です。</p>',
      '<form class="auth-form">',
      '<label for="site-password">パスワード</label>',
      '<input id="site-password" name="site-password" type="password" autocomplete="current-password" />',
      '<button class="auth-submit" type="submit">ページを見る</button>',
      '<div class="auth-error" aria-live="polite"></div>',
      '</form>',
      '</div>'
    ].join("");

    var form = overlay.querySelector(".auth-form");
    var input = overlay.querySelector("#site-password");
    var error = overlay.querySelector(".auth-error");

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      error.textContent = "";
      var value = input.value.trim();
      if (!value) {
        error.textContent = "パスワードを入力してください。";
        return;
      }

      var hash = await sha256(value);
      if (hash === PASSWORD_HASH) {
        sessionStorage.setItem(AUTH_KEY, "ok");
        unlock();
        return;
      }

      error.textContent = "パスワードが違います。";
      input.select();
    });

    document.body.appendChild(overlay);
    input.focus();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (sessionStorage.getItem(AUTH_KEY) === "ok") {
      unlock();
      return;
    }
    buildOverlay();
  });
})();
