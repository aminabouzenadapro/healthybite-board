/* HealthyBite board — rendering and interactions. */

const COLUMNS = ["todo", "doing", "review", "done"];
const FORMATS = ["Post", "Reel", "Story", "Carousel"];
const UI_KEY = "hb-ui";
const DAY = 86400000;

const ui = Object.assign(
  { lang: "en", tab: "week", weekOverride: 0, fWeek: "current", fRole: "", fPerson: "", q: "" },
  readJSON(UI_KEY)
);

function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch { return {}; }
}
function saveUI() {
  try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch {}
}

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const t = (key, vars) => {
  let s = (I18N[ui.lang] && I18N[ui.lang][key]) || I18N.en[key] || key;
  if (vars) for (const k in vars) s = s.replace("{" + k + "}", vars[k]);
  return s;
};
/* Seeded texts are { en, fr, ar }; texts typed by the team are plain strings. */
const tx = v => (v && typeof v === "object" ? v[ui.lang] || v.en : v ?? "");
const locale = () => ({ en: "en-GB", fr: "fr-FR", ar: "ar-DZ" }[ui.lang]);
const num = n => new Intl.NumberFormat(locale()).format(n || 0);
const uid = p => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const today = () => new Date().toISOString().slice(0, 10);

function meta() {
  return Store.get("meta") || { members: defaultMembers(), startDate: "", budgetLimit: 0 };
}
function defaultMembers() { return [1, 2, 3, 4, 5, 6, 7].map(i => "Member " + i); }
function members() { return meta().members || defaultMembers(); }

function seatOf(memberIndex, week) { return SEATS[(memberIndex + week - 1) % SEATS.length]; }
function holders(week, role) { return members().filter((_, i) => seatOf(i, week) === role); }

function autoWeek() {
  const start = meta().startDate;
  if (!start) return 1;
  const diff = Math.floor((Date.now() - new Date(start + "T00:00:00").getTime()) / (7 * DAY)) + 1;
  return Math.min(7, Math.max(1, diff));
}
function currentWeek() { return ui.weekOverride || autoWeek(); }
function weekDate(n) {
  const start = meta().startDate;
  if (!start) return "";
  const d = new Date(new Date(start + "T00:00:00").getTime() + (n - 1) * 7 * DAY);
  return d.toLocaleDateString(locale(), { weekday: "short", day: "numeric", month: "short" });
}
function initials(name) {
  return String(name).trim().split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}
function avatarColor(name) {
  let h = 0;
  for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return `hsl(${Math.round(h * 137.5) % 360} 50% 42%)`;
}
function avatar(name) {
  return `<span class="avatar" style="--av:${avatarColor(name)}" title="${esc(name)}">${esc(initials(name))}</span>`;
}
function roleChip(role) {
  const r = ROLES[role];
  return r ? `<span class="chip role-chip" style="--rc:${r.color}">${r.icon} ${esc(tx(r.t))}</span>` : "";
}

/* ---------- health-claims check ---------- */
function flaggedWords(text) {
  const s = String(text || "").toLowerCase();
  if (!s) return [];
  return [...new Set(CLAIM_WORDS.filter(w => {
    if (/[؀-ۿ]/.test(w)) return s.includes(w);
    const re = new RegExp("(^|[^\\p{L}])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^\\p{L}])", "iu");
    return re.test(s);
  }))];
}
function claimsPassed(card) {
  const checks = card.checks || [];
  return CLAIM_CHECKS.every((_, i) => checks[i]) && flaggedWords(card.caption).length === 0;
}

/* ---------- seed (the HealthyBite plan) ---------- */
function seedData() {
  const list = [{ id: "meta", kind: "meta", members: defaultMembers(), startDate: "", budgetLimit: 0 }];
  let order = 1;
  WEEKS.forEach(w => {
    Object.entries(w.tasks).forEach(([role, tasks]) => {
      tasks.forEach((title, i) => {
        const isContent = /caption/i.test(title.en) || /posts?$/i.test(title.en) && role === "content";
        list.push({
          id: `c-w${w.n}-${role}-${i}`, kind: "card", title, desc: "", week: w.n, role, status: "todo",
          type: isContent ? "content" : "task", assignee: "", due: "", caption: "", checks: [], comments: [], order: order++,
        });
      });
    });
  });
  list.push({ id: "cl-practice", kind: "client", practice: true, name: "", baseline: {}, current: {} });
  list.push({ id: "cl-1", kind: "client", name: "Pilot client 1", baseline: {}, current: {} });
  SEED_RISKS.forEach((r, i) => list.push({ id: "r-" + i, kind: "risk", risk: r.risk, level: r.level, plan: r.plan, owner: "", status: "open" }));
  return list;
}

/* ---------- rendering ---------- */
let pendingRender = false;
function scheduleRender() {
  const a = document.activeElement;
  if (a && a.closest("#main") && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) { pendingRender = true; return; }
  render();
}

function render() {
  pendingRender = false;
  document.documentElement.lang = ui.lang;
  document.documentElement.dir = ui.lang === "ar" ? "rtl" : "ltr";
  renderHeader();
  renderNav();
  const view = VIEWS[ui.tab] || VIEWS.week;
  $("#main").innerHTML = view();
  if (ui.tab === "session") tickTimer();
}

function renderHeader() {
  const status = { local: "sync_local", live: "sync_live", connecting: "sync_connecting", error: "sync_error" }[Store.mode];
  $("#sync").className = "sync sync-" + Store.mode;
  $("#sync").innerHTML = `<span class="dot"></span>${esc(t(status))}`;
  $("#sync").title = Store.mode === "error" ? Store.error : Store.mode === "live" ? Store.team : "";
  $("#tagline").textContent = t("tagline");
  $("#rule").textContent = t("rule_banner");
  document.querySelectorAll("[data-lang]").forEach(b => b.classList.toggle("on", b.dataset.lang === ui.lang));
  const wk = $("#week-select");
  wk.innerHTML = WEEKS.map(w => `<option value="${w.n}" ${w.n === currentWeek() ? "selected" : ""}>${esc(t("weekN", { n: w.n }))}</option>`).join("");
}

