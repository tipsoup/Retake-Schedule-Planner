const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const PERIODS = Array.from({ length: 11 }, (_, i) => i + 1);
const WEEK_MAX = 30;
const SETTINGS_STORAGE_KEY = "retakePlannerSettingsV2";
const LAYOUT_STORAGE_KEY = "retakePlannerLayoutSplitV1";
const DEMO_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const FALLBACK_I18N = {
  "zh-CN": {
    ui: {
      eyebrow: "Retake Planner",
      heroTitle: "重修课表规划器",
      heroSubtitle: "本地部署 | 实时课表预览 | 多方案评分排序",
      presetTitle: "快速预设",
      rankingTitle: "全量规划排名",
      pageSizeLabel: "每页",
      prevPage: "上一页",
      nextPage: "下一页",
      preferenceTitle: "偏好筛选",
      teacherPreferenceLabel: "倾向选择教师",
      teacherPreferencePlaceholder: "输入教师关键词，多个可用逗号分隔",
      dayPreferenceLabel: "倾向选择工作日",
      statusTitle: "当前组合状态",
      weekPanelTitle: "实时课表小窗",
      weekSelectLabel: "显示周次",
      weekPrevBtn: "上一周",
      weekNextBtn: "下一周",
      periodHead: "节次",
      settingsToggle: "设置",
      settingsTitle: "设置",
      languageLabel: "语言",
      darkModeLabel: "暗色模式",
      demoModeLabel: "演示模式",
      demoModeOff: "关闭",
      demoModeHash: "加密映射（同文同密）",
      demoModeRandom: "全随机字符"
    },
    dayNames: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    presetButtons: {
      plan1: "预览方案一",
      plan2: "预览方案二",
      plan3: "预览方案三"
    },
    presetDetail: {
      title: "评分说明",
      plan1: "方案一按 s1 评分最高生成，侧重冲突安全与课堂稳定性。",
      plan2: "方案二按 s2 评分最高生成，侧重工作日集中与节奏平衡。",
      plan3: "方案三按 s3 评分优先并尽量与方案一保持差异，作为备选。"
    },
    planName: {
      currentCustom: "当前：自定义组合",
      currentRanked: "当前：排名第 {rank} 方案",
      plan1: "当前：方案一",
      plan2: "当前：方案二",
      plan3: "当前：方案三"
    },
    status: {
      conflictAll: "全周冲突",
      currentWeekView: "当前周视图",
      currentWeekTip: "切换周次查看",
      weekConflict: "第{week}周冲突",
      occupiedDays: "占用天数",
      lateClasses: "晚课数量",
      zeroConflict: "零冲突",
      itemCount: "{count} 项",
      dayCount: "{count} 天",
      classCount: "{count} 门",
      noRisk: "当前组合未发现明显风险。"
    },
    ranking: {
      total: "总计 {total} 套可行方案，按总分降序",
      pageInfo: "{page}/{totalPages} 页",
      scoreTotal: "总分 {score}",
      applyPreview: "应用预览",
      applied: "已应用",
      emptyAfterFilter: "未筛选到满足需求的规划。",
      emptyNoData: "没有可展示的规划。",
      loadFail: "加载失败: {msg}"
    },
    filter: {
      none: "未启用筛选，显示全部规划。",
      matched: "已按需求筛选，保留 {matched} / {total} 套规划。",
      empty: "未筛选到满足需求的规划。"
    },
    misc: {
      unknownTeacher: "未知教师",
      courseMeta: "数据来自本地文件解析结果。",
      allWeeks: "全部周叠加",
      weekN: "第{week}周",
      weekHintAll: "周次 {weeks}",
      weekHintSingle: "第{week}周",
      noWeeks: "无",
      presetInfoTitle: "查看评分说明"
    }
  },
  "en-US": {
    ui: {
      eyebrow: "Retake Planner",
      heroTitle: "Retake Schedule Planner",
      heroSubtitle: "Local-first | Live timetable preview | Ranked plans",
      presetTitle: "Quick Presets",
      rankingTitle: "Ranked Plans",
      pageSizeLabel: "Per page",
      prevPage: "Prev",
      nextPage: "Next",
      preferenceTitle: "Preference Filter",
      teacherPreferenceLabel: "Preferred Teacher",
      teacherPreferencePlaceholder: "Type teacher keywords, separated by commas",
      dayPreferenceLabel: "Preferred Weekdays",
      statusTitle: "Current Selection Status",
      weekPanelTitle: "Live Timetable Panel",
      weekSelectLabel: "Week",
      weekPrevBtn: "Prev Week",
      weekNextBtn: "Next Week",
      periodHead: "Period",
      settingsToggle: "Settings",
      settingsTitle: "Settings",
      languageLabel: "Language",
      darkModeLabel: "Dark Mode",
      demoModeLabel: "Demo Mode",
      demoModeOff: "关闭",
      demoModeHash: "Deterministic Mask",
      demoModeRandom: "Random Mask"
    },
    dayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    presetButtons: {
      plan1: "Preview Plan 1",
      plan2: "Preview Plan 2",
      plan3: "Preview Plan 3"
    },
    presetDetail: {
      title: "Scoring Notes",
      plan1: "Plan 1 is chosen by highest s1, focusing on conflict safety and schedule stability.",
      plan2: "Plan 2 is chosen by highest s2, focusing on weekday concentration and rhythm.",
      plan3: "Plan 3 prioritizes s3 and keeps diversity from Plan 1 as a fallback option."
    },
    planName: {
      currentCustom: "Current: Custom Selection",
      currentRanked: "Current: Rank #{rank}",
      plan1: "Current: Plan 1",
      plan2: "Current: Plan 2",
      plan3: "Current: Plan 3"
    },
    status: {
      conflictAll: "Full-week conflicts",
      currentWeekView: "Current week view",
      currentWeekTip: "Switch week to inspect",
      weekConflict: "Week {week} conflicts",
      occupiedDays: "Occupied days",
      lateClasses: "Late classes",
      zeroConflict: "No conflict",
      itemCount: "{count} items",
      dayCount: "{count} days",
      classCount: "{count} classes",
      noRisk: "No obvious risk in current selection."
    },
    ranking: {
      total: "{total} feasible plans, sorted by total score desc",
      pageInfo: "{page}/{totalPages}",
      scoreTotal: "Total {score}",
      applyPreview: "Apply",
      applied: "Applied",
      emptyAfterFilter: "No plans match current preferences.",
      emptyNoData: "No plans available.",
      loadFail: "Load failed: {msg}"
    },
    filter: {
      none: "No filter applied. Showing all plans.",
      matched: "Filtered by preference: {matched}/{total} plans kept.",
      empty: "No plans match current preferences."
    },
    misc: {
      unknownTeacher: "Unknown Teacher",
      courseMeta: "Data parsed from local source files.",
      allWeeks: "All weeks",
      weekN: "Week {week}",
      weekHintAll: "Weeks {weeks}",
      weekHintSingle: "Week {week}",
      noWeeks: "N/A",
      presetInfoTitle: "Show scoring note"
    }
  }
};

