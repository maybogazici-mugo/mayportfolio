(function () {
  const meetingForm = document.querySelector("#meeting-form");
  if (!meetingForm) {
    return;
  }

  const pickerRoot = document.querySelector("#meeting-picker");
  const startAtInput = meetingForm.querySelector('input[name="startAt"]');
  const durationInput = meetingForm.querySelector('select[name="durationMinutes"]');
  const dateTrigger = pickerRoot.querySelector('[data-picker-trigger="date"]');
  const timeTrigger = pickerRoot.querySelector('[data-picker-trigger="time"]');
  const datePanel = pickerRoot.querySelector('[data-picker-panel="date"]');
  const timePanel = pickerRoot.querySelector('[data-picker-panel="time"]');
  const dateGrid = pickerRoot.querySelector("#meeting-date-grid");
  const timeGrid = pickerRoot.querySelector("#meeting-time-grid");
  const summaryNode = pickerRoot.querySelector("#meeting-picker-summary");
  const timezoneNode = pickerRoot.querySelector("#meeting-picker-timezone");
  const selectedDateNode = pickerRoot.querySelector("#meeting-picker-selected-date");

  const state = {
    availability: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    selectedDate: "",
    selectedSlot: "",
    loading: false,
  };

  const text = () => {
    const isTr = document.documentElement.lang !== "en";
    return isTr
      ? {
          dateTriggerIdle: "Tarih secin",
          timeTriggerIdle: "Saat secin",
          loading: "Musait saatler yukleniyor...",
          dateTitle: "Uygun gunler",
          timeTitle: "Uygun saatler",
          noDates: "Yakin tarihlerde uygun gun bulunamadi.",
          noSlots: "Bu gun icin uygun saat kalmadi.",
          slotCount: "uygun saat",
          pickDayFirst: "Once bir gun secin.",
          summaryPrefix: "Secilen gorusme",
          timezonePrefix: "Saat dilimi",
        }
      : {
          dateTriggerIdle: "Select a date",
          timeTriggerIdle: "Select a time",
          loading: "Loading available times...",
          dateTitle: "Available dates",
          timeTitle: "Available times",
          noDates: "No available dates were found in the next days.",
          noSlots: "No available times remain for this date.",
          slotCount: "available times",
          pickDayFirst: "Select a date first.",
          summaryPrefix: "Selected meeting",
          timezonePrefix: "Timezone",
        };
  };

  const buildApiCandidates = (path) => {
    const normalizedPath = path.startsWith("/") ? path : "/" + path;
    const configured = (document.querySelector('meta[name="api-base-url"]')?.getAttribute("content") || "")
      .trim()
      .replace(/\/+$/, "");
    const candidates = [];

    if (configured) {
      candidates.push(configured + normalizedPath);
      if (normalizedPath.startsWith("/api/")) {
        candidates.push(configured + normalizedPath.replace(/^\/api/, ""));
      }
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

  const closePanels = () => {
    datePanel.hidden = true;
    timePanel.hidden = true;
    dateTrigger.setAttribute("aria-expanded", "false");
    timeTrigger.setAttribute("aria-expanded", "false");
  };

  const formatDateLabel = (dateValue) => {
    const date = new Date(dateValue + "T12:00:00");
    const locale = document.documentElement.lang === "en" ? "en-US" : "tr-TR";
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(date);
  };

  const findSelectedDay = () => state.availability.find((day) => day.date === state.selectedDate) || null;

  const setSummary = () => {
    const t = text();
    const selectedDay = findSelectedDay();
    if (!selectedDay || !state.selectedSlot) {
      summaryNode.textContent = "";
      return;
    }

    const slot = selectedDay.slots.find((item) => item.startAt === state.selectedSlot);
    if (!slot) {
      summaryNode.textContent = "";
      return;
    }

    summaryNode.textContent = `${t.summaryPrefix}: ${formatDateLabel(selectedDay.date)} ${slot.label}`;
  };

  const renderTimes = () => {
    const t = text();
    const selectedDay = findSelectedDay();
    timeGrid.innerHTML = "";

    if (!selectedDay) {
      selectedDateNode.textContent = t.pickDayFirst;
      timeGrid.innerHTML = `<p class="meeting-picker-empty">${t.pickDayFirst}</p>`;
      timeTrigger.disabled = true;
      timeTrigger.textContent = t.timeTriggerIdle;
      return;
    }

    selectedDateNode.textContent = formatDateLabel(selectedDay.date);
    timeTrigger.disabled = false;
    timeTrigger.textContent = state.selectedSlot
      ? selectedDay.slots.find((slot) => slot.startAt === state.selectedSlot)?.label || t.timeTriggerIdle
      : t.timeTriggerIdle;

    if (!selectedDay.slots.length) {
      timeGrid.innerHTML = `<p class="meeting-picker-empty">${t.noSlots}</p>`;
      return;
    }

    for (const slot of selectedDay.slots) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "meeting-picker-cell";
      if (slot.startAt === state.selectedSlot) {
        button.classList.add("is-active");
      }
      button.innerHTML = `<strong>${slot.label}</strong><span>${selectedDay.label}</span>`;
      button.addEventListener("click", () => {
        state.selectedSlot = slot.startAt;
        startAtInput.value = slot.startAt;
        timeTrigger.textContent = slot.label;
        setSummary();
        renderTimes();
        closePanels();
      });
      timeGrid.appendChild(button);
    }
  };

  const renderDates = () => {
    const t = text();
    dateGrid.innerHTML = "";
    timezoneNode.textContent = `${t.timezonePrefix}: ${state.timezone}`;

    if (!state.availability.length) {
      dateGrid.innerHTML = `<p class="meeting-picker-empty">${t.noDates}</p>`;
      return;
    }

    for (const day of state.availability) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "meeting-picker-cell";
      button.disabled = day.availableCount === 0;
      if (day.date === state.selectedDate) {
        button.classList.add("is-active");
      }
      button.innerHTML = `<strong>${formatDateLabel(day.date)}</strong><span>${day.availableCount} ${t.slotCount}</span>`;
      button.addEventListener("click", () => {
        state.selectedDate = day.date;
        state.selectedSlot = "";
        startAtInput.value = "";
        dateTrigger.textContent = formatDateLabel(day.date);
        timeTrigger.disabled = false;
        timeTrigger.textContent = t.timeTriggerIdle;
        renderDates();
        renderTimes();
        timePanel.hidden = false;
        timeTrigger.setAttribute("aria-expanded", "true");
        datePanel.hidden = true;
        dateTrigger.setAttribute("aria-expanded", "false");
      });
      dateGrid.appendChild(button);
    }
  };

  const loadAvailability = async () => {
    if (state.loading) {
      return;
    }

    const t = text();
    state.loading = true;
    summaryNode.textContent = t.loading;

    const params = new URLSearchParams({
      days: "14",
      durationMinutes: durationInput.value || "30",
      timezone: state.timezone,
    });

    try {
      const response = await fetchWithFallback(
        buildApiCandidates("/api/appointments/availability?" + params.toString()),
        { method: "GET", headers: { Accept: "application/json" } }
      );

      if (!response.ok) {
        const message = (await response.text()).trim();
        throw new Error(message || "Failed to load availability");
      }

      const data = await response.json();
      state.availability = Array.isArray(data.days) ? data.days : [];
      state.timezone = typeof data.timezone === "string" && data.timezone ? data.timezone : state.timezone;

      if (state.selectedDate && !state.availability.some((day) => day.date === state.selectedDate)) {
        state.selectedDate = "";
        state.selectedSlot = "";
        startAtInput.value = "";
      }

      renderDates();
      renderTimes();
      summaryNode.textContent = state.selectedSlot ? summaryNode.textContent : "";
    } catch (error) {
      state.availability = [];
      state.selectedDate = "";
      state.selectedSlot = "";
      startAtInput.value = "";
      renderDates();
      renderTimes();
      summaryNode.textContent = error instanceof Error ? error.message : "Failed to load availability";
    } finally {
      state.loading = false;
      setSummary();
    }
  };

  const togglePanel = async (panelName) => {
    if (panelName === "date") {
      const shouldOpen = datePanel.hidden;
      closePanels();
      if (shouldOpen) {
        datePanel.hidden = false;
        dateTrigger.setAttribute("aria-expanded", "true");
        await loadAvailability();
      }
      return;
    }

    if (timeTrigger.disabled) {
      summaryNode.textContent = text().pickDayFirst;
      return;
    }

    const shouldOpen = timePanel.hidden;
    closePanels();
    if (shouldOpen) {
      timePanel.hidden = false;
      timeTrigger.setAttribute("aria-expanded", "true");
      renderTimes();
    }
  };

  dateTrigger.addEventListener("click", () => {
    togglePanel("date");
  });
  timeTrigger.addEventListener("click", () => {
    togglePanel("time");
  });

  durationInput.addEventListener("change", async () => {
    state.selectedDate = "";
    state.selectedSlot = "";
    startAtInput.value = "";
    dateTrigger.textContent = text().dateTriggerIdle;
    timeTrigger.textContent = text().timeTriggerIdle;
    timeTrigger.disabled = true;
    setSummary();
    await loadAvailability();
  });

  meetingForm.addEventListener("reset", () => {
    state.selectedDate = "";
    state.selectedSlot = "";
    startAtInput.value = "";
    dateTrigger.textContent = text().dateTriggerIdle;
    timeTrigger.textContent = text().timeTriggerIdle;
    timeTrigger.disabled = true;
    closePanels();
    setSummary();
  });

  document.addEventListener("click", (event) => {
    if (!pickerRoot.contains(event.target)) {
      closePanels();
    }
  });

  new MutationObserver(() => {
    dateTrigger.textContent = state.selectedDate ? formatDateLabel(state.selectedDate) : text().dateTriggerIdle;
    renderDates();
    renderTimes();
    setSummary();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });

  dateTrigger.textContent = text().dateTriggerIdle;
  timeTrigger.textContent = text().timeTriggerIdle;
  timeTrigger.disabled = true;
})();
