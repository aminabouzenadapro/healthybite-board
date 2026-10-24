/* HealthyBite board — the weekly guide ("This week") and the "All weeks" overview. */

/* Six steps: 0 Before, 1–4 the agenda blocks, 5 After. The shared timer decides the current step. */
const STEPS = 6;
let viewStep = null;             // a step someone clicked to look at; null = follow the timer
function autoStep() {
  const s = timerState();
  const ms = elapsedMs();
  if (!s.running && ms === 0) return 0;
  const b = blockAt(ms);
  return b.i >= AGENDA.length ? 5 : b.i + 1;
}
function stepName(i) {
  if (i === 0) return t("step_before");
  if (i === 5) return t("step_after");
  return tx(AGENDA[i - 1].t);
}

VIEWS.guide = () => {
  const n = currentWeek();
  const w = weekPlan(n);
  const me = ui.me;
  const myRole = me ? roleOf(me, n) : "";
  const partners = myRole ? holders(n, myRole).filter(p => p !== me) : [];
  const now = autoStep();
  const step = viewStep ?? now;

  const stepper = Array.from({ length: STEPS }, (_, i) => {
    const state = i < now ? "done" : i === now ? "now" : "next";
    const sub = i === 0 || i === 5 ? "" : AGENDA[i - 1].min + " min";
    return `<button class="g-step ${state} ${i === step ? "viewing" : ""}" data-action="guide-step" data-step="${i}">
      <span class="g-dot">${i < now ? icon("check") : i + 1}</span>
      <span class="g-label"><b>${esc(stepName(i))}</b>${sub ? `<small>${sub}</small>` : ""}</span>
    </button>`;
  }).join("");

  const youLine = me
    ? `<div class="g-you" style="--rc:${ROLES[myRole]?.color}">${avatar(me)}<div><span>${esc(t("you"))}</span><b>${esc(tx(ROLES[myRole]?.t))}</b>${partners.length ? `<small>${esc(t("with"))} ${partners.map(esc).join(", ")}</small>` : ""}</div></div>`
    : `<button class="g-you empty" data-action="who">${icon("users")}<span>${esc(t("pick_name_first"))}</span></button>`;

  const wc = weekCards(n);
  const wcDone = wc.filter(c => c.status === "done").length;
  const ds = weekDeliverableStats(n);
  const chk = w.done.filter(d => checkDone(n, d.id)).length;

  /* The big action button under the instruction. */
  let action;
  if (viewStep !== null && viewStep !== now) action = `<button class="btn big" data-action="guide-now">${icon("chevron", "back")}${esc(t("back_to_now"))}</button>`;
  else if (now === 0) action = `<button class="btn primary big" data-action="next-step">${icon("play")}${esc(t("start_the_session"))}</button>`;
  else if (now < 5) action = `<button class="btn primary big" data-action="next-step">${esc(t("next_step"))}: ${esc(stepName(now + 1))}${icon("chevron", "flip")}</button>`;
  else action = `<p class="g-finished">${icon("check")}${esc(t("week_complete"))}</p>`;

  return `
  <section class="g-head phase-${w.phase}">
    <div class="g-title">
      <div class="eyebrow">${esc(t("week_of_7", { n }))} · ${esc(tx(PHASES[w.phase].t))}${weekDate(n) ? " · " + esc(weekDate(n)) : ""}</div>
      <h1>${esc(tx(w.focus))}</h1>
    </div>
    ${youLine}
  </section>

  <nav class="g-steps" aria-label="${esc(t("nav_guide"))}">${stepper}</nav>

  <div class="g-body">
    <div class="g-main">
      <section class="g-instruction">
        <div class="g-step-tag">${esc(t("step_of", { a: step + 1, b: STEPS }))}${step === now ? ` · <b>${esc(t("now"))}</b>` : ""}</div>
        <h2>${esc(stepName(step))}</h2>
        <p>${esc(tx(GUIDE[step]))}</p>
        ${action}
      </section>
      ${guideStepContent(step, n, w, me, myRole)}
    </div>

    <aside class="g-side">
      ${timerCard(now)}
      <section class="panel g-progress">
        <h3>${esc(t("week_progress"))}</h3>
        <div class="gp"><span>${icon("listcheck")}${esc(t("nav_tasks"))}</span><b>${wcDone}/${wc.length}</b>${bar(pct(wcDone, wc.length))}</div>
        <div class="gp"><span>${icon("inbox")}${esc(t("deliv_approved"))}</span><b>${ds.approved}/${ds.total}</b>${bar(pct(ds.approved, ds.total))}</div>
        <div class="gp"><span>${icon("check")}${esc(t("done_by_end"))}</span><b>${chk}/${w.done.length}</b>${bar(pct(chk, w.done.length))}</div>
        <button class="link-btn small" data-action="go-week" data-week="${n}">${esc(t("open_week"))} ${icon("chevron", "flip")}</button>
      </section>
    </aside>
  </div>`;
};