const state = {
  data: null,
  selected: {},
  selectedPlan: "custom",
  selectedWeek: "ALL",
  activeComboRank: null,
  pageSize: 50,
  page: 1,
  i18n: {
    resources: { ...FALLBACK_I18N },
    language: "zh-CN"
  },
  settings: {
    darkMode: false,
    demoMode: "off",
    language: "zh-CN"
  },
  filters: {
    teacherQuery: "",
    preferredDays: []
  },
  filteredCombos: null
};

function getLanguage() {
  return state.settings.language in state.i18n.resources ? state.settings.language : "zh-CN";
}

function t(key, vars = {}) {
  const lang = getLanguage();
  const source = state.i18n.resources[lang] || state.i18n.resources["zh-CN"];
  const val = key.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source);
  const template = val === undefined ? key : String(val);
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function obfuscateText(text, mode) {
  if (typeof text !== "string" || !text.length || mode === "off") return text;

  if (mode === "hash") {
    let out = "";
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (/\s/.test(ch)) {
        out += ch;
        continue;
      }
      const idx = hash32(`${text}|${i}|${ch}`) % DEMO_ALPHABET.length;
      out += DEMO_ALPHABET[idx];
    }
    return out;
  }

  return text
    .split("")
    .map((ch) => (/\s/.test(ch) ? ch : DEMO_ALPHABET[Math.floor(Math.random() * DEMO_ALPHABET.length)]))
    .join("");
}

function hasNoObfuscateMarker(node) {
  let el = node.parentElement;
  while (el) {
    if (el.dataset && el.dataset.noObfuscate === "true") return true;
    if (el.tagName === "OPTION" && el.getAttribute("data-no-obfuscate") === "true") return true;
    el = el.parentElement;
  }
  return false;
}

function applyDemoTextToDocument() {
  const mode = state.settings.demoMode;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (hasNoObfuscateMarker(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    if (node.__originalText === undefined) node.__originalText = node.nodeValue;
    if (mode === "off") {
      node.nodeValue = node.__originalText;
      return;
    }
    node.nodeValue = obfuscateText(node.__originalText, mode);
  });

  document.querySelectorAll("[title]").forEach((el) => {
    if (el.dataset.originalTitle === undefined) {
      el.dataset.originalTitle = el.getAttribute("title") || "";
    }
    if (mode === "off") {
      el.setAttribute("title", el.dataset.originalTitle);
      return;
    }
    el.setAttribute("title", obfuscateText(el.dataset.originalTitle, mode));
  });
}

