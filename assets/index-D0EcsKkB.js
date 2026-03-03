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

const translations = {
  tr: {
    metaTitle: "NexGen Automations | Geleceği Otomatize Edin",
    metaDescription:
      "Kişisel yapay zeka asistanları, chatbotlar ve YouTube otomasyon sistemleri ile işinizi büyütün.",
    nav: ["Ana Sayfa", "Hizmetler", "Fiyatlandırma", "İletişim"],
    navCta: "Başlayalım",
    heroBadge: "Sektörün Öncüsü Otomasyon Çözümleri",
    heroTitle: "Yapay Zeka ile İşinizi <span>Işık Hızına</span> Taşıyın",
    heroText:
      "Özel chatbotlar, YouTube otomasyonları ve kişisel asistanlar ile zaman kazanın, verimliliği artırın.",
    heroPrimary: "Çözümleri İncele",
    heroSecondary: "Fiyat Listesi",
    servicesTitle: "Neler Yapıyoruz?",
    servicesSubtitle: "İhtiyaçlarınıza özel olarak geliştirilmiş akıllı sistemler.",
    serviceCards: [
      {
        title: "Kişisel AI Asistanı",
        text: "E-postalarınızı yöneten ve randevularınızı düzenleyen özel asistanlar.",
      },
      {
        title: "Akıllı Chatbotlar",
        text: "Müşterilerinizle 7/24 iletişim kuran gelişmiş satış ve destek botları.",
      },
      {
        title: "YouTube Otomasyonu",
        text: "İçerik planlamadan video montajına kadar tam otonom sistemler.",
      },
      {
        title: "Geri Bildirim Analizi",
        text: "Duygu tespiti ile müşteri yorumlarını analiz eden akıllı raporlama sistemleri.",
      },
      {
        title: "AI Web Araştırmacısı",
        text: "Satış odaklı derinlemesine pazar araştırması ve veri toplama otomasyonları.",
      },
      {
        title: "Sosyal Medya Otomasyonu",
        text: "Tüm mecralarda içerik paylaşımı ve etkileşim yönetimini otonom hale getirin.",
      },
      {
        title: "E-posta Otomasyonu",
        text: "Akıllı filtreleme, otomatik yanıtlama ve soğuk mail kampanyaları için AI destekli sistemler.",
      },
      {
        title: "İsteğe Özel Geliştirme",
        text: "Hayal ettiğiniz her türlü karmaşık sistemi sıfırdan sizin için inşa ediyoruz.",
      },
    ],
    pricingTitle: "Fiyatlandırma",
    pricingSubtitle: "Bütçenize ve ihtiyacınıza en uygun paketi seçin.",
    billingMonthly: "Aylık",
    billingYearly: "Yıllık",
    saveBadge: "%20 Tasarruf",
    plans: [
      {
        name: "Başlangıç Paketi",
        monthly: "₺4.999",
        yearly: "₺3.999",
        features: ["AI Asistan & Chatbot", "Haftalık Raporlama", "7/24 Destek"],
        cta: "Seç",
      },
      {
        badge: "En Çok Tercih Edilen",
        name: "Premium Özel Paket",
        monthly: "₺20.000",
        yearly: "₺16.000",
        features: [
          "İstediğiniz 4 Otomasyon",
          "Öncelikli Destek",
          "Özel Entegrasyonlar",
          "Stratejik Danışmanlık",
        ],
        cta: "Hemen Başla",
      },
    ],
    customTitle: "Kendi Paketini Oluştur",
    customSubtitle: "Sadece ihtiyacın olan hizmetleri seç, fiyatı anında gör.",
    customServices: [
      "Kişisel AI Asistanı",
      "Akıllı Chatbotlar",
      "YouTube Otomasyonu",
      "Geri Bildirim Analizi",
      "AI Web Araştırmacısı",
      "Sosyal Medya Otomasyonu",
      "E-posta Otomasyonu",
    ],
    totalLabel: "Tahmini Toplam",
    quoteCta: "Teklif Al",
    contactTitle: "Hayalinizdeki Sistemi Kuralım",
    contactText:
      "Projeniz hakkında detayları paylaşın, sizin için en iyi otomasyonu tasarlayalım.",
    contactCountry: "📍 Türkiye",
    placeholders: {
      name: "Adınız Soyadınız",
      email: "E-posta Adresiniz",
      message: "Mesajınız...",
    },
    selectPlaceholder: "İlgilendiğiniz Hizmet",
    selectOptions: [
      "Kişisel AI Asistanı",
      "Akıllı Chatbotlar",
      "YouTube Otomasyonu",
      "Geri Bildirim Analizi",
      "AI Web Araştırmacısı",
      "Sosyal Medya Otomasyonu",
      "E-posta Otomasyonu",
    ],
    contactSendButton: "Mesaj Gönder",
    footer: "© 2026 NexGen Automations. Tüm Hakları Saklıdır.",
    monthlySuffix: "/ay",
    yearlySuffix: "/ay*",
    toggleButtonLabel: "EN",
    toggleAria: "Dili İngilizceye çevir",
    alertMissingNameEmail: "Lütfen ad ve e-posta bilgilerinizi doldurun.",
    openingEmail: "E-posta uygulaması açılıyor...",
    emailSubjectPrefix: "Yeni Talep",
    serviceNotSpecified: "Belirtilmedi",
    messageLabel: "Mesaj:",
    noMessage: "(Mesaj girilmedi)",
    emailBodyName: "Ad Soyad",
    emailBodyEmail: "E-posta",
    emailBodyService: "Hizmet",
  },
  en: {
    metaTitle: "NexGen Automations | Automate the Future",
    metaDescription:
      "Scale your business with personal AI assistants, chatbots, and YouTube automation systems.",
    nav: ["Home", "Services", "Pricing", "Contact"],
    navCta: "Get Started",
    heroBadge: "Leading Automation Solutions",
    heroTitle: "Scale Your Business with <span>AI Speed</span>",
    heroText:
      "Save time and increase efficiency with custom chatbots, YouTube automations, and personal assistants.",
    heroPrimary: "Explore Solutions",
    heroSecondary: "View Pricing",
    servicesTitle: "What We Build",
    servicesSubtitle: "Intelligent systems tailored to your exact needs.",
    serviceCards: [
      {
        title: "Personal AI Assistant",
        text: "Custom assistants that manage your emails and organize your schedule.",
      },
      {
        title: "Smart Chatbots",
        text: "Advanced sales and support bots that stay in touch with customers 24/7.",
      },
      {
        title: "YouTube Automation",
        text: "Fully autonomous workflows from content planning to video editing.",
      },
      {
        title: "Feedback Analysis",
        text: "Smart reporting systems that analyze customer sentiment and comments.",
      },
      {
        title: "AI Web Researcher",
        text: "Deep, sales-focused market research and data collection automations.",
      },
      {
        title: "Social Media Automation",
        text: "Automate publishing and engagement management across every platform.",
      },
      {
        title: "Email Automation",
        text: "AI-powered systems for smart filtering, auto-replies, and cold email campaigns.",
      },
      {
        title: "Custom Development",
        text: "We build any complex system you imagine from the ground up.",
      },
    ],
    pricingTitle: "Pricing",
    pricingSubtitle: "Choose the package that best matches your goals and budget.",
    billingMonthly: "Monthly",
    billingYearly: "Yearly",
    saveBadge: "Save 20%",
    plans: [
      {
        name: "Starter Package",
        monthly: "₺4,999",
        yearly: "₺3,999",
        features: ["AI Assistant & Chatbot", "Weekly Reporting", "24/7 Support"],
        cta: "Choose",
      },
      {
        badge: "Most Popular",
        name: "Premium Custom Package",
        monthly: "₺20,000",
        yearly: "₺16,000",
        features: [
          "Any 4 Automations",
          "Priority Support",
          "Custom Integrations",
          "Strategic Consulting",
        ],
        cta: "Start Now",
      },
    ],
    customTitle: "Build Your Own Package",
    customSubtitle: "Select only the services you need and see your price instantly.",
    customServices: [
      "Personal AI Assistant",
      "Smart Chatbots",
      "YouTube Automation",
      "Feedback Analysis",
      "AI Web Researcher",
      "Social Media Automation",
      "Email Automation",
    ],
    totalLabel: "Estimated Total",
    quoteCta: "Get a Quote",
    contactTitle: "Let's Build Your Ideal System",
    contactText:
      "Share your project details and we will design the best automation setup for you.",
    contactCountry: "📍 Turkey",
    placeholders: {
      name: "Full Name",
      email: "Email Address",
      message: "Your message...",
    },
    selectPlaceholder: "Service You Are Interested In",
    selectOptions: [
      "Personal AI Assistant",
      "Smart Chatbots",
      "YouTube Automation",
      "Feedback Analysis",
      "AI Web Researcher",
      "Social Media Automation",
      "Email Automation",
    ],
    contactSendButton: "Send Message",
    footer: "© 2026 NexGen Automations. All Rights Reserved.",
    monthlySuffix: "/mo",
    yearlySuffix: "/mo*",
    toggleButtonLabel: "TR",
    toggleAria: "Switch language to Turkish",
    alertMissingNameEmail: "Please provide your name and email.",
    openingEmail: "Opening your email app...",
    emailSubjectPrefix: "New Inquiry",
    serviceNotSpecified: "Not specified",
    messageLabel: "Message:",
    noMessage: "(No message entered)",
    emailBodyName: "Name",
    emailBodyEmail: "Email",
    emailBodyService: "Service",
  },
};

