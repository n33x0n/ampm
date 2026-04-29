(() => {
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, "0");

  // ---------- Clock ----------
  const timeEl = $("time");
  const suffixEl = $("suffix");
  const dateEl = $("date");
  const locale = document.documentElement.lang || "en";
  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" });
  let lastDateKey = "";
  const btn12 = $("btn-12");
  const btn24 = $("btn-24");

  let format = localStorage.getItem("ampm.format") === "24" ? "24" : "12";

  function setFormat(f) {
    format = f;
    localStorage.setItem("ampm.format", f);
    btn12.setAttribute("aria-selected", f === "12");
    btn24.setAttribute("aria-selected", f === "24");
    suffixEl.style.visibility = f === "12" ? "visible" : "hidden";
    tick();
    if (typeof updateCities === "function") updateCities();
  }

  function tick() {
    const d = new Date();
    const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (dateKey !== lastDateKey) {
      dateEl.textContent = dateFmt.format(d);
      lastDateKey = dateKey;
    }
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();
    if (format === "24") {
      timeEl.innerHTML = `${pad(h)}:${pad(m)}<span class="sec">:${pad(s)}</span>`;
      suffixEl.textContent = "";
    } else {
      const h12 = ((h + 11) % 12) + 1;
      timeEl.innerHTML = `${pad(h12)}:${pad(m)}<span class="sec">:${pad(s)}</span>`;
      suffixEl.textContent = h < 12 ? "AM" : "PM";
    }
  }

  btn12.addEventListener("click", () => setFormat("12"));
  btn24.addEventListener("click", () => setFormat("24"));
  setFormat(format);
  tick();
  setInterval(() => { tick(); updateCities(); }, 1000);

  // ---------- World clock ----------
  const cityList = $("cities");
  const enabledKey = "ampm.cities";
  let enabled = new Set();
  try {
    const raw = localStorage.getItem(enabledKey);
    if (raw) enabled = new Set(JSON.parse(raw));
  } catch (e) {}

  const tzFmtCache = new Map();
  function tzFmt(tz) {
    const key = tz + "|" + format;
    if (tzFmtCache.has(key)) return tzFmtCache.get(key);
    const f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: format === "12",
    });
    tzFmtCache.set(key, f);
    return f;
  }

  const cityRows = [];
  cityList.querySelectorAll("li").forEach((li) => {
    const tz = li.dataset.tz;
    const label = li.dataset.label;
    const on = enabled.has(tz);
    li.dataset.on = on ? "true" : "false";
    li.innerHTML = `
      <span class="city-label">${label}</span>
      <span class="city-time" aria-live="off"></span>
      <button type="button" class="switch" role="switch" aria-checked="${on}" aria-label="${label}"></button>
    `;
    const sw = li.querySelector(".switch");
    sw.addEventListener("click", () => {
      const isOn = sw.getAttribute("aria-checked") === "true";
      const next = !isOn;
      sw.setAttribute("aria-checked", next);
      li.dataset.on = next ? "true" : "false";
      if (next) enabled.add(tz); else enabled.delete(tz);
      localStorage.setItem(enabledKey, JSON.stringify([...enabled]));
      updateCities();
    });
    cityRows.push({ li, tz, timeEl: li.querySelector(".city-time") });
  });

  function updateCities() {
    const d = new Date();
    cityRows.forEach(({ li, tz, timeEl }) => {
      if (li.dataset.on !== "true") return;
      timeEl.textContent = tzFmt(tz).format(d);
    });
  }
  updateCities();

  // ---------- Converter ----------
  const h12 = $("h12");
  const m12 = $("m12");
  const h24 = $("h24");
  const m24 = $("m24");
  const meridiemBtns = document.querySelectorAll('.ampm button[data-meridiem]');

  let updating = false;

  const digits = (s) => (s || "").replace(/\D/g, "");
  const parseInt2 = (s) => {
    const d = digits(s);
    return d === "" ? null : parseInt(d, 10);
  };

  function getMeridiem() {
    const active = document.querySelector('.ampm button[aria-checked="true"]');
    return active ? active.dataset.meridiem : "AM";
  }
  function setMeridiem(v) {
    meridiemBtns.forEach((b) => {
      b.setAttribute("aria-checked", b.dataset.meridiem === v);
    });
  }

  function from12to24() {
    if (updating) return;
    const hh = parseInt2(h12.value);
    const mm = parseInt2(m12.value);
    if (hh === null || hh < 1 || hh > 12) { return; }
    if (mm !== null && (mm < 0 || mm > 59)) { return; }
    const meridiem = getMeridiem();
    let h = hh % 12;
    if (meridiem === "PM") h += 12;
    updating = true;
    h24.value = pad(h);
    m24.value = mm === null ? "" : pad(mm);
    updating = false;
  }

  function from24to12() {
    if (updating) return;
    const hh = parseInt2(h24.value);
    const mm = parseInt2(m24.value);
    if (hh === null || hh < 0 || hh > 23) { return; }
    if (mm !== null && (mm < 0 || mm > 59)) { return; }
    const meridiem = hh < 12 ? "AM" : "PM";
    const h12v = ((hh + 11) % 12) + 1;
    updating = true;
    h12.value = pad(h12v);
    m12.value = mm === null ? "" : pad(mm);
    setMeridiem(meridiem);
    updating = false;
  }

  function sanitize(input, max) {
    input.addEventListener("input", () => {
      const before = input.value;
      let v = digits(before).slice(0, 2);
      if (v.length === 2 && parseInt(v, 10) > max) v = String(max);
      if (v !== before) input.value = v;
    });
  }
  sanitize(h12, 12);
  sanitize(m12, 59);
  sanitize(h24, 23);
  sanitize(m24, 59);

  [h12, m12].forEach((el) => el.addEventListener("input", from12to24));
  [h24, m24].forEach((el) => el.addEventListener("input", from24to12));
  meridiemBtns.forEach((b) => {
    b.addEventListener("click", () => {
      setMeridiem(b.dataset.meridiem);
      from12to24();
    });
  });

  // Seed converter with current time so users see a working example
  (function seed() {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes();
    h24.value = pad(h);
    m24.value = pad(m);
    from24to12();
  })();
})();