function saveSettings() {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state.settings.darkMode = Boolean(parsed.darkMode);
    state.settings.demoMode = ["off", "hash", "random"].includes(parsed.demoMode) ? parsed.demoMode : "off";
    state.settings.language = ["zh-CN", "en-US"].includes(parsed.language) ? parsed.language : "zh-CN";
    state.i18n.language = state.settings.language;
  } catch (_) {
    state.settings = { darkMode: false, demoMode: "off", language: "zh-CN" };
  }
}

async function loadI18nResources() {
  const languages = ["zh-CN", "en-US"];
  const loaded = { ...FALLBACK_I18N };

  for (const lang of languages) {
    try {
      const resp = await fetch(`./i18n/${lang}.json`, { cache: "no-store" });
      if (!resp.ok) continue;
      const json = await resp.json();
      loaded[lang] = { ...loaded[lang], ...json };
    } catch (_) {
      // Keep fallback if loading fails.
    }
  }

  state.i18n.resources = loaded;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function applyLanguage() {
  const names = state.i18n.resources[getLanguage()]?.dayNames || DAYS;
  document.documentElement.lang = getLanguage();

  setText("eyebrowText", t("ui.eyebrow"));
  setText("heroTitle", t("ui.heroTitle"));
  setText("heroSubtitle", t("ui.heroSubtitle"));
  setText("presetTitle", t("ui.presetTitle"));
  setText("rankingTitle", t("ui.rankingTitle"));
  setText("pageSizeLabel", t("ui.pageSizeLabel"));
  setText("prevPage", t("ui.prevPage"));
  setText("nextPage", t("ui.nextPage"));
  setText("preferenceToggle", t("ui.preferenceTitle"));
  setText("teacherPreferenceLabel", t("ui.teacherPreferenceLabel"));
  setText("dayPreferenceLabel", t("ui.dayPreferenceLabel"));
  setText("statusTitle", t("ui.statusTitle"));
  setText("weekPanelTitle", t("ui.weekPanelTitle"));
  setText("weekSelectLabel", t("ui.weekSelectLabel"));
  setText("weekPrevBtn", t("ui.weekPrevBtn"));
  setText("weekNextBtn", t("ui.weekNextBtn"));
  setText("periodHead", t("ui.periodHead"));
  setText("settingsToggle", t("ui.settingsToggle"));
  setText("settingsTitle", t("ui.settingsTitle"));
  setText("languageLabel", t("ui.languageLabel"));
  setText("darkModeLabel", t("ui.darkModeLabel"));
  setText("demoModeLabel", t("ui.demoModeLabel"));

  const teacherInput = document.getElementById("teacherPreferenceInput");
  if (teacherInput) teacherInput.placeholder = t("ui.teacherPreferencePlaceholder");

  names.forEach((name, idx) => {
    setText(`dayHead${idx + 1}`, name);
  });

  const dayChecks = document.querySelectorAll("#dayPreferenceChecks label");
  dayChecks.forEach((label, idx) => {
    const input = label.querySelector("input");
    if (!input) return;
    const spanText = names[idx] || DAYS[idx];
    const textNode = [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
    if (textNode) {
      textNode.nodeValue = spanText;
    } else {
      label.appendChild(document.createTextNode(spanText));
    }
  });

  const languageSelect = document.getElementById("languageSelect");
  if (languageSelect) {
    const zhOpt = languageSelect.querySelector('option[value="zh-CN"]');
    const enOpt = languageSelect.querySelector('option[value="en-US"]');
    if (zhOpt) zhOpt.textContent = "中文";
    if (enOpt) enOpt.textContent = "English";
    languageSelect.value = getLanguage();
  }

  const demoModeSelect = document.getElementById("demoModeSelect");
  if (demoModeSelect) {
    const off = demoModeSelect.querySelector('option[value="off"]');
    const hash = demoModeSelect.querySelector('option[value="hash"]');
    const random = demoModeSelect.querySelector('option[value="random"]');
    if (off) off.textContent = t("ui.demoModeOff");
    if (hash) hash.textContent = t("ui.demoModeHash");
    if (random) random.textContent = t("ui.demoModeRandom");
  }

  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.textContent = t(`presetButtons.${btn.dataset.plan}`);
  });

  document.querySelectorAll(".preset-info-btn").forEach((btn) => {
    btn.title = t("misc.presetInfoTitle");
  });

  renderPresetInfoPanels();
  initWeekSelector();
  renderFilterHint();
  highlightPreset();
}

function applySettingsAppearance() {
  document.body.classList.toggle("dark-mode", state.settings.darkMode);
  document.body.classList.toggle("demo-font", state.settings.demoMode !== "off");
  applyDemoTextToDocument();
}