function timerCard(now) {
  const s = timerState();
  if (now === 0) return `<section class="panel g-timer idle"><div class="g-clock">3:00:00</div><p class="muted small">${esc(t("not_started"))}</p></section>`;
  if (now === 5) return `<section class="panel g-timer idle"><div class="g-clock">${icon("check")}</div><p class="muted small">${esc(t("session_done"))}</p>
    <button class="link-btn small" data-action="timer-reset">${esc(t("restart"))}</button></section>`;
  return `<section class="panel g-timer">
    <div id="t-block" class="t-block"></div>
    <div id="t-clock" class="g-clock">0:00</div>
    <div class="meter"><i id="t-bar" style="width:0"></i></div>
    <div class="t-sub"><span id="t-total"></span></div>
    <div class="btn-row center">
      <button class="btn sm" data-action="timer-toggle">${s.running ? icon("pause") + esc(t("pause")) : icon("play") + esc(t("start"))}</button>
      <button class="btn ghost sm" data-action="timer-reset">${icon("rotate")}${esc(t("reset"))}</button>
    </div>
  </section>`;
}

/* What each step shows under the instruction. */
function guideStepContent(step, n, w, me, myRole) {
  const prevNote = n > 1 ? Store.get(`note-w${n - 1}`) : null;
  const note = Store.get(`note-w${n}`) || {};

  const handoff = `<section class="panel">
    <h3>${esc(t("handoff_last"))}</h3>
    ${n === 1 ? `<p class="muted">${esc(t("first_week"))}</p>`
      : ["done", "left"].map(k => `<div class="readout"><span>${esc(t("handoff_" + k))}</span><p>${esc(prevNote?.[k] || t("none"))}</p></div>`).join("")}
  </section>`;

  const team = `<section class="panel">
    <h3>${esc(t("team_this_week"))}</h3>
    <div class="g-team">${Object.keys(ROLES).map(r => `
      <div class="g-role ${r === myRole ? "mine" : ""}" style="--rc:${ROLES[r].color}">
        <span class="role-badge">${icon(ROLE_ICON[r])}</span>
        <div><b>${esc(tx(ROLES[r].t))}</b><span>${holders(n, r).map(esc).join(", ")}</span></div>
      </div>`).join("")}</div>
  </section>`;

  const delivList = (forReview) => {
    const slots = w.deliverables;
    const extra = submissions(n).filter(d => !d.slot || !slots.some(s => s.id === d.slot));
    const rows = [...slots.map(s => ({ s, d: submissionFor(n, s.id) })), ...extra.map(d => ({ s: null, d }))];
    return `<ul class="g-deliv">${rows.map(({ s, d }) => {
      const status = d ? d.status : "missing";
      const title = d ? tx(d.title) : tx(s.t);
      let btn;
      if (!d) btn = `<button class="btn sm primary" data-action="new-deliv" data-week="${n}" data-slot="${s.id}">${icon("upload")}${esc(t("submit"))}</button>`;
      else if (forReview && status === "submitted") btn = `<button class="btn sm primary" data-action="open-deliv" data-id="${d.id}">${icon("shield")}${esc(t("review"))}</button>`;
      else btn = `<button class="btn sm" data-action="open-deliv" data-id="${d.id}">${esc(t("open"))}</button>`;
      return `<li>${statusBadge(status)}<span class="g-deliv-title">${esc(title)}</span>${btn}</li>`;
    }).join("")}</ul>`;
  };

  switch (step) {
    case 0:
      return team + handoff;
    case 1: {
      const logs = Store.all("log").sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 4);
      return handoff + (logs.length ? `<section class="panel"><h3>${esc(t("between_title"))}</h3>
        <ul class="g-log">${logs.map(l => `<li>${avatar(l.who || "?", "sm")}<b>${esc(l.who || "")}</b><span>${esc(l.what || "")}</span><small>${esc(l.date ? shortDate(l.date) : "")}</small></li>`).join("")}</ul></section>` : "");
    }
    case 2:
      return `<section class="panel g-lesson">
        <div class="g-lesson-title">${icon("book")}<b>${esc(tx(w.lesson))}</b></div>
        <label class="field"><span>${esc(t("lesson_notes"))}</span>
          <textarea rows="7" data-note="note-w${n}" data-key="lessonNotes" placeholder="${esc(t("lesson_notes_ph"))}">${esc(note.lessonNotes || "")}</textarea></label>
        <p class="hint">${esc(t("handoff_hint"))}</p>
      </section>`;
    case 3: {
      const cards = weekCards(n);
      const mine = myRole ? cards.filter(c => c.role === myRole) : [];
      const others = Object.keys(ROLES).filter(r => r !== myRole);
      return `
      ${me ? `<section class="panel g-mine" style="--rc:${ROLES[myRole].color}">
        <h3>${icon(ROLE_ICON[myRole])} ${esc(t("your_tasks_role"))} · ${esc(tx(ROLES[myRole].t))}</h3>
        <ul class="task-list big">${mine.map(c => taskRow(c)).join("")}</ul>
        <label class="quick-add">${icon("plus")}<input data-quick="week" data-week="${n}" data-role="${myRole}" placeholder="${esc(t("add_task_ph"))}"></label>
      </section>` : `<button class="panel g-pick" data-action="who">${icon("users")}${esc(t("pick_name_first"))}</button>`}
      <section class="panel"><h3>${esc(t("hand_in"))}</h3>${delivList(false)}</section>
      <section class="panel"><h3>${esc(me ? t("other_pairs") : t("team_this_week"))}</h3>
        <div class="g-others">${(me ? others : Object.keys(ROLES)).map(r => {
          const list = cards.filter(c => c.role === r);
          const done = list.filter(c => c.status === "done").length;
          return `<details class="g-other" style="--rc:${ROLES[r].color}">
            <summary><span class="role-badge">${icon(ROLE_ICON[r])}</span><b>${esc(tx(ROLES[r].t))}</b><span class="muted small">${holders(n, r).map(esc).join(", ")}</span><span class="count">${done}/${list.length}</span></summary>
            <ul class="task-list">${list.map(c => taskRow(c)).join("")}</ul>
          </details>`;
        }).join("")}</div>
      </section>`;
    }
    case 4:
      return `
      <section class="panel"><h3>${esc(t("tab_deliverables"))}</h3>
        ${coordinator(n) ? `<p class="muted small">${icon("shield")} ${esc(t("coordinator_reviews", { n, name: coordinator(n) }))}</p>` : ""}
        ${delivList(true)}</section>
      <section class="panel"><h3>${esc(t("done_by_end"))}</h3>
        <ul class="checklist">${w.done.map(d => {
          const on = checkDone(n, d.id);
          return `<li><label class="check ${on ? "on" : ""}"><input type="checkbox" data-action="done-check" data-id="chk-w${n}-${d.id}" ${on ? "checked" : ""}><span class="box">${icon("check")}</span><span>${esc(tx(d.t))}</span></label></li>`;
        }).join("")}</ul></section>`;
    case 5: {
      const logs = Store.all("log").sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const field = (key, label) => `<label class="field"><span>${esc(label)}</span><textarea rows="3" data-note="note-w${n}" data-key="${key}">${esc(note[key] || "")}</textarea></label>`;
      const next = n < 7 ? weekPlan(n + 1) : null;
      const nextRole = me && next ? roleOf(me, n + 1) : "";
      return `
      <section class="panel"><h3>${esc(t("handoff"))} · ${esc(t("weekN", { n }))}</h3>
        ${field("done", t("handoff_done"))}${field("left", t("handoff_left"))}
        <p class="hint">${esc(t("handoff_hint"))}</p></section>
      <section class="panel"><h3>${esc(t("between_title"))}</h3>
        <p class="muted small">${esc(t("between_hint"))} · ${holders(n, "data").map(esc).join(", ")}</p>
        <form class="g-log-add" data-form="log">
          <select name="who">${members().map(m => opt(m, m, holders(n, "data").includes(me) ? me : holders(n, "data")[0])).join("")}</select>
          <input name="what" placeholder="${esc(t("log_ph"))}" required>
          <button class="btn primary">${icon("plus")}${esc(t("log_add"))}</button>
        </form>
        <ul class="g-log">${logs.map(l => `<li>${avatar(l.who || "?", "sm")}<b>${esc(l.who || "")}</b><span>${esc(l.what || "")}</span><small>${esc(l.date ? shortDate(l.date) : "")}</small>
          <button class="icon-btn subtle" data-action="del-item" data-id="${l.id}">${icon("trash")}</button></li>`).join("")}</ul>
      </section>
      ${next ? `<section class="panel g-next"><h3>${esc(t("next_week"))} · ${esc(t("weekN", { n: n + 1 }))}</h3>
        <p><b>${esc(tx(next.focus))}</b></p>
        ${nextRole ? `<p class="muted">${esc(t("your_role_next"))}: <b style="color:${ROLES[nextRole].color}">${esc(tx(ROLES[nextRole].t))}</b></p>` : ""}
      </section>` : ""}`;
    }
  }
  return "";
}