const pricingValues = document.querySelectorAll(".price[data-monthly]");
const automationCheckboxes = document.querySelectorAll(
  '.automation-selector input[type="checkbox"]'
);
const dynamicTotal = document.querySelector("#dynamic-total");
const billingToggle = document.querySelector("#billing-toggle");
const languageToggle = document.querySelector("#language-toggle");
const contactForm = document.querySelector(".contact-form");

let currentLanguage = "tr";

const setText = (selector, value) => {
  const node = document.querySelector(selector);
  if (node) {
    node.textContent = value;
  }
};

const setHtml = (selector, value) => {
  const node = document.querySelector(selector);
  if (node) {
    node.innerHTML = value;
  }
};

const formatTry = (value) => {
  const locale = currentLanguage === "tr" ? "tr-TR" : "en-US";
  const formattedNumber = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value);

  return `₺${formattedNumber}`;
};

const updatePricingValues = () => {
  const t = translations[currentLanguage];
  const isYearly = billingToggle ? billingToggle.checked : false;

  pricingValues.forEach((price, index) => {
    const plan = t.plans[index];
    if (!plan) {
      return;
    }

    const priceValue = isYearly ? plan.yearly : plan.monthly;
    const suffix = isYearly ? t.yearlySuffix : t.monthlySuffix;

    price.innerHTML = `${priceValue}<span>${suffix}</span>`;
    price.style.transform = "scale(1.1)";
    setTimeout(() => {
      price.style.transform = "scale(1)";
    }, 200);
  });
};

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

  dynamicTotal.innerHTML = `${formatTry(total)}<span>${translations[currentLanguage].monthlySuffix}</span>`;
  dynamicTotal.style.transform = "scale(1.1)";
  setTimeout(() => {
    dynamicTotal.style.transform = "scale(1)";
  }, 150);
};