function initSettingsPanel() {
  const panel = document.getElementById("settingsPanel");
  const toggle = document.getElementById("settingsToggle");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const demoModeSelect = document.getElementById("demoModeSelect");
  const languageSelect = document.getElementById("languageSelect");

  darkModeToggle.checked = state.settings.darkMode;
  demoModeSelect.value = state.settings.demoMode;
  languageSelect.value = getLanguage();

  toggle.addEventListener("click", () => {
    const hidden = panel.hasAttribute("hidden");
    if (hidden) {
      panel.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
      return;
    }
    panel.setAttribute("hidden", "hidden");
    toggle.setAttribute("aria-expanded", "false");
  });

  darkModeToggle.addEventListener("change", () => {
    state.settings.darkMode = darkModeToggle.checked;
    saveSettings();
    applySettingsAppearance();
  });

  demoModeSelect.addEventListener("change", () => {
    state.settings.demoMode = demoModeSelect.value;
    saveSettings();
    applySettingsAppearance();
  });

  languageSelect.addEventListener("change", () => {
    state.settings.language = languageSelect.value;
    state.i18n.language = languageSelect.value;
    saveSettings();
    applyLanguage();
    renderAll();
    applySettingsAppearance();
  });
}

function getWeekOptions() {
  return ["ALL", ...Array.from({ length: WEEK_MAX }, (_, i) => String(i + 1))];
}

function indexData(raw) {
  const byCourse = {};
  raw.courses.forEach((course) => {
    const classMap = {};
    course.classes.forEach((klass) => {
      const slotsAll = new Set();
      const slotsByWeek = {};
      klass.blocks.forEach((block) => {
        block.weeks.forEach((week) => {
          if (!slotsByWeek[week]) slotsByWeek[week] = new Set();
          block.periods.forEach((period) => {
            slotsAll.add(`${week}-${block.day}-${period}`);
            slotsByWeek[week].add(`${block.day}-${period}`);
          });
        });
      });
      classMap[klass.id] = {
        ...klass,
        course: course.name,
        _slotsAll: slotsAll,
        _slotsByWeek: slotsByWeek
      };
    });

    byCourse[course.name] = {
      ...course,
      classMap
    };
  });

  return {
    ...raw,
    byCourse
  };
}

function getClassByPick(courseName, classId) {
  return state.data.byCourse[courseName]?.classMap[classId] || null;
}

function getCurrentItems() {
  return state.data.courseNames
    .map((courseName) => getClassByPick(courseName, state.selected[courseName]))
    .filter(Boolean);
}

function getItemsForCombo(combo) {
  return state.data.courseNames
    .map((courseName) => getClassByPick(courseName, combo.pick[courseName]))
    .filter(Boolean);
}

function getActiveCombos() {
  return state.filteredCombos || state.data.combos;
}

function buildCourseUI() {
  const root = document.getElementById("courseBlock");
  root.innerHTML = "";

  state.data.courseNames.forEach((courseName) => {
    const course = state.data.byCourse[courseName];
    const card = document.createElement("article");
    card.className = "course-card";

    const title = document.createElement("h3");
    title.className = "course-title";
    title.textContent = `${courseName}（${course.classes.length}）`;

    const row = document.createElement("div");
    row.className = "select-row";

    const select = document.createElement("select");
    select.name = courseName;

    course.classes.forEach((klass) => {
      const option = document.createElement("option");
      option.value = klass.id;
      option.textContent = `${klass.id} | ${klass.teacher || t("misc.unknownTeacher")} | ${klass.timeRaw}`;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      state.selected[courseName] = select.value;
      state.selectedPlan = "custom";
      state.activeComboRank = null;
      highlightPreset();
      renderAll();
    });

    const meta = document.createElement("p");
    meta.className = "course-meta";
    meta.textContent = t("misc.courseMeta");

    row.appendChild(select);
    card.appendChild(title);
    card.appendChild(row);
    card.appendChild(meta);
    root.appendChild(card);
  });
}

function initWeekSelector() {
  const select = document.getElementById("weekSelect");
  const options = getWeekOptions();

  if (!options.includes(state.selectedWeek)) {
    state.selectedWeek = "ALL";
  }

  select.innerHTML = options
    .map((w) => (w === "ALL" ? `<option value="ALL">${t("misc.allWeeks")}</option>` : `<option value="${w}">${t("misc.weekN", { week: w })}</option>`))
    .join("");

  select.value = state.selectedWeek;
}

function shiftWeek(delta) {
  const options = getWeekOptions();
  const idx = options.indexOf(state.selectedWeek);
  const current = idx >= 0 ? idx : 0;
  const next = (current + delta + options.length) % options.length;
  state.selectedWeek = options[next];
  const select = document.getElementById("weekSelect");
  if (select) select.value = state.selectedWeek;
  renderAll();
}

function getSlotsForMode(item, weekMode) {
  if (weekMode === "ALL") return item._slotsAll;
  const weekSet = item._slotsByWeek[Number(weekMode)] || new Set();
  const expanded = new Set();
  weekSet.forEach((v) => expanded.add(`${weekMode}-${v}`));
  return expanded;
}

