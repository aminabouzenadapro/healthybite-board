/* HealthyBite board — page views. Each returns the HTML of #main. */

const VIEWS = {};
const opt = (v, label, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? "selected" : ""}>${esc(label)}</option>`;
const bar = (p, cls = "") => `<div class="meter ${cls}"><i style="width:${Math.min(100, p)}%"></i></div>`;

/* ---------- Dashboard ---------- */
VIEWS.dashboard = () => {
  const n = currentWeek();
  const w = weekPlan(n);
  const me = ui.me;
  const myRole = me ? roleOf(me, n) : "";
  const partners = myRole ? holders(n, myRole).filter(p => p !== me) : [];
  const myTasks = me ? weekCards(n).filter(c => c.status !== "done" && cardPeople(c).includes(me)) : [];

  const cards = Store.all("card");
  const doneCards = cards.filter(c => c.status === "done").length;
  let slots = 0, approved = 0;
  for (let k = 1; k <= 7; k++) { const s = weekDeliverableStats(k); slots += s.total; approved += s.approved; }
  const sellers = Store.all("seller");
  const pitched = sellers.filter(s => s.stage && s.stage !== "todo").length;
  const posts = Store.all("post").length;
  const queue = submissions().filter(d => d.status === "submitted").sort((a, b) => (b.at || 0) - (a.at || 0));

  const wc = weekCards(n);
  const wcDone = wc.filter(c => c.status === "done").length;
  const chkDone = w.done.filter(d => checkDone(n, d.id)).length;
  const ds = weekDeliverableStats(n);

  const stat = (ic, label, value, total, p) => `
    <div class="stat">
      <div class="stat-top"><span class="stat-ic">${icon(ic)}</span><span>${esc(label)}</span></div>
      <b>${value}${total !== undefined ? `<small> / ${total}</small>` : ""}</b>
      ${p !== undefined ? bar(p) : ""}
    </div>`;

  const timeline = WEEKS.map(wk => {
    const k = wk.n;
    const kc = weekCards(k);
    const tp = pct(kc.filter(c => c.status === "done").length, kc.length);
    const s = weekDeliverableStats(k);
    const dp = pct(s.approved, s.total);
    return `<button class="tl-week ${k === n ? "now" : ""} phase-${wk.phase}" data-action="go-week" data-week="${k}">
      <div class="tl-bars"><i class="tb-t" style="height:${Math.max(4, tp)}%"></i><i class="tb-d" style="height:${Math.max(4, dp)}%"></i></div>
      <b>${k}</b><span>${esc(tx(weekPlan(k).focus))}</span></button>`;
  }).join("");

  return `
  <section class="welcome">
    <div>
      <p class="muted">${esc(new Date().toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" }))}</p>
      <h1>${esc(me ? t("hello", { name: me.split(" ")[0] }) : t("hello_anon"))}</h1>
    </div>
    <div class="btn-row">
      <button class="btn" data-action="nav" data-view="session">${icon("timer")}${esc(t("start_session"))}</button>
      <button class="btn primary" data-action="go-week" data-week="${n}">${esc(t("open_week"))}${icon("chevron", "flip")}</button>
    </div>
  </section>

  <div class="dash-top">
    <article class="week-hero phase-${w.phase}" data-action="go-week" data-week="${n}">
      <div class="eyebrow">${esc(tx(PHASES[w.phase].t))} · ${esc(t("week_of_7", { n }))}${weekDate(n) ? " · " + esc(weekDate(n)) : ""}</div>
      <h2>${esc(tx(w.focus))}</h2>
      <p class="lesson-line">${icon("book")}<span>${esc(tx(w.lesson))}</span></p>
      <div class="hero-metrics">
        <div><span>${esc(t("tab_board"))}</span><b>${wcDone}/${wc.length}</b>${bar(pct(wcDone, wc.length), "light")}</div>
        <div><span>${esc(t("checklist"))}</span><b>${chkDone}/${w.done.length}</b>${bar(pct(chkDone, w.done.length), "light")}</div>
        <div><span>${esc(t("tab_deliverables"))}</span><b>${ds.approved}/${ds.total}</b>${bar(pct(ds.approved, ds.total), "light")}</div>
      </div>
    </article>

    <article class="panel me-panel">
      ${me ? `
        <div class="me-role" style="--rc:${ROLES[myRole]?.color || "var(--green)"}">
          <span class="role-badge">${icon(ROLE_ICON[myRole] || "users")}</span>
          <div><span class="muted small">${esc(t("your_role"))}</span><b>${esc(tx(ROLES[myRole]?.t))}</b>
            ${partners.length ? `<span class="muted small">${esc(t("with"))} ${partners.map(esc).join(", ")}</span>` : ""}</div>
        </div>
        <h3>${esc(t("your_tasks"))}</h3>
        <ul class="task-list">${myTasks.map(taskRow).join("") || `<li class="empty">${esc(t("no_tasks_you"))}</li>`}</ul>`
      : `<div class="empty-state">${icon("users", "xl")}<p>${esc(t("who_hint"))}</p><button class="btn primary" data-action="who">${esc(t("who_are_you"))}</button></div>`}
    </article>
  </div>

  <div class="stats">
    ${stat("listcheck", t("tasks_done"), doneCards, cards.length, pct(doneCards, cards.length))}
    ${stat("inbox", t("deliv_approved"), approved, slots, pct(approved, slots))}
    ${stat("users", t("pitched"), pitched, 15, pct(pitched, 15))}
    ${stat("chart", t("posts_logged"), posts)}
  </div>

  <div class="dash-bottom">
    <section class="panel">
      <div class="panel-head"><h2>${esc(t("project_progress"))}</h2>
        <div class="legend"><span><i class="tb-t"></i>${esc(t("tasks_done"))}</span><span><i class="tb-d"></i>${esc(t("deliv_approved"))}</span></div></div>
      <div class="timeline">${timeline}</div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>${esc(t("needs_review"))}</h2><span class="count">${queue.length}</span></div>
      <ul class="review-list">${queue.slice(0, 6).map(d => `
        <li data-action="open-deliv" data-id="${d.id}">
          ${avatar(d.by || "?")}
          <div><b>${esc(tx(d.title))}</b><span class="muted small">${esc(t("weekN", { n: d.week }))} · ${esc(d.by || "")} · ${esc(when(d.at))}</span></div>
          ${icon("chevron", "flip")}
        </li>`).join("") || `<li class="empty">${esc(t("nothing_to_review"))}</li>`}</ul>
    </section>
  </div>`;
};

/* One task line with a done tick (dashboard and week page). */
function taskRow(c, opts = {}) {
  const subs = c.subtasks || [];
  const subDone = subs.filter(s => s.done).length;
  return `<li class="task-row ${c.status === "done" ? "is-done" : ""} st-${c.status}">
    <button class="tick" data-action="toggle-task" data-id="${c.id}" title="${esc(t("col_done"))}">${icon("check")}</button>
    <span class="task-title" data-action="open-card" data-id="${c.id}" tabindex="0">${esc(tx(c.title))}</span>
    ${subs.length ? `<span class="mini-chip">${icon("listcheck")}${subDone}/${subs.length}</span>` : ""}
    ${c.status !== "todo" && c.status !== "done" ? `<span class="mini-chip col-${c.status}">${esc(t("col_" + c.status))}</span>` : ""}
    ${opts.del ? `<button class="icon-btn subtle" data-action="del-card" data-id="${c.id}" title="${esc(t("delete"))}">${icon("trash")}</button>` : ""}
  </li>`;
}

/* ---------- Week page ---------- */
VIEWS.week = () => {
  const n = ui.viewWeek || currentWeek();
  const w = weekPlan(n);
  const cards = weekCards(n);
  const done = cards.filter(c => c.status === "done").length;
  const chkDone = w.done.filter(d => checkDone(n, d.id)).length;
  const ds = weekDeliverableStats(n);
  const coord = coordinator(n);

  const roleCol = role => {
    const r = ROLES[role];
    const list = cards.filter(c => c.role === role);
    return `<div class="role-col" style="--rc:${r.color}">
      <div class="role-head">
        <span class="role-badge">${icon(ROLE_ICON[role])}</span>
        <div><b>${esc(tx(r.t))}</b><div class="people">${holders(n, role).map(p => `<span>${avatar(p, "sm")}${esc(p)}</span>`).join("")}</div></div>
      </div>
      <ul class="task-list">${list.map(c => taskRow(c, { del: true })).join("")}</ul>
      <label class="quick-add">${icon("plus")}<input data-quick="week" data-week="${n}" data-role="${role}" placeholder="${esc(t("add_task_ph"))}"></label>
    </div>`;
  };
  const others = cards.filter(c => !ROLES[c.role]);

  const slots = w.deliverables.map(s => {
    const sub = submissionFor(n, s.id);
    return delivTile(n, s, sub);
  }).join("");
  const extra = submissions(n).filter(d => !d.slot || !w.deliverables.some(s => s.id === d.slot)).map(d => delivTile(n, null, d)).join("");

  return `
  <section class="page-head phase-${w.phase}">
    <div class="crumbs"><button class="link-btn" data-action="nav" data-view="dashboard">${esc(t("nav_dashboard"))}</button>${icon("chevron", "flip")}<span>${esc(t("weekN", { n }))}</span></div>
    <div class="page-head-row">
      <div>
        <div class="eyebrow">${esc(tx(PHASES[w.phase].t))}${weekDate(n) ? " · " + esc(weekDate(n)) : ""}</div>
        <h1>${esc(t("weekN", { n }))} — ${esc(tx(w.focus))}</h1>
        <p class="lesson-line">${icon("book")}<span><b>${esc(t("lesson"))}:</b> ${esc(tx(w.lesson))}</span></p>
      </div>
      <div class="btn-row">
        <button class="icon-btn boxed" data-action="go-week" data-week="${Math.max(1, n - 1)}" ${n === 1 ? "disabled" : ""} title="${esc(t("weekN", { n: n - 1 }))}">${icon("chevron", "back")}</button>
        <button class="icon-btn boxed" data-action="go-week" data-week="${Math.min(7, n + 1)}" ${n === 7 ? "disabled" : ""} title="${esc(t("weekN", { n: n + 1 }))}">${icon("chevron", "flip")}</button>
        <button class="btn" data-action="edit-plan" data-week="${n}">${icon("pencil")}${esc(t("edit_plan"))}</button>
      </div>
    </div>
    <div class="head-metrics">
      <div><span>${icon("kanban")}${esc(t("tab_board"))}</span><b>${done}/${cards.length}</b>${bar(pct(done, cards.length))}</div>
      <div><span>${icon("listcheck")}${esc(t("checklist"))}</span><b>${chkDone}/${w.done.length}</b>${bar(pct(chkDone, w.done.length))}</div>
      <div><span>${icon("inbox")}${esc(t("deliv_approved"))}</span><b>${ds.approved}/${ds.total}</b>${bar(pct(ds.approved, ds.total))}</div>
    </div>
  </section>

  <section class="panel">
    <div class="panel-head"><h2>${esc(t("team_this_week"))}</h2><button class="btn ghost sm" data-action="board-week" data-week="${n}">${icon("kanban")}${esc(t("tab_board"))}</button></div>
    <div class="role-cols">${Object.keys(ROLES).map(roleCol).join("")}
      ${others.length ? `<div class="role-col" style="--rc:var(--muted)"><div class="role-head"><span class="role-badge">${icon("listcheck")}</span><b>${esc(t("other_tasks"))}</b></div>
        <ul class="task-list">${others.map(c => taskRow(c, { del: true })).join("")}</ul></div>` : ""}
    </div>
  </section>

  <div class="two-col wide-right">
    <section class="panel">
      <div class="panel-head"><h2>${esc(t("done_by_end"))}</h2><span class="count">${chkDone}/${w.done.length}</span></div>
      <ul class="checklist">${w.done.map(d => {
        const on = checkDone(n, d.id);
        return `<li><label class="check ${on ? "on" : ""}"><input type="checkbox" data-action="done-check" data-id="chk-w${n}-${d.id}" ${on ? "checked" : ""}><span class="box">${icon("check")}</span><span>${esc(tx(d.t))}</span></label></li>`;
      }).join("")}</ul>
    </section>
    <section class="panel">
      <div class="panel-head">
        <div><h2>${esc(t("expected_deliverables"))}</h2>${coord ? `<p class="muted small">${icon("shield")} ${esc(t("coordinator_reviews", { n, name: coord }))}</p>` : ""}</div>
        <button class="btn ghost sm" data-action="new-deliv" data-week="${n}">${icon("plus")}${esc(t("other_deliverable"))}</button>
      </div>
      <div class="deliv-grid">${slots}${extra}</div>
    </section>
  </div>`;
};

/* A deliverable tile: an expected slot (maybe not submitted yet) or a free submission. */
function delivTile(week, slot, sub) {
  const status = sub ? sub.status : "missing";
  const title = sub ? tx(sub.title) : tx(slot.t);
  const thumbs = (sub?.photos || []).slice(0, 3);
  const links = (sub?.links || []).length;
  const action = sub ? `data-action="open-deliv" data-id="${sub.id}"` : `data-action="new-deliv" data-week="${week}" data-slot="${slot.id}"`;
  return `<article class="deliv st-${status}" ${action} tabindex="0">
    <div class="deliv-top">${statusBadge(status)}${links ? `<span class="mini-chip">${icon("link")}${links}</span>` : ""}${(sub?.photos || []).length ? `<span class="mini-chip">${icon("image")}${sub.photos.length}</span>` : ""}</div>
    <b class="deliv-title">${esc(title)}</b>
    ${thumbs.length ? `<div class="thumbs">${thumbs.map(p => `<img src="${p.thumb}" alt="">`).join("")}</div>` : ""}
    <div class="deliv-foot">${sub
      ? `${avatar(sub.by || "?", "sm")}<span>${esc(sub.by || "")} · ${esc(when(sub.at))}</span>`
      : `<span class="btn-like">${icon("upload")}${esc(t("submit"))}</span>`}</div>
  </article>`;
}

/* ---------- Deliverables page ---------- */
VIEWS.deliverables = () => {
  const weeks = ui.dWeek && ui.dWeek !== "0" ? [Number(ui.dWeek)] : [1, 2, 3, 4, 5, 6, 7];
  const groups = weeks.map(n => {
    const w = weekPlan(n);
    const tiles = [
      ...w.deliverables.map(s => ({ slot: s, sub: submissionFor(n, s.id) })),
      ...submissions(n).filter(d => !d.slot || !w.deliverables.some(s => s.id === d.slot)).map(d => ({ slot: null, sub: d })),
    ].filter(x => !ui.dStatus || (x.sub ? x.sub.status : "missing") === ui.dStatus);
    if (!tiles.length && ui.dStatus) return "";
    const ds = weekDeliverableStats(n);
    return `<section class="panel">
      <div class="panel-head">
        <div><h2><button class="link-btn" data-action="go-week" data-week="${n}">${esc(t("weekN", { n }))}</button> · ${esc(tx(w.focus))}</h2>
          <p class="muted small">${icon("shield")} ${esc(t("coordinator_reviews", { n, name: coordinator(n) }))}</p></div>
        <div class="btn-row"><span class="count">${ds.approved}/${ds.total}</span>
          <button class="btn ghost sm" data-action="new-deliv" data-week="${n}">${icon("plus")}${esc(t("other_deliverable"))}</button></div>
      </div>
      <div class="deliv-grid">${tiles.map(x => delivTile(n, x.slot, x.sub)).join("") || `<div class="empty">${esc(t("empty"))}</div>`}</div>
    </section>`;
  }).join("");
  return `
  <div class="toolbar">
    <select data-ui="dWeek">${opt("0", t("all_weeks"), ui.dWeek)}${WEEKS.map(w => opt(w.n, t("weekN", { n: w.n }), ui.dWeek)).join("")}</select>
    <select data-ui="dStatus">${opt("", t("all_status"), ui.dStatus)}${["missing", "submitted", "changes", "approved"].map(s => opt(s, t(STATUS_KEY[s]), ui.dStatus)).join("")}</select>
  </div>
  ${groups || `<div class="panel empty">${esc(t("empty"))}</div>`}`;
};

/* ---------- Board ---------- */
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

VIEWS.board = () => {
  const cards = filteredCards();
  const toolbar = `
  <div class="toolbar">
    <select data-ui="fWeek">${opt("current", t("current_week") + " (" + currentWeek() + ")", ui.fWeek)}${opt("0", t("all_weeks"), ui.fWeek)}${WEEKS.map(w => opt(w.n, t("weekN", { n: w.n }), ui.fWeek)).join("")}</select>
    <select data-ui="fRole">${opt("", t("all_roles"), ui.fRole)}${Object.keys(ROLES).map(r => opt(r, tx(ROLES[r].t), ui.fRole)).join("")}</select>
    <select data-ui="fPerson">${opt("", t("all_people"), ui.fPerson)}${members().map(m => opt(m, m, ui.fPerson)).join("")}</select>
    ${ui.q ? `<button class="chip-btn" data-action="clear-q">${icon("search")}“${esc(ui.q)}” ${icon("x")}</button>` : ""}
  </div>`;
  const cols = COLUMNS.map(s => {
    const list = cards.filter(c => c.status === s);
    return `<div class="column col-${s}" data-drop="card" data-status="${s}">
      <div class="col-head"><span class="col-dot"></span><span>${esc(t("col_" + s))}</span><b>${list.length}</b></div>
      <div class="col-body">${list.map(cardHTML).join("")}</div>
      <label class="quick-add">${icon("plus")}<input data-quick="board" data-status="${s}" placeholder="${esc(t("add_task_ph"))}"></label>
    </div>`;
  }).join("");
  return toolbar + `<div class="kanban">${cols}</div>`;
};

function cardHTML(c) {
  const r = ROLES[c.role];
  const people = cardPeople(c);
  const subs = c.subtasks || [];
  const subDone = subs.filter(s => s.done).length;
  let badge = "";
  if (c.type === "content") {
    badge = claimsPassed(c)
      ? `<span class="mini-chip ok">${icon("shield")}${esc(t("claims_ok"))}</span>`
      : `<span class="mini-chip warn">${icon("shield")}${esc(t("claims_pending"))}</span>`;
  }
  return `<article class="card" draggable="true" data-id="${c.id}" data-action="open-card" tabindex="0" style="--rc:${r ? r.color : "var(--line-strong)"}">
    <div class="card-top">${r ? `<span class="role-dot">${icon(ROLE_ICON[c.role])}${esc(tx(r.t))}</span>` : ""}<span class="wk">${esc(t("weekN", { n: c.week }))}</span></div>
    <div class="card-title">${esc(tx(c.title))}</div>
    ${subs.length ? `<div class="sub-bar"><div class="meter thin"><i style="width:${pct(subDone, subs.length)}%"></i></div><span>${subDone}/${subs.length}</span></div>` : ""}
    <div class="card-foot">
      <div class="card-meta">${badge}
        ${c.due ? `<span class="mini-chip">${icon("calendar")}${esc(shortDate(c.due))}</span>` : ""}
        ${(c.comments || []).length ? `<span class="mini-chip">${icon("message")}${c.comments.length}</span>` : ""}</div>
      <div class="card-people">${people.map(p => avatar(p, "sm")).join("")}</div>
    </div>
  </article>`;
}

/* ---------- Session ---------- */
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
      <textarea rows="3" data-note="note-w${n}" data-key="${key}">${esc(note[key] || "")}</textarea></label>`;
  return `
  <section class="panel timer-panel">
    <div class="panel-head">
      <div><h2>${esc(t("timer_title"))} · ${esc(t("weekN", { n }))}</h2><p class="muted small">${esc(t("timer_shared"))}</p></div>
      <div class="btn-row">
        <button class="btn primary" data-action="timer-toggle">${s.running ? icon("pause") + esc(t("pause")) : icon("play") + esc(t("start"))}</button>
        <button class="btn" data-action="timer-next">${icon("skip")}${esc(t("next_block"))}</button>
        <button class="btn ghost" data-action="timer-reset">${icon("rotate")}${esc(t("reset"))}</button>
      </div>
    </div>
    <div class="timer-body">
      <div class="timer-now"><div id="t-block" class="t-block"></div><div id="t-clock" class="t-clock">0:00</div><div class="t-sub"><span id="t-total"></span></div></div>
      <ol class="agenda">${AGENDA.map((b, i) => `<li id="ag-${i}" style="flex:${b.min}"><div class="ag-bar"><i></i></div><b>${esc(tx(b.t))}</b><span>${b.min} min</span></li>`).join("")}</ol>
    </div>
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
      <td><button class="icon-btn subtle" data-action="del-item" data-id="${r.id}" title="${esc(t("delete"))}">${icon("trash")}</button></td></tr>`).join("")
      || `<tr><td colspan="${cols.length + 1}" class="empty">${esc(t("empty"))}</td></tr>`}</tbody>
    ${extraFoot}
  </table></div>
  <button class="btn sm" data-action="add-row" data-kind="${kind}">${icon("plus")}${esc(t("add_row"))}</button>`;
}

/* ---------- Posts ---------- */
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
        ${c.practice ? "" : `<button class="icon-btn subtle" data-action="del-item" data-id="${c.id}" title="${esc(t("delete"))}">${icon("trash")}</button>`}
      </div>
      <table class="metrics">
        <thead><tr><th></th><th>${esc(t("baseline"))}</th><th>${esc(t("current"))}</th><th>${esc(t("change"))}</th></tr></thead>
        <tbody>${METRICS.map(([k, label]) => {
          const b = Number((c.baseline || {})[k]) || 0, cur = Number((c.current || {})[k]) || 0;
          const p = b ? Math.round((cur - b) / b * 100) : null;
          const max = Math.max(b, cur, 1);
          return `<tr><th>${esc(t(label))}</th>
            <td><input type="number" min="0" data-num="1" data-id="${c.id}" data-key="baseline.${k}" value="${(c.baseline || {})[k] ?? ""}"></td>
            <td><input type="number" min="0" data-num="1" data-id="${c.id}" data-key="current.${k}" value="${(c.current || {})[k] ?? ""}"></td>
            <td class="delta ${p > 0 ? "up" : p < 0 ? "down" : ""}">${p === null ? t("none") : (p > 0 ? "+" : "") + p + "%"}
              <div class="mini-bars"><i class="b" style="width:${b / max * 100}%"></i><i class="c" style="width:${cur / max * 100}%"></i></div></td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>`).join("");

  return `
  <section class="panel">
    <div class="panel-head"><h2>${esc(t("baseline_title"))}</h2><button class="btn sm" data-action="add-row" data-kind="client">${icon("plus")}${esc(t("add_client"))}</button></div>
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