function renderNav() {
  const tabs = ["week", "board", "session", "posts", "sellers", "budget", "risks", "settings"];
  const icons = { week: "🗓️", board: "🗂️", session: "⏱️", posts: "📈", sellers: "🤝", budget: "💰", risks: "⚠️", settings: "⚙️" };
  $("#nav").innerHTML = tabs.map(k =>
    `<button class="tab ${ui.tab === k ? "on" : ""}" data-action="tab" data-tab="${k}"><span aria-hidden="true">${icons[k]}</span>${esc(t("tab_" + k))}</button>`
  ).join("");
}

const VIEWS = {};

/* This week */
VIEWS.week = () => {
  const n = currentWeek();
  const w = WEEKS[n - 1];
  const doneChecks = w.done.filter((_, i) => Store.get(`chk-w${n}-${i}`)?.done).length;
  const cards = Store.all("card").filter(c => c.week === n);
  const counts = COLUMNS.map(s => cards.filter(c => c.status === s).length);

  const strip = Object.values(PHASES).map(p => `
    <div class="phase-group">
      <div class="phase-label">${esc(tx(p.t))}</div>
      <div class="phase-weeks">${p.weeks.map(k => {
        const wk = WEEKS[k - 1];
        const all = wk.done.length, ok = wk.done.filter((_, i) => Store.get(`chk-w${k}-${i}`)?.done).length;
        return `<button class="week-pill ${k === n ? "on" : ""} ${ok === all ? "complete" : ""}" data-action="pick-week" data-week="${k}">
          <b>${k}</b><span>${esc(tx(wk.focus))}</span><i style="--p:${Math.round(ok / all * 100)}%"></i></button>`;
      }).join("")}</div>
    </div>`).join("");

  const team = Object.keys(ROLES).map(role => `
    <div class="role-card" style="--rc:${ROLES[role].color}">
      <div class="role-name">${ROLES[role].icon} ${esc(tx(ROLES[role].t))}</div>
      <div class="role-people">${holders(n, role).map(p => `<span class="person">${avatar(p)}${esc(p)}</span>`).join("")}</div>
      <ul class="role-tasks">${w.tasks[role].map((task, i) => {
        const c = Store.get(`c-w${n}-${role}-${i}`);
        const st = c ? c.status : "todo";
        return `<li class="st-${st}" ${c ? `data-action="open-card" data-id="${c.id}"` : ""}><span class="st-dot"></span>${esc(c ? tx(c.title) : tx(task))}</li>`;
      }).join("")}</ul>
    </div>`).join("");

  return `
  <section class="hero phase-${w.phase}">
    <div>
      <div class="eyebrow">${esc(tx(PHASES[w.phase].t))}${weekDate(n) ? " · " + esc(weekDate(n)) : ""}</div>
      <h1>${esc(t("weekN", { n }))}: ${esc(tx(w.focus))}</h1>
      <p class="lesson"><span>${esc(t("lesson"))}</span>${esc(tx(w.lesson))}</p>
    </div>
    <div class="hero-stats">
      <div class="ring" style="--p:${Math.round(doneChecks / w.done.length * 100)}"><b>${doneChecks}/${w.done.length}</b><span>${esc(t("done_by_end"))}</span></div>
    </div>
  </section>
  <section class="strip">${strip}</section>
  <section class="panel">
    <h2>${esc(t("team_this_week"))}</h2>
    <div class="role-grid">${team}</div>
  </section>
  <div class="two-col">
    <section class="panel">
      <h2>${esc(t("done_by_end"))}</h2>
      <ul class="checklist">${w.done.map((d, i) => {
        const on = Store.get(`chk-w${n}-${i}`)?.done;
        return `<li><label class="check ${on ? "on" : ""}"><input type="checkbox" data-action="done-check" data-id="chk-w${n}-${i}" ${on ? "checked" : ""}><span class="box"></span>${esc(tx(d))}</label></li>`;
      }).join("")}</ul>
    </section>
    <section class="panel">
      <h2>${esc(t("cards_progress"))}</h2>
      <div class="col-counts">${COLUMNS.map((s, i) => `<div class="cc cc-${s}"><b>${counts[i]}</b><span>${esc(t("col_" + s))}</span></div>`).join("")}</div>
      <div class="stack-bar">${COLUMNS.map((s, i) => counts[i] ? `<i class="sb-${s}" style="flex:${counts[i]}"></i>` : "").join("")}</div>
      <button class="btn ghost" data-action="tab" data-tab="board" data-fweek="${n}">${esc(t("tab_board"))} →</button>
    </section>
  </div>`;
};

/* Board */
function filteredCards() {
  const wk = ui.fWeek === "current" ? currentWeek() : Number(ui.fWeek) || 0;
  const q = ui.q.trim().toLowerCase();
  return Store.all("card").filter(c => {
    if (wk && c.week !== wk) return false;
    if (ui.fRole && c.role !== ui.fRole) return false;
    if (ui.fPerson && !cardPeople(c).includes(ui.fPerson)) return false;
    if (q && !(tx(c.title) + " " + (c.desc || "") + " " + (c.caption || "")).toLowerCase().includes(q)) return false;
    return true;
  }).sort((a, b) => (a.order || 0) - (b.order || 0));
}
function cardPeople(c) {
  if (c.assignee) return [c.assignee];
  return c.role && c.week ? holders(c.week, c.role) : [];
}