function computeStatus(items) {
  const collisionsAll = [];
  const collisionsWeek = [];

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const allA = items[i]._slotsAll;
      const allConflict = [...items[j]._slotsAll].filter((x) => allA.has(x));
      if (allConflict.length) {
        collisionsAll.push(`${items[i].course} / ${items[j].course} : ${allConflict.length}`);
      }

      if (state.selectedWeek !== "ALL") {
        const weekA = getSlotsForMode(items[i], state.selectedWeek);
        const weekConflict = [...getSlotsForMode(items[j], state.selectedWeek)].filter((x) => weekA.has(x));
        if (weekConflict.length) {
          collisionsWeek.push(`${items[i].course} / ${items[j].course} : ${weekConflict.length}`);
        }
      }
    }
  }

  const activeDays = new Set();
  let lateClasses = 0;

  items.forEach((item) => {
    item.blocks.forEach((block) => {
      const visible = state.selectedWeek === "ALL" || block.weeks.includes(Number(state.selectedWeek));
      if (!visible) return;
      activeDays.add(block.day);
      if (block.periods.some((p) => p >= 7)) lateClasses += 1;
    });
  });

  const riskText = [];
  items.forEach((item) => {
    if (item.flags.nonContinuousWeeks) {
      riskText.push(`${item.course} ${item.id}`);
    }
    if (item.flags.oddEven) {
      riskText.push(`${item.course} ${item.id}`);
    }
  });

  return {
    collisionsAll,
    collisionsWeek,
    occupiedDays: activeDays.size,
    lateClasses,
    riskText
  };
}

function renderStatus(status) {
  const grid = document.getElementById("statusGrid");
  const riskList = document.getElementById("riskList");

  const cards = [
    {
      label: t("status.conflictAll"),
      value: status.collisionsAll.length ? t("status.itemCount", { count: status.collisionsAll.length }) : t("status.zeroConflict"),
      className: status.collisionsAll.length ? "danger" : "ok"
    },
    {
      label: state.selectedWeek === "ALL" ? t("status.currentWeekView") : t("status.weekConflict", { week: state.selectedWeek }),
      value: state.selectedWeek === "ALL"
        ? t("status.currentWeekTip")
        : (status.collisionsWeek.length ? t("status.itemCount", { count: status.collisionsWeek.length }) : t("status.zeroConflict")),
      className: status.collisionsWeek.length ? "danger" : "ok"
    },
    {
      label: t("status.occupiedDays"),
      value: t("status.dayCount", { count: status.occupiedDays }),
      className: "warn"
    },
    {
      label: t("status.lateClasses"),
      value: t("status.classCount", { count: status.lateClasses }),
      className: status.lateClasses ? "warn" : "ok"
    }
  ];

  grid.innerHTML = cards.map((card) => `<article class="stat ${card.className}"><div class="label">${card.label}</div><div class="value">${card.value}</div></article>`).join("");

  const lines = [];
  status.collisionsAll.forEach((msg) => lines.push(`<li class="danger">${msg}</li>`));
  status.collisionsWeek.forEach((msg) => lines.push(`<li class="danger">${msg}</li>`));
  status.riskText.forEach((msg) => lines.push(`<li class="warn">${msg}</li>`));
  if (!lines.length) lines.push(`<li class="ok">${t("status.noRisk")}</li>`);
  riskList.innerHTML = lines.join("");
}

function renderWeekGrid(items) {
  const body = document.getElementById("weekBody");
  const legend = document.getElementById("miniLegend");

  const matrix = {};
  for (let day = 1; day <= 7; day += 1) {
    PERIODS.forEach((period) => {
      matrix[`${day}-${period}`] = [];
    });
  }

  items.forEach((item, index) => {
    const styleId = `course-${(index % 5) + 1}`;
    const cellDedup = new Set();

    item.blocks.forEach((block) => {
      const visible = state.selectedWeek === "ALL" || block.weeks.includes(Number(state.selectedWeek));
      if (!visible) return;

      block.periods.forEach((period) => {
        if (period < 1 || period > PERIODS.length) return;
        const key = `${block.day}-${period}-${item.id}`;
        if (cellDedup.has(key)) return;
        cellDedup.add(key);

        const weekHint = state.selectedWeek === "ALL"
          ? t("misc.weekHintAll", { weeks: formatWeeks(block.weeks) })
          : t("misc.weekHintSingle", { week: state.selectedWeek });

        matrix[`${block.day}-${period}`].push({
          course: item.course,
          teacher: item.teacher || t("misc.unknownTeacher"),
          styleId,
          weekHint
        });
      });
    });
  });

  body.innerHTML = PERIODS.map((period) => {
    const row = [`<td><strong>${period}</strong></td>`];
    for (let day = 1; day <= 7; day += 1) {
      const bucket = matrix[`${day}-${period}`];
      if (!bucket.length) {
        row.push("<td></td>");
      } else {
        const chips = bucket.map((x) => `<div class="slot-chip ${x.styleId}" title="${x.weekHint}">${x.course}·${x.teacher}</div>`).join("");
        row.push(`<td>${chips}</td>`);
      }
    }
    return `<tr>${row.join("")}</tr>`;
  }).join("");

  legend.innerHTML = items
    .map((item, idx) => `<div class="legend-item"><span class="legend-dot course-${(idx % 5) + 1}"></span><span>${item.course} ${item.id} / ${item.teacher || t("misc.unknownTeacher")}</span></div>`)
    .join("");
}