/* ---------- Sellers ---------- */
VIEWS.sellers = () => {
  const sellers = Store.all("seller").sort((a, b) => (a.order || 0) - (b.order || 0));
  const pitched = sellers.filter(s => s.stage && s.stage !== "todo").length;
  const signed = sellers.filter(s => s.stage === "signed").length;
  return `
  <div class="stats two">
    <div class="stat"><div class="stat-top"><span class="stat-ic">${icon("send")}</span><span>${esc(t("pitched"))}</span></div><b>${pitched}<small> / 15</small></b>${bar(pct(pitched, 15))}</div>
    <div class="stat"><div class="stat-top"><span class="stat-ic">${icon("check")}</span><span>${esc(t("stage_signed"))}</span></div><b>${signed}<small> / 2</small></b>${bar(pct(signed, 2))}</div>
  </div>
  <div class="toolbar"><p class="muted">${esc(t("sellers_goal"))}</p><button class="btn primary" data-action="new-seller">${icon("plus")}${esc(t("new_seller"))}</button></div>
  <div class="kanban pipeline">${SELLER_STAGES.map(st => {
    const list = sellers.filter(s => (s.stage || "todo") === st);
    return `<div class="column stage-${st}" data-drop="seller" data-status="${st}">
      <div class="col-head"><span class="col-dot"></span><span>${esc(t("stage_" + st))}</span><b>${list.length}</b></div>
      <div class="col-body">${list.map(s => `
        <article class="card seller" draggable="true" data-id="${s.id}" data-action="open-seller" tabindex="0">
          <div class="card-title">${esc(s.name || "—")}</div>
          ${s.products ? `<div class="card-sub">${esc(s.products)}</div>` : ""}
          <div class="card-meta">${s.city ? `<span class="mini-chip">${esc(s.city)}</span>` : ""}${s.contact ? `<span class="mini-chip">${esc(s.contact)}</span>` : ""}</div>
        </article>`).join("")}</div>
    </div>`;
  }).join("")}</div>`;
};