VIEWS.board = () => {
  const cards = filteredCards();
  const opt = (v, label, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? "selected" : ""}>${esc(label)}</option>`;
  const toolbar = `
  <div class="toolbar">
    <select data-ui="fWeek">${opt("current", t("current_week") + " (" + currentWeek() + ")", ui.fWeek)}${opt("0", t("all_weeks"), ui.fWeek)}${WEEKS.map(w => opt(w.n, t("weekN", { n: w.n }), ui.fWeek)).join("")}</select>
    <select data-ui="fRole">${opt("", t("all_roles"), ui.fRole)}${Object.keys(ROLES).map(r => opt(r, tx(ROLES[r].t), ui.fRole)).join("")}</select>
    <select data-ui="fPerson">${opt("", t("all_people"), ui.fPerson)}${members().map(m => opt(m, m, ui.fPerson)).join("")}</select>
    <input type="search" data-ui="q" value="${esc(ui.q)}" placeholder="${esc(t("search"))}">
    <button class="btn primary" data-action="new-card">＋ ${esc(t("new_card"))}</button>
  </div>`;
  const cols = COLUMNS.map(s => {
    const list = cards.filter(c => c.status === s);
    return `<div class="column col-${s}" data-drop="card" data-status="${s}">
      <div class="col-head"><span>${esc(t("col_" + s))}</span><b>${list.length}</b></div>
      <div class="col-body">${list.map(cardHTML).join("") || `<div class="empty">${esc(t("empty"))}</div>`}</div>
    </div>`;
  }).join("");
  return toolbar + `<div class="kanban">${cols}</div>`;
};

function cardHTML(c) {
  const r = ROLES[c.role];
  const people = cardPeople(c);
  let badge = "";
  if (c.type === "content") {
    badge = claimsPassed(c)
      ? `<span class="chip ok">✓ ${esc(t("claims_ok"))}</span>`
      : `<span class="chip warn">⚑ ${esc(t("claims_pending"))}</span>`;
  }
  return `<article class="card" draggable="true" data-id="${c.id}" data-action="open-card" style="--rc:${r ? r.color : "var(--muted)"}">
    <div class="card-title">${esc(tx(c.title))}</div>
    <div class="card-meta">
      <span class="chip">${esc(t("weekN", { n: c.week }))}</span>
      ${r ? `<span class="chip role-chip" style="--rc:${r.color}">${r.icon} ${esc(tx(r.t))}</span>` : ""}
      ${badge}
      ${c.due ? `<span class="chip">📅 ${esc(new Date(c.due + "T00:00:00").toLocaleDateString(locale(), { day: "numeric", month: "short" }))}</span>` : ""}
      ${(c.comments || []).length ? `<span class="chip">💬 ${c.comments.length}</span>` : ""}
    </div>
    <div class="card-people">${people.map(avatar).join("")}</div>
  </article>`;
}

/* Move a card; content cards cannot reach Done before the claims review passes. */
function moveCard(id, status, order) {
  const c = Store.get(id);
  if (!c) return;
  if (status === "done" && c.type === "content" && !claimsPassed(c)) {
    toast(t("claims_block"), "warn");
    status = "review";
  }
  Store.patch(id, { status, order: order ?? Date.now() });
}

/* Session */
function timerState() {
  return Store.get("timer") || { id: "timer", kind: "timer", running: false, startedAt: 0, base: 0 };
}
function elapsedMs() {
  const s = timerState();
  return s.base + (s.running ? Date.now() - s.startedAt : 0);
}
function blockAt(ms) {
  let acc = 0;
  for (let i = 0; i < AGENDA.length; i++) {
    const len = AGENDA[i].min * 60000;
    if (ms < acc + len) return { i, start: acc, len };
    acc += len;
  }
  return { i: AGENDA.length, start: acc, len: 0 };
}
const TOTAL_MS = AGENDA.reduce((s, b) => s + b.min * 60000, 0);
const clock = ms => {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60;
  return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(sec).padStart(2, "0");
};

VIEWS.session = () => {
  const n = currentWeek();
  const note = Store.get(`note-w${n}`) || {};
  const prev = n > 1 ? Store.get(`note-w${n - 1}`) : null;
  const logs = Store.all("log").sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const s = timerState();
  const field = (key, label) => `
    <label class="field"><span>${esc(label)}</span>
      <textarea rows="4" data-note="note-w${n}" data-key="${key}">${esc(note[key] || "")}</textarea></label>`;
  return `
  <section class="panel timer-panel">
    <div class="timer-head">
      <h2>${esc(t("timer_title"))}</h2>
      <div class="timer-btns">
        <button class="btn primary" data-action="timer-toggle">${s.running ? "⏸ " + esc(t("pause")) : "▶ " + esc(t("start"))}</button>
        <button class="btn" data-action="timer-next">⏭ ${esc(t("next_block"))}</button>
        <button class="btn ghost" data-action="timer-reset">↺ ${esc(t("reset"))}</button>
      </div>
    </div>
    <div class="timer-body">
      <div class="timer-now"><div id="t-block" class="t-block"></div><div id="t-clock" class="t-clock">0:00</div><div class="t-sub"><span id="t-total"></span></div></div>
      <ol class="agenda">${AGENDA.map((b, i) => `<li id="ag-${i}" style="flex:${b.min}"><div class="ag-bar"><i></i></div><b>${esc(tx(b.t))}</b><span>${b.min} min</span></li>`).join("")}</ol>
    </div>
    <p class="hint">${esc(t("timer_shared"))}</p>
  </section>
  <div class="two-col">
    <section class="panel">
      <h2>${esc(t("handoff"))} · ${esc(t("weekN", { n }))}</h2>
      ${field("done", t("handoff_done"))}
      ${field("left", t("handoff_left"))}
      ${field("between", t("handoff_between"))}
      <p class="hint">${esc(t("handoff_hint"))}</p>
    </section>
    <section class="panel">
      <h2>${esc(t("handoff"))} · ${esc(n > 1 ? t("weekN", { n: n - 1 }) : t("none"))}</h2>
      ${prev ? ["done", "left", "between"].map(k => `<div class="readout"><span>${esc(t("handoff_" + k))}</span><p>${esc(prev[k] || t("none"))}</p></div>`).join("")
        : `<div class="empty">${esc(t("empty"))}</div>`}
    </section>
  </div>
  <section class="panel">
    <h2>${esc(t("between_log"))}</h2>
    <p class="hint">${esc(t("between_hint"))}</p>
    ${table(logs, [
      { key: "date", label: t("date"), type: "date" },
      { key: "who", label: t("who"), type: "select", options: members().map(m => [m, m]) },
      { key: "what", label: t("what"), type: "text", wide: true },
    ], "log")}
  </section>`;
};

let lastBlock = -1;
function tickTimer() {
  const el = $("#t-clock");
  if (!el) return;
  const ms = elapsedMs();
  const b = blockAt(ms);
  const done = b.i >= AGENDA.length;
  el.textContent = done ? "0:00" : clock(b.start + b.len - ms);
  $("#t-block").textContent = done ? t("col_done") + " ✓" : tx(AGENDA[b.i].t);
  $("#t-total").textContent = `${t("total")} ${clock(Math.min(ms, TOTAL_MS))} / ${clock(TOTAL_MS)}`;
  let acc = 0;
  AGENDA.forEach((blk, i) => {
    const len = blk.min * 60000;
    const p = Math.min(1, Math.max(0, (ms - acc) / len));
    const li = $("#ag-" + i);
    li.querySelector("i").style.width = p * 100 + "%";
    li.classList.toggle("now", i === b.i);
    li.classList.toggle("past", p >= 1);
    acc += len;
  });
  if (timerState().running && lastBlock !== -1 && b.i !== lastBlock) beep();
  lastBlock = b.i;
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25].forEach(d => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.15, ctx.currentTime + d);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.2);
      o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.2);
    });
  } catch {}
}
setInterval(tickTimer, 1000);

/* Generic inline table. Edits save on change; rows are items of `kind`. */
function table(rows, cols, kind, extraFoot = "") {
  const cell = (row, c) => {
    const v = c.key.split(".").reduce((o, k) => (o || {})[k], row);
    const attrs = `data-id="${row.id}" data-key="${c.key}" ${c.type === "number" ? 'data-num="1"' : ""}`;
    if (c.type === "select") {
      return `<select ${attrs}><option value=""></option>${c.options.map(([val, label]) => `<option value="${esc(val)}" ${val === v ? "selected" : ""}>${esc(label)}</option>`).join("")}</select>`;
    }
    const type = c.type === "number" ? "number" : c.type === "date" ? "date" : "text";
    return `<input type="${type}" ${type === "number" ? 'min="0" inputmode="numeric"' : ""} value="${esc(tx(v))}" ${attrs}>`;
  };
  return `<div class="table-wrap"><table class="grid">
    <thead><tr>${cols.map(c => `<th class="${c.wide ? "wide" : ""} ${c.type === "number" ? "num" : ""}">${esc(c.label)}</th>`).join("")}<th></th></tr></thead>
    <tbody>${rows.map(r => `<tr>${cols.map(c => `<td class="${c.type === "number" ? "num" : ""}">${cell(r, c)}</td>`).join("")}
      <td><button class="icon-btn" data-action="del-item" data-id="${r.id}" title="${esc(t("delete"))}">✕</button></td></tr>`).join("")
      || `<tr><td colspan="${cols.length + 1}" class="empty">${esc(t("empty"))}</td></tr>`}</tbody>
    ${extraFoot}
  </table></div>
  <button class="btn" data-action="add-row" data-kind="${kind}">＋ ${esc(t("add_row"))}</button>`;
}

/* Posts */
const METRICS = [["followers", "followers"], ["reach", "avg_reach"], ["likes", "avg_likes"], ["messages", "msgs_week"]];
function clientName(c) { return c.practice ? t("practice_page") : c.name || t("client_name"); }

VIEWS.posts = () => {
  const clients = Store.all("client").sort((a, b) => (b.practice ? 1 : 0) - (a.practice ? 1 : 0));
  const posts = Store.all("post").sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const sum = k => posts.reduce((s, p) => s + (Number(p[k]) || 0), 0);
  const foot = `<tfoot><tr><td colspan="4">${esc(t("totals"))} · ${posts.length}</td>${["reach", "likes", "saves", "messages"].map(k => `<td class="num"><b>${num(sum(k))}</b></td>`).join("")}<td></td></tr></tfoot>`;

  const cmp = clients.map(c => `
    <div class="client-card">
      <div class="client-head">
        ${c.practice ? `<b>${esc(clientName(c))}</b>` : `<input class="client-name" value="${esc(c.name)}" data-id="${c.id}" data-key="name" placeholder="${esc(t("client_name"))}">`}
        ${c.practice ? "" : `<button class="icon-btn" data-action="del-item" data-id="${c.id}" title="${esc(t("delete"))}">✕</button>`}
      </div>
      <table class="metrics">
        <thead><tr><th></th><th>${esc(t("baseline"))}</th><th>${esc(t("current"))}</th><th>${esc(t("change"))}</th></tr></thead>
        <tbody>${METRICS.map(([k, label]) => {
          const b = Number((c.baseline || {})[k]) || 0, cur = Number((c.current || {})[k]) || 0;
          const pct = b ? Math.round((cur - b) / b * 100) : null;
          const max = Math.max(b, cur, 1);
          return `<tr><th>${esc(t(label))}</th>
            <td><input type="number" min="0" data-num="1" data-id="${c.id}" data-key="baseline.${k}" value="${(c.baseline || {})[k] ?? ""}"></td>
            <td><input type="number" min="0" data-num="1" data-id="${c.id}" data-key="current.${k}" value="${(c.current || {})[k] ?? ""}"></td>
            <td class="delta ${pct > 0 ? "up" : pct < 0 ? "down" : ""}">${pct === null ? t("none") : (pct > 0 ? "+" : "") + pct + "%"}
              <div class="mini-bars"><i class="b" style="width:${b / max * 100}%"></i><i class="c" style="width:${cur / max * 100}%"></i></div></td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>`).join("");

  return `
  <section class="panel">
    <div class="panel-head"><h2>${esc(t("baseline_title"))}</h2><button class="btn" data-action="add-row" data-kind="client">＋ ${esc(t("add_client"))}</button></div>
    <div class="legend"><span><i class="b"></i>${esc(t("baseline"))}</span><span><i class="c"></i>${esc(t("current"))}</span></div>
    <div class="client-grid">${cmp}</div>
  </section>
  <section class="panel">
    <h2>${esc(t("posts_title"))}</h2>
    ${table(posts, [
      { key: "date", label: t("date"), type: "date" },
      { key: "account", label: t("account"), type: "select", options: clients.map(c => [c.id, clientName(c)]) },
      { key: "post", label: t("post"), type: "text", wide: true },
      { key: "format", label: t("format"), type: "select", options: FORMATS.map(f => [f, f]) },
      { key: "reach", label: t("reach"), type: "number" },
      { key: "likes", label: t("likes"), type: "number" },
      { key: "saves", label: t("saves"), type: "number" },
      { key: "messages", label: t("messages"), type: "number" },
    ], "post", foot)}
  </section>`;
};

/* Sellers */
VIEWS.sellers = () => {
  const sellers = Store.all("seller").sort((a, b) => (a.order || 0) - (b.order || 0));
  const pitched = sellers.filter(s => s.stage && s.stage !== "todo").length;
  const signed = sellers.filter(s => s.stage === "signed").length;
  return `
  <section class="panel">
    <div class="panel-head"><div><h2>${esc(t("sellers_title"))}</h2><p class="hint">${esc(t("sellers_goal"))}</p></div>
      <button class="btn primary" data-action="new-seller">＋ ${esc(t("new_seller"))}</button></div>
    <div class="goal-row">
      <div class="goal"><span>${esc(t("pitched"))}</span><b>${pitched}<small> / 15</small></b><div class="meter"><i style="width:${Math.min(100, pitched / 15 * 100)}%"></i></div></div>
      <div class="goal"><span>${esc(t("stage_signed"))}</span><b>${signed}<small> / 2</small></b><div class="meter"><i style="width:${Math.min(100, signed / 2 * 100)}%"></i></div></div>
    </div>
  </section>
  <div class="kanban pipeline">${SELLER_STAGES.map(st => {
    const list = sellers.filter(s => (s.stage || "todo") === st);
    return `<div class="column stage-${st}" data-drop="seller" data-status="${st}">
      <div class="col-head"><span>${esc(t("stage_" + st))}</span><b>${list.length}</b></div>
      <div class="col-body">${list.map(s => `
        <article class="card seller" draggable="true" data-id="${s.id}" data-action="open-seller">
          <div class="card-title">${esc(s.name || "—")}</div>
          <div class="card-meta">${s.city ? `<span class="chip">📍 ${esc(s.city)}</span>` : ""}${s.contact ? `<span class="chip">${esc(s.contact)}</span>` : ""}</div>
          ${s.products ? `<div class="card-sub">${esc(s.products)}</div>` : ""}
        </article>`).join("") || `<div class="empty">${esc(t("empty"))}</div>`}</div>
    </div>`;
  }).join("")}</div>`;
};

/* Budget */
VIEWS.budget = () => {
  const rows = Store.all("budget").sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const spent = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const limit = Number(meta().budgetLimit) || 0;
  const pct = limit ? Math.min(100, spent / limit * 100) : 0;
  return `
  <section class="panel">
    <h2>${esc(t("budget_title"))}</h2>
    <div class="goal-row">
      <label class="goal"><span>${esc(t("budget_limit"))}</span><input type="number" min="0" data-num="1" data-id="meta" data-key="budgetLimit" value="${limit || ""}"></label>
      <div class="goal"><span>${esc(t("spent"))}</span><b>${num(spent)} <small>DZD</small></b><div class="meter ${limit && spent > limit ? "over" : ""}"><i style="width:${pct}%"></i></div></div>
      <div class="goal"><span>${esc(t("left"))}</span><b class="${limit && spent > limit ? "neg" : ""}">${limit ? num(limit - spent) : t("none")} <small>DZD</small></b></div>
    </div>
    ${table(rows, [
      { key: "date", label: t("date"), type: "date" },
      { key: "item", label: t("item"), type: "text", wide: true },
      { key: "category", label: t("category"), type: "text" },
      { key: "amount", label: t("amount"), type: "number" },
      { key: "paidBy", label: t("paid_by"), type: "select", options: members().map(m => [m, m]) },
    ], "budget")}
  </section>`;
};

/* Risks */
VIEWS.risks = () => {
  const rows = Store.all("risk");
  const lv = { high: 0, medium: 1, low: 2 };
  rows.sort((a, b) => (a.status === "closed") - (b.status === "closed") || (lv[a.level] ?? 3) - (lv[b.level] ?? 3));
  return `
  <section class="panel">
    <h2>${esc(t("risks_title"))}</h2>
    ${table(rows, [
      { key: "risk", label: t("risk"), type: "text", wide: true },
      { key: "level", label: t("level"), type: "select", options: ["low", "medium", "high"].map(l => [l, t("level_" + l)]) },
      { key: "plan", label: t("plan"), type: "text", wide: true },
      { key: "owner", label: t("owner"), type: "select", options: members().map(m => [m, m]) },
      { key: "status", label: t("status"), type: "select", options: [["open", t("open")], ["closed", t("closed")]] },
    ], "risk")}
  </section>`;
};

/* Settings */
VIEWS.settings = () => {
  const m = meta();
  const conn = Store.connection();
  const live = Store.mode === "live" || Store.mode === "connecting";
  return `
  <section class="panel">
    <h2>${esc(t("members"))}</h2>
    <p class="hint">${esc(t("members_hint"))}</p>
    <div class="members">${members().map((name, i) => `
      <label class="member">${avatar(name)}<input value="${esc(name)}" data-member="${i}">
        <span class="seat">${esc(t("weekN", { n: currentWeek() }))}: ${ROLES[seatOf(i, currentWeek())].icon} ${esc(tx(ROLES[seatOf(i, currentWeek())].t))}</span></label>`).join("")}</div>
    <div class="rotation table-wrap"><table class="grid rot">
      <thead><tr><th></th>${WEEKS.map(w => `<th>${w.n}</th>`).join("")}</tr></thead>
      <tbody>${members().map((name, i) => `<tr><th>${esc(name)}</th>${WEEKS.map(w => {
        const r = seatOf(i, w.n);
        return `<td title="${esc(tx(ROLES[r].t))}" style="--rc:${ROLES[r].color}" class="rot-cell">${ROLES[r].icon}</td>`;
      }).join("")}</tr>`).join("")}</tbody>
    </table></div>
    <div class="settings-row">
      <label class="field"><span>${esc(t("start_date"))}</span><input type="date" data-id="meta" data-key="startDate" value="${esc(m.startDate || "")}"></label>
      <label class="field"><span>${esc(t("current_week"))}</span>
        <select data-ui-num="weekOverride"><option value="0">${esc(t("auto"))} (${autoWeek()})</option>${WEEKS.map(w => `<option value="${w.n}" ${ui.weekOverride === w.n ? "selected" : ""}>${esc(t("weekN", { n: w.n }))}</option>`).join("")}</select></label>
    </div>
  </section>
  <section class="panel">
    <h2>${esc(t("sharing"))}</h2>
    <p class="${live ? "ok-text" : "hint"}">${live ? esc(t("sharing_on")) + " <b>" + esc(Store.team) + "</b>" : esc(t("sharing_off"))}</p>
    ${Store.mode === "error" ? `<p class="err-text">${esc(Store.error)}</p>` : ""}
    <label class="field"><span>${esc(t("paste_config"))}</span>
      <textarea id="fb-config" rows="5" spellcheck="false" placeholder="const firebaseConfig = { apiKey: &quot;…&quot;, projectId: &quot;…&quot;, … };"></textarea></label>
    <label class="field"><span>${esc(t("team_space"))}</span><input id="fb-team" value="${esc((conn && conn.team) || "healthybite")}"></label>
    <div class="btn-row">
      <button class="btn primary" data-action="fb-connect">${esc(t("connect"))}</button>
      ${live ? `<button class="btn ghost" data-action="fb-disconnect">${esc(t("disconnect"))}</button>` : ""}
    </div>
  </section>
  <section class="panel">
    <h2>${esc(t("backup"))}</h2>
    <div class="btn-row">
      <button class="btn" data-action="export">⬇ ${esc(t("export"))}</button>
      <label class="btn">⬆ ${esc(t("import"))}<input type="file" accept=".json,application/json" id="import-file" hidden></label>
      <button class="btn danger" data-action="reset">${esc(t("reset_plan"))}</button>
    </div>
  </section>`;
};

/* ---------- modals ---------- */
function openModal(html, onReady) {
  const m = $("#modal");
  m.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">${html}</div>`;
  m.hidden = false;
  document.body.classList.add("modal-open");
  onReady && onReady(m);
}
function closeModal() {
  $("#modal").hidden = true;
  $("#modal").innerHTML = "";
  document.body.classList.remove("modal-open");
  if (pendingRender) render();
}

function openCard(id) {
  const isNew = !id;
  const c = isNew
    ? { id: uid("c"), kind: "card", title: "", desc: "", week: currentWeek(), role: "", status: "todo", type: "task", assignee: "", due: "", caption: "", checks: [], comments: [] }
    : structuredClone(Store.get(id));
  if (!c) return;
  const opt = (v, label, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? "selected" : ""}>${esc(label)}</option>`;
  openModal(`
    <form id="card-form" class="form">
      <div class="modal-head"><input class="title-input" name="title" value="${esc(tx(c.title))}" placeholder="${esc(t("title"))}" required>
        <button type="button" class="icon-btn" data-action="close-modal">✕</button></div>
      <div class="form-grid">
        <label class="field"><span>${esc(t("status"))}</span><select name="status">${COLUMNS.map(s => opt(s, t("col_" + s), c.status)).join("")}</select></label>
        <label class="field"><span>${esc(t("week"))}</span><select name="week">${WEEKS.map(w => opt(w.n, t("weekN", { n: w.n }), c.week)).join("")}</select></label>
        <label class="field"><span>${esc(t("role"))}</span><select name="role">${opt("", t("none"), c.role)}${Object.keys(ROLES).map(r => opt(r, ROLES[r].icon + " " + tx(ROLES[r].t), c.role)).join("")}</select></label>
        <label class="field"><span>${esc(t("assignee"))}</span><select name="assignee">${opt("", t("auto_role"), c.assignee)}${members().map(mm => opt(mm, mm, c.assignee)).join("")}</select></label>
        <label class="field"><span>${esc(t("due"))}</span><input type="date" name="due" value="${esc(c.due || "")}"></label>
        <label class="field"><span>${esc(t("type"))}</span><select name="type">${opt("task", t("type_task"), c.type)}${opt("content", t("type_content"), c.type)}</select></label>
      </div>
      <label class="field"><span>${esc(t("description"))}</span><textarea name="desc" rows="3">${esc(c.desc || "")}</textarea></label>
      <div class="claims" ${c.type === "content" ? "" : "hidden"}>
        <label class="field"><span>${esc(t("caption"))}</span><textarea name="caption" rows="4">${esc(c.caption || "")}</textarea></label>
        <div class="flags"></div>
        <fieldset class="claims-box"><legend>🛡️ ${esc(t("claims_review"))}</legend>
          ${CLAIM_CHECKS.map((ch, i) => `<label class="check ${c.checks[i] ? "on" : ""}"><input type="checkbox" name="check${i}" ${c.checks[i] ? "checked" : ""}><span class="box"></span>${esc(tx(ch))}</label>`).join("")}
          <div class="claims-status"></div>
        </fieldset>
      </div>
      <div class="comments">
        <span class="field-label">${esc(t("comments"))}</span>
        <ul>${(c.comments || []).map(cm => `<li><b>${esc(cm.who)}</b> <small>${esc(new Date(cm.at).toLocaleString(locale(), { dateStyle: "short", timeStyle: "short" }))}</small><p>${esc(cm.text)}</p></li>`).join("")}</ul>
        <div class="comment-row"><select name="cwho">${members().map(mm => opt(mm, mm, "")).join("")}</select><input name="ctext" placeholder="…"></div>
      </div>
      <div class="modal-foot">
        ${isNew ? "" : `<button type="button" class="btn danger ghost" data-action="del-card" data-id="${c.id}">${esc(t("delete"))}</button>`}
        <span class="spacer"></span>
        <button type="button" class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button>
        <button type="submit" class="btn primary">${esc(t("save"))}</button>
      </div>
    </form>`, m => {
    const f = $("#card-form", m);
    const refresh = () => {
      const isContent = f.type.value === "content";
      $(".claims", f).hidden = !isContent;
      const words = flaggedWords(f.caption.value);
      $(".flags", f).innerHTML = words.length ? `<div class="flag-box">⚠️ ${esc(t("claims_flagged"))} ${words.map(w => `<mark>${esc(w)}</mark>`).join(" ")}</div>` : "";
      f.querySelectorAll(".claims-box .check").forEach(l => l.classList.toggle("on", l.querySelector("input").checked));
      const ok = CLAIM_CHECKS.every((_, i) => f["check" + i].checked) && !words.length;
      $(".claims-status", f).innerHTML = ok ? `<span class="chip ok">✓ ${esc(t("claims_ok"))}</span>` : `<span class="chip warn">⚑ ${esc(t("claims_pending"))}</span>`;
    };
    f.addEventListener("input", refresh);
    f.addEventListener("change", refresh);
    refresh();
    f.addEventListener("submit", e => {
      e.preventDefault();
      const title = f.title.value.trim();
      const seededSame = typeof c.title === "object" && title === tx(c.title);
      const next = {
        ...c,
        title: seededSame ? c.title : title,
        desc: f.desc.value, week: Number(f.week.value), role: f.role.value, assignee: f.assignee.value,
        due: f.due.value, type: f.type.value, caption: f.caption.value,
        checks: CLAIM_CHECKS.map((_, i) => f["check" + i].checked),
        order: c.order || Date.now(),
      };
      if (f.ctext.value.trim()) next.comments = [...(c.comments || []), { who: f.cwho.value, text: f.ctext.value.trim(), at: Date.now() }];
      let status = f.status.value;
      if (status === "done" && next.type === "content" && !claimsPassed(next)) {
        toast(t("claims_block"), "warn");
        status = "review";
      }
      next.status = status;
      Store.put(next);
      closeModal();
    });
    if (isNew) f.title.focus();
  });
}

function openSeller(id) {
  const isNew = !id;
  const s = isNew ? { id: uid("s"), kind: "seller", name: "", contact: "", city: "", products: "", notes: "", stage: "todo", order: Date.now() } : { ...Store.get(id) };
  const f = (name, label, type = "text") => `<label class="field"><span>${esc(t(label))}</span>${type === "area"
    ? `<textarea name="${name}" rows="3">${esc(s[name] || "")}</textarea>` : `<input name="${name}" value="${esc(s[name] || "")}">`}</label>`;
  openModal(`
    <form id="seller-form" class="form">
      <div class="modal-head"><h3>${esc(isNew ? t("new_seller") : s.name)}</h3><button type="button" class="icon-btn" data-action="close-modal">✕</button></div>
      <div class="form-grid">
        ${f("name", "seller_name")}${f("contact", "contact")}${f("city", "city")}
        <label class="field"><span>${esc(t("status"))}</span><select name="stage">${SELLER_STAGES.map(st => `<option value="${st}" ${s.stage === st ? "selected" : ""}>${esc(t("stage_" + st))}</option>`).join("")}</select></label>
      </div>
      ${f("products", "products")}${f("notes", "notes", "area")}
      <div class="modal-foot">
        ${isNew ? "" : `<button type="button" class="btn danger ghost" data-action="del-item" data-id="${s.id}" data-close="1">${esc(t("delete"))}</button>`}
        <span class="spacer"></span>
        <button type="button" class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button>
        <button type="submit" class="btn primary">${esc(t("save"))}</button>
      </div>
    </form>`, m => {
    const form = $("#seller-form", m);
    form.name.focus();
    form.addEventListener("submit", e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      Store.put({ ...s, ...data });
      closeModal();
    });
  });
}

function toast(msg, kind = "") {
  const el = document.createElement("div");
  el.className = "toast " + kind;
  el.textContent = msg;
  $("#toasts").appendChild(el);
  setTimeout(() => el.classList.add("out"), 4200);
  setTimeout(() => el.remove(), 4700);
}

/* ---------- events ---------- */
function setPath(obj, path, value) {
  const keys = path.split(".");
  const top = { ...obj };
  let cur = top;
  keys.slice(0, -1).forEach(k => { cur[k] = { ...(cur[k] || {}) }; cur = cur[k]; });
  cur[keys[keys.length - 1]] = value;
  return top;
}

document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (e.target.id === "modal") return closeModal();
  if (!el) return;
  const a = el.dataset.action;
  if (a === "tab") {
    ui.tab = el.dataset.tab;
    if (el.dataset.fweek) ui.fWeek = "current";
    saveUI(); render(); window.scrollTo(0, 0);
  } else if (a === "pick-week") {
    ui.weekOverride = Number(el.dataset.week); saveUI(); render();
  } else if (a === "open-card") {
    openCard(el.dataset.id);
  } else if (a === "new-card") {
    openCard(null);
  } else if (a === "open-seller") {
    openSeller(el.dataset.id);
  } else if (a === "new-seller") {
    openSeller(null);
  } else if (a === "close-modal") {
    closeModal();
  } else if (a === "del-card" || a === "del-item") {
    if (confirm(t("confirm_delete"))) {
      Store.del(el.dataset.id);
      if (a === "del-card" || el.dataset.close) closeModal();
    }
  } else if (a === "add-row") {
    const kind = el.dataset.kind;
    const base = { id: uid(kind[0]), kind };
    if (kind === "post" || kind === "budget" || kind === "log") base.date = today();
    if (kind === "risk") Object.assign(base, { level: "medium", status: "open" });
    if (kind === "client") Object.assign(base, { name: "", baseline: {}, current: {} });
    Store.put(base);
  } else if (a === "timer-toggle") {
    const s = timerState();
    Store.put(s.running ? { ...s, running: false, base: elapsedMs() } : { ...s, running: true, startedAt: Date.now() });
  } else if (a === "timer-next") {
    const s = timerState(), b = blockAt(elapsedMs());
    const base = Math.min(TOTAL_MS, b.start + b.len);
    lastBlock = -1;
    Store.put({ ...s, base, startedAt: Date.now() });
  } else if (a === "timer-reset") {
    lastBlock = -1;
    Store.put({ id: "timer", kind: "timer", running: false, startedAt: 0, base: 0 });
  } else if (a === "fb-connect") {
    const cfg = parseFirebaseConfig($("#fb-config").value);
    const prev = Store.connection();
    const firebase = cfg || (prev && prev.firebase);
    if (!firebase) { toast("Firebase config: apiKey / projectId ?", "warn"); return; }
    Store.saveConnection({ firebase, team: $("#fb-team").value.trim() || "healthybite" });
    location.reload();
  } else if (a === "fb-disconnect") {
    Store.saveConnection(null);
    location.reload();
  } else if (a === "export") {
    const blob = new Blob([JSON.stringify([...Store.items.values()], null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `healthybite-board-${today()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  } else if (a === "reset") {
    if (confirm(t("confirm_reset"))) Store.replaceAll(seedData());
  }
});

document.addEventListener("change", e => {
  const el = e.target;
  if (el.id === "week-select") {
    ui.weekOverride = Number(el.value); saveUI(); render(); return;
  }
  if (el.id === "import-file") {
    const file = el.files[0];
    if (!file) return;
    file.text().then(txt => {
      const list = JSON.parse(txt);
      if (Array.isArray(list) && list.every(it => it && it.id && it.kind)) { Store.replaceAll(list); toast(t("imported")); }
    }).catch(err => toast(String(err), "warn"));
    return;
  }
  if (el.dataset.action === "done-check") {
    Store.put({ id: el.dataset.id, kind: "check", done: el.checked });
    return;
  }
  if (el.dataset.ui) { ui[el.dataset.ui] = el.value; saveUI(); render(); return; }
  if (el.dataset.uiNum) { ui[el.dataset.uiNum] = Number(el.value); saveUI(); render(); return; }
  if (el.dataset.member !== undefined) {
    const list = [...members()];
    const old = list[el.dataset.member];
    list[el.dataset.member] = el.value.trim() || old;
    Store.put({ ...meta(), id: "meta", kind: "meta", members: list });
    return;
  }
  if (el.dataset.note) {
    const cur = Store.get(el.dataset.note) || { id: el.dataset.note, kind: "note" };
    Store.put({ ...cur, [el.dataset.key]: el.value });
    return;
  }
  if (el.dataset.id && el.dataset.key && el.closest("#main")) {
    const item = Store.get(el.dataset.id) || (el.dataset.id === "meta" ? { ...meta(), id: "meta", kind: "meta" } : null);
    if (!item) return;
    const value = el.dataset.num ? (el.value === "" ? "" : Number(el.value)) : el.value;
    Store.put(setPath(item, el.dataset.key, value));
  }
});

/* Search box filters as you type. */
document.addEventListener("input", e => {
  if (e.target.dataset.ui === "q") {
    ui.q = e.target.value; saveUI();
    const body = $(".kanban");
    if (body) {
      const pos = e.target.selectionStart;
      render();
      const box = $('[data-ui="q"]');
      box.focus(); box.setSelectionRange(pos, pos);
    }
  }
});

document.addEventListener("focusout", e => {
  if (pendingRender && e.target.closest("#main")) setTimeout(() => {
    const a = document.activeElement;
    if (!(a && a.closest("#main") && /INPUT|TEXTAREA|SELECT/.test(a.tagName))) render();
  }, 0);
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$("#modal").hidden) closeModal();
  if (e.key === "Enter" && e.target.dataset.action === "open-card") openCard(e.target.dataset.id);
});