/* ---------- All weeks ---------- */
VIEWS.weeks = () => {
  const cw = currentWeek();
  const cards = Store.all("card");
  const doneCards = cards.filter(c => c.status === "done").length;
  let slots = 0, approved = 0;
  for (let k = 1; k <= 7; k++) { const s = weekDeliverableStats(k); slots += s.total; approved += s.approved; }
  const pitched = Store.all("seller").filter(s => s.stage && s.stage !== "todo").length;
  const stat = (ic, label, value, total) => `<div class="stat"><div class="stat-top"><span class="stat-ic">${icon(ic)}</span><span>${esc(label)}</span></div>
    <b>${value}${total !== undefined ? `<small> / ${total}</small>` : ""}</b>${total !== undefined ? bar(pct(value, total)) : ""}</div>`;

  return `
  <div class="stats">
    ${stat("listcheck", t("tasks_done"), doneCards, cards.length)}
    ${stat("inbox", t("deliv_approved"), approved, slots)}
    ${stat("users", t("pitched"), pitched, 15)}
    ${stat("chart", t("posts_logged"), Store.all("post").length)}
  </div>
  ${Object.values(PHASES).map(p => `
    <h2 class="phase-title">${esc(tx(p.t))}</h2>
    <div class="week-cards">${p.weeks.map(k => {
      const w = weekPlan(k);
      const kc = weekCards(k);
      const kd = kc.filter(c => c.status === "done").length;
      const ds = weekDeliverableStats(k);
      return `<article class="week-card ${k === cw ? "current" : ""} ${k < cw ? "past" : ""}" data-action="go-week" data-week="${k}" tabindex="0">
        <div class="wc-top"><span class="wc-num">${k}</span>${k === cw ? `<span class="status st-submitted">${esc(t("now"))}</span>` : ""}${weekDate(k) ? `<span class="muted small">${esc(weekDate(k))}</span>` : ""}</div>
        <b class="wc-focus">${esc(tx(w.focus))}</b>
        <p class="muted small">${icon("book")} ${esc(tx(w.lesson))}</p>
        <div class="wc-meters">
          <div><span>${esc(t("nav_tasks"))}</span><b>${kd}/${kc.length}</b>${bar(pct(kd, kc.length))}</div>
          <div><span>${esc(t("tab_deliverables"))}</span><b>${ds.approved}/${ds.total}</b>${bar(pct(ds.approved, ds.total))}</div>
        </div>
        <div class="wc-coord muted small">${icon("compass")} ${esc(coordinator(k))}</div>
      </article>`;
    }).join("")}</div>`).join("")}`;
};
