/* HealthyBite board — app shell, events and start-up. */

const NAV = [
  ["guide", "home", "nav_guide"],
  ["weeks", "calendar", "nav_weeks"],
  ["board", "kanban", "nav_tasks"],
  ["deliverables", "inbox", "tab_deliverables"],
];
const NAV_MORE = [
  ["posts", "chart", "tab_posts"],
  ["sellers", "users", "tab_sellers"],
  ["budget", "wallet", "tab_budget"],
  ["risks", "alert", "tab_risks"],
  ["settings", "sliders", "tab_settings"],
];

/* ---------- rendering ---------- */
let pendingRender = false;
function scheduleRender() {
  const a = document.activeElement;
  if (a && a.closest("#main") && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) { pendingRender = true; return; }
  render();
}

function render() {
  pendingRender = false;
  if (!VIEWS[ui.view]) ui.view = "guide";
  document.documentElement.lang = ui.lang;
  document.documentElement.dir = ui.lang === "ar" ? "rtl" : "ltr";
  renderSidebar();
  renderTopbar();
  $("#main").innerHTML = VIEWS[ui.view]();
  lastStep = ui.view === "guide" ? autoStep() : -1;
  tickTimer();
}

function renderSidebar() {
  const cw = currentWeek();
  const navItem = ([view, ic, label]) => {
    let badge = "";
    if (view === "deliverables") {
      const q = submissions().filter(d => d.status === "submitted").length;
      if (q) badge = `<span class="nav-badge">${q}</span>`;
    }
    if (view === "guide") badge = `<span class="nav-week-tag">${esc(t("weekN", { n: cw }))}</span>`;
    const on = ui.view === view || (view === "weeks" && ui.view === "week");
    return `<button class="nav-item ${on ? "on" : ""}" data-action="nav" data-view="${view}">${icon(ic)}<span>${esc(t(label))}</span>${badge}</button>`;
  };
  const me = ui.me;
  const myRole = me ? roleOf(me, cw) : "";
  const status = { local: "sync_local", live: "sync_live", connecting: "sync_connecting", error: "sync_error" }[Store.mode];
  const moreOpen = ui.moreOpen || NAV_MORE.some(x => x[0] === ui.view);

  $("#sidebar").innerHTML = `
    <div class="brand">
      <svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="35" r="23" fill="var(--green)"/><path d="M32 12c5-8 16-7 16-7s-1 11-12 12z" fill="var(--saffron)"/><path d="M22 36c4 6 16 6 20 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>
      <div><b>HealthyBite</b><span>${esc(t("tagline"))}</span></div>
    </div>
    <button class="me-chip" data-action="who">
      ${me ? avatar(me) : `<span class="avatar ghost">${icon("users")}</span>`}
      <span class="me-text"><b>${esc(me || t("not_set"))}</b><small>${me ? esc(tx(ROLES[myRole]?.t)) : esc(t("who_are_you"))}</small></span>
      ${icon("chevron", "flip dim")}
    </button>
    <nav class="nav-group">${NAV.map(navItem).join("")}</nav>
    <details class="nav-more" ${moreOpen ? "open" : ""}>
      <summary>${icon("chevron", "flip")}<span>${esc(t("more"))}</span></summary>
      <nav class="nav-group">${NAV_MORE.map(navItem).join("")}</nav>
    </details>
    <div class="sidebar-foot">
      <button class="nav-item" data-action="tour">${icon("book")}<span>${esc(t("how_it_works"))}</span></button>
      <div class="sync sync-${Store.mode}" title="${esc(Store.mode === "error" ? Store.error : Store.team)}"><span class="dot"></span>${esc(t(status))}</div>
    </div>`;
}

function renderTopbar() {
  let title;
  if (ui.view === "week") {
    const n = ui.viewWeek || currentWeek();
    title = `${icon("calendar")}<span>${esc(t("weekN", { n }))}</span>`;
  } else if (ui.view === "guide") {
    title = `${icon("home")}<span>${esc(t("nav_guide"))} · ${esc(t("weekN", { n: currentWeek() }))}</span>`;
  } else {
    const item = [...NAV, ...NAV_MORE].find(x => x[0] === ui.view);
    title = `${icon(item[1])}<span>${esc(t(item[2]))}</span>`;
  }
  $("#page-title").innerHTML = title;
  document.querySelectorAll("[data-lang]").forEach(b => b.classList.toggle("on", b.dataset.lang === ui.lang));
}

function go(view, extra = {}) {
  Object.assign(ui, { view }, extra);
  saveUI();
  viewStep = null;
  document.body.classList.remove("nav-open");
  render();
  window.scrollTo(0, 0);
}

