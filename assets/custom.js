(function () {
  "use strict";

  function initRoiCalculator() {
    var hoursInput = document.getElementById("roi-hours");
    var rateInput = document.getElementById("roi-rate");
    var hoursValue = document.getElementById("roi-hours-value");
    var rateValue = document.getElementById("roi-rate-value");
    var monthlyEl = document.getElementById("roi-monthly");
    var yearlyEl = document.getElementById("roi-yearly");
    if (!hoursInput || !rateInput) {
      return;
    }

    function formatter() {
      var locale = document.documentElement.lang === "en" ? "en-US" : "tr-TR";
      return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    }

    function recalc() {
      var hours = parseInt(hoursInput.value, 10);
      var rate = parseInt(rateInput.value, 10);
      hoursValue.textContent = hours;
      rateValue.textContent = rate;
      var monthly = hours * 4.33 * rate;
      var yearly = monthly * 12;
      var fmt = formatter();
      monthlyEl.textContent = "₺" + fmt.format(Math.round(monthly));
      yearlyEl.textContent = "₺" + fmt.format(Math.round(yearly));
    }

    hoursInput.addEventListener("input", recalc);
    rateInput.addEventListener("input", recalc);
    recalc();
  }

  function initFaqAccordion() {
    var questions = document.querySelectorAll(".faq-question");
    questions.forEach(function (button) {
      button.addEventListener("click", function () {
        var item = button.closest(".faq-item");
        var answer = item.querySelector(".faq-answer");
        var isOpen = button.getAttribute("aria-expanded") === "true";

        document.querySelectorAll(".faq-question").forEach(function (otherButton) {
          if (otherButton === button) {
            return;
          }
          otherButton.setAttribute("aria-expanded", "false");
          var otherAnswer = otherButton.closest(".faq-item").querySelector(".faq-answer");
          otherAnswer.style.maxHeight = null;
        });

        button.setAttribute("aria-expanded", String(!isOpen));
        answer.style.maxHeight = isOpen ? null : answer.scrollHeight + "px";
      });
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    initRoiCalculator();
    initFaqAccordion();
  });
})();