/* ---------- Budget ---------- */
VIEWS.budget = () => {
  const rows = Store.all("budget").sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const spent = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const limit = Number(meta().budgetLimit) || 0;
  const over = limit && spent > limit;
  return `
  <div class="stats three">
    <label class="stat"><div class="stat-top"><span class="stat-ic">${icon("wallet")}</span><span>${esc(t("budget_limit"))}</span></div><input type="number" min="0" data-num="1" data-id="meta" data-key="budgetLimit" value="${limit || ""}"></label>
    <div class="stat"><div class="stat-top"><span class="stat-ic">${icon("chart")}</span><span>${esc(t("spent"))}</span></div><b>${num(spent)} <small>DZD</small></b>${bar(limit ? pct(spent, limit) : 0, over ? "over" : "")}</div>
    <div class="stat"><div class="stat-top"><span class="stat-ic">${icon("check")}</span><span>${esc(t("left"))}</span></div><b class="${over ? "neg" : ""}">${limit ? num(limit - spent) : t("none")} <small>DZD</small></b></div>
  </div>
  <section class="panel">
    <h2>${esc(t("budget_title"))}</h2>
    ${table(rows, [
      { key: "date", label: t("date"), type: "date" },
      { key: "item", label: t("item"), type: "text", wide: true },
      { key: "category", label: t("category"), type: "text" },
      { key: "amount", label: t("amount"), type: "number" },
      { key: "paidBy", label: t("paid_by"), type: "select", options: members().map(m => [m, m]) },
    ], "budget")}
  </section>`;
};

