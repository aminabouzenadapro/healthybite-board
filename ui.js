/* HealthyBite board — shared state, helpers, icons and plan accessors. */

const COLUMNS = ["todo", "doing", "review", "done"];
const FORMATS = ["Post", "Reel", "Story", "Carousel"];
const UI_KEY = "hb-ui";
const DAY = 86400000;
const MAX_PHOTOS = 6;

const ui = Object.assign(
  { lang: "en", view: "dashboard", viewWeek: 0, weekOverride: 0, fWeek: "current", fRole: "", fPerson: "", q: "", me: "", dWeek: "0", dStatus: "" },
  readJSON(UI_KEY)
);
if (ui.tab && !ui.view) ui.view = ui.tab;

function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch { return {}; }
}
function saveUI() {
  try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch {}
}

/* ---------- text ---------- */
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
const pct = (a, b) => (b ? Math.round(a / b * 100) : 0);
const when = ms => new Date(ms).toLocaleString(locale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const shortDate = d => new Date(d + "T00:00:00").toLocaleDateString(locale(), { day: "numeric", month: "short" });

/* Only http(s) links are shown, so a pasted "javascript:" link can never run. */
function safeUrl(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : "https://" + s.replace(/^[a-z]+:\/*/i, "");
}
function linkHost(u) {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; }
}

/* ---------- icons (Lucide, ISC licence) ---------- */
const ICONS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  kanban: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7v7"/><path d="M12 7v4"/><path d="M16 7v9"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  sliders: '<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  listcheck: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  skip: '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  bars: '<path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  sparkle: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/>',
};
const icon = (name, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
const ROLE_ICON = { coord: "compass", content: "pen", visuals: "camera", data: "bars" };

/* ---------- team ---------- */
function defaultMembers() { return [1, 2, 3, 4, 5, 6, 7].map(i => "Member " + i); }
function meta() { return Store.get("meta") || { members: defaultMembers(), startDate: "", budgetLimit: 0 }; }
function members() { return meta().members || defaultMembers(); }
function seatOf(memberIndex, week) { return SEATS[(memberIndex + week - 1) % SEATS.length]; }
function holders(week, role) { return members().filter((_, i) => seatOf(i, week) === role); }
function roleOf(name, week) {
  const i = members().indexOf(name);
  return i < 0 ? "" : seatOf(i, week);
}
function coordinator(week) { return holders(week, "coord")[0] || ""; }

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
  return d.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" });
}

function initials(name) {
  return String(name).trim().split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}
function avatarColor(name) {
  let h = 0;
  for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return `hsl(${Math.round(h * 137.5) % 360} 48% 44%)`;
}
function avatar(name, size = "") {
  return `<span class="avatar ${size}" style="--av:${avatarColor(name)}" title="${esc(name)}">${esc(initials(name))}</span>`;
}
function roleChip(role) {
  const r = ROLES[role];
  return r ? `<span class="chip role-chip" style="--rc:${r.color}">${icon(ROLE_ICON[role])}${esc(tx(r.t))}</span>` : "";
}

/* ---------- week plan (editable; falls back to data.js) ---------- */
function weekPlan(n) {
  const base = WEEKS[n - 1];
  const w = Store.get("week-" + n) || {};
  return {
    n, phase: base.phase,
    focus: w.focus ?? base.focus,
    lesson: w.lesson ?? base.lesson,
    done: w.done ?? base.done.map((text, i) => ({ id: String(i), t: text })),
    deliverables: w.deliverables ?? (DELIVERABLES[n] || []).map((text, i) => ({ id: "d" + i, t: text })),
  };
}
function saveWeek(n, fields) {
  const cur = Store.get("week-" + n) || { id: "week-" + n, kind: "week", week: n };
  Store.put({ ...cur, ...fields });
}
function checkDone(n, itemId) { return !!Store.get(`chk-w${n}-${itemId}`)?.done; }

/* ---------- cards ---------- */
function cardPeople(c) {
  if (c.assignee) return [c.assignee];
  return c.role && c.week ? holders(c.week, c.role) : [];
}
function weekCards(n) {
  return Store.all("card").filter(c => c.week === n).sort((a, b) => (a.order || 0) - (b.order || 0));
}

/* ---------- deliverables ---------- */
function submissions(week) { return Store.all("deliverable").filter(d => !week || d.week === week); }
function submissionFor(week, slotId) { return Store.all("deliverable").find(d => d.week === week && d.slot === slotId); }
const STATUS_KEY = { missing: "deliv_missing", submitted: "deliv_submitted", approved: "deliv_approved_s", changes: "deliv_changes" };
function statusBadge(status) {
  const ic = { missing: "clock", submitted: "send", approved: "check", changes: "pencil" }[status];
  return `<span class="status st-${status}">${icon(ic)}${esc(t(STATUS_KEY[status]))}</span>`;
}
function weekDeliverableStats(n) {
  const slots = weekPlan(n).deliverables;
  const approved = slots.filter(s => submissionFor(n, s.id)?.status === "approved").length;
  const submitted = slots.filter(s => submissionFor(n, s.id)).length;
  return { total: slots.length, approved, submitted };
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

/* ---------- seed (the HealthyBite plan) ---------- */
function seedData() {
  const list = [{ id: "meta", kind: "meta", members: defaultMembers(), startDate: "", budgetLimit: 0 }];
  let order = 1;
  WEEKS.forEach(w => {
    Object.entries(w.tasks).forEach(([role, tasks]) => {
      tasks.forEach((title, i) => {
        const isContent = /caption/i.test(title.en) || (/posts?$/i.test(title.en) && role === "content");
        list.push({
          id: `c-w${w.n}-${role}-${i}`, kind: "card", title, desc: "", week: w.n, role, status: "todo",
          type: isContent ? "content" : "task", assignee: "", due: "", caption: "", checks: [], comments: [], subtasks: [], order: order++,
        });
      });
    });
  });
  list.push({ id: "cl-practice", kind: "client", practice: true, name: "", baseline: {}, current: {} });
  list.push({ id: "cl-1", kind: "client", name: "Pilot client 1", baseline: {}, current: {} });
  SEED_RISKS.forEach((r, i) => list.push({ id: "r-" + i, kind: "risk", risk: r.risk, level: r.level, plan: r.plan, owner: "", status: "open" }));
  return list;
}

function toast(msg, kind = "") {
  const el = document.createElement("div");
  el.className = "toast " + kind;
  el.textContent = msg;
  $("#toasts").appendChild(el);
  setTimeout(() => el.classList.add("out"), 4200);
  setTimeout(() => el.remove(), 4700);
}