function formatWeeks(weeks) {
  if (!weeks || !weeks.length) return t("misc.noWeeks");
  const first = weeks[0];
  const last = weeks[weeks.length - 1];
  const continuous = weeks.length === (last - first + 1);
  return continuous ? `${first}-${last}` : weeks.join(",");
}

function setSelectValues() {
  document.querySelectorAll(".course-card select").forEach((select) => {
    const course = select.name;
    if (state.selected[course]) select.value = state.selected[course];
  });
}

function applyPreset(planKey) {
  const preset = state.data.presets[planKey];
  if (!preset) return;
  state.selectedPlan = planKey;
  state.activeComboRank = null;
  Object.entries(preset.pick).forEach(([course, classId]) => {
    state.selected[course] = classId;
  });
  setSelectValues();
  highlightPreset();
  renderAll();
}

function applyCombo(combo) {
  state.selectedPlan = "ranked";
  state.activeComboRank = combo.rank;
  Object.entries(combo.pick).forEach(([course, classId]) => {
    state.selected[course] = classId;
  });
  setSelectValues();
  highlightPreset();
  renderAll();
}

function highlightPreset() {
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.plan === state.selectedPlan);
  });

  const planName = document.getElementById("planName");
  if (state.selectedPlan === "ranked" && state.activeComboRank) {
    planName.textContent = t("planName.currentRanked", { rank: state.activeComboRank });
    return;
  }

  if (["plan1", "plan2", "plan3"].includes(state.selectedPlan)) {
    planName.textContent = t(`planName.${state.selectedPlan}`);
    return;
  }

  planName.textContent = t("planName.currentCustom");
}

function renderPresetInfoPanels() {
  const popover = document.getElementById("presetInfoPopover");
  if (popover) {
    popover.innerHTML = "";
    popover.setAttribute("hidden", "hidden");
  }
}

function closePresetInfoPopover() {
  const popover = document.getElementById("presetInfoPopover");
  if (!popover) return;
  popover.setAttribute("hidden", "hidden");
  popover.innerHTML = "";
  document.querySelectorAll(".preset-info-btn").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
}

function openPresetInfoPopover(plan, anchorBtn) {
  const popover = document.getElementById("presetInfoPopover");
  if (!popover || !anchorBtn) return;

  popover.innerHTML = `<strong>${t("presetDetail.title")}</strong><br/>${t(`presetDetail.${plan}`)}`;
  popover.removeAttribute("hidden");

  const rect = anchorBtn.getBoundingClientRect();
  const margin = 8;
  const left = Math.min(rect.left, window.innerWidth - 320);
  const top = Math.min(rect.bottom + margin, window.innerHeight - 180);
  popover.style.left = `${Math.max(8, left)}px`;
  popover.style.top = `${Math.max(8, top)}px`;

  document.querySelectorAll(".preset-info-btn").forEach((btn) => {
    btn.setAttribute("aria-expanded", btn === anchorBtn ? "true" : "false");
  });
}

function comboMatchesFilters(combo) {
  const items = getItemsForCombo(combo);

  const keywords = state.filters.teacherQuery
    .split(/[，,;；\s]+/)
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  if (keywords.length) {
    const teachers = items.map((it) => String(it.teacher || "").toLowerCase());
    const teacherMatched = keywords.some((k) => teachers.some((teacher) => teacher.includes(k)));
    if (!teacherMatched) return false;
  }

  if (state.filters.preferredDays.length) {
    const daySet = new Set(state.filters.preferredDays);
    const outside = items.some((it) => it.blocks.some((b) => !daySet.has(Number(b.day))));
    if (outside) return false;
  }

  return true;
}

function applyPreferenceFilters() {
  const all = state.data.combos;
  const hasTeacher = state.filters.teacherQuery.trim().length > 0;
  const hasDays = state.filters.preferredDays.length > 0;

  if (!hasTeacher && !hasDays) {
    state.filteredCombos = null;
    state.page = 1;
    renderFilterHint();
    return;
  }

  state.filteredCombos = all.filter(comboMatchesFilters);
  state.page = 1;

  if (state.activeComboRank) {
    const exists = state.filteredCombos.some((x) => x.rank === state.activeComboRank);
    if (!exists) {
      state.activeComboRank = null;
      state.selectedPlan = "custom";
    }
  }

  renderFilterHint();
}