/* ---------- Risks ---------- */
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

/* ---------- Settings ---------- */
VIEWS.settings = () => {
  const m = meta();
  const conn = Store.connection();
  const live = Store.mode === "live" || Store.mode === "connecting";
  const cw = currentWeek();
  return `
  <section class="panel">
    <h2>${esc(t("members"))}</h2>
    <p class="hint">${esc(t("members_hint"))}</p>
    <div class="members">${members().map((name, i) => `
      <label class="member">${avatar(name, "lg")}<input value="${esc(name)}" data-member="${i}">
        <span class="seat">${esc(t("weekN", { n: cw }))}: ${esc(tx(ROLES[seatOf(i, cw)].t))}</span></label>`).join("")}</div>
    <div class="table-wrap"><table class="grid rot">
      <thead><tr><th></th>${WEEKS.map(w => `<th>${w.n}</th>`).join("")}</tr></thead>
      <tbody>${members().map((name, i) => `<tr><th>${esc(name)}</th>${WEEKS.map(w => {
        const r = seatOf(i, w.n);
        return `<td title="${esc(tx(ROLES[r].t))}" style="--rc:${ROLES[r].color}" class="rot-cell">${icon(ROLE_ICON[r])}</td>`;
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
    <details class="advanced"><summary>Firebase</summary>
      <label class="field"><span>${esc(t("paste_config"))}</span>
        <textarea id="fb-config" rows="5" spellcheck="false" placeholder="const firebaseConfig = { apiKey: &quot;…&quot;, projectId: &quot;…&quot;, … };"></textarea></label>
      <label class="field"><span>${esc(t("team_space"))}</span><input id="fb-team" value="${esc((conn && conn.team) || "healthybite")}"></label>
      <div class="btn-row">
        <button class="btn primary" data-action="fb-connect">${esc(t("connect"))}</button>
        ${live ? `<button class="btn ghost" data-action="fb-disconnect">${esc(t("disconnect"))}</button>` : ""}
      </div>
    </details>
  </section>
  <section class="panel">
    <h2>${esc(t("backup"))}</h2>
    <div class="btn-row">
      <button class="btn" data-action="export">${icon("download")}${esc(t("export"))}</button>
      <label class="btn">${icon("upload")}${esc(t("import"))}<input type="file" accept=".json,application/json" id="import-file" hidden></label>
      <button class="btn danger" data-action="reset">${icon("rotate")}${esc(t("reset_plan"))}</button>
    </div>
  </section>`;
};
