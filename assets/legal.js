(function () {
  "use strict";

  function applyLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-tr]").forEach(function (node) {
      var value = lang === "en" ? node.getAttribute("data-en") : node.getAttribute("data-tr");
      if (value) {
        node.textContent = value;
      }
    });
    var toggle = document.getElementById("legal-lang-toggle");
    if (toggle) {
      toggle.textContent = lang === "en" ? "TR" : "EN";
    }
  }

  window.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("legal-lang-toggle");
    var current = "tr";
    if (toggle) {
      toggle.addEventListener("click", function () {
        current = current === "tr" ? "en" : "tr";
        applyLang(current);
      });
    }
  });
})();
