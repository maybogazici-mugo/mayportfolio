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
    metaTitle: "NexGen Automations | Yapay Zeka & İş Otomasyonu | Chatbot, YouTube, E-posta",
    metaDescription:
      "Yapay zeka ile işinizi otomatize edin. Chatbot, YouTube otomasyonu, e-posta kampanyaları ve akıllı iş akışları. Haftada 18 saat tasarruf edin. Ücretsiz görüşme alın.",
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
        monthly: "₺2.499",
        yearly: "₺1.999",
        features: [
          "Günde 200 müşteri sorusuna kadar otomatik yanıt",
          "Haftalık performans raporu",
          "7/24 kesintisiz çalışan sistem",
          "30 gün içinde kurulum",
        ],
        cta: "Seç",
      },
      {
        badge: "En Çok Tercih Edilen",
        name: "Premium Özel Paket",
        monthly: "₺10.000",
        yearly: "₺8.000",
        features: [
          "İstediğiniz 4 otomasyonu birden çalıştırın",
          "Aynı gün yanıt garantili öncelikli destek",
          "CRM, takvim ve mevcut araçlarınızla entegrasyon",
          "Aylık strateji görüşmesi",
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
    budgetPlaceholder: "Aylık Bütçeniz (opsiyonel)",
    budgetOptions: [
      "₺2.500 - ₺5.000",
      "₺5.000 - ₺10.000",
      "₺10.000 - ₺20.000",
      "₺20.000+",
      "Henüz belirsiz",
    ],
    timelinePlaceholder: "Ne Zaman Başlamak İstersiniz?",
    timelineOptions: ["Hemen", "1-2 hafta içinde", "1 ay içinde", "Sadece araştırıyorum"],
    contactSendButton: "Mesaj Gönder",
    footer: "© 2026 NexGen Automations. Tüm Hakları Saklıdır.",
    monthlySuffix: "/ay",
    yearlySuffix: "/ay*",
    toggleButtonLabel: "EN",
    toggleAria: "Dili İngilizceye çevir",
    alertMissingNameEmail:
      "Lütfen ad, e-posta, hizmet ve mesaj alanlarını doldurun.",
    openingEmail: "Mesajınız gönderiliyor...",
    formSuccess:
      "Mesajınız alındı. En kısa sürede size e-posta veya telefonla dönüş yapacağız.",
    formError:
      "Mesaj gönderilemedi. Lütfen kısa bir süre sonra tekrar deneyin.",
    trustLabel: "İşletmelerin Otomasyon İhtiyaçlarında Tercih Ettiği Çözüm Ortağı",
    trustTags: ["E-ticaret", "SaaS", "Perakende", "Hizmet Sektörü", "Lojistik", "Sağlık"],
    aboutTitle: "Kimiz?",
    aboutP1:
      "NexGen Automations, işletmelerin tekrarlayan ve zaman alan görevlerini yapay zeka destekli sistemlerle otomatikleştiren mühendislik odaklı bir otomasyon stüdyosudur.",
    aboutP2:
      "Her projeye sıfırdan, işletmenin gerçek ihtiyacına göre tasarlanmış bir mühendislik problemi gibi yaklaşırız — hazır şablon değil, size özel çalışan bir sistem kurarız.",
    aboutStat1: "Otomasyon Kategorisi",
    aboutStat2: "Çalışan Sistemler",
    resultsTitle: "Örnek Sonuçlar",
    resultsSubtitle: "Benzer bir işletme için kurduğumuz bir otomasyonun yarattığı etki.",
    resultsTag: "Örnek Sonuç",
    resultsUnit1: "sa/hafta",
    resultsStat1: "Kazanılan Zaman",
    resultsStat2Value: "%63",
    resultsStat2: "Daha Hızlı Yanıt Süresi",
    resultsUnit3: "ay",
    resultsStat3: "Yatırımın Geri Dönüşü",
    resultsDesc:
      "E-ticaret odaklı bir müşteri için kurduğumuz akıllı chatbot ve e-posta otomasyonu, destek ekibinin haftada 18 saatini geri kazandırdı ve yanıt sürelerini %63 hızlandırdı.",
    resultsQuote:
      "\"Manuel olarak yaptığımız işlerin büyük kısmını otomatikleştirdik. Ekibimiz artık tekrarlayan görevler yerine büyümeye odaklanıyor.\"",
    resultsAuthor: "— Örnek Müşteri, E-ticaret Sektörü",
    roiTitle: "Ne Kadar Zaman Kaybediyorsunuz?",
    roiSubtitle: "İki soruyu cevaplayın, manuel işlerin yıllık size maliyetini görün.",
    roiHoursLabel: "Haftada manuel işlere kaç saat ayırıyorsunuz?",
    roiHoursUnit: "sa/hafta",
    roiRateLabel: "Bu sürenin saatlik maliyeti (₺)?",
    roiPerHour: "/sa",
    roiMonthly: "Aylık Kayıp",
    roiYearly: "Yıllık Kayıp",
    roiNote: "Bu, otomasyon ile geri kazanabileceğiniz zamanın ve bütçenin tahmini değeridir.",
    roiCta: "Bu Zamanı Geri Kazanın",
    faqTitle: "Sıkça Sorulan Sorular",
    faqSubtitle: "Aklına gelen ilk sorular muhtemelen burada.",
    faqItems: [
      {
        q: "Uzun dönem bir sözleşme imzalamam gerekiyor mu?",
        a: "Hayır. Uzun dönem bir sözleşme yok, istediğiniz zaman iptal edebilirsiniz. İptal sonrası sistemleriniz mevcut faturalandırma döneminin sonuna kadar çalışmaya devam eder.",
      },
      {
        q: "Kurulum ne kadar sürer?",
        a: "Kurulum süresi projenin kapsamına göre değişir, genelde 1-3 hafta arasında sürer. Görüşme sonrası size net bir zaman çizelgesi paylaşırız.",
      },
      {
        q: "Mevcut araçlarımla (CRM, e-posta, takvim vb.) entegre olur mu?",
        a: "Genellikle evet. Otomasyonları, kullandığınız mevcut araçlara entegre şekilde tasarlıyoruz; hangi araçları kullandığınızı görüşme sırasında öğrenip ona göre planlıyoruz.",
      },
      {
        q: "Fiyatlar neye göre belirleniyor?",
        a: "Hazır paketlerimiz var, ayrıca yalnızca ihtiyacınız olan otomasyonları seçip kendi paketinizi de oluşturabilirsiniz. Tam özel projeler için görüşme sonrası ayrı bir teklif hazırlarız.",
      },
    ],
    footerPrivacy: "Gizlilik Politikası",
    footerTerms: "Hizmet Şartları",
  },
  en: {
    metaTitle: "NexGen Automations | AI & Business Automation | Chatbots, YouTube, Email",
    metaDescription:
      "Automate your business with AI. Chatbots, YouTube automation, email campaigns, and smart workflows. Save 18 hours a week. Book a free consultation.",
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
        monthly: "₺2,499",
        yearly: "₺1,999",
        features: [
          "Auto-replies to up to 200 customer questions a day",
          "Weekly performance report",
          "Always-on, 24/7 running system",
          "Live within 30 days",
        ],
        cta: "Choose",
      },
      {
        badge: "Most Popular",
        name: "Premium Custom Package",
        monthly: "₺10,000",
        yearly: "₺8,000",
        features: [
          "Run any 4 automations at once",
          "Priority support with same-day response",
          "Integrates with your CRM, calendar, and existing tools",
          "Monthly strategy call",
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
    budgetPlaceholder: "Your Monthly Budget (optional)",
    budgetOptions: ["$80 - $150", "$150 - $300", "$300 - $600", "$600+", "Not sure yet"],
    timelinePlaceholder: "When Would You Like to Start?",
    timelineOptions: ["Right away", "Within 1-2 weeks", "Within a month", "Just researching"],
    contactSendButton: "Send Message",
    footer: "© 2026 NexGen Automations. All Rights Reserved.",
    monthlySuffix: "/mo",
    yearlySuffix: "/mo*",
    toggleButtonLabel: "TR",
    toggleAria: "Switch language to Turkish",
    alertMissingNameEmail:
      "Please provide your name, email, service, and message.",
    openingEmail: "Sending your message...",
    formSuccess:
      "Your message has been received. We will get back to you by email or phone shortly.",
    formError: "Your message could not be sent. Please try again shortly.",
    trustLabel: "The Trusted Automation Partner for Growing Businesses",
    trustTags: ["E-commerce", "SaaS", "Retail", "Services", "Logistics", "Healthcare"],
    aboutTitle: "Who We Are",
    aboutP1:
      "NexGen Automations is an engineering-driven automation studio that helps businesses eliminate repetitive, time-consuming work with AI-powered systems.",
    aboutP2:
      "We approach every project as an engineering problem designed around your real needs — not a template, but a working system built specifically for you.",
    aboutStat1: "Automation Categories",
    aboutStat2: "Always-On Systems",
    resultsTitle: "Example Results",
    resultsSubtitle: "The impact of an automation we built for a similar business.",
    resultsTag: "Example Result",
    resultsUnit1: "hrs/week",
    resultsStat1: "Time Saved",
    resultsStat2Value: "63%",
    resultsStat2: "Faster Response Time",
    resultsUnit3: "mo",
    resultsStat3: "Return on Investment",
    resultsDesc:
      "For an e-commerce client, the smart chatbot and email automation we built gave the support team back 18 hours a week and made response times 63% faster.",
    resultsQuote:
      "\"We automated most of the work we used to do manually. Our team now focuses on growth instead of repetitive tasks.\"",
    resultsAuthor: "— Example Client, E-commerce Industry",
    roiTitle: "How Much Time Are You Wasting?",
    roiSubtitle: "Answer two questions to see what manual work is costing you per year.",
    roiHoursLabel: "How many hours a week do you spend on manual tasks?",
    roiHoursUnit: "hrs/week",
    roiRateLabel: "What's the hourly cost of that time (₺)?",
    roiPerHour: "/hr",
    roiMonthly: "Monthly Loss",
    roiYearly: "Yearly Loss",
    roiNote: "This is an estimate of the time and budget you could recover with automation.",
    roiCta: "Get This Time Back",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "The questions you're probably already thinking of.",
    faqItems: [
      {
        q: "Do I need to sign a long-term contract?",
        a: "No. There's no long-term contract — you can cancel anytime. After cancellation your systems keep running until the end of the current billing period.",
      },
      {
        q: "How long does setup take?",
        a: "Setup time depends on the scope of the project, but it's usually 1-3 weeks. We'll share a clear timeline with you after our first call.",
      },
      {
        q: "Will it integrate with the tools I already use (CRM, email, calendar, etc.)?",
        a: "In most cases, yes. We design automations to plug into the tools you already use — we map this out during our first conversation.",
      },
      {
        q: "How is pricing determined?",
        a: "We have ready-made packages, and you can also build your own by selecting only the automations you need. For fully custom projects, we put together a separate quote after our call.",
      },
    ],
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
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
const meetingForm = document.querySelector("#meeting-form");

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

const meetingTexts = () =>
  currentLanguage === "tr"
    ? {
        missing: "Lütfen ad, e-posta ve tarih/saat alanlarını doldurun.",
        sending: "Randevu oluşturuluyor...",
        success: "Toplantı oluşturuldu. Meet linkiniz aşağıda.",
        error: "Toplantı oluşturulamadı. Lütfen tekrar deneyin.",
        linkLabel: "Google Meet'e katıl",
      }
    : {
        missing: "Please fill in name, email and date/time.",
        sending: "Creating appointment...",
        success: "Meeting created. Your Meet link is below.",
        error: "Meeting could not be created. Please try again.",
        linkLabel: "Join Google Meet",
      };

const configuredApiBase = (() => {
  const metaNode = document.querySelector('meta[name="api-base-url"]');
  const metaValue = metaNode ? metaNode.getAttribute("content") || "" : "";
  const windowValue =
    typeof window !== "undefined" &&
    typeof window.__API_BASE_URL__ === "string"
      ? window.__API_BASE_URL__
      : "";

  return (windowValue || metaValue).trim().replace(/\/+$/, "");
})();

const inferredApiBases = (() => {
  if (typeof window === "undefined" || !window.location) {
    return [];
  }

  const { hostname, protocol } = window.location;
  if (!hostname || hostname === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return [];
  }

  const secureProtocol = protocol === "https:" ? "https:" : "http:";
  const bases = [];

  if (!hostname.startsWith("api.")) {
    bases.push(`${secureProtocol}//api.${hostname}`);
  }

  return bases;
})();

const buildApiCandidates = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const candidates = [];
  const apiBases = configuredApiBase
    ? [configuredApiBase]
    : inferredApiBases;

  for (const apiBase of apiBases) {
    candidates.push(`${apiBase}${normalizedPath}`);
    if (normalizedPath.startsWith("/api/")) {
      candidates.push(
        `${apiBase}${normalizedPath.replace(/^\/api/, "")}`
      );
    }
  }

  if (configuredApiBase) {
    return Array.from(new Set(candidates));
  }

  candidates.push(normalizedPath);
  if (normalizedPath.startsWith("/api/")) {
    candidates.push(normalizedPath.replace(/^\/api/, ""));
  }

  return Array.from(new Set(candidates));
};

const fetchWithFallback = async (urls, options) => {
  let lastResponse = null;
  let lastError = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, options);
      if (response.status === 404) {
        lastResponse = response;
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw lastError || new Error("Network request failed");
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
  document.body.classList.toggle("lang-en", language === "en");
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
  const selectInput = document.querySelector('.contact-form select[name="service"]');
  const budgetInput = document.querySelector('.contact-form select[name="budget"]');
  const timelineInput = document.querySelector('.contact-form select[name="timeline"]');
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

  const rebuildSelect = (select, placeholder, options) => {
    if (!select) {
      return;
    }
    const previousValue = select.value;
    select.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    select.appendChild(placeholderOption);

    options.forEach((optionText) => {
      const option = document.createElement("option");
      option.value = optionText;
      option.textContent = optionText;
      select.appendChild(option);
    });

    if (previousValue && options.some((optionText) => optionText === previousValue)) {
      select.value = previousValue;
    } else {
      select.value = "";
    }
  };

  rebuildSelect(selectInput, t.selectPlaceholder, t.selectOptions);
  rebuildSelect(budgetInput, t.budgetPlaceholder, t.budgetOptions);
  rebuildSelect(timelineInput, t.timelinePlaceholder, t.timelineOptions);

  if (submitButton) {
    submitButton.textContent = t.contactSendButton;
  }

  setText("footer p", t.footer);

  if (languageToggle) {
    languageToggle.textContent = t.toggleButtonLabel;
    languageToggle.setAttribute("aria-label", t.toggleAria);
  }

  setText(".trust-label", t.trustLabel);
  const trustTagNodes = document.querySelectorAll(".trust-tags span");
  trustTagNodes.forEach((node, index) => {
    if (t.trustTags[index]) {
      node.textContent = t.trustTags[index];
    }
  });

  setText("#about h2", t.aboutTitle);
  const aboutParagraphs = document.querySelectorAll(".about-content > p");
  if (aboutParagraphs[0]) {
    aboutParagraphs[0].textContent = t.aboutP1;
  }
  if (aboutParagraphs[1]) {
    aboutParagraphs[1].textContent = t.aboutP2;
  }
  const aboutStatLabels = document.querySelectorAll(".about-stat-label");
  if (aboutStatLabels[0]) {
    aboutStatLabels[0].textContent = t.aboutStat1;
  }
  if (aboutStatLabels[1]) {
    aboutStatLabels[1].textContent = t.aboutStat2;
  }

  setText("#results .section-header h2", t.resultsTitle);
  setText("#results .section-header p", t.resultsSubtitle);
  setText(".example-tag", t.resultsTag);
  setText(".result-stats .stat:nth-child(1) .stat-num span", t.resultsUnit1);
  setText(".result-stats .stat:nth-child(1) .stat-label", t.resultsStat1);
  setText(".result-stats .stat:nth-child(2) .stat-num", t.resultsStat2Value);
  setText(".result-stats .stat:nth-child(2) .stat-label", t.resultsStat2);
  setText(".result-stats .stat:nth-child(3) .stat-num span", t.resultsUnit3);
  setText(".result-stats .stat:nth-child(3) .stat-label", t.resultsStat3);
  setText(".result-desc", t.resultsDesc);
  setText(".result-quote p", `"${t.resultsQuote.replace(/^"|"$/g, "")}"`);
  setText(".result-author", t.resultsAuthor);

  setText("#roi .section-header h2", t.roiTitle);
  setText("#roi .section-header p", t.roiSubtitle);
  setText('label[for="roi-hours"]', t.roiHoursLabel);
  setText(".roi-hours-unit", t.roiHoursUnit);
  setText('label[for="roi-rate"]', t.roiRateLabel);
  setText(".roi-per-hour", t.roiPerHour);
  setText(".roi-result-card:not(.highlight) .roi-result-label", t.roiMonthly);
  setText(".roi-result-card.highlight .roi-result-label", t.roiYearly);
  setText(".roi-note", t.roiNote);
  setText("#roi .btn", t.roiCta);

  setText("#faq .section-header h2", t.faqTitle);
  setText("#faq .section-header p", t.faqSubtitle);
  const faqItemNodes = document.querySelectorAll(".faq-item");
  faqItemNodes.forEach((item, index) => {
    const entry = t.faqItems[index];
    if (!entry) {
      return;
    }
    const question = item.querySelector(".faq-question span:first-child");
    const answer = item.querySelector(".faq-answer p");
    if (question) {
      question.textContent = entry.q;
    }
    if (answer) {
      answer.textContent = entry.a;
    }
  });

  const footerLinks = document.querySelectorAll(".footer-links a");
  if (footerLinks[0]) {
    footerLinks[0].textContent = t.footerPrivacy;
  }
  if (footerLinks[1]) {
    footerLinks[1].textContent = t.footerTerms;
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
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const t = translations[currentLanguage];
    const button = contactForm.querySelector("button");
    const originalText = button ? button.innerText : t.contactSendButton;
    const statusNode = document.querySelector("#contact-status");

    const nameInput = contactForm.querySelector('input[type="text"]');
    const emailInput = contactForm.querySelector('input[type="email"]');
    const serviceInput = contactForm.querySelector('select[name="service"]');
    const budgetInput = contactForm.querySelector('select[name="budget"]');
    const timelineInput = contactForm.querySelector('select[name="timeline"]');
    const messageInput = contactForm.querySelector("textarea");

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const service = serviceInput ? serviceInput.value.trim() : "";
    const budget = budgetInput ? budgetInput.value.trim() : "";
    const timeline = timelineInput ? timelineInput.value.trim() : "";
    const message = messageInput ? messageInput.value.trim() : "";

    if (!name || !email || !service || !message) {
      alert(t.alertMissingNameEmail);
      return;
    }

    if (button) {
      button.innerText = t.openingEmail;
      button.disabled = true;
    }
    if (statusNode) {
      statusNode.textContent = t.openingEmail;
    }

    try {
      const response = await fetchWithFallback(
        buildApiCandidates("/api/contact"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            service,
            budget,
            timeline,
            message,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      if (statusNode) {
        statusNode.textContent = t.formSuccess;
      } else {
        alert(t.formSuccess);
      }
      contactForm.reset();
    } catch (error) {
      if (statusNode) {
        statusNode.textContent = t.formError;
      } else {
        alert(t.formError);
      }
    } finally {
      if (button) {
        button.innerText = originalText;
        button.disabled = false;
      }
    }
  });
}

if (meetingForm) {
  const startAtInput = meetingForm.querySelector('input[name="startAt"]');
  if (startAtInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    startAtInput.min = local.toISOString().slice(0, 16);
  }

  meetingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const t = meetingTexts();
    const button = meetingForm.querySelector("button");
    const originalText = button ? button.innerText : "";
    const statusNode = document.querySelector("#meeting-status");
    const linkNode = document.querySelector("#meeting-link-wrapper");

    const nameInput = meetingForm.querySelector('input[name="name"]');
    const emailInput = meetingForm.querySelector('input[name="email"]');
    const startAtInput = meetingForm.querySelector('input[name="startAt"]');
    const durationInput = meetingForm.querySelector('select[name="durationMinutes"]');
    const notesInput = meetingForm.querySelector('textarea[name="notes"]');

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const startAt = startAtInput ? startAtInput.value.trim() : "";
    const durationMinutes = durationInput
      ? parseInt(durationInput.value, 10)
      : 30;
    const notes = notesInput ? notesInput.value.trim() : "";
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!name || !email || !startAt) {
      if (statusNode) {
        statusNode.textContent = t.missing;
      } else {
        alert(t.missing);
      }
      return;
    }

    if (button) {
      button.innerText = t.sending;
      button.disabled = true;
    }
    if (statusNode) {
      statusNode.textContent = t.sending;
    }
    if (linkNode) {
      linkNode.innerHTML = "";
    }

    try {
      const response = await fetchWithFallback(
        buildApiCandidates("/api/appointments"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            startAt,
            durationMinutes,
            notes,
            timezone,
          }),
        }
      );

      if (!response.ok) {
        const errText = (await response.text()).trim();
        throw new Error(errText || t.error);
      }

      const data = await response.json();
      if (statusNode) {
        statusNode.textContent = t.success;
      }
      if (linkNode && data.meetLink) {
        linkNode.innerHTML = `<a href="${data.meetLink}" target="_blank" rel="noopener noreferrer">${t.linkLabel}</a>`;
      }
      meetingForm.reset();
    } catch (error) {
      const message =
        error instanceof Error && error.message ? error.message : t.error;
      if (statusNode) {
        statusNode.textContent = message;
      } else {
        alert(message);
      }
    } finally {
      if (button) {
        button.innerText = originalText;
        button.disabled = false;
      }
    }
  });
}

applyLanguage(currentLanguage);