function renderFilterHint() {
  const target = document.getElementById("filterHint");
  if (!target || !state.data) return;

  const allCount = state.data.combos.length;
  const activeCount = getActiveCombos().length;
  const hasFilter = state.filteredCombos !== null;

  if (!hasFilter) {
    target.textContent = t("filter.none");
    return;
  }

  if (!activeCount) {
    target.textContent = t("filter.empty");
    return;
  }

  target.textContent = t("filter.matched", { matched: activeCount, total: allCount });
}

function renderRankingList() {
  const combos = getActiveCombos();
  const total = combos.length;
  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  state.page = Math.min(state.page, totalPages);

  const start = (state.page - 1) * state.pageSize;
  const end = Math.min(total, start + state.pageSize);
  const visible = combos.slice(start, end);

  const root = document.getElementById("planList");

  if (!total) {
    root.innerHTML = `<article class="plan-item"><p class="plan-item-detail">${state.filteredCombos ? t("ranking.emptyAfterFilter") : t("ranking.emptyNoData")}</p></article>`;
    document.getElementById("rankingMeta").textContent = t("ranking.total", { total: 0 });
    document.getElementById("pageInfo").textContent = t("ranking.pageInfo", { page: 1, totalPages: 1 });
    document.getElementById("prevPage").disabled = true;
    document.getElementById("nextPage").disabled = true;
    applySettingsAppearance();
    return;
  }

  root.innerHTML = visible.map((combo) => {
    const picked = state.data.courseNames.map((courseName) => `${courseName}:${combo.pick[courseName]}`).join(" | ");
    const active = combo.rank === state.activeComboRank;
    return `
      <article class="plan-item" data-rank="${combo.rank}">
        <div class="plan-item-top">
          <p class="plan-item-title">#${combo.rank} <span class="plan-score">${t("ranking.scoreTotal", { score: combo.score.total })}</span></p>
          <button class="plan-apply-btn" data-rank="${combo.rank}">${active ? t("ranking.applied") : t("ranking.applyPreview")}</button>
        </div>
        <p class="plan-item-detail">s1=${combo.score.s1} | s2=${combo.score.s2} | s3=${combo.score.s3}</p>
        <p class="plan-item-detail">${picked}</p>
      </article>
    `;
  }).join("");

  document.getElementById("rankingMeta").textContent = t("ranking.total", { total });
  document.getElementById("pageInfo").textContent = t("ranking.pageInfo", { page: state.page, totalPages });

  document.getElementById("prevPage").disabled = state.page <= 1;
  document.getElementById("nextPage").disabled = state.page >= totalPages;

  root.querySelectorAll(".plan-apply-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const rank = Number(btn.dataset.rank);
      const combo = combos.find((x) => x.rank === rank);
      if (!combo) return;
      applyCombo(combo);
    });
  });

  applySettingsAppearance();
}

function renderAll() {
  const items = getCurrentItems();
  const status = computeStatus(items);
  renderStatus(status);
  renderWeekGrid(items);
  renderRankingList();
  applySettingsAppearance();
}

function bindTopControls() {
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyPreset(btn.dataset.plan));
  });

  document.querySelectorAll(".preset-info-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const plan = btn.dataset.planInfo;
      const expanded = btn.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closePresetInfoPopover();
      } else {
        openPresetInfoPopover(plan, btn);
      }
    });
  });

  const pageSize = document.getElementById("pageSize");
  pageSize.value = String(state.pageSize);
  pageSize.addEventListener("change", () => {
    state.pageSize = Number(pageSize.value);
    state.page = 1;
    renderRankingList();
  });

  document.getElementById("prevPage").addEventListener("click", () => {
    state.page = Math.max(1, state.page - 1);
    renderRankingList();
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(getActiveCombos().length / state.pageSize));
    state.page = Math.min(totalPages, state.page + 1);
    renderRankingList();
  });

  const weekSelect = document.getElementById("weekSelect");
  weekSelect.addEventListener("change", () => {
    state.selectedWeek = weekSelect.value;
    renderAll();
  });

  document.getElementById("weekPrevBtn").addEventListener("click", () => shiftWeek(-1));
  document.getElementById("weekNextBtn").addEventListener("click", () => shiftWeek(1));
}