const applyLanguage = (language) => {
  currentLanguage = language;
  const t = translations[language];

  document.documentElement.lang = language;
  document.title = t.metaTitle;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", t.metaDescription);
  }

  const navLinks = document.querySelectorAll("nav ul li a");
  navLinks.forEach((link, index) => {
    if (t.nav[index]) {
      link.textContent = t.nav[index];
    }
  });

  setText(".nav-actions a", t.navCta);
  setText(".hero .badge", t.heroBadge);
  setHtml(".hero h1", t.heroTitle);
  setText(".hero p", t.heroText);

  const heroButtons = document.querySelectorAll(".hero-btns .btn");
  if (heroButtons[0]) {
    heroButtons[0].textContent = t.heroPrimary;
  }
  if (heroButtons[1]) {
    heroButtons[1].textContent = t.heroSecondary;
  }

  setText("#services .section-header h2", t.servicesTitle);
  setText("#services .section-header p", t.servicesSubtitle);

  const serviceCards = document.querySelectorAll(".services-grid .service-card");
  serviceCards.forEach((card, index) => {
    const item = t.serviceCards[index];
    if (!item) {
      return;
    }

    const title = card.querySelector("h3");
    const text = card.querySelector("p");

    if (title) {
      title.textContent = item.title;
    }
    if (text) {
      text.textContent = item.text;
    }
  });

  setText("#pricing .section-header h2", t.pricingTitle);
  setText("#pricing .section-header p", t.pricingSubtitle);

  const toggleLabels = document.querySelectorAll(".pricing-toggle > span");
  if (toggleLabels[0]) {
    toggleLabels[0].textContent = t.billingMonthly;
  }
  if (toggleLabels[1]) {
    toggleLabels[1].innerHTML = `${t.billingYearly} <small class="save-badge">${t.saveBadge}</small>`;
  }

  const planNames = document.querySelectorAll(".pricing-card .plan");
  planNames.forEach((planName, index) => {
    const plan = t.plans[index];
    if (plan) {
      planName.textContent = plan.name;
    }
  });

  setText(".popular-badge", t.plans[1].badge);

  const features = document.querySelectorAll(".pricing-card .features");
  features.forEach((featureList, index) => {
    const plan = t.plans[index];
    if (!plan) {
      return;
    }

    const listItems = featureList.querySelectorAll("li");
    listItems.forEach((listItem, itemIndex) => {
      if (plan.features[itemIndex]) {
        listItem.textContent = plan.features[itemIndex];
      }
    });
  });

  const pricingCtas = document.querySelectorAll(".pricing-card .btn");
  pricingCtas.forEach((cta, index) => {
    const plan = t.plans[index];
    if (plan) {
      cta.textContent = plan.cta;
    }
  });

  setText(".custom-pricing-box h3", t.customTitle);
  setText(".custom-pricing-box > p", t.customSubtitle);

  const customLabels = document.querySelectorAll(".automation-selector label");
  customLabels.forEach((label, index) => {
    const serviceName = t.customServices[index];
    if (!serviceName) {
      return;
    }

    const checkbox = document.querySelectorAll(
      '.automation-selector input[type="checkbox"]'
    )[index];
    const price = checkbox ? parseInt(checkbox.getAttribute("data-price"), 10) : 0;
    label.innerHTML = `${serviceName} <span>+${formatTry(price)}${t.monthlySuffix}</span>`;
  });

  setText(".total-label", t.totalLabel);
  setText(".total-calc .btn", t.quoteCta);

  setText(".contact-info h2", t.contactTitle);
  setText(".contact-info p", t.contactText);

  const contactItems = document.querySelectorAll(".contact-list li");
  if (contactItems[0]) {
    contactItems[0].textContent = t.contactCountry;
  }

  const nameInput = document.querySelector('.contact-form input[type="text"]');
  const emailInput = document.querySelector('.contact-form input[type="email"]');
  const selectInput = document.querySelector(".contact-form select");
  const messageInput = document.querySelector(".contact-form textarea");
  const submitButton = document.querySelector(".contact-form button");

  if (nameInput) {
    nameInput.placeholder = t.placeholders.name;
  }
  if (emailInput) {
    emailInput.placeholder = t.placeholders.email;
  }
  if (messageInput) {
    messageInput.placeholder = t.placeholders.message;
  }

  if (selectInput) {
    const previousValue = selectInput.value;
    selectInput.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = t.selectPlaceholder;
    selectInput.appendChild(placeholderOption);

    t.selectOptions.forEach((optionText) => {
      const option = document.createElement("option");
      option.value = optionText;
      option.textContent = optionText;
      selectInput.appendChild(option);
    });

    if (
      previousValue &&
      t.selectOptions.some((optionText) => optionText === previousValue)
    ) {
      selectInput.value = previousValue;
    } else {
      selectInput.value = "";
    }
  }

  if (submitButton) {
    submitButton.textContent = t.contactSendButton;
  }

  setText("footer p", t.footer);

  if (languageToggle) {
    languageToggle.textContent = t.toggleButtonLabel;
    languageToggle.setAttribute("aria-label", t.toggleAria);
  }

  updatePricingValues();
  updateTotal();
};

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

