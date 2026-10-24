/* Data store. Every record is an item { id, kind, ... }.
   Local mode: localStorage (+ live updates between tabs of the same browser).
   Live mode:  Firestore collection teams/{team}/items, one document per item,
               so two people editing different cards never overwrite each other. */

const FIREBASE_SDK = window.HB_FIREBASE_SDK || "https://www.gstatic.com/firebasejs/10.12.2/";
const LOCAL_KEY = "hb-board-v1";
const CONN_KEY = "hb-connection";

const Store = {
  items: new Map(),
  mode: "local",          // local | connecting | live | error
  team: "",
  error: "",
  onChange: () => {},
  _fs: null,              // { db, api } in live mode
  _channel: null,

  /* Firebase settings: Settings page (this browser) wins over config.js. */
  connection() {
    try {
      const saved = JSON.parse(localStorage.getItem(CONN_KEY) || "null");
      if (saved) return saved;
    } catch {}
    const cfg = window.HB_CONFIG || {};
    return cfg.firebase ? { firebase: cfg.firebase, team: cfg.team || "healthybite" } : null;
  },
  saveConnection(conn) {
    try {
      if (conn) localStorage.setItem(CONN_KEY, JSON.stringify(conn));
      else localStorage.setItem(CONN_KEY, JSON.stringify({ localOnly: true }));
    } catch {}
  },

  async init(seed) {
    const conn = this.connection();
    if (conn && conn.firebase && !conn.localOnly) {
      try {
        await this._initLive(conn, seed);
        return;
      } catch (e) {
        console.error(e);
        this.error = String(e.message || e);
      }
    }
    this._initLocal(seed);
  },

  _initLocal(seed) {
    this.mode = "local";
    this._loadLocal();
    if (!this.items.has("meta")) {
      seed().forEach(it => this.items.set(it.id, it));
      this._saveLocal();
    }
    try {
      this._channel = new BroadcastChannel("hb-board");
      this._channel.onmessage = () => { this._loadLocal(); this.onChange(); };
    } catch {}
    this.onChange();
  },
  _loadLocal() {
    this.items.clear();
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      raw.forEach(it => this.items.set(it.id, it));
    } catch {}
  },
  _saveLocal() {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify([...this.items.values()])); } catch {}
    try { this._channel && this._channel.postMessage("changed"); } catch {}
  },

  async _initLive(conn, seed) {
    this.mode = "connecting";
    this.team = conn.team || "healthybite";
    this.onChange();
    const appMod = await import(FIREBASE_SDK + "firebase-app.js");
    const api = await import(FIREBASE_SDK + "firebase-firestore.js");
    const app = appMod.initializeApp(conn.firebase, "hb-" + this.team);
    let db;
    try {
      db = api.initializeFirestore(app, { localCache: api.persistentLocalCache() });
    } catch {
      db = api.getFirestore(app);
    }
    const col = api.collection(db, "teams", this.team, "items");
    this._fs = { db, api, col };

    await new Promise((resolve, reject) => {
      let first = true, checkedSeed = false;
      api.onSnapshot(col, { includeMetadataChanges: true }, snap => {
        snap.docChanges().forEach(ch => {
          if (ch.type === "removed") this.items.delete(ch.doc.id);
          else this.items.set(ch.doc.id, ch.doc.data());
        });
        this.mode = "live";
        /* Seed the plan once, only when the server confirms the team space is empty. */
        if (!checkedSeed && !snap.metadata.fromCache) {
          checkedSeed = true;
          if (!this.items.has("meta")) {
            const list = seed();
            list.forEach(it => this.items.set(it.id, it));
            this._writeMany(list);
          }
        }
        if (first) { first = false; resolve(); }
        this.onChange();
      }, err => {
        this.mode = "error";
        this.error = err.message;
        this.onChange();
        if (first) reject(err);
      });
    });
  },

  _writeMany(list) {
    if (this.mode !== "live") return;
    const { db, api, col } = this._fs;
    for (let i = 0; i < list.length; i += 400) {
      const batch = api.writeBatch(db);
      list.slice(i, i + 400).forEach(it => batch.set(api.doc(col, it.id), clean(it)));
      batch.commit().catch(e => this._fail(e));
    }
  },
  _fail(e) {
    console.error(e);
    this.error = e.message;
    this.mode = "error";
    this.onChange();
  },

  all(kind) { return [...this.items.values()].filter(it => it.kind === kind); },
  get(id) { return this.items.get(id); },

  put(item) {
    item.updated = Date.now();
    this.items.set(item.id, item);
    if (this.mode === "local") this._saveLocal();
    else if (this._fs) {
      const { api, col } = this._fs;
      api.setDoc(api.doc(col, item.id), clean(item)).catch(e => this._fail(e));
    }
    this.onChange();
  },
  patch(id, fields) {
    const cur = this.items.get(id);
    if (cur) this.put({ ...cur, ...fields });
  },
  del(id) {
    this.items.delete(id);
    if (this.mode === "local") this._saveLocal();
    else if (this._fs) {
      const { api, col } = this._fs;
      api.deleteDoc(api.doc(col, id)).catch(e => this._fail(e));
    }
    this.onChange();
  },

  /* Replace everything (reset / import). */
  replaceAll(list) {
    const old = [...this.items.keys()];
    if (this.mode === "local") {
      this.items.clear();
      list.forEach(it => this.items.set(it.id, it));
      this._saveLocal();
    } else if (this._fs) {
      const { db, api, col } = this._fs;
      const keep = new Set(list.map(it => it.id));
      const gone = old.filter(id => !keep.has(id));
      for (let i = 0; i < gone.length; i += 400) {
        const batch = api.writeBatch(db);
        gone.slice(i, i + 400).forEach(id => batch.delete(api.doc(col, id)));
        batch.commit().catch(e => this._fail(e));
      }
      gone.forEach(id => this.items.delete(id));
      list.forEach(it => this.items.set(it.id, it));
      this._writeMany(list);
    }
    this.onChange();
  },
};

/* Firestore rejects undefined values. */
function clean(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* Accepts the snippet Firebase shows ("const firebaseConfig = { apiKey: "..." }")
   or plain JSON, and returns the config object. */
function parseFirebaseConfig(text) {
  const out = {};
  const re = /["']?(\w+)["']?\s*:\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text))) out[m[1]] = m[2];
  return out.apiKey && out.projectId ? out : null;
}
