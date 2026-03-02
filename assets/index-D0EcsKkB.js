(function () {
  const relList = document.createElement("link").relList;

  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }

  const processPreload = (link) => {
    if (link.ep) {
      return;
    }

    link.ep = true;
    const fetchOptions = {};

    if (link.integrity) {
      fetchOptions.integrity = link.integrity;
    }

    if (link.referrerPolicy) {
      fetchOptions.referrerPolicy = link.referrerPolicy;
    }

    if (link.crossOrigin === "use-credentials") {
      fetchOptions.credentials = "include";
    } else if (link.crossOrigin === "anonymous") {
      fetchOptions.credentials = "omit";
    } else {
      fetchOptions.credentials = "same-origin";
    }

    fetch(link.href, fetchOptions);
  };

  document
    .querySelectorAll('link[rel="modulepreload"]')
    .forEach((link) => processPreload(link));

  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type !== "childList") {
        return;
      }

      mutation.addedNodes.forEach((node) => {
        if (node.tagName === "LINK" && node.rel === "modulepreload") {
          processPreload(node);
        }
      });
    });
  }).observe(document, { childList: true, subtree: true });
})();

const revealElements = document.querySelectorAll(".reveal");

const runRevealAnimation = () => {
  revealElements.forEach((element) => {
    const top = element.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      element.classList.add("active");
    }
  });
};

window.addEventListener("scroll", runRevealAnimation);
window.addEventListener("load", () => {
  revealElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
    element.style.transition = "all 0.8s ease-out";
  });

  const style = document.createElement("style");
  style.innerHTML = `
    .reveal.active {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);

  runRevealAnimation();
});

const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  if (!navbar) {
    return;
  }

  if (window.scrollY > 50) {
    navbar.style.padding = "1rem 0";
    navbar.style.background = "rgba(10, 11, 16, 0.95)";
  } else {
    navbar.style.padding = "1.5rem 0";
    navbar.style.background = "rgba(10, 11, 16, 0.8)";
  }
});

const billingToggle = document.querySelector("#billing-toggle");
const pricingValues = document.querySelectorAll(".price[data-monthly]");

if (billingToggle) {
  billingToggle.addEventListener("change", () => {
    const isYearly = billingToggle.checked;

    pricingValues.forEach((price) => {
      const monthlyValue = price.getAttribute("data-monthly");
      const yearlyValue = price.getAttribute("data-yearly");
      const suffix = isYearly ? "<span>/ay*</span>" : "<span>/ay</span>";

      price.innerHTML = `${isYearly ? yearlyValue : monthlyValue}${suffix}`;
      price.style.transform = "scale(1.1)";
      setTimeout(() => {
        price.style.transform = "scale(1)";
      }, 200);
    });
  });
}

const automationCheckboxes = document.querySelectorAll(
  '.automation-selector input[type="checkbox"]'
);
const dynamicTotal = document.querySelector("#dynamic-total");

const updateTotal = () => {
  if (!dynamicTotal) {
    return;
  }

  let total = 0;
  automationCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      total += parseInt(checkbox.getAttribute("data-price"), 10);
    }
  });

  const formatted = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(total);

  dynamicTotal.innerHTML = `${formatted}<span>/ay</span>`;
  dynamicTotal.style.transform = "scale(1.1)";
  setTimeout(() => {
    dynamicTotal.style.transform = "scale(1)";
  }, 150);
};

if (automationCheckboxes.length > 0) {
  automationCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateTotal);
  });
  updateTotal();
}

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const button = contactForm.querySelector("button");
    const originalText = button ? button.innerText : "Mesaj Gönder";

    const nameInput = contactForm.querySelector('input[type="text"]');
    const emailInput = contactForm.querySelector('input[type="email"]');
    const serviceSelect = contactForm.querySelector("select");
    const messageInput = contactForm.querySelector("textarea");

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const service = serviceSelect ? serviceSelect.value : "";
    const serviceLabel = serviceSelect && serviceSelect.selectedIndex >= 0
      ? serviceSelect.options[serviceSelect.selectedIndex].text
      : "Belirtilmedi";
    const message = messageInput ? messageInput.value.trim() : "";

    if (!name || !email) {
      alert("Lütfen ad ve e-posta bilgilerinizi doldurun.");
      return;
    }

    if (button) {
      button.innerText = "E-posta uygulaması açılıyor...";
      button.disabled = true;
    }

    const recipient = "maybogazici@gmail.com";
    const subject = `Yeni Talep - ${name}`;
    const body = [
      `Ad Soyad: ${name}`,
      `E-posta: ${email}`,
      `Hizmet: ${service || "Belirtilmedi"} (${serviceLabel})`,
      "",
      "Mesaj:",
      message || "(Mesaj girilmedi)",
    ].join("\n");

    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    setTimeout(() => {
      if (button) {
        button.innerText = originalText;
        button.disabled = false;
      }
    }, 1200);
  });
}