/* Drag and drop (cards and sellers). Drop position decides the order. */
let dragId = null;
document.addEventListener("dragstart", e => {
  const card = e.target.closest(".card[draggable]");
  if (!card) return;
  dragId = card.dataset.id;
  card.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", dragId);
});
document.addEventListener("dragend", e => {
  e.target.closest?.(".card")?.classList.remove("dragging");
  document.querySelectorAll(".drop-on").forEach(c => c.classList.remove("drop-on"));
  dragId = null;
});
document.addEventListener("dragover", e => {
  const col = e.target.closest("[data-drop]");
  if (!col || !dragId) return;
  e.preventDefault();
  document.querySelectorAll(".drop-on").forEach(c => c !== col && c.classList.remove("drop-on"));
  col.classList.add("drop-on");
});
document.addEventListener("drop", e => {
  const col = e.target.closest("[data-drop]");
  if (!col || !dragId) return;
  e.preventDefault();
  const siblings = [...col.querySelectorAll(".card:not(.dragging)")];
  const after = siblings.find(el => { const r = el.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
  const orderOf = el => Store.get(el.dataset.id)?.order || 0;
  let order;
  if (after) {
    const idx = siblings.indexOf(after);
    const prev = idx > 0 ? orderOf(siblings[idx - 1]) : orderOf(after) - 2;
    order = (prev + orderOf(after)) / 2;
  } else {
    order = siblings.length ? orderOf(siblings[siblings.length - 1]) + 1 : Date.now();
  }
  if (col.dataset.drop === "card") moveCard(dragId, col.dataset.status, order);
  else Store.patch(dragId, { stage: col.dataset.status, order });
  dragId = null;
});

document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => {
  ui.lang = b.dataset.lang; saveUI(); render();
}));

/* ---------- start ---------- */
Store.onChange = scheduleRender;
Store.init(seedData);