function initGlobalDismissHandlers() {
  const settingsPanel = document.getElementById("settingsPanel");
  const settingsToggle = document.getElementById("settingsToggle");
  const presetPopover = document.getElementById("presetInfoPopover");

  document.addEventListener("click", (evt) => {
    const target = evt.target;

    if (presetPopover && !presetPopover.hasAttribute("hidden")) {
      const hitPresetBtn = target.closest && target.closest(".preset-info-btn");
      const hitPopover = target.closest && target.closest("#presetInfoPopover");
      if (!hitPresetBtn && !hitPopover) {
        closePresetInfoPopover();
      }
    }

    if (settingsPanel && !settingsPanel.hasAttribute("hidden")) {
      const hitToggle = target.closest && target.closest("#settingsToggle");
      const hitPanel = target.closest && target.closest("#settingsPanel");
      if (!hitToggle && !hitPanel) {
        settingsPanel.setAttribute("hidden", "hidden");
        if (settingsToggle) settingsToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key !== "Escape") return;
    closePresetInfoPopover();
    if (settingsPanel && !settingsPanel.hasAttribute("hidden")) {
      settingsPanel.setAttribute("hidden", "hidden");
      if (settingsToggle) settingsToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function initPreferencePanel() {
  const toggle = document.getElementById("preferenceToggle");
  const panel = document.getElementById("preferencePanel");
  const teacherInput = document.getElementById("teacherPreferenceInput");

  toggle.addEventListener("click", () => {
    const hidden = panel.hasAttribute("hidden");
    if (hidden) {
      panel.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
      return;
    }
    panel.setAttribute("hidden", "hidden");
    toggle.setAttribute("aria-expanded", "false");
  });

  teacherInput.addEventListener("input", () => {
    state.filters.teacherQuery = teacherInput.value;
    applyPreferenceFilters();
    renderAll();
  });

  document.querySelectorAll("#dayPreferenceChecks input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      state.filters.preferredDays = [...document.querySelectorAll("#dayPreferenceChecks input[type='checkbox']:checked")].map((x) => Number(x.value));
      applyPreferenceFilters();
      renderAll();
    });
  });
}

function loadLayoutWidth() {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return 43;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return 43;
    return Math.min(62, Math.max(36, parsed));
  } catch (_) {
    return 43;
  }
}

function saveLayoutWidth(width) {
  localStorage.setItem(LAYOUT_STORAGE_KEY, String(width));
}

function initLayoutResizer() {
  const layout = document.getElementById("layoutRoot");
  const divider = document.getElementById("layoutDivider");
  if (!layout || !divider) return;

  let mainWidth = loadLayoutWidth();
  let dragging = false;

  const applyWidth = (value) => {
    const clamped = Math.min(62, Math.max(36, value));
    mainWidth = clamped;
    layout.style.setProperty("--main-width", `${clamped}%`);
    divider.setAttribute("aria-valuemin", "36");
    divider.setAttribute("aria-valuemax", "62");
    divider.setAttribute("aria-valuenow", String(Math.round(clamped)));
  };

  const updateByClientX = (clientX) => {
    if (window.matchMedia("(max-width: 1080px)").matches) return;
    const rect = layout.getBoundingClientRect();
    if (!rect.width) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    applyWidth(pct);
  };

  applyWidth(mainWidth);

  divider.addEventListener("pointerdown", (evt) => {
    if (window.matchMedia("(max-width: 1080px)").matches) return;
    dragging = true;
    divider.classList.add("dragging");
    divider.setPointerCapture(evt.pointerId);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    updateByClientX(evt.clientX);
  });

  divider.addEventListener("pointermove", (evt) => {
    if (!dragging) return;
    updateByClientX(evt.clientX);
  });

  const stopDragging = (pointerId) => {
    if (!dragging) return;
    dragging = false;
    divider.classList.remove("dragging");
    if (pointerId !== undefined && divider.hasPointerCapture(pointerId)) {
      divider.releasePointerCapture(pointerId);
    }
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    saveLayoutWidth(mainWidth);
  };

  divider.addEventListener("pointerup", (evt) => stopDragging(evt.pointerId));
  divider.addEventListener("pointercancel", (evt) => stopDragging(evt.pointerId));

  divider.addEventListener("keydown", (evt) => {
    if (evt.key !== "ArrowLeft" && evt.key !== "ArrowRight") return;
    evt.preventDefault();
    const delta = evt.key === "ArrowLeft" ? -2 : 2;
    applyWidth(mainWidth + delta);
    saveLayoutWidth(mainWidth);
  });
}

async function init() {
  loadSettings();
  await loadI18nResources();

  const resp = await fetch("./data/data.json", { cache: "no-store" });
  if (!resp.ok) {
    throw new Error(`无法加载 web/data/data.json: HTTP ${resp.status}`);
  }

  state.data = indexData(await resp.json());

  applyLanguage();
  buildCourseUI();
  renderPresetInfoPanels();
  bindTopControls();
  initGlobalDismissHandlers();
  initWeekSelector();
  initPreferencePanel();
  initLayoutResizer();
  initSettingsPanel();

  const defaultPreset = state.data.presets.plan1 ? "plan1" : Object.keys(state.data.presets)[0];
  if (defaultPreset) {
    Object.entries(state.data.presets[defaultPreset].pick).forEach(([course, classId]) => {
      state.selected[course] = classId;
    });
    setSelectValues();
    applyPreset(defaultPreset);
  }

  applyPreferenceFilters();
  renderAll();
  applySettingsAppearance();
}

init().catch((err) => {
  console.error(err);
  const target = document.getElementById("rankingMeta");
  if (target) target.textContent = t("ranking.loadFail", { msg: err.message });
});