/* ---------- session timer ---------- */
let lastBlock = -1;
let lastStep = -1;
function tickTimer() {
  const ms = elapsedMs();
  const b = blockAt(ms);
  const running = timerState().running;
  if (running && lastBlock !== -1 && b.i !== lastBlock) beep();
  lastBlock = b.i;
  /* The guide follows the timer: when a block ends, show the next step. */
  if (ui.view === "guide" && lastStep !== -1 && autoStep() !== lastStep) { lastStep = autoStep(); scheduleRender(); return; }
  const el = $("#t-clock");
  if (!el || b.i >= AGENDA.length) return;
  el.textContent = clock(b.start + b.len - ms);
  $("#t-block").textContent = tx(AGENDA[b.i].t) + (running ? "" : " · " + t("pause"));
  $("#t-bar").style.width = Math.min(100, (ms - b.start) / b.len * 100) + "%";
  $("#t-total").textContent = `${t("total")} ${clock(Math.min(ms, TOTAL_MS))} / ${clock(TOTAL_MS)}`;
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

/* Start, advance or reset the shared timer (always for the current week). */
function startTimer() {
  const s = timerState();
  Store.put({ ...s, running: true, startedAt: Date.now(), week: currentWeek() });
}
function nextBlock() {
  const s = timerState(), b = blockAt(elapsedMs());
  const base = Math.min(TOTAL_MS, b.start + b.len);
  lastBlock = -1;
  Store.put({ ...s, base, startedAt: Date.now(), running: base < TOTAL_MS, week: currentWeek() });
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
  if (e.target.id === "modal") return closeModal();
  if (e.target.id === "lightbox" || e.target.closest("[data-action=close-lightbox]")) { $("#lightbox").hidden = true; return; }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action;
  const id = el.dataset.id;
  switch (a) {
    case "nav": go(el.dataset.view); break;
    case "go-week": go("week", { viewWeek: Number(el.dataset.week) }); break;
    case "board-week": go("board", { fWeek: el.dataset.week, fRole: "", fPerson: "" }); break;
    case "toggle-nav": document.body.classList.toggle("nav-open"); break;
    case "close-nav": document.body.classList.remove("nav-open"); break;
    case "who": openWho(); break;
    case "set-me": ui.me = el.dataset.name; saveUI(); closeModal(); break;
    case "open-card": openCard(id); break;
    case "new-card": {
      const wk = ui.view === "week" ? (ui.viewWeek || currentWeek()) : ui.fWeek === "current" ? currentWeek() : Number(ui.fWeek) || currentWeek();
      openCard(null, { week: wk, role: ui.fRole || "" });
      break;
    }
    case "toggle-task": {
      const c = Store.get(id);
      if (c) moveCard(id, c.status === "done" ? "todo" : "done");
      break;
    }
    case "open-seller": openSeller(id); break;
    case "new-seller": openSeller(null); break;
    case "close-modal": closeModal(); break;
    case "edit-plan": openWeekPlan(Number(el.dataset.week)); break;
    case "open-deliv": openDeliverable(id); break;
    case "new-deliv": editDeliverable({ week: Number(el.dataset.week), slot: el.dataset.slot || "" }); break;
    case "edit-deliv": editDeliverable(id); break;
    case "review": reviewDeliverable(id, el.dataset.status); break;
    case "view-photo": {
      const img = el.querySelector("img");
      viewPhoto(el.dataset.photo, img && img.src);
      break;
    }
    case "del-deliv":
      if (confirm(t("confirm_delete"))) { deleteDeliverable(id); closeModal(); }
      break;
    case "del-card":
    case "del-item":
      if (confirm(t("confirm_delete"))) {
        Store.del(id);
        if (!$("#modal").hidden && (a === "del-card" || el.dataset.close)) closeModal();
      }
      break;
    case "clear-q": ui.q = ""; saveUI(); render(); break;
    case "add-row": {
      const kind = el.dataset.kind;
      const base = { id: uid(kind[0]), kind };
      if (kind === "post" || kind === "budget" || kind === "log") base.date = today();
      if (kind === "risk") Object.assign(base, { level: "medium", status: "open" });
      if (kind === "client") Object.assign(base, { name: "", baseline: {}, current: {} });
      Store.put(base);
      break;
    }
    case "guide-step": {
      const s = Number(el.dataset.step);
      viewStep = s === autoStep() ? null : s;
      render();
      break;
    }
    case "guide-now": viewStep = null; render(); break;
    case "next-step":
      viewStep = null;
      if (autoStep() === 0) startTimer(); else nextBlock();
      window.scrollTo(0, 0);
      break;
    case "timer-toggle": {
      const s = timerState();
      if (s.running) Store.put({ ...s, running: false, base: elapsedMs() });
      else startTimer();
      break;
    }
    case "timer-reset":
      if (!confirm(t("restart") + "?")) break;
      lastBlock = -1;
      viewStep = null;
      Store.put({ id: "timer", kind: "timer", running: false, startedAt: 0, base: 0, week: currentWeek() });
      break;
    case "tour": openTour(0); break;
    case "tour-go": openTour(Number(el.dataset.step)); break;
    case "tour-end":
      ui.toured = true; saveUI();
      if (ui.me) closeModal(); else openWho();
      break;
    case "fb-connect": {
      const cfg = parseFirebaseConfig($("#fb-config").value);
      const prev = Store.connection();
      const firebase = cfg || (prev && prev.firebase);
      if (!firebase) { toast("Firebase config: apiKey / projectId ?", "warn"); return; }
      Store.saveConnection({ firebase, team: $("#fb-team").value.trim() || "healthybite" });
      location.reload();
      break;
    }
    case "fb-disconnect": Store.saveConnection(null); location.reload(); break;
    case "export": {
      const blob = new Blob([JSON.stringify([...Store.items.values()], null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `healthybite-board-${today()}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      break;
    }
    case "reset":
      if (confirm(t("confirm_reset"))) Store.replaceAll(seedData());
      break;
  }
});

document.addEventListener("change", e => {
  const el = e.target;
  if (el.closest("#modal")) return; // dialogs handle their own fields
  if (el.id === "import-file") {
    const file = el.files[0];
    if (!file) return;
    file.text().then(txt => {
      const list = JSON.parse(txt);
      if (Array.isArray(list) && list.every(it => it && it.id && it.kind)) { Store.replaceAll(list); toast(t("imported")); }
    }).catch(err => toast(String(err), "warn"));
    return;
  }
  if (el.dataset.action === "done-check") { Store.put({ id: el.dataset.id, kind: "check", done: el.checked }); return; }
  if (el.dataset.ui) { ui[el.dataset.ui] = el.value; saveUI(); render(); return; }
  if (el.dataset.uiNum) { ui[el.dataset.uiNum] = Number(el.value); saveUI(); render(); return; }
  if (el.dataset.member !== undefined) {
    const list = [...members()];
    const old = list[el.dataset.member];
    const name = el.value.trim() || old;
    list[el.dataset.member] = name;
    if (ui.me === old) { ui.me = name; saveUI(); }
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

/* Search on the Tasks page filters cards as you type. */
document.addEventListener("input", e => {
  if (e.target.id !== "q") return;
  ui.q = e.target.value;
  saveUI();
  const pos = e.target.selectionStart;
  render();
  const box = $("#q");
  box.focus();
  box.setSelectionRange(pos, pos);
});

/* Between-sessions log (guide, "After" step). */
document.addEventListener("submit", e => {
  const form = e.target.closest("[data-form=log]");
  if (!form) return;
  e.preventDefault();
  const what = form.what.value.trim();
  if (!what) return;
  Store.put({ id: uid("l"), kind: "log", date: today(), who: form.who.value, what });
  render();
});

/* Remember whether "More" is open in the sidebar. */
document.addEventListener("toggle", e => {
  if (e.target.classList?.contains("nav-more")) { ui.moreOpen = e.target.open; saveUI(); }
}, true);

/* Quick add: type a task title and press Enter (week page and board columns). */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (!$("#lightbox").hidden) { $("#lightbox").hidden = true; return; }
    if (!$("#modal").hidden) closeModal();
    document.body.classList.remove("nav-open");
    return;
  }
  const el = e.target;
  if (e.key === "Enter" && el.dataset.quick) {
    e.preventDefault();
    const title = el.value.trim();
    if (!title) return;
    let card;
    if (el.dataset.quick === "week") {
      card = { week: Number(el.dataset.week), role: el.dataset.role, status: "todo" };
    } else {
      const wk = ui.fWeek === "current" ? currentWeek() : Number(ui.fWeek) || currentWeek();
      card = { week: wk, role: ui.fRole || "", status: el.dataset.status };
    }
    Store.put({
      id: uid("c"), kind: "card", title, desc: "", type: "task", assignee: "", due: "", caption: "",
      checks: [], comments: [], subtasks: [], order: Date.now(), ...card,
    });
    const sel = el.dataset.quick === "week"
      ? `[data-quick="week"][data-role="${el.dataset.role}"]`
      : `[data-quick="board"][data-status="${el.dataset.status}"]`;
    render();
    $(sel)?.focus();
    return;
  }
  if (e.key === "Enter" && el.dataset.action && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(el.tagName)) {
    e.preventDefault();
    el.click();
  }
});

document.addEventListener("focusout", e => {
  if (pendingRender && e.target.closest("#main")) setTimeout(() => {
    const a = document.activeElement;
    if (!(a && a.closest("#main") && /INPUT|TEXTAREA|SELECT/.test(a.tagName))) render();
  }, 0);
});

/* Drag and drop (cards and sellers). Drop position decides the order. */
let dragId = null;
document.addEventListener("dragstart", e => {
  const card = e.target.closest?.(".card[draggable]");
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
  const col = e.target.closest?.("[data-drop]");
  if (!col || !dragId) return;
  e.preventDefault();
  document.querySelectorAll(".drop-on").forEach(c => c !== col && c.classList.remove("drop-on"));
  col.classList.add("drop-on");
});
document.addEventListener("drop", e => {
  const col = e.target.closest?.("[data-drop]");
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
Store.init(seedData).then(() => {
  if (!ui.toured) openTour(0);
  else if (!ui.me && Store.items.has("meta")) openWho();
});
