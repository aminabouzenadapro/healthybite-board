/* HealthyBite board — dialogs: task, seller, week plan, deliverables, who-are-you, photo viewer. */

function openModal(html, onReady, cls = "") {
  const m = $("#modal");
  m.innerHTML = `<div class="modal-card ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  m.hidden = false;
  document.body.classList.add("modal-open");
  onReady && onReady(m);
}
function closeModal() {
  $("#modal").hidden = true;
  $("#modal").innerHTML = "";
  document.body.classList.remove("modal-open");
  render();
}
const modalHead = (title, extra = "") => `<div class="modal-head">${title}${extra}<button type="button" class="icon-btn" data-action="close-modal" title="${esc(t("close"))}">${icon("x")}</button></div>`;

/* ---------- task ---------- */
function openCard(id, preset = {}) {
  const isNew = !id;
  const c = isNew
    ? { id: uid("c"), kind: "card", title: "", desc: "", week: currentWeek(), role: "", status: "todo", type: "task", assignee: "", due: "", caption: "", checks: [], comments: [], subtasks: [], ...preset }
    : structuredClone(Store.get(id));
  if (!c) return;
  c.checks = c.checks || [];
  let subs = structuredClone(c.subtasks || []);

  openModal(`
    <form id="card-form" class="form">
      ${modalHead(`<input class="title-input" name="title" value="${esc(tx(c.title))}" placeholder="${esc(t("title"))}" required>`)}
      <div class="form-grid">
        <label class="field"><span>${esc(t("status"))}</span><select name="status">${COLUMNS.map(s => opt(s, t("col_" + s), c.status)).join("")}</select></label>
        <label class="field"><span>${esc(t("week"))}</span><select name="week">${WEEKS.map(w => opt(w.n, t("weekN", { n: w.n }), c.week)).join("")}</select></label>
        <label class="field"><span>${esc(t("role"))}</span><select name="role">${opt("", t("none"), c.role)}${Object.keys(ROLES).map(r => opt(r, tx(ROLES[r].t), c.role)).join("")}</select></label>
        <label class="field"><span>${esc(t("assignee"))}</span><select name="assignee">${opt("", t("auto_role"), c.assignee)}${members().map(mm => opt(mm, mm, c.assignee)).join("")}</select></label>
        <label class="field"><span>${esc(t("due"))}</span><input type="date" name="due" value="${esc(c.due || "")}"></label>
        <label class="field"><span>${esc(t("type"))}</span><select name="type">${opt("task", t("type_task"), c.type)}${opt("content", t("type_content"), c.type)}</select></label>
      </div>
      <label class="field"><span>${esc(t("description"))}</span><textarea name="desc" rows="2">${esc(c.desc || "")}</textarea></label>

      <div class="field">
        <span class="field-label">${icon("listcheck")} ${esc(t("subtasks"))} <em class="sub-count"></em></span>
        <ul class="subtasks"></ul>
        <label class="quick-add boxed">${icon("plus")}<input name="newsub" placeholder="${esc(t("add_subtask"))}"></label>
      </div>

      <div class="claims" ${c.type === "content" ? "" : "hidden"}>
        <label class="field"><span>${esc(t("caption"))}</span><textarea name="caption" rows="4">${esc(c.caption || "")}</textarea></label>
        <div class="flags"></div>
        <fieldset class="claims-box"><legend>${icon("shield")} ${esc(t("claims_review"))}</legend>
          ${CLAIM_CHECKS.map((ch, i) => `<label class="check ${c.checks[i] ? "on" : ""}"><input type="checkbox" name="check${i}" ${c.checks[i] ? "checked" : ""}><span class="box">${icon("check")}</span><span>${esc(tx(ch))}</span></label>`).join("")}
          <div class="claims-status"></div>
        </fieldset>
      </div>

      <div class="comments">
        <span class="field-label">${icon("message")} ${esc(t("comments"))}</span>
        <ul>${(c.comments || []).map(cm => `<li>${avatar(cm.who, "sm")}<div><b>${esc(cm.who)}</b> <small>${esc(when(cm.at))}</small><p>${esc(cm.text)}</p></div></li>`).join("")}</ul>
        <div class="comment-row"><select name="cwho">${members().map(mm => opt(mm, mm, ui.me)).join("")}</select><input name="ctext" placeholder="…"></div>
      </div>
      <div class="modal-foot">
        ${isNew ? "" : `<button type="button" class="btn danger ghost" data-action="del-card" data-id="${c.id}">${icon("trash")}${esc(t("delete"))}</button>`}
        <span class="spacer"></span>
        <button type="button" class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button>
        <button type="submit" class="btn primary">${esc(t("save"))}</button>
      </div>
    </form>`, m => {
    const f = $("#card-form", m);
    const drawSubs = () => {
      $(".subtasks", f).innerHTML = subs.map((s, i) => `
        <li class="${s.done ? "is-done" : ""}">
          <label class="check"><input type="checkbox" data-sub="${i}" ${s.done ? "checked" : ""}><span class="box">${icon("check")}</span></label>
          <input class="sub-text" data-subtext="${i}" value="${esc(s.text)}">
          <button type="button" class="icon-btn subtle" data-subdel="${i}">${icon("x")}</button>
        </li>`).join("");
      $(".sub-count", f).textContent = subs.length ? `${subs.filter(s => s.done).length}/${subs.length}` : "";
    };
    drawSubs();
    f.addEventListener("click", e => {
      const del = e.target.closest("[data-subdel]");
      if (del) { subs.splice(Number(del.dataset.subdel), 1); drawSubs(); }
    });
    f.addEventListener("change", e => {
      if (e.target.dataset.sub !== undefined) { subs[e.target.dataset.sub].done = e.target.checked; drawSubs(); }
    });
    f.addEventListener("input", e => {
      if (e.target.dataset.subtext !== undefined) subs[e.target.dataset.subtext].text = e.target.value;
    });
    f.newsub.addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      const text = f.newsub.value.trim();
      if (!text) return;
      subs.push({ id: uid("st"), text, done: false });
      f.newsub.value = "";
      drawSubs();
    });

    const refresh = () => {
      $(".claims", f).hidden = f.type.value !== "content";
      const words = flaggedWords(f.caption.value);
      $(".flags", f).innerHTML = words.length ? `<div class="flag-box">${icon("alert")} ${esc(t("claims_flagged"))} ${words.map(w => `<mark>${esc(w)}</mark>`).join(" ")}</div>` : "";
      f.querySelectorAll(".claims-box .check").forEach(l => l.classList.toggle("on", l.querySelector("input").checked));
      const ok = CLAIM_CHECKS.every((_, i) => f["check" + i].checked) && !words.length;
      $(".claims-status", f).innerHTML = ok ? `<span class="mini-chip ok">${icon("shield")}${esc(t("claims_ok"))}</span>` : `<span class="mini-chip warn">${icon("shield")}${esc(t("claims_pending"))}</span>`;
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
        subtasks: subs.filter(s => s.text.trim()),
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

/* ---------- seller ---------- */
function openSeller(id) {
  const isNew = !id;
  const s = isNew ? { id: uid("s"), kind: "seller", name: "", contact: "", city: "", products: "", notes: "", stage: "todo", order: Date.now() } : { ...Store.get(id) };
  const f = (name, label, type = "text") => `<label class="field"><span>${esc(t(label))}</span>${type === "area"
    ? `<textarea name="${name}" rows="3">${esc(s[name] || "")}</textarea>` : `<input name="${name}" value="${esc(s[name] || "")}">`}</label>`;
  openModal(`
    <form id="seller-form" class="form">
      ${modalHead(`<h3>${esc(isNew ? t("new_seller") : s.name)}</h3>`)}
      <div class="form-grid">
        ${f("name", "seller_name")}${f("contact", "contact")}${f("city", "city")}
        <label class="field"><span>${esc(t("status"))}</span><select name="stage">${SELLER_STAGES.map(st => opt(st, t("stage_" + st), s.stage)).join("")}</select></label>
      </div>
      ${f("products", "products")}${f("notes", "notes", "area")}
      <div class="modal-foot">
        ${isNew ? "" : `<button type="button" class="btn danger ghost" data-action="del-item" data-id="${s.id}" data-close="1">${icon("trash")}${esc(t("delete"))}</button>`}
        <span class="spacer"></span>
        <button type="button" class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button>
        <button type="submit" class="btn primary">${esc(t("save"))}</button>
      </div>
    </form>`, m => {
    const form = $("#seller-form", m);
    form.elements.name.focus();
    form.addEventListener("submit", e => {
      e.preventDefault();
      Store.put({ ...s, ...Object.fromEntries(new FormData(form)) });
      closeModal();
    });
  });
}

/* ---------- week plan ---------- */
function openWeekPlan(n) {
  const w = weekPlan(n);
  const rows = (list, name) => list.map(it => `
    <li class="edit-row" data-id="${esc(it.id)}"><input data-list="${name}" value="${esc(tx(it.t))}"><button type="button" class="icon-btn subtle" data-rowdel>${icon("trash")}</button></li>`).join("");
  openModal(`
    <form id="plan-form" class="form">
      ${modalHead(`<h3>${esc(t("edit_plan"))} · ${esc(t("weekN", { n }))}</h3>`)}
      <label class="field"><span>${icon("target")} ${esc(t("focus"))}</span><input name="focus" value="${esc(tx(w.focus))}" placeholder="${esc(t("focus_ph"))}"></label>
      <label class="field"><span>${icon("book")} ${esc(t("lesson"))}</span><input name="lesson" value="${esc(tx(w.lesson))}" placeholder="${esc(t("lesson_ph"))}"></label>
      <div class="field"><span class="field-label">${icon("listcheck")} ${esc(t("done_by_end"))}</span>
        <ul class="edit-list" data-for="done">${rows(w.done, "done")}</ul>
        <button type="button" class="btn ghost sm" data-addrow="done">${icon("plus")}${esc(t("add_item"))}</button></div>
      <div class="field"><span class="field-label">${icon("inbox")} ${esc(t("expected_deliverables"))}</span>
        <ul class="edit-list" data-for="deliverables">${rows(w.deliverables, "deliverables")}</ul>
        <button type="button" class="btn ghost sm" data-addrow="deliverables">${icon("plus")}${esc(t("add_item"))}</button></div>
      <p class="hint">${esc(t("add_task_ph"))} → ${esc(t("team_this_week"))}</p>
      <div class="modal-foot"><span class="spacer"></span>
        <button type="button" class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button>
        <button type="submit" class="btn primary">${esc(t("save"))}</button></div>
    </form>`, m => {
    const f = $("#plan-form", m);
    f.addEventListener("click", e => {
      if (e.target.closest("[data-rowdel]")) e.target.closest("li").remove();
      const add = e.target.closest("[data-addrow]");
      if (add) {
        const name = add.dataset.addrow;
        const li = document.createElement("li");
        li.className = "edit-row";
        li.dataset.id = (name === "done" ? "i" : "d") + Date.now().toString(36);
        li.innerHTML = `<input data-list="${name}"><button type="button" class="icon-btn subtle" data-rowdel>${icon("trash")}</button>`;
        $(`[data-for="${name}"]`, f).appendChild(li);
        li.querySelector("input").focus();
      }
    });
    f.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.dataset.list) e.preventDefault(); });
    /* Unchanged seeded texts keep all 3 languages; edited ones become plain text. */
    const keep = (orig, text) => (orig && tx(orig) === text ? orig : text);
    const collect = (name, original) => [...f.querySelectorAll(`[data-for="${name}"] li`)].map(li => {
      const text = li.querySelector("input").value.trim();
      const was = original.find(o => o.id === li.dataset.id);
      return text ? { id: li.dataset.id, t: keep(was && was.t, text) } : null;
    }).filter(Boolean);
    f.addEventListener("submit", e => {
      e.preventDefault();
      saveWeek(n, {
        focus: keep(w.focus, f.focus.value.trim()),
        lesson: keep(w.lesson, f.lesson.value.trim()),
        done: collect("done", w.done),
        deliverables: collect("deliverables", w.deliverables),
      });
      toast(t("plan_saved"));
      closeModal();
    });
  });
}

/* ---------- deliverables ---------- */
function openDeliverable(id) {
  const d = Store.get(id);
  if (!d) return;
  const coord = coordinator(d.week);
  const history = (d.history || []).slice().reverse();
  openModal(`
    <div class="form">
      ${modalHead(`<div class="grow"><div class="eyebrow dark">${esc(t("weekN", { n: d.week }))} · ${esc(t("deliv_title"))}</div><h3>${esc(tx(d.title))}</h3></div>`, statusBadge(d.status))}
      <div class="submit-meta">${avatar(d.by || "?")}<div><b>${esc(d.by || "")}</b><span class="muted small">${esc(t("submitted_by"))} · ${esc(when(d.at))}</span></div></div>
      ${(d.links || []).length ? `<div class="field"><span class="field-label">${icon("link")} ${esc(t("links"))}</span>
        <ul class="link-list">${d.links.map(l => `<li><a href="${esc(safeUrl(l))}" target="_blank" rel="noopener noreferrer">${icon("external")}<span>${esc(linkHost(safeUrl(l)))}</span><small>${esc(l)}</small></a></li>`).join("")}</ul></div>` : ""}
      ${(d.photos || []).length ? `<div class="field"><span class="field-label">${icon("image")} ${esc(t("photos"))}</span>
        <div class="photo-grid">${d.photos.map(p => `<button type="button" class="photo" data-action="view-photo" data-photo="${p.id}"><img src="${p.thumb}" alt=""></button>`).join("")}</div></div>` : ""}
      ${d.note ? `<div class="readout"><span>${esc(t("notes"))}</span><p>${esc(d.note)}</p></div>` : ""}

      <div class="review-box">
        <div class="field-label">${icon("shield")} ${esc(t("coordinator_reviews", { n: d.week, name: coord }))}</div>
        <div class="form-grid">
          <label class="field"><span>${esc(t("reviewer"))}</span><select id="rv-by">${members().map(mm => opt(mm, mm, ui.me || coord)).join("")}</select></label>
        </div>
        <label class="field"><span>${esc(t("review_comment"))}</span><textarea id="rv-comment" rows="2"></textarea></label>
        <div class="btn-row">
          <button class="btn approve" data-action="review" data-id="${d.id}" data-status="approved">${icon("check")}${esc(t("approve"))}</button>
          <button class="btn changes" data-action="review" data-id="${d.id}" data-status="changes">${icon("pencil")}${esc(t("request_changes"))}</button>
        </div>
      </div>

      ${history.length ? `<div class="field"><span class="field-label">${icon("clock")} ${esc(t("history"))}</span>
        <ul class="history">${history.map(h => `<li class="ev-${h.type}">${avatar(h.by || "?", "sm")}<div><b>${esc(h.by || "")}</b> ${esc(t("ev_" + h.type))} <small>${esc(when(h.at))}</small>${h.comment ? `<p>${esc(h.comment)}</p>` : ""}</div></li>`).join("")}</ul></div>` : ""}

      <div class="modal-foot">
        <button type="button" class="btn danger ghost" data-action="del-deliv" data-id="${d.id}">${icon("trash")}${esc(t("delete"))}</button>
        <span class="spacer"></span>
        <button type="button" class="btn" data-action="edit-deliv" data-id="${d.id}">${icon("upload")}${esc(t("resubmit"))}</button>
      </div>
    </div>`);
}

function reviewDeliverable(id, status) {
  const d = Store.get(id);
  if (!d) return;
  const by = $("#rv-by").value;
  const comment = $("#rv-comment").value.trim();
  const at = Date.now();
  Store.put({ ...d, status, review: { by, comment, at }, history: [...(d.history || []), { type: status, by, comment, at }] });
  openDeliverable(id);
}

function deleteDeliverable(id) {
  const d = Store.get(id);
  if (!d) return;
  (d.photos || []).forEach(p => Store.delPhoto(p.id));
  Store.del(id);
}

/* Submit or resubmit. `ref` is an existing deliverable id, or { week, slot }. */
function editDeliverable(ref) {
  const existing = typeof ref === "string" ? Store.get(ref) : null;
  const week = existing ? existing.week : ref.week;
  const slotId = existing ? existing.slot : ref.slot || "";
  const slot = slotId ? weekPlan(week).deliverables.find(s => s.id === slotId) : null;
  const d = existing ? structuredClone(existing) : { id: uid("dl"), kind: "deliverable", week, slot: slotId, title: slot ? slot.t : "", links: [], photos: [], note: "", history: [] };
  let links = d.links.length ? [...d.links] : [""];
  let photos = [...(d.photos || [])];           // { id, thumb, full? } (full only for new ones)
  const removed = [];

  openModal(`
    <form id="deliv-form" class="form">
      ${modalHead(`<div class="grow"><div class="eyebrow dark">${esc(t("weekN", { n: week }))} · ${esc(t("submit"))}</div>
        ${slot ? `<h3>${esc(tx(slot.t))}</h3>` : `<input class="title-input" name="title" value="${esc(tx(d.title))}" placeholder="${esc(t("deliv_title"))}" required>`}</div>`)}
      <div class="field"><span class="field-label">${icon("link")} ${esc(t("links"))}</span>
        <ul class="edit-list links"></ul>
        <button type="button" class="btn ghost sm" data-addlink>${icon("plus")}${esc(t("add_link"))}</button></div>
      <div class="field"><span class="field-label">${icon("image")} ${esc(t("photos"))}</span>
        <div class="photo-grid editable"></div>
        <p class="hint">${esc(t("photos_hint"))}</p></div>
      <label class="field"><span>${esc(t("notes"))}</span><textarea name="note" rows="3">${esc(d.note || "")}</textarea></label>
      <label class="field narrow"><span>${esc(t("submitted_by"))}</span><select name="by">${members().map(mm => opt(mm, mm, d.by || ui.me)).join("")}</select></label>
      <div class="modal-foot"><span class="busy muted small"></span><span class="spacer"></span>
        <button type="button" class="btn ghost" data-action="close-modal">${esc(t("cancel"))}</button>
        <button type="submit" class="btn primary">${icon("send")}${esc(t("submit"))}</button></div>
    </form>`, m => {
    const f = $("#deliv-form", m);
    const drawLinks = () => {
      $(".links", f).innerHTML = links.map((l, i) => `<li class="edit-row"><input inputmode="url" autocomplete="off" data-link="${i}" value="${esc(l)}" placeholder="${esc(t("link_ph"))}"><button type="button" class="icon-btn subtle" data-linkdel="${i}">${icon("x")}</button></li>`).join("");
    };
    const drawPhotos = () => {
      $(".photo-grid", f).innerHTML = photos.map((p, i) => `<div class="photo"><img src="${p.thumb}" alt=""><button type="button" class="photo-del" data-photodel="${i}">${icon("x")}</button></div>`).join("")
        + (photos.length < MAX_PHOTOS ? `<label class="photo add">${icon("plus")}<span>${esc(t("add_photos"))}</span><input type="file" accept="image/*" multiple hidden data-photos></label>` : "");
    };
    drawLinks(); drawPhotos();
    f.addEventListener("input", e => { if (e.target.dataset.link !== undefined) links[e.target.dataset.link] = e.target.value; });
    f.addEventListener("click", e => {
      if (e.target.closest("[data-addlink]")) { links.push(""); drawLinks(); f.querySelector(`[data-link="${links.length - 1}"]`).focus(); }
      const ld = e.target.closest("[data-linkdel]");
      if (ld) { links.splice(Number(ld.dataset.linkdel), 1); if (!links.length) links = [""]; drawLinks(); }
      const pd = e.target.closest("[data-photodel]");
      if (pd) { const [p] = photos.splice(Number(pd.dataset.photodel), 1); if (!p.full) removed.push(p.id); drawPhotos(); }
    });
    f.addEventListener("change", async e => {
      if (!e.target.matches("[data-photos]")) return;
      const files = [...e.target.files];
      if (photos.length + files.length > MAX_PHOTOS) toast(t("photo_limit"), "warn");
      $(".busy", f).textContent = t("compressing");
      for (const file of files.slice(0, MAX_PHOTOS - photos.length)) {
        try { photos.push({ id: uid("ph"), ...(await compressPhoto(file)) }); } catch { toast(t("photo_failed"), "warn"); }
      }
      $(".busy", f).textContent = "";
      drawPhotos();
    });
    f.addEventListener("submit", async e => {
      e.preventDefault();
      const btn = f.querySelector("[type=submit]");
      btn.disabled = true;
      $(".busy", f).textContent = t("saving") || "…";
      const kept = [];
      for (const p of photos) {
        if (!p.full) { kept.push({ id: p.id, thumb: p.thumb }); continue; }
        try { await Store.putPhoto(p.id, p.full); kept.push({ id: p.id, thumb: p.thumb }); }
        catch (err) { console.error(err); toast(t("photo_failed"), "warn"); }
      }
      removed.forEach(pid => Store.delPhoto(pid));
      const by = f.by.value;
      const at = Date.now();
      Store.put({
        ...d,
        title: slot ? slot.t : f.title.value.trim(),
        links: links.map(l => safeUrl(l)).filter(l => /^https?:\/\/[^\s/]+\.[^\s/]{2,}/i.test(l)),
        photos: kept, note: f.note.value, by, at, status: "submitted",
        history: [...(d.history || []), { type: "submitted", by, at }],
      });
      if (!ui.me) { ui.me = by; saveUI(); }
      closeModal();
      openDeliverable(d.id);
    });
  });
}

/* Phone photos are large: keep a 1280px JPEG for viewing and a small thumbnail for lists. */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}
function toJpeg(img, max, quality) {
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * s);
  c.height = Math.round(img.naturalHeight * s);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", quality);
}
async function compressPhoto(file) {
  const img = await loadImage(file);
  let full = toJpeg(img, 1280, 0.72);
  if (full.length > 700000) full = toJpeg(img, 1000, 0.6); // Firestore documents must stay under 1 MB
  return { full, thumb: toJpeg(img, 320, 0.6) };
}

async function viewPhoto(photoId, thumb) {
  const box = $("#lightbox");
  box.innerHTML = `<button class="icon-btn lb-close" data-action="close-lightbox">${icon("x")}</button><img src="${thumb || ""}" class="loading" alt="">`;
  box.hidden = false;
  const full = await Store.getPhoto(photoId).catch(() => null);
  const img = box.querySelector("img");
  if (img && full) { img.src = full; img.classList.remove("loading"); }
}

/* ---------- who are you ---------- */
function openWho() {
  openModal(`
    <div class="form">
      ${modalHead(`<h3>${esc(t("who_are_you"))}</h3>`)}
      <p class="hint">${esc(t("who_hint"))}</p>
      <div class="who-grid">${members().map(mm => `<button class="who ${mm === ui.me ? "on" : ""}" data-action="set-me" data-name="${esc(mm)}">${avatar(mm, "lg")}<b>${esc(mm)}</b><span class="muted small">${esc(tx(ROLES[roleOf(mm, currentWeek())]?.t))}</span></button>`).join("")}</div>
    </div>`, null, "narrow");
}