if (billingToggle) {
  billingToggle.addEventListener("change", updatePricingValues);
}

if (automationCheckboxes.length > 0) {
  automationCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateTotal);
  });
}

if (languageToggle) {
  languageToggle.addEventListener("click", () => {
    const nextLanguage = currentLanguage === "tr" ? "en" : "tr";
    applyLanguage(nextLanguage);
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const t = translations[currentLanguage];
    const button = contactForm.querySelector("button");
    const originalText = button ? button.innerText : t.contactSendButton;

    const nameInput = contactForm.querySelector('input[type="text"]');
    const emailInput = contactForm.querySelector('input[type="email"]');
    const serviceSelect = contactForm.querySelector("select");
    const messageInput = contactForm.querySelector("textarea");

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const service = serviceSelect ? serviceSelect.value : "";
    const serviceLabel =
      serviceSelect && serviceSelect.selectedIndex >= 0
        ? serviceSelect.options[serviceSelect.selectedIndex].text
        : t.serviceNotSpecified;
    const message = messageInput ? messageInput.value.trim() : "";

    if (!name || !email) {
      alert(t.alertMissingNameEmail);
      return;
    }

    if (button) {
      button.innerText = t.openingEmail;
      button.disabled = true;
    }

    const recipient =
      contactForm.getAttribute("data-mail-target") || "maybogazici@gmail.com";
    const subject = `${t.emailSubjectPrefix} - ${name}`;
    const body = [
      `${t.emailBodyName}: ${name}`,
      `${t.emailBodyEmail}: ${email}`,
      `${t.emailBodyService}: ${service || t.serviceNotSpecified} (${serviceLabel})`,
      "",
      t.messageLabel,
      message || t.noMessage,
    ].join("\n");

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      recipient
    )}&su=${encodedSubject}&body=${encodedBody}`;
    const mailtoUrl = `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`;

    const popup = window.open(gmailComposeUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.href = mailtoUrl;
    }

    setTimeout(() => {
      if (button) {
        button.innerText = originalText;
        button.disabled = false;
      }
    }, 1200);
  });
}

applyLanguage(currentLanguage);
