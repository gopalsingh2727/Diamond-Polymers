var bt = Object.defineProperty;
var Et = (u, p, o) => p in u ? bt(u, p, { enumerable: !0, configurable: !0, writable: !0, value: o }) : u[p] = o;
var g = (u, p, o) => Et(u, typeof p != "symbol" ? p + "" : p, o);
import St, { app as I, Menu as Ot, session as G, shell as Q, globalShortcut as Le, Notification as Ie, ipcMain as H, BrowserWindow as _e } from "electron";
import { fileURLToPath as Dt } from "node:url";
import F from "node:path";
import J from "node:fs";
import At from "node:os";
import { spawn as Fe } from "node:child_process";
import M from "fs";
import q from "path";
import W from "os";
import Lt from "crypto";
import _t from "child_process";
import Pt from "util";
import ut from "events";
import Rt from "http";
import xt from "https";
function ft(u) {
  return u && u.__esModule && Object.prototype.hasOwnProperty.call(u, "default") ? u.default : u;
}
var T = { exports: {} };
const $t = "16.6.1", It = {
  version: $t
};
var Ne;
function Ft() {
  if (Ne) return T.exports;
  Ne = 1;
  const u = M, p = q, o = W, a = Lt, r = It.version, e = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
  function t(f) {
    const m = {};
    let b = f.toString();
    b = b.replace(/\r\n?/mg, `
`);
    let S;
    for (; (S = e.exec(b)) != null; ) {
      const P = S[1];
      let w = S[2] || "";
      w = w.trim();
      const O = w[0];
      w = w.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), O === '"' && (w = w.replace(/\\n/g, `
`), w = w.replace(/\\r/g, "\r")), m[P] = w;
    }
    return m;
  }
  function n(f) {
    f = f || {};
    const m = _(f);
    f.path = m;
    const b = v.configDotenv(f);
    if (!b.parsed) {
      const O = new Error(`MISSING_DATA: Cannot parse ${m} for an unknown reason`);
      throw O.code = "MISSING_DATA", O;
    }
    const S = d(f).split(","), P = S.length;
    let w;
    for (let O = 0; O < P; O++)
      try {
        const A = S[O].trim(), N = h(b, A);
        w = v.decrypt(N.ciphertext, N.key);
        break;
      } catch (A) {
        if (O + 1 >= P)
          throw A;
      }
    return v.parse(w);
  }
  function s(f) {
    console.log(`[dotenv@${r}][WARN] ${f}`);
  }
  function c(f) {
    console.log(`[dotenv@${r}][DEBUG] ${f}`);
  }
  function l(f) {
    console.log(`[dotenv@${r}] ${f}`);
  }
  function d(f) {
    return f && f.DOTENV_KEY && f.DOTENV_KEY.length > 0 ? f.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
  }
  function h(f, m) {
    let b;
    try {
      b = new URL(m);
    } catch (A) {
      if (A.code === "ERR_INVALID_URL") {
        const N = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
        throw N.code = "INVALID_DOTENV_KEY", N;
      }
      throw A;
    }
    const S = b.password;
    if (!S) {
      const A = new Error("INVALID_DOTENV_KEY: Missing key part");
      throw A.code = "INVALID_DOTENV_KEY", A;
    }
    const P = b.searchParams.get("environment");
    if (!P) {
      const A = new Error("INVALID_DOTENV_KEY: Missing environment part");
      throw A.code = "INVALID_DOTENV_KEY", A;
    }
    const w = `DOTENV_VAULT_${P.toUpperCase()}`, O = f.parsed[w];
    if (!O) {
      const A = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${w} in your .env.vault file.`);
      throw A.code = "NOT_FOUND_DOTENV_ENVIRONMENT", A;
    }
    return { ciphertext: O, key: S };
  }
  function _(f) {
    let m = null;
    if (f && f.path && f.path.length > 0)
      if (Array.isArray(f.path))
        for (const b of f.path)
          u.existsSync(b) && (m = b.endsWith(".vault") ? b : `${b}.vault`);
      else
        m = f.path.endsWith(".vault") ? f.path : `${f.path}.vault`;
    else
      m = p.resolve(process.cwd(), ".env.vault");
    return u.existsSync(m) ? m : null;
  }
  function E(f) {
    return f[0] === "~" ? p.join(o.homedir(), f.slice(1)) : f;
  }
  function y(f) {
    const m = !!(f && f.debug), b = f && "quiet" in f ? f.quiet : !0;
    (m || !b) && l("Loading env from encrypted .env.vault");
    const S = v._parseVault(f);
    let P = process.env;
    return f && f.processEnv != null && (P = f.processEnv), v.populate(P, S, f), { parsed: S };
  }
  function L(f) {
    const m = p.resolve(process.cwd(), ".env");
    let b = "utf8";
    const S = !!(f && f.debug), P = f && "quiet" in f ? f.quiet : !0;
    f && f.encoding ? b = f.encoding : S && c("No encoding is specified. UTF-8 is used by default");
    let w = [m];
    if (f && f.path)
      if (!Array.isArray(f.path))
        w = [E(f.path)];
      else {
        w = [];
        for (const C of f.path)
          w.push(E(C));
      }
    let O;
    const A = {};
    for (const C of w)
      try {
        const x = v.parse(u.readFileSync(C, { encoding: b }));
        v.populate(A, x, f);
      } catch (x) {
        S && c(`Failed to load ${C} ${x.message}`), O = x;
      }
    let N = process.env;
    if (f && f.processEnv != null && (N = f.processEnv), v.populate(N, A, f), S || !P) {
      const C = Object.keys(A).length, x = [];
      for (const $e of w)
        try {
          const B = p.relative(process.cwd(), $e);
          x.push(B);
        } catch (B) {
          S && c(`Failed to load ${$e} ${B.message}`), O = B;
        }
      l(`injecting env (${C}) from ${x.join(",")}`);
    }
    return O ? { parsed: A, error: O } : { parsed: A };
  }
  function R(f) {
    if (d(f).length === 0)
      return v.configDotenv(f);
    const m = _(f);
    return m ? v._configVault(f) : (s(`You set DOTENV_KEY but you are missing a .env.vault file at ${m}. Did you forget to build it?`), v.configDotenv(f));
  }
  function j(f, m) {
    const b = Buffer.from(m.slice(-64), "hex");
    let S = Buffer.from(f, "base64");
    const P = S.subarray(0, 12), w = S.subarray(-16);
    S = S.subarray(12, -16);
    try {
      const O = a.createDecipheriv("aes-256-gcm", b, P);
      return O.setAuthTag(w), `${O.update(S)}${O.final()}`;
    } catch (O) {
      const A = O instanceof RangeError, N = O.message === "Invalid key length", C = O.message === "Unsupported state or unable to authenticate data";
      if (A || N) {
        const x = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
        throw x.code = "INVALID_DOTENV_KEY", x;
      } else if (C) {
        const x = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
        throw x.code = "DECRYPTION_FAILED", x;
      } else
        throw O;
    }
  }
  function K(f, m, b = {}) {
    const S = !!(b && b.debug), P = !!(b && b.override);
    if (typeof m != "object") {
      const w = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
      throw w.code = "OBJECT_REQUIRED", w;
    }
    for (const w of Object.keys(m))
      Object.prototype.hasOwnProperty.call(f, w) ? (P === !0 && (f[w] = m[w]), S && c(P === !0 ? `"${w}" is already defined and WAS overwritten` : `"${w}" is already defined and was NOT overwritten`)) : f[w] = m[w];
  }
  const v = {
    configDotenv: L,
    _configVault: y,
    _parseVault: n,
    config: R,
    decrypt: j,
    parse: t,
    populate: K
  };
  return T.exports.configDotenv = v.configDotenv, T.exports._configVault = v._configVault, T.exports._parseVault = v._parseVault, T.exports.config = v.config, T.exports.decrypt = v.decrypt, T.exports.parse = v.parse, T.exports.populate = v.populate, T.exports = v, T.exports;
}
var Nt = Ft();
const Tt = /* @__PURE__ */ ft(Nt);
var U = { exports: {} }, X = { exports: {} }, Te;
function pt() {
  return Te || (Te = 1, (function(u) {
    let p = {};
    try {
      p = require("electron");
    } catch {
    }
    p.ipcRenderer && o(p), u.exports = o;
    function o({ contextBridge: a, ipcRenderer: i }) {
      if (!i)
        return;
      i.on("__ELECTRON_LOG_IPC__", (e, t) => {
        window.postMessage({ cmd: "message", ...t });
      }), i.invoke("__ELECTRON_LOG__", { cmd: "getOptions" }).catch((e) => console.error(new Error(
        `electron-log isn't initialized in the main process. Please call log.initialize() before. ${e.message}`
      )));
      const r = {
        sendToMain(e) {
          try {
            i.send("__ELECTRON_LOG__", e);
          } catch (t) {
            console.error("electronLog.sendToMain ", t, "data:", e), i.send("__ELECTRON_LOG__", {
              cmd: "errorHandler",
              error: { message: t == null ? void 0 : t.message, stack: t == null ? void 0 : t.stack },
              errorName: "sendToMain"
            });
          }
        },
        log(...e) {
          r.sendToMain({ data: e, level: "info" });
        }
      };
      for (const e of ["error", "warn", "info", "verbose", "debug", "silly"])
        r[e] = (...t) => r.sendToMain({
          data: t,
          level: e
        });
      if (a && process.contextIsolated)
        try {
          a.exposeInMainWorld("__electronLog", r);
        } catch {
        }
      typeof window == "object" ? window.__electronLog = r : __electronLog = r;
    }
  })(X)), X.exports;
}
var Z = { exports: {} }, ee, Ce;
function Ct() {
  if (Ce) return ee;
  Ce = 1, ee = u;
  function u(p) {
    return Object.defineProperties(o, {
      defaultLabel: { value: "", writable: !0 },
      labelPadding: { value: !0, writable: !0 },
      maxLabelLength: { value: 0, writable: !0 },
      labelLength: {
        get() {
          switch (typeof o.labelPadding) {
            case "boolean":
              return o.labelPadding ? o.maxLabelLength : 0;
            case "number":
              return o.labelPadding;
            default:
              return 0;
          }
        }
      }
    });
    function o(a) {
      o.maxLabelLength = Math.max(o.maxLabelLength, a.length);
      const i = {};
      for (const r of p.levels)
        i[r] = (...e) => p.logData(e, { level: r, scope: a });
      return i.log = i.info, i;
    }
  }
  return ee;
}
var te, je;
function jt() {
  if (je) return te;
  je = 1;
  class u {
    constructor({ processMessage: o }) {
      this.processMessage = o, this.buffer = [], this.enabled = !1, this.begin = this.begin.bind(this), this.commit = this.commit.bind(this), this.reject = this.reject.bind(this);
    }
    addMessage(o) {
      this.buffer.push(o);
    }
    begin() {
      this.enabled = [];
    }
    commit() {
      this.enabled = !1, this.buffer.forEach((o) => this.processMessage(o)), this.buffer = [];
    }
    reject() {
      this.enabled = !1, this.buffer = [];
    }
  }
  return te = u, te;
}
var re, qe;
function dt() {
  if (qe) return re;
  qe = 1;
  const u = Ct(), p = jt(), a = class a {
    constructor({
      allowUnknownLevel: r = !1,
      dependencies: e = {},
      errorHandler: t,
      eventLogger: n,
      initializeFn: s,
      isDev: c = !1,
      levels: l = ["error", "warn", "info", "verbose", "debug", "silly"],
      logId: d,
      transportFactories: h = {},
      variables: _
    } = {}) {
      g(this, "dependencies", {});
      g(this, "errorHandler", null);
      g(this, "eventLogger", null);
      g(this, "functions", {});
      g(this, "hooks", []);
      g(this, "isDev", !1);
      g(this, "levels", null);
      g(this, "logId", null);
      g(this, "scope", null);
      g(this, "transports", {});
      g(this, "variables", {});
      this.addLevel = this.addLevel.bind(this), this.create = this.create.bind(this), this.initialize = this.initialize.bind(this), this.logData = this.logData.bind(this), this.processMessage = this.processMessage.bind(this), this.allowUnknownLevel = r, this.buffering = new p(this), this.dependencies = e, this.initializeFn = s, this.isDev = c, this.levels = l, this.logId = d, this.scope = u(this), this.transportFactories = h, this.variables = _ || {};
      for (const E of this.levels)
        this.addLevel(E, !1);
      this.log = this.info, this.functions.log = this.log, this.errorHandler = t, t == null || t.setOptions({ ...e, logFn: this.error }), this.eventLogger = n, n == null || n.setOptions({ ...e, logger: this });
      for (const [E, y] of Object.entries(h))
        this.transports[E] = y(this, e);
      a.instances[d] = this;
    }
    static getInstance({ logId: r }) {
      return this.instances[r] || this.instances.default;
    }
    addLevel(r, e = this.levels.length) {
      e !== !1 && this.levels.splice(e, 0, r), this[r] = (...t) => this.logData(t, { level: r }), this.functions[r] = this[r];
    }
    catchErrors(r) {
      return this.processMessage(
        {
          data: ["log.catchErrors is deprecated. Use log.errorHandler instead"],
          level: "warn"
        },
        { transports: ["console"] }
      ), this.errorHandler.startCatching(r);
    }
    create(r) {
      return typeof r == "string" && (r = { logId: r }), new a({
        dependencies: this.dependencies,
        errorHandler: this.errorHandler,
        initializeFn: this.initializeFn,
        isDev: this.isDev,
        transportFactories: this.transportFactories,
        variables: { ...this.variables },
        ...r
      });
    }
    compareLevels(r, e, t = this.levels) {
      const n = t.indexOf(r), s = t.indexOf(e);
      return s === -1 || n === -1 ? !0 : s <= n;
    }
    initialize(r = {}) {
      this.initializeFn({ logger: this, ...this.dependencies, ...r });
    }
    logData(r, e = {}) {
      this.buffering.enabled ? this.buffering.addMessage({ data: r, date: /* @__PURE__ */ new Date(), ...e }) : this.processMessage({ data: r, ...e });
    }
    processMessage(r, { transports: e = this.transports } = {}) {
      if (r.cmd === "errorHandler") {
        this.errorHandler.handle(r.error, {
          errorName: r.errorName,
          processType: "renderer",
          showDialog: !!r.showDialog
        });
        return;
      }
      let t = r.level;
      this.allowUnknownLevel || (t = this.levels.includes(r.level) ? r.level : "info");
      const n = {
        date: /* @__PURE__ */ new Date(),
        logId: this.logId,
        ...r,
        level: t,
        variables: {
          ...this.variables,
          ...r.variables
        }
      };
      for (const [s, c] of this.transportEntries(e))
        if (!(typeof c != "function" || c.level === !1) && this.compareLevels(c.level, r.level))
          try {
            const l = this.hooks.reduce((d, h) => d && h(d, c, s), n);
            l && c({ ...l, data: [...l.data] });
          } catch (l) {
            this.processInternalErrorFn(l);
          }
    }
    processInternalErrorFn(r) {
    }
    transportEntries(r = this.transports) {
      return (Array.isArray(r) ? r : Object.entries(r)).map((t) => {
        switch (typeof t) {
          case "string":
            return this.transports[t] ? [t, this.transports[t]] : null;
          case "function":
            return [t.name, t];
          default:
            return Array.isArray(t) ? t : null;
        }
      }).filter(Boolean);
    }
  };
  g(a, "instances", {});
  let o = a;
  return re = o, re;
}
var ne, ke;
function qt() {
  if (ke) return ne;
  ke = 1;
  const u = console.error;
  class p {
    constructor({ logFn: a = null } = {}) {
      g(this, "logFn", null);
      g(this, "onError", null);
      g(this, "showDialog", !1);
      g(this, "preventDefault", !0);
      this.handleError = this.handleError.bind(this), this.handleRejection = this.handleRejection.bind(this), this.startCatching = this.startCatching.bind(this), this.logFn = a;
    }
    handle(a, {
      logFn: i = this.logFn,
      errorName: r = "",
      onError: e = this.onError,
      showDialog: t = this.showDialog
    } = {}) {
      try {
        (e == null ? void 0 : e({ error: a, errorName: r, processType: "renderer" })) !== !1 && i({ error: a, errorName: r, showDialog: t });
      } catch {
        u(a);
      }
    }
    setOptions({ logFn: a, onError: i, preventDefault: r, showDialog: e }) {
      typeof a == "function" && (this.logFn = a), typeof i == "function" && (this.onError = i), typeof r == "boolean" && (this.preventDefault = r), typeof e == "boolean" && (this.showDialog = e);
    }
    startCatching({ onError: a, showDialog: i } = {}) {
      this.isActive || (this.isActive = !0, this.setOptions({ onError: a, showDialog: i }), window.addEventListener("error", (r) => {
        var e;
        this.preventDefault && ((e = r.preventDefault) == null || e.call(r)), this.handleError(r.error || r);
      }), window.addEventListener("unhandledrejection", (r) => {
        var e;
        this.preventDefault && ((e = r.preventDefault) == null || e.call(r)), this.handleRejection(r.reason || r);
      }));
    }
    handleError(a) {
      this.handle(a, { errorName: "Unhandled" });
    }
    handleRejection(a) {
      const i = a instanceof Error ? a : new Error(JSON.stringify(a));
      this.handle(i, { errorName: "Unhandled rejection" });
    }
  }
  return ne = p, ne;
}
var se, Ve;
function k() {
  if (Ve) return se;
  Ve = 1, se = { transform: u };
  function u({
    logger: p,
    message: o,
    transport: a,
    initialData: i = (o == null ? void 0 : o.data) || [],
    transforms: r = a == null ? void 0 : a.transforms
  }) {
    return r.reduce((e, t) => typeof t == "function" ? t({ data: e, logger: p, message: o, transport: a }) : e, i);
  }
  return se;
}
var oe, Me;
function kt() {
  if (Me) return oe;
  Me = 1;
  const { transform: u } = k();
  oe = o;
  const p = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    verbose: console.info,
    debug: console.debug,
    silly: console.debug,
    log: console.log
  };
  function o(i) {
    return Object.assign(r, {
      format: "{h}:{i}:{s}.{ms}{scope} › {text}",
      transforms: [a],
      writeFn({ message: { level: e, data: t } }) {
        const n = p[e] || p.info;
        setTimeout(() => n(...t));
      }
    });
    function r(e) {
      r.writeFn({
        message: { ...e, data: u({ logger: i, message: e, transport: r }) }
      });
    }
  }
  function a({
    data: i = [],
    logger: r = {},
    message: e = {},
    transport: t = {}
  }) {
    if (typeof t.format == "function")
      return t.format({
        data: i,
        level: (e == null ? void 0 : e.level) || "info",
        logger: r,
        message: e,
        transport: t
      });
    if (typeof t.format != "string")
      return i;
    i.unshift(t.format), typeof i[1] == "string" && i[1].match(/%[1cdfiOos]/) && (i = [`${i[0]}${i[1]}`, ...i.slice(2)]);
    const n = e.date || /* @__PURE__ */ new Date();
    return i[0] = i[0].replace(/\{(\w+)}/g, (s, c) => {
      var l, d;
      switch (c) {
        case "level":
          return e.level;
        case "logId":
          return e.logId;
        case "scope": {
          const h = e.scope || ((l = r.scope) == null ? void 0 : l.defaultLabel);
          return h ? ` (${h})` : "";
        }
        case "text":
          return "";
        case "y":
          return n.getFullYear().toString(10);
        case "m":
          return (n.getMonth() + 1).toString(10).padStart(2, "0");
        case "d":
          return n.getDate().toString(10).padStart(2, "0");
        case "h":
          return n.getHours().toString(10).padStart(2, "0");
        case "i":
          return n.getMinutes().toString(10).padStart(2, "0");
        case "s":
          return n.getSeconds().toString(10).padStart(2, "0");
        case "ms":
          return n.getMilliseconds().toString(10).padStart(3, "0");
        case "iso":
          return n.toISOString();
        default:
          return ((d = e.variables) == null ? void 0 : d[c]) || s;
      }
    }).trim(), i;
  }
  return oe;
}
var ie, Ue;
function Vt() {
  if (Ue) return ie;
  Ue = 1;
  const { transform: u } = k();
  ie = o;
  const p = /* @__PURE__ */ new Set([Promise, WeakMap, WeakSet]);
  function o(r) {
    return Object.assign(e, {
      depth: 5,
      transforms: [i]
    });
    function e(t) {
      if (!window.__electronLog) {
        r.processMessage(
          {
            data: ["electron-log: logger isn't initialized in the main process"],
            level: "error"
          },
          { transports: ["console"] }
        );
        return;
      }
      try {
        const n = u({
          initialData: t,
          logger: r,
          message: t,
          transport: e
        });
        __electronLog.sendToMain(n);
      } catch (n) {
        r.transports.console({
          data: ["electronLog.transports.ipc", n, "data:", t.data],
          level: "error"
        });
      }
    }
  }
  function a(r) {
    return Object(r) !== r;
  }
  function i({
    data: r,
    depth: e,
    seen: t = /* @__PURE__ */ new WeakSet(),
    transport: n = {}
  } = {}) {
    const s = e || n.depth || 5;
    return t.has(r) ? "[Circular]" : s < 1 ? a(r) ? r : Array.isArray(r) ? "[Array]" : `[${typeof r}]` : ["function", "symbol"].includes(typeof r) ? r.toString() : a(r) ? r : p.has(r.constructor) ? `[${r.constructor.name}]` : Array.isArray(r) ? r.map((c) => i({
      data: c,
      depth: s - 1,
      seen: t
    })) : r instanceof Date ? r.toISOString() : r instanceof Error ? r.stack : r instanceof Map ? new Map(
      Array.from(r).map(([c, l]) => [
        i({ data: c, depth: s - 1, seen: t }),
        i({ data: l, depth: s - 1, seen: t })
      ])
    ) : r instanceof Set ? new Set(
      Array.from(r).map(
        (c) => i({ data: c, depth: s - 1, seen: t })
      )
    ) : (t.add(r), Object.fromEntries(
      Object.entries(r).map(
        ([c, l]) => [
          c,
          i({ data: l, depth: s - 1, seen: t })
        ]
      )
    ));
  }
  return ie;
}
var ze;
function Mt() {
  return ze || (ze = 1, (function(u) {
    const p = dt(), o = qt(), a = kt(), i = Vt();
    typeof process == "object" && process.type === "browser" && console.warn(
      "electron-log/renderer is loaded in the main process. It could cause unexpected behaviour."
    ), u.exports = r(), u.exports.Logger = p, u.exports.default = u.exports;
    function r() {
      const e = new p({
        allowUnknownLevel: !0,
        errorHandler: new o(),
        initializeFn: () => {
        },
        logId: "default",
        transportFactories: {
          console: a,
          ipc: i
        },
        variables: {
          processType: "renderer"
        }
      });
      return e.errorHandler.setOptions({
        logFn({ error: t, errorName: n, showDialog: s }) {
          e.transports.console({
            data: [n, t].filter(Boolean),
            level: "error"
          }), e.transports.ipc({
            cmd: "errorHandler",
            error: {
              cause: t == null ? void 0 : t.cause,
              code: t == null ? void 0 : t.code,
              name: t == null ? void 0 : t.name,
              message: t == null ? void 0 : t.message,
              stack: t == null ? void 0 : t.stack
            },
            errorName: n,
            logId: e.logId,
            showDialog: s
          });
        }
      }), typeof window == "object" && window.addEventListener("message", (t) => {
        const { cmd: n, logId: s, ...c } = t.data || {}, l = p.getInstance({ logId: s });
        n === "message" && l.processMessage(c, { transports: ["console"] });
      }), new Proxy(e, {
        get(t, n) {
          return typeof t[n] < "u" ? t[n] : (...s) => e.logData(s, { level: n });
        }
      });
    }
  })(Z)), Z.exports;
}
var ae, We;
function Ut() {
  if (We) return ae;
  We = 1;
  const u = M, p = q;
  ae = {
    findAndReadPackageJson: o,
    tryReadJsonAt: a
  };
  function o() {
    return a(e()) || a(r()) || a(process.resourcesPath, "app.asar") || a(process.resourcesPath, "app") || a(process.cwd()) || { name: void 0, version: void 0 };
  }
  function a(...t) {
    if (t[0])
      try {
        const n = p.join(...t), s = i("package.json", n);
        if (!s)
          return;
        const c = JSON.parse(u.readFileSync(s, "utf8")), l = (c == null ? void 0 : c.productName) || (c == null ? void 0 : c.name);
        return !l || l.toLowerCase() === "electron" ? void 0 : l ? { name: l, version: c == null ? void 0 : c.version } : void 0;
      } catch {
        return;
      }
  }
  function i(t, n) {
    let s = n;
    for (; ; ) {
      const c = p.parse(s), l = c.root, d = c.dir;
      if (u.existsSync(p.join(s, t)))
        return p.resolve(p.join(s, t));
      if (s === l)
        return null;
      s = d;
    }
  }
  function r() {
    const t = process.argv.filter((s) => s.indexOf("--user-data-dir=") === 0);
    return t.length === 0 || typeof t[0] != "string" ? null : t[0].replace("--user-data-dir=", "");
  }
  function e() {
    var t;
    try {
      return (t = require.main) == null ? void 0 : t.filename;
    } catch {
      return;
    }
  }
  return ae;
}
var ce, Be;
function ht() {
  if (Be) return ce;
  Be = 1;
  const u = _t, p = W, o = q, a = Ut();
  class i {
    constructor() {
      g(this, "appName");
      g(this, "appPackageJson");
      g(this, "platform", process.platform);
    }
    getAppLogPath(e = this.getAppName()) {
      return this.platform === "darwin" ? o.join(this.getSystemPathHome(), "Library/Logs", e) : o.join(this.getAppUserDataPath(e), "logs");
    }
    getAppName() {
      var t;
      const e = this.appName || ((t = this.getAppPackageJson()) == null ? void 0 : t.name);
      if (!e)
        throw new Error(
          "electron-log can't determine the app name. It tried these methods:\n1. Use `electron.app.name`\n2. Use productName or name from the nearest package.json`\nYou can also set it through log.transports.file.setAppName()"
        );
      return e;
    }
    /**
     * @private
     * @returns {undefined}
     */
    getAppPackageJson() {
      return typeof this.appPackageJson != "object" && (this.appPackageJson = a.findAndReadPackageJson()), this.appPackageJson;
    }
    getAppUserDataPath(e = this.getAppName()) {
      return e ? o.join(this.getSystemPathAppData(), e) : void 0;
    }
    getAppVersion() {
      var e;
      return (e = this.getAppPackageJson()) == null ? void 0 : e.version;
    }
    getElectronLogPath() {
      return this.getAppLogPath();
    }
    getMacOsVersion() {
      const e = Number(p.release().split(".")[0]);
      return e <= 19 ? `10.${e - 4}` : e - 9;
    }
    /**
     * @protected
     * @returns {string}
     */
    getOsVersion() {
      let e = p.type().replace("_", " "), t = p.release();
      return e === "Darwin" && (e = "macOS", t = this.getMacOsVersion()), `${e} ${t}`;
    }
    /**
     * @return {PathVariables}
     */
    getPathVariables() {
      const e = this.getAppName(), t = this.getAppVersion(), n = this;
      return {
        appData: this.getSystemPathAppData(),
        appName: e,
        appVersion: t,
        get electronDefaultDir() {
          return n.getElectronLogPath();
        },
        home: this.getSystemPathHome(),
        libraryDefaultDir: this.getAppLogPath(e),
        libraryTemplate: this.getAppLogPath("{appName}"),
        temp: this.getSystemPathTemp(),
        userData: this.getAppUserDataPath(e)
      };
    }
    getSystemPathAppData() {
      const e = this.getSystemPathHome();
      switch (this.platform) {
        case "darwin":
          return o.join(e, "Library/Application Support");
        case "win32":
          return process.env.APPDATA || o.join(e, "AppData/Roaming");
        default:
          return process.env.XDG_CONFIG_HOME || o.join(e, ".config");
      }
    }
    getSystemPathHome() {
      var e;
      return ((e = p.homedir) == null ? void 0 : e.call(p)) || process.env.HOME;
    }
    getSystemPathTemp() {
      return p.tmpdir();
    }
    getVersions() {
      return {
        app: `${this.getAppName()} ${this.getAppVersion()}`,
        electron: void 0,
        os: this.getOsVersion()
      };
    }
    isDev() {
      return process.env.NODE_ENV === "development" || process.env.ELECTRON_IS_DEV === "1";
    }
    isElectron() {
      return !!process.versions.electron;
    }
    onAppEvent(e, t) {
    }
    onAppReady(e) {
      e();
    }
    onEveryWebContentsEvent(e, t) {
    }
    /**
     * Listen to async messages sent from opposite process
     * @param {string} channel
     * @param {function} listener
     */
    onIpc(e, t) {
    }
    onIpcInvoke(e, t) {
    }
    /**
     * @param {string} url
     * @param {Function} [logFunction]
     */
    openUrl(e, t = console.error) {
      const s = { darwin: "open", win32: "start", linux: "xdg-open" }[process.platform] || "xdg-open";
      u.exec(`${s} ${e}`, {}, (c) => {
        c && t(c);
      });
    }
    setAppName(e) {
      this.appName = e;
    }
    setPlatform(e) {
      this.platform = e;
    }
    setPreloadFileForSessions({
      filePath: e,
      // eslint-disable-line no-unused-vars
      includeFutureSession: t = !0,
      // eslint-disable-line no-unused-vars
      getSessions: n = () => []
      // eslint-disable-line no-unused-vars
    }) {
    }
    /**
     * Sent a message to opposite process
     * @param {string} channel
     * @param {any} message
     */
    sendIpc(e, t) {
    }
    showErrorBox(e, t) {
    }
  }
  return ce = i, ce;
}
var le, He;
function zt() {
  if (He) return le;
  He = 1;
  const u = q, p = ht();
  class o extends p {
    /**
     * @param {object} options
     * @param {typeof Electron} [options.electron]
     */
    constructor({ electron: r } = {}) {
      super();
      /**
       * @type {typeof Electron}
       */
      g(this, "electron");
      this.electron = r;
    }
    getAppName() {
      var e, t;
      let r;
      try {
        r = this.appName || ((e = this.electron.app) == null ? void 0 : e.name) || ((t = this.electron.app) == null ? void 0 : t.getName());
      } catch {
      }
      return r || super.getAppName();
    }
    getAppUserDataPath(r) {
      return this.getPath("userData") || super.getAppUserDataPath(r);
    }
    getAppVersion() {
      var e;
      let r;
      try {
        r = (e = this.electron.app) == null ? void 0 : e.getVersion();
      } catch {
      }
      return r || super.getAppVersion();
    }
    getElectronLogPath() {
      return this.getPath("logs") || super.getElectronLogPath();
    }
    /**
     * @private
     * @param {any} name
     * @returns {string|undefined}
     */
    getPath(r) {
      var e;
      try {
        return (e = this.electron.app) == null ? void 0 : e.getPath(r);
      } catch {
        return;
      }
    }
    getVersions() {
      return {
        app: `${this.getAppName()} ${this.getAppVersion()}`,
        electron: `Electron ${process.versions.electron}`,
        os: this.getOsVersion()
      };
    }
    getSystemPathAppData() {
      return this.getPath("appData") || super.getSystemPathAppData();
    }
    isDev() {
      var r;
      return ((r = this.electron.app) == null ? void 0 : r.isPackaged) !== void 0 ? !this.electron.app.isPackaged : typeof process.execPath == "string" ? u.basename(process.execPath).toLowerCase().startsWith("electron") : super.isDev();
    }
    onAppEvent(r, e) {
      var t;
      return (t = this.electron.app) == null || t.on(r, e), () => {
        var n;
        (n = this.electron.app) == null || n.off(r, e);
      };
    }
    onAppReady(r) {
      var e, t, n;
      (e = this.electron.app) != null && e.isReady() ? r() : (t = this.electron.app) != null && t.once ? (n = this.electron.app) == null || n.once("ready", r) : r();
    }
    onEveryWebContentsEvent(r, e) {
      var n, s, c;
      return (s = (n = this.electron.webContents) == null ? void 0 : n.getAllWebContents()) == null || s.forEach((l) => {
        l.on(r, e);
      }), (c = this.electron.app) == null || c.on("web-contents-created", t), () => {
        var l, d;
        (l = this.electron.webContents) == null || l.getAllWebContents().forEach((h) => {
          h.off(r, e);
        }), (d = this.electron.app) == null || d.off("web-contents-created", t);
      };
      function t(l, d) {
        d.on(r, e);
      }
    }
    /**
     * Listen to async messages sent from opposite process
     * @param {string} channel
     * @param {function} listener
     */
    onIpc(r, e) {
      var t;
      (t = this.electron.ipcMain) == null || t.on(r, e);
    }
    onIpcInvoke(r, e) {
      var t, n;
      (n = (t = this.electron.ipcMain) == null ? void 0 : t.handle) == null || n.call(t, r, e);
    }
    /**
     * @param {string} url
     * @param {Function} [logFunction]
     */
    openUrl(r, e = console.error) {
      var t;
      (t = this.electron.shell) == null || t.openExternal(r).catch(e);
    }
    setPreloadFileForSessions({
      filePath: r,
      includeFutureSession: e = !0,
      getSessions: t = () => {
        var n;
        return [(n = this.electron.session) == null ? void 0 : n.defaultSession];
      }
    }) {
      for (const s of t().filter(Boolean))
        n(s);
      e && this.onAppEvent("session-created", (s) => {
        n(s);
      });
      function n(s) {
        typeof s.registerPreloadScript == "function" ? s.registerPreloadScript({
          filePath: r,
          id: "electron-log-preload",
          type: "frame"
        }) : s.setPreloads([...s.getPreloads(), r]);
      }
    }
    /**
     * Sent a message to opposite process
     * @param {string} channel
     * @param {any} message
     */
    sendIpc(r, e) {
      var t, n;
      (n = (t = this.electron.BrowserWindow) == null ? void 0 : t.getAllWindows()) == null || n.forEach((s) => {
        var c, l;
        ((c = s.webContents) == null ? void 0 : c.isDestroyed()) === !1 && ((l = s.webContents) == null ? void 0 : l.isCrashed()) === !1 && s.webContents.send(r, e);
      });
    }
    showErrorBox(r, e) {
      var t;
      (t = this.electron.dialog) == null || t.showErrorBox(r, e);
    }
  }
  return le = o, le;
}
var ue, Je;
function Wt() {
  if (Je) return ue;
  Je = 1;
  const u = M, p = W, o = q, a = pt();
  let i = !1, r = !1;
  ue = {
    initialize({
      externalApi: n,
      getSessions: s,
      includeFutureSession: c,
      logger: l,
      preload: d = !0,
      spyRendererConsole: h = !1
    }) {
      n.onAppReady(() => {
        try {
          d && e({
            externalApi: n,
            getSessions: s,
            includeFutureSession: c,
            logger: l,
            preloadOption: d
          }), h && t({ externalApi: n, logger: l });
        } catch (_) {
          l.warn(_);
        }
      });
    }
  };
  function e({
    externalApi: n,
    getSessions: s,
    includeFutureSession: c,
    logger: l,
    preloadOption: d
  }) {
    let h = typeof d == "string" ? d : void 0;
    if (i) {
      l.warn(new Error("log.initialize({ preload }) already called").stack);
      return;
    }
    i = !0;
    try {
      h = o.resolve(
        __dirname,
        "../renderer/electron-log-preload.js"
      );
    } catch {
    }
    if (!h || !u.existsSync(h)) {
      h = o.join(
        n.getAppUserDataPath() || p.tmpdir(),
        "electron-log-preload.js"
      );
      const _ = `
      try {
        (${a.toString()})(require('electron'));
      } catch(e) {
        console.error(e);
      }
    `;
      u.writeFileSync(h, _, "utf8");
    }
    n.setPreloadFileForSessions({
      filePath: h,
      includeFutureSession: c,
      getSessions: s
    });
  }
  function t({ externalApi: n, logger: s }) {
    if (r) {
      s.warn(
        new Error("log.initialize({ spyRendererConsole }) already called").stack
      );
      return;
    }
    r = !0;
    const c = ["debug", "info", "warn", "error"];
    n.onEveryWebContentsEvent(
      "console-message",
      (l, d, h) => {
        s.processMessage({
          data: [h],
          level: c[d],
          variables: { processType: "renderer" }
        });
      }
    );
  }
  return ue;
}
var fe, Ye;
function Bt() {
  if (Ye) return fe;
  Ye = 1;
  class u {
    constructor({
      externalApi: a,
      logFn: i = void 0,
      onError: r = void 0,
      showDialog: e = void 0
    } = {}) {
      g(this, "externalApi");
      g(this, "isActive", !1);
      g(this, "logFn");
      g(this, "onError");
      g(this, "showDialog", !0);
      this.createIssue = this.createIssue.bind(this), this.handleError = this.handleError.bind(this), this.handleRejection = this.handleRejection.bind(this), this.setOptions({ externalApi: a, logFn: i, onError: r, showDialog: e }), this.startCatching = this.startCatching.bind(this), this.stopCatching = this.stopCatching.bind(this);
    }
    handle(a, {
      logFn: i = this.logFn,
      onError: r = this.onError,
      processType: e = "browser",
      showDialog: t = this.showDialog,
      errorName: n = ""
    } = {}) {
      var s;
      a = p(a);
      try {
        if (typeof r == "function") {
          const c = ((s = this.externalApi) == null ? void 0 : s.getVersions()) || {}, l = this.createIssue;
          if (r({
            createIssue: l,
            error: a,
            errorName: n,
            processType: e,
            versions: c
          }) === !1)
            return;
        }
        n ? i(n, a) : i(a), t && !n.includes("rejection") && this.externalApi && this.externalApi.showErrorBox(
          `A JavaScript error occurred in the ${e} process`,
          a.stack
        );
      } catch {
        console.error(a);
      }
    }
    setOptions({ externalApi: a, logFn: i, onError: r, showDialog: e }) {
      typeof a == "object" && (this.externalApi = a), typeof i == "function" && (this.logFn = i), typeof r == "function" && (this.onError = r), typeof e == "boolean" && (this.showDialog = e);
    }
    startCatching({ onError: a, showDialog: i } = {}) {
      this.isActive || (this.isActive = !0, this.setOptions({ onError: a, showDialog: i }), process.on("uncaughtException", this.handleError), process.on("unhandledRejection", this.handleRejection));
    }
    stopCatching() {
      this.isActive = !1, process.removeListener("uncaughtException", this.handleError), process.removeListener("unhandledRejection", this.handleRejection);
    }
    createIssue(a, i) {
      var r;
      (r = this.externalApi) == null || r.openUrl(
        `${a}?${new URLSearchParams(i).toString()}`
      );
    }
    handleError(a) {
      this.handle(a, { errorName: "Unhandled" });
    }
    handleRejection(a) {
      const i = a instanceof Error ? a : new Error(JSON.stringify(a));
      this.handle(i, { errorName: "Unhandled rejection" });
    }
  }
  function p(o) {
    if (o instanceof Error)
      return o;
    if (o && typeof o == "object") {
      if (o.message)
        return Object.assign(new Error(o.message), o);
      try {
        return new Error(JSON.stringify(o));
      } catch (a) {
        return new Error(`Couldn't normalize error ${String(o)}: ${a}`);
      }
    }
    return new Error(`Can't normalize error ${String(o)}`);
  }
  return fe = u, fe;
}
var pe, Ke;
function Ht() {
  if (Ke) return pe;
  Ke = 1;
  class u {
    constructor(o = {}) {
      g(this, "disposers", []);
      g(this, "format", "{eventSource}#{eventName}:");
      g(this, "formatters", {
        app: {
          "certificate-error": ({ args: o }) => this.arrayToObject(o.slice(1, 4), [
            "url",
            "error",
            "certificate"
          ]),
          "child-process-gone": ({ args: o }) => o.length === 1 ? o[0] : o,
          "render-process-gone": ({ args: [o, a] }) => a && typeof a == "object" ? { ...a, ...this.getWebContentsDetails(o) } : []
        },
        webContents: {
          "console-message": ({ args: [o, a, i, r] }) => {
            if (!(o < 3))
              return { message: a, source: `${r}:${i}` };
          },
          "did-fail-load": ({ args: o }) => this.arrayToObject(o, [
            "errorCode",
            "errorDescription",
            "validatedURL",
            "isMainFrame",
            "frameProcessId",
            "frameRoutingId"
          ]),
          "did-fail-provisional-load": ({ args: o }) => this.arrayToObject(o, [
            "errorCode",
            "errorDescription",
            "validatedURL",
            "isMainFrame",
            "frameProcessId",
            "frameRoutingId"
          ]),
          "plugin-crashed": ({ args: o }) => this.arrayToObject(o, ["name", "version"]),
          "preload-error": ({ args: o }) => this.arrayToObject(o, ["preloadPath", "error"])
        }
      });
      g(this, "events", {
        app: {
          "certificate-error": !0,
          "child-process-gone": !0,
          "render-process-gone": !0
        },
        webContents: {
          // 'console-message': true,
          "did-fail-load": !0,
          "did-fail-provisional-load": !0,
          "plugin-crashed": !0,
          "preload-error": !0,
          unresponsive: !0
        }
      });
      g(this, "externalApi");
      g(this, "level", "error");
      g(this, "scope", "");
      this.setOptions(o);
    }
    setOptions({
      events: o,
      externalApi: a,
      level: i,
      logger: r,
      format: e,
      formatters: t,
      scope: n
    }) {
      typeof o == "object" && (this.events = o), typeof a == "object" && (this.externalApi = a), typeof i == "string" && (this.level = i), typeof r == "object" && (this.logger = r), (typeof e == "string" || typeof e == "function") && (this.format = e), typeof t == "object" && (this.formatters = t), typeof n == "string" && (this.scope = n);
    }
    startLogging(o = {}) {
      this.setOptions(o), this.disposeListeners();
      for (const a of this.getEventNames(this.events.app))
        this.disposers.push(
          this.externalApi.onAppEvent(a, (...i) => {
            this.handleEvent({ eventSource: "app", eventName: a, handlerArgs: i });
          })
        );
      for (const a of this.getEventNames(this.events.webContents))
        this.disposers.push(
          this.externalApi.onEveryWebContentsEvent(
            a,
            (...i) => {
              this.handleEvent(
                { eventSource: "webContents", eventName: a, handlerArgs: i }
              );
            }
          )
        );
    }
    stopLogging() {
      this.disposeListeners();
    }
    arrayToObject(o, a) {
      const i = {};
      return a.forEach((r, e) => {
        i[r] = o[e];
      }), o.length > a.length && (i.unknownArgs = o.slice(a.length)), i;
    }
    disposeListeners() {
      this.disposers.forEach((o) => o()), this.disposers = [];
    }
    formatEventLog({ eventName: o, eventSource: a, handlerArgs: i }) {
      var l;
      const [r, ...e] = i;
      if (typeof this.format == "function")
        return this.format({ args: e, event: r, eventName: o, eventSource: a });
      const t = (l = this.formatters[a]) == null ? void 0 : l[o];
      let n = e;
      if (typeof t == "function" && (n = t({ args: e, event: r, eventName: o, eventSource: a })), !n)
        return;
      const s = {};
      return Array.isArray(n) ? s.args = n : typeof n == "object" && Object.assign(s, n), a === "webContents" && Object.assign(s, this.getWebContentsDetails(r == null ? void 0 : r.sender)), [this.format.replace("{eventSource}", a === "app" ? "App" : "WebContents").replace("{eventName}", o), s];
    }
    getEventNames(o) {
      return !o || typeof o != "object" ? [] : Object.entries(o).filter(([a, i]) => i).map(([a]) => a);
    }
    getWebContentsDetails(o) {
      if (!(o != null && o.loadURL))
        return {};
      try {
        return {
          webContents: {
            id: o.id,
            url: o.getURL()
          }
        };
      } catch {
        return {};
      }
    }
    handleEvent({ eventName: o, eventSource: a, handlerArgs: i }) {
      var e;
      const r = this.formatEventLog({ eventName: o, eventSource: a, handlerArgs: i });
      if (r) {
        const t = this.scope ? this.logger.scope(this.scope) : this.logger;
        (e = t == null ? void 0 : t[this.level]) == null || e.call(t, ...r);
      }
    }
  }
  return pe = u, pe;
}
var de, Ge;
function gt() {
  if (Ge) return de;
  Ge = 1;
  const { transform: u } = k();
  de = {
    concatFirstStringElements: p,
    formatScope: a,
    formatText: r,
    formatVariables: i,
    timeZoneFromOffset: o,
    format({ message: e, logger: t, transport: n, data: s = e == null ? void 0 : e.data }) {
      switch (typeof n.format) {
        case "string":
          return u({
            message: e,
            logger: t,
            transforms: [i, a, r],
            transport: n,
            initialData: [n.format, ...s]
          });
        case "function":
          return n.format({
            data: s,
            level: (e == null ? void 0 : e.level) || "info",
            logger: t,
            message: e,
            transport: n
          });
        default:
          return s;
      }
    }
  };
  function p({ data: e }) {
    return typeof e[0] != "string" || typeof e[1] != "string" || e[0].match(/%[1cdfiOos]/) ? e : [`${e[0]} ${e[1]}`, ...e.slice(2)];
  }
  function o(e) {
    const t = Math.abs(e), n = e > 0 ? "-" : "+", s = Math.floor(t / 60).toString().padStart(2, "0"), c = (t % 60).toString().padStart(2, "0");
    return `${n}${s}:${c}`;
  }
  function a({ data: e, logger: t, message: n }) {
    const { defaultLabel: s, labelLength: c } = (t == null ? void 0 : t.scope) || {}, l = e[0];
    let d = n.scope;
    d || (d = s);
    let h;
    return d === "" ? h = c > 0 ? "".padEnd(c + 3) : "" : typeof d == "string" ? h = ` (${d})`.padEnd(c + 3) : h = "", e[0] = l.replace("{scope}", h), e;
  }
  function i({ data: e, message: t }) {
    let n = e[0];
    if (typeof n != "string")
      return e;
    n = n.replace("{level}]", `${t.level}]`.padEnd(6, " "));
    const s = t.date || /* @__PURE__ */ new Date();
    return e[0] = n.replace(/\{(\w+)}/g, (c, l) => {
      var d;
      switch (l) {
        case "level":
          return t.level || "info";
        case "logId":
          return t.logId;
        case "y":
          return s.getFullYear().toString(10);
        case "m":
          return (s.getMonth() + 1).toString(10).padStart(2, "0");
        case "d":
          return s.getDate().toString(10).padStart(2, "0");
        case "h":
          return s.getHours().toString(10).padStart(2, "0");
        case "i":
          return s.getMinutes().toString(10).padStart(2, "0");
        case "s":
          return s.getSeconds().toString(10).padStart(2, "0");
        case "ms":
          return s.getMilliseconds().toString(10).padStart(3, "0");
        case "z":
          return o(s.getTimezoneOffset());
        case "iso":
          return s.toISOString();
        default:
          return ((d = t.variables) == null ? void 0 : d[l]) || c;
      }
    }).trim(), e;
  }
  function r({ data: e }) {
    const t = e[0];
    if (typeof t != "string")
      return e;
    if (t.lastIndexOf("{text}") === t.length - 6)
      return e[0] = t.replace(/\s?{text}/, ""), e[0] === "" && e.shift(), e;
    const s = t.split("{text}");
    let c = [];
    return s[0] !== "" && c.push(s[0]), c = c.concat(e.slice(1)), s[1] !== "" && c.push(s[1]), c;
  }
  return de;
}
var he = { exports: {} }, Qe;
function Y() {
  return Qe || (Qe = 1, (function(u) {
    const p = Pt;
    u.exports = {
      serialize: a,
      maxDepth({ data: i, transport: r, depth: e = (r == null ? void 0 : r.depth) ?? 6 }) {
        if (!i)
          return i;
        if (e < 1)
          return Array.isArray(i) ? "[array]" : typeof i == "object" && i ? "[object]" : i;
        if (Array.isArray(i))
          return i.map((n) => u.exports.maxDepth({
            data: n,
            depth: e - 1
          }));
        if (typeof i != "object" || i && typeof i.toISOString == "function")
          return i;
        if (i === null)
          return null;
        if (i instanceof Error)
          return i;
        const t = {};
        for (const n in i)
          Object.prototype.hasOwnProperty.call(i, n) && (t[n] = u.exports.maxDepth({
            data: i[n],
            depth: e - 1
          }));
        return t;
      },
      toJSON({ data: i }) {
        return JSON.parse(JSON.stringify(i, o()));
      },
      toString({ data: i, transport: r }) {
        const e = (r == null ? void 0 : r.inspectOptions) || {}, t = i.map((n) => {
          if (n !== void 0)
            try {
              const s = JSON.stringify(n, o(), "  ");
              return s === void 0 ? void 0 : JSON.parse(s);
            } catch {
              return n;
            }
        });
        return p.formatWithOptions(e, ...t);
      }
    };
    function o(i = {}) {
      const r = /* @__PURE__ */ new WeakSet();
      return function(e, t) {
        if (typeof t == "object" && t !== null) {
          if (r.has(t))
            return;
          r.add(t);
        }
        return a(e, t, i);
      };
    }
    function a(i, r, e = {}) {
      const t = (e == null ? void 0 : e.serializeMapAndSet) !== !1;
      return r instanceof Error ? r.stack : r && (typeof r == "function" ? `[function] ${r.toString()}` : r instanceof Date ? r.toISOString() : t && r instanceof Map && Object.fromEntries ? Object.fromEntries(r) : t && r instanceof Set && Array.from ? Array.from(r) : r);
    }
  })(he)), he.exports;
}
var ge, Xe;
function xe() {
  if (Xe) return ge;
  Xe = 1, ge = {
    transformStyles: a,
    applyAnsiStyles({ data: i }) {
      return a(i, p, o);
    },
    removeStyles({ data: i }) {
      return a(i, () => "");
    }
  };
  const u = {
    unset: "\x1B[0m",
    black: "\x1B[30m",
    red: "\x1B[31m",
    green: "\x1B[32m",
    yellow: "\x1B[33m",
    blue: "\x1B[34m",
    magenta: "\x1B[35m",
    cyan: "\x1B[36m",
    white: "\x1B[37m",
    gray: "\x1B[90m"
  };
  function p(i) {
    const r = i.replace(/color:\s*(\w+).*/, "$1").toLowerCase();
    return u[r] || "";
  }
  function o(i) {
    return i + u.unset;
  }
  function a(i, r, e) {
    const t = {};
    return i.reduce((n, s, c, l) => {
      if (t[c])
        return n;
      if (typeof s == "string") {
        let d = c, h = !1;
        s = s.replace(/%[1cdfiOos]/g, (_) => {
          if (d += 1, _ !== "%c")
            return _;
          const E = l[d];
          return typeof E == "string" ? (t[d] = !0, h = !0, r(E, s)) : _;
        }), h && e && (s = e(s));
      }
      return n.push(s), n;
    }, []);
  }
  return ge;
}
var me, Ze;
function Jt() {
  if (Ze) return me;
  Ze = 1;
  const {
    concatFirstStringElements: u,
    format: p
  } = gt(), { maxDepth: o, toJSON: a } = Y(), {
    applyAnsiStyles: i,
    removeStyles: r
  } = xe(), { transform: e } = k(), t = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    verbose: console.info,
    debug: console.debug,
    silly: console.debug,
    log: console.log
  };
  me = c;
  const s = `%c{h}:{i}:{s}.{ms}{scope}%c ${process.platform === "win32" ? ">" : "›"} {text}`;
  Object.assign(c, {
    DEFAULT_FORMAT: s
  });
  function c(E) {
    return Object.assign(y, {
      colorMap: {
        error: "red",
        warn: "yellow",
        info: "cyan",
        verbose: "unset",
        debug: "gray",
        silly: "gray",
        default: "unset"
      },
      format: s,
      level: "silly",
      transforms: [
        l,
        p,
        h,
        u,
        o,
        a
      ],
      useStyles: process.env.FORCE_STYLES,
      writeFn({ message: L }) {
        (t[L.level] || t.info)(...L.data);
      }
    });
    function y(L) {
      const R = e({ logger: E, message: L, transport: y });
      y.writeFn({
        message: { ...L, data: R }
      });
    }
  }
  function l({ data: E, message: y, transport: L }) {
    return typeof L.format != "string" || !L.format.includes("%c") ? E : [
      `color:${_(y.level, L)}`,
      "color:unset",
      ...E
    ];
  }
  function d(E, y) {
    if (typeof E == "boolean")
      return E;
    const R = y === "error" || y === "warn" ? process.stderr : process.stdout;
    return R && R.isTTY;
  }
  function h(E) {
    const { message: y, transport: L } = E;
    return (d(L.useStyles, y.level) ? i : r)(E);
  }
  function _(E, y) {
    return y.colorMap[E] || y.colorMap.default;
  }
  return me;
}
var ye, et;
function mt() {
  if (et) return ye;
  et = 1;
  const u = ut, p = M, o = W;
  class a extends u {
    constructor({
      path: t,
      writeOptions: n = { encoding: "utf8", flag: "a", mode: 438 },
      writeAsync: s = !1
    }) {
      super();
      g(this, "asyncWriteQueue", []);
      g(this, "bytesWritten", 0);
      g(this, "hasActiveAsyncWriting", !1);
      g(this, "path", null);
      g(this, "initialSize");
      g(this, "writeOptions", null);
      g(this, "writeAsync", !1);
      this.path = t, this.writeOptions = n, this.writeAsync = s;
    }
    get size() {
      return this.getSize();
    }
    clear() {
      try {
        return p.writeFileSync(this.path, "", {
          mode: this.writeOptions.mode,
          flag: "w"
        }), this.reset(), !0;
      } catch (t) {
        return t.code === "ENOENT" ? !0 : (this.emit("error", t, this), !1);
      }
    }
    crop(t) {
      try {
        const n = i(this.path, t || 4096);
        this.clear(), this.writeLine(`[log cropped]${o.EOL}${n}`);
      } catch (n) {
        this.emit(
          "error",
          new Error(`Couldn't crop file ${this.path}. ${n.message}`),
          this
        );
      }
    }
    getSize() {
      if (this.initialSize === void 0)
        try {
          const t = p.statSync(this.path);
          this.initialSize = t.size;
        } catch {
          this.initialSize = 0;
        }
      return this.initialSize + this.bytesWritten;
    }
    increaseBytesWrittenCounter(t) {
      this.bytesWritten += Buffer.byteLength(t, this.writeOptions.encoding);
    }
    isNull() {
      return !1;
    }
    nextAsyncWrite() {
      const t = this;
      if (this.hasActiveAsyncWriting || this.asyncWriteQueue.length === 0)
        return;
      const n = this.asyncWriteQueue.join("");
      this.asyncWriteQueue = [], this.hasActiveAsyncWriting = !0, p.writeFile(this.path, n, this.writeOptions, (s) => {
        t.hasActiveAsyncWriting = !1, s ? t.emit(
          "error",
          new Error(`Couldn't write to ${t.path}. ${s.message}`),
          this
        ) : t.increaseBytesWrittenCounter(n), t.nextAsyncWrite();
      });
    }
    reset() {
      this.initialSize = void 0, this.bytesWritten = 0;
    }
    toString() {
      return this.path;
    }
    writeLine(t) {
      if (t += o.EOL, this.writeAsync) {
        this.asyncWriteQueue.push(t), this.nextAsyncWrite();
        return;
      }
      try {
        p.writeFileSync(this.path, t, this.writeOptions), this.increaseBytesWrittenCounter(t);
      } catch (n) {
        this.emit(
          "error",
          new Error(`Couldn't write to ${this.path}. ${n.message}`),
          this
        );
      }
    }
  }
  ye = a;
  function i(r, e) {
    const t = Buffer.alloc(e), n = p.statSync(r), s = Math.min(n.size, e), c = Math.max(0, n.size - e), l = p.openSync(r, "r"), d = p.readSync(l, t, 0, s, c);
    return p.closeSync(l), t.toString("utf8", 0, d);
  }
  return ye;
}
var ve, tt;
function Yt() {
  if (tt) return ve;
  tt = 1;
  const u = mt();
  class p extends u {
    clear() {
    }
    crop() {
    }
    getSize() {
      return 0;
    }
    isNull() {
      return !0;
    }
    writeLine() {
    }
  }
  return ve = p, ve;
}
var we, rt;
function Kt() {
  if (rt) return we;
  rt = 1;
  const u = ut, p = M, o = q, a = mt(), i = Yt();
  class r extends u {
    constructor() {
      super();
      g(this, "store", {});
      this.emitError = this.emitError.bind(this);
    }
    /**
     * Provide a File object corresponding to the filePath
     * @param {string} filePath
     * @param {WriteOptions} [writeOptions]
     * @param {boolean} [writeAsync]
     * @return {File}
     */
    provide({ filePath: n, writeOptions: s = {}, writeAsync: c = !1 }) {
      let l;
      try {
        if (n = o.resolve(n), this.store[n])
          return this.store[n];
        l = this.createFile({ filePath: n, writeOptions: s, writeAsync: c });
      } catch (d) {
        l = new i({ path: n }), this.emitError(d, l);
      }
      return l.on("error", this.emitError), this.store[n] = l, l;
    }
    /**
     * @param {string} filePath
     * @param {WriteOptions} writeOptions
     * @param {boolean} async
     * @return {File}
     * @private
     */
    createFile({ filePath: n, writeOptions: s, writeAsync: c }) {
      return this.testFileWriting({ filePath: n, writeOptions: s }), new a({ path: n, writeOptions: s, writeAsync: c });
    }
    /**
     * @param {Error} error
     * @param {File} file
     * @private
     */
    emitError(n, s) {
      this.emit("error", n, s);
    }
    /**
     * @param {string} filePath
     * @param {WriteOptions} writeOptions
     * @private
     */
    testFileWriting({ filePath: n, writeOptions: s }) {
      p.mkdirSync(o.dirname(n), { recursive: !0 }), p.writeFileSync(n, "", { flag: "a", mode: s.mode });
    }
  }
  return we = r, we;
}
var be, nt;
function Gt() {
  if (nt) return be;
  nt = 1;
  const u = M, p = W, o = q, a = Kt(), { transform: i } = k(), { removeStyles: r } = xe(), {
    format: e,
    concatFirstStringElements: t
  } = gt(), { toString: n } = Y();
  be = c;
  const s = new a();
  function c(d, { registry: h = s, externalApi: _ } = {}) {
    let E;
    return h.listenerCount("error") < 1 && h.on("error", (v, f) => {
      R(`Can't write to ${f}`, v);
    }), Object.assign(y, {
      fileName: l(d.variables.processType),
      format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}",
      getFile: j,
      inspectOptions: { depth: 5 },
      level: "silly",
      maxSize: 1024 ** 2,
      readAllLogs: K,
      sync: !0,
      transforms: [r, e, t, n],
      writeOptions: { flag: "a", mode: 438, encoding: "utf8" },
      archiveLogFn(v) {
        const f = v.toString(), m = o.parse(f);
        try {
          u.renameSync(f, o.join(m.dir, `${m.name}.old${m.ext}`));
        } catch (b) {
          R("Could not rotate log", b);
          const S = Math.round(y.maxSize / 4);
          v.crop(Math.min(S, 256 * 1024));
        }
      },
      resolvePathFn(v) {
        return o.join(v.libraryDefaultDir, v.fileName);
      },
      setAppName(v) {
        d.dependencies.externalApi.setAppName(v);
      }
    });
    function y(v) {
      const f = j(v);
      y.maxSize > 0 && f.size > y.maxSize && (y.archiveLogFn(f), f.reset());
      const b = i({ logger: d, message: v, transport: y });
      f.writeLine(b);
    }
    function L() {
      E || (E = Object.create(
        Object.prototype,
        {
          ...Object.getOwnPropertyDescriptors(
            _.getPathVariables()
          ),
          fileName: {
            get() {
              return y.fileName;
            },
            enumerable: !0
          }
        }
      ), typeof y.archiveLog == "function" && (y.archiveLogFn = y.archiveLog, R("archiveLog is deprecated. Use archiveLogFn instead")), typeof y.resolvePath == "function" && (y.resolvePathFn = y.resolvePath, R("resolvePath is deprecated. Use resolvePathFn instead")));
    }
    function R(v, f = null, m = "error") {
      const b = [`electron-log.transports.file: ${v}`];
      f && b.push(f), d.transports.console({ data: b, date: /* @__PURE__ */ new Date(), level: m });
    }
    function j(v) {
      L();
      const f = y.resolvePathFn(E, v);
      return h.provide({
        filePath: f,
        writeAsync: !y.sync,
        writeOptions: y.writeOptions
      });
    }
    function K({ fileFilter: v = (f) => f.endsWith(".log") } = {}) {
      L();
      const f = o.dirname(y.resolvePathFn(E));
      return u.existsSync(f) ? u.readdirSync(f).map((m) => o.join(f, m)).filter(v).map((m) => {
        try {
          return {
            path: m,
            lines: u.readFileSync(m, "utf8").split(p.EOL)
          };
        } catch {
          return null;
        }
      }).filter(Boolean) : [];
    }
  }
  function l(d = process.type) {
    switch (d) {
      case "renderer":
        return "renderer.log";
      case "worker":
        return "worker.log";
      default:
        return "main.log";
    }
  }
  return be;
}
var Ee, st;
function Qt() {
  if (st) return Ee;
  st = 1;
  const { maxDepth: u, toJSON: p } = Y(), { transform: o } = k();
  Ee = a;
  function a(i, { externalApi: r }) {
    return Object.assign(e, {
      depth: 3,
      eventId: "__ELECTRON_LOG_IPC__",
      level: i.isDev ? "silly" : !1,
      transforms: [p, u]
    }), r != null && r.isElectron() ? e : void 0;
    function e(t) {
      var n;
      ((n = t == null ? void 0 : t.variables) == null ? void 0 : n.processType) !== "renderer" && (r == null || r.sendIpc(e.eventId, {
        ...t,
        data: o({ logger: i, message: t, transport: e })
      }));
    }
  }
  return Ee;
}
var Se, ot;
function Xt() {
  if (ot) return Se;
  ot = 1;
  const u = Rt, p = xt, { transform: o } = k(), { removeStyles: a } = xe(), { toJSON: i, maxDepth: r } = Y();
  Se = e;
  function e(t) {
    return Object.assign(n, {
      client: { name: "electron-application" },
      depth: 6,
      level: !1,
      requestOptions: {},
      transforms: [a, i, r],
      makeBodyFn({ message: s }) {
        return JSON.stringify({
          client: n.client,
          data: s.data,
          date: s.date.getTime(),
          level: s.level,
          scope: s.scope,
          variables: s.variables
        });
      },
      processErrorFn({ error: s }) {
        t.processMessage(
          {
            data: [`electron-log: can't POST ${n.url}`, s],
            level: "warn"
          },
          { transports: ["console", "file"] }
        );
      },
      sendRequestFn({ serverUrl: s, requestOptions: c, body: l }) {
        const h = (s.startsWith("https:") ? p : u).request(s, {
          method: "POST",
          ...c,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": l.length,
            ...c.headers
          }
        });
        return h.write(l), h.end(), h;
      }
    });
    function n(s) {
      if (!n.url)
        return;
      const c = n.makeBodyFn({
        logger: t,
        message: { ...s, data: o({ logger: t, message: s, transport: n }) },
        transport: n
      }), l = n.sendRequestFn({
        serverUrl: n.url,
        requestOptions: n.requestOptions,
        body: Buffer.from(c, "utf8")
      });
      l.on("error", (d) => n.processErrorFn({
        error: d,
        logger: t,
        message: s,
        request: l,
        transport: n
      }));
    }
  }
  return Se;
}
var Oe, it;
function yt() {
  if (it) return Oe;
  it = 1;
  const u = dt(), p = Bt(), o = Ht(), a = Jt(), i = Gt(), r = Qt(), e = Xt();
  Oe = t;
  function t({ dependencies: n, initializeFn: s }) {
    var l;
    const c = new u({
      dependencies: n,
      errorHandler: new p(),
      eventLogger: new o(),
      initializeFn: s,
      isDev: (l = n.externalApi) == null ? void 0 : l.isDev(),
      logId: "default",
      transportFactories: {
        console: a,
        file: i,
        ipc: r,
        remote: e
      },
      variables: {
        processType: "main"
      }
    });
    return c.default = c, c.Logger = u, c.processInternalErrorFn = (d) => {
      c.transports.console.writeFn({
        message: {
          data: ["Unhandled electron-log error", d],
          level: "error"
        }
      });
    }, c;
  }
  return Oe;
}
var De, at;
function Zt() {
  if (at) return De;
  at = 1;
  const u = St, p = zt(), { initialize: o } = Wt(), a = yt(), i = new p({ electron: u }), r = a({
    dependencies: { externalApi: i },
    initializeFn: o
  });
  De = r, i.onIpc("__ELECTRON_LOG__", (t, n) => {
    n.scope && r.Logger.getInstance(n).scope(n.scope);
    const s = new Date(n.date);
    e({
      ...n,
      date: s.getTime() ? s : /* @__PURE__ */ new Date()
    });
  }), i.onIpcInvoke("__ELECTRON_LOG__", (t, { cmd: n = "", logId: s }) => {
    switch (n) {
      case "getOptions":
        return {
          levels: r.Logger.getInstance({ logId: s }).levels,
          logId: s
        };
      default:
        return e({ data: [`Unknown cmd '${n}'`], level: "error" }), {};
    }
  });
  function e(t) {
    var n;
    (n = r.Logger.getInstance(t)) == null || n.processMessage(t);
  }
  return De;
}
var Ae, ct;
function er() {
  if (ct) return Ae;
  ct = 1;
  const u = ht(), p = yt(), o = new u();
  return Ae = p({
    dependencies: { externalApi: o }
  }), Ae;
}
var lt;
function tr() {
  if (lt) return U.exports;
  lt = 1;
  const u = typeof process > "u" || process.type === "renderer" || process.type === "worker", p = typeof process == "object" && process.type === "browser";
  return u ? (pt(), U.exports = Mt()) : p ? U.exports = Zt() : U.exports = er(), U.exports;
}
var rr = tr();
const D = /* @__PURE__ */ ft(rr);
Tt.config();
const nr = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Required for Vite dev mode
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' http://localhost:* ws://localhost:* wss://* https://api.github.com https://*.27infinity.in https://*.execute-api.ap-south-1.amazonaws.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:"
].join("; "), vt = F.dirname(Dt(import.meta.url));
process.env.APP_ROOT = F.join(vt, "..");
const Pe = process.env.VITE_DEV_SERVER_URL, br = F.join(process.env.APP_ROOT, "dist-electron"), wt = F.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Pe ? F.join(process.env.APP_ROOT, "public") : wt;
let $ = null, z = null, V = null;
function Re() {
  return z = new _e({
    width: 400,
    height: 300,
    frame: !1,
    transparent: !0,
    alwaysOnTop: !0,
    resizable: !1
  }), z.loadFile(F.join(process.env.VITE_PUBLIC, "splash.html")), $ = new _e({
    show: !1,
    width: 1200,
    height: 800,
    icon: F.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    autoHideMenuBar: !0,
    webPreferences: {
      preload: F.join(vt, "preload.mjs"),
      // Enable features required for speech recognition and WASM
      webSecurity: !0,
      allowRunningInsecureContent: !1,
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), $.webContents.on("did-finish-load", () => {
    z == null || z.close(), $ == null || $.show(), $ == null || $.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), Pe ? $.loadURL(Pe) : $.loadFile(F.join(wt, "index.html")), $;
}
I.whenReady().then(() => {
  Ot.setApplicationMenu(null), D.transports.file.level = "info", D.info("Logger initialized"), D.info("App version:", I.getVersion()), G.defaultSession.webRequest.onHeadersReceived((n, s) => {
    s({
      responseHeaders: {
        ...n.responseHeaders,
        "Content-Security-Policy": [nr],
        "X-Content-Type-Options": ["nosniff"],
        "X-Frame-Options": ["DENY"],
        "X-XSS-Protection": ["1; mode=block"]
      }
    });
  }), I.on("web-contents-created", (n, s) => {
    s.on("will-navigate", (c, l) => {
      const d = new URL(l);
      d.hostname !== "localhost" && !d.hostname.endsWith("27infinity.in") && (D.warn(`Blocked navigation to: ${l}`), c.preventDefault());
    }), s.setWindowOpenHandler(({ url: c }) => {
      const l = new URL(c);
      return l.hostname.endsWith("27infinity.in") || l.hostname === "github.com" ? Q.openExternal(c) : D.warn(`Blocked popup to: ${c}`), { action: "deny" };
    });
  }), G.defaultSession.setPermissionRequestHandler((n, s, c) => {
    ["media", "microphone", "audioCapture"].includes(s) ? (D.info(`Permission granted: ${s}`), c(!0)) : (D.info(`Permission denied: ${s}`), c(!1));
  }), G.defaultSession.setPermissionCheckHandler((n, s) => ["media", "microphone", "audioCapture"].includes(s));
  const u = Re(), p = process.platform === "darwin" ? "Command+R" : "Control+R";
  Le.register(p, () => {
    D.info("Refresh shortcut triggered - clearing storage and reloading"), u && !u.isDestroyed() && u.webContents.send("clear-storage-and-reload");
  }) ? D.info(`Refresh shortcut registered: ${p}`) : D.error(`Failed to register refresh shortcut: ${p}`);
  const a = process.platform === "darwin" ? "Option+Command+I" : "Control+Shift+I";
  Le.register(a, () => {
    D.info("DevTools shortcut triggered"), u && !u.isDestroyed() && (u.webContents.isDevToolsOpened() ? u.webContents.closeDevTools() : u.webContents.openDevTools());
  }) ? D.info(`DevTools shortcut registered: ${a}`) : D.error(`Failed to register DevTools shortcut: ${a}`);
  const r = () => {
    const n = "https://27infinity.in/products";
    return process.platform === "darwin" ? process.arch === "arm64" ? `${n}?download=mac-arm64` : `${n}?download=mac-intel` : process.platform === "win32" ? process.arch === "x64" || process.arch === "arm64" ? `${n}?download=win64` : `${n}?download=win32` : n;
  }, e = async () => {
    try {
      const n = await fetch(
        "https://api.github.com/repos/gopalsingh2727/Diamond-Polymers/releases/latest"
      );
      if (!n.ok)
        throw new Error(`GitHub API error: ${n.status}`);
      const s = await n.json(), c = s.tag_name.replace("v", ""), l = I.getVersion(), d = c !== l && c.localeCompare(l, void 0, { numeric: !0 }) > 0;
      return {
        version: l,
        newVersion: c,
        update: d,
        releaseNotes: s.body || ""
      };
    } catch (n) {
      return D.error("Update check failed:", n.message), {
        error: {
          message: n.message || "Failed to check for updates"
        },
        version: I.getVersion()
      };
    }
  };
  setTimeout(async () => {
    const n = await e();
    if (n.update) {
      if (D.info("Update available:", n.newVersion), Ie.isSupported()) {
        const s = new Ie({
          title: "Update Available",
          body: `Version ${n.newVersion} is available. Click to download.`,
          icon: F.join(process.env.VITE_PUBLIC, "electron-vite.svg")
        });
        s.on("click", () => {
          Q.openExternal(r());
        }), s.show();
      }
      u == null || u.webContents.send("update-can-available", n);
    }
  }, 3e3), H.handle("check-update", async () => await e()), H.handle("open-download-page", async () => {
    try {
      const n = r();
      return D.info("Opening download URL:", n), await Q.openExternal(n), { success: !0 };
    } catch (n) {
      return D.error("Failed to open download page:", n.message), { success: !1, error: n.message };
    }
  });
  const t = async () => {
    try {
      const n = await fetch(
        "https://api.github.com/repos/gopalsingh2727/Diamond-Polymers/releases/latest"
      );
      if (!n.ok)
        throw new Error(`GitHub API error: ${n.status}`);
      const c = (await n.json()).assets || [];
      let l = null;
      return process.platform === "win32" ? process.arch === "x64" || process.arch === "arm64" ? l = c.find(
        (d) => d.name.endsWith(".exe") && !d.name.includes("ia32")
      ) : l = c.find(
        (d) => d.name.endsWith(".exe") && d.name.includes("ia32")
      ) : process.platform === "darwin" && (process.arch === "arm64" ? l = c.find(
        (d) => d.name.includes("arm64") && d.name.endsWith(".dmg")
      ) : l = c.find(
        (d) => d.name.includes("x64") && d.name.endsWith(".dmg")
      ) || c.find(
        (d) => d.name.endsWith(".dmg") && !d.name.includes("arm64")
      )), l ? {
        url: l.browser_download_url,
        filename: l.name
      } : null;
    } catch (n) {
      return D.error("Failed to get installer URL:", n.message), null;
    }
  };
  H.handle("download-update", async () => {
    var n;
    try {
      const s = await t();
      if (!s)
        return { success: !1, error: "No installer found for your platform" };
      D.info("Downloading installer:", s.url);
      const c = F.join(At.tmpdir(), "27-manufacturing-update");
      J.existsSync(c) || J.mkdirSync(c, { recursive: !0 });
      const l = F.join(c, s.filename), d = await fetch(s.url);
      if (!d.ok)
        throw new Error(`Download failed: ${d.status}`);
      const h = parseInt(d.headers.get("content-length") || "0", 10);
      let _ = 0;
      const E = J.createWriteStream(l), y = (n = d.body) == null ? void 0 : n.getReader();
      if (!y)
        throw new Error("Failed to get response reader");
      for (; ; ) {
        const { done: L, value: R } = await y.read();
        if (L) break;
        E.write(R), _ += R.length;
        const j = h > 0 ? Math.round(_ / h * 100) : 0;
        u == null || u.webContents.send("download-progress", {
          progress: j,
          downloaded: _,
          total: h
        });
      }
      return E.end(), await new Promise((L) => E.on("finish", L)), V = l, D.info("Download complete:", l), {
        success: !0,
        filePath: l,
        filename: s.filename
      };
    } catch (s) {
      return D.error("Download failed:", s.message), { success: !1, error: s.message };
    }
  }), H.handle("install-update", async () => {
    try {
      return !V || !J.existsSync(V) ? { success: !1, error: "No downloaded installer found" } : (D.info("Installing update from:", V), process.platform === "win32" ? Fe(V, [], {
        detached: !0,
        stdio: "ignore"
      }).unref() : process.platform === "darwin" && Fe("open", [V], {
        detached: !0,
        stdio: "ignore"
      }).unref(), setTimeout(() => {
        I.quit();
      }, 1e3), { success: !0 });
    } catch (n) {
      return D.error("Installation failed:", n.message), { success: !1, error: n.message };
    }
  });
});
I.on("window-all-closed", () => {
  process.platform !== "darwin" && (I.quit(), $ = null);
});
I.on("activate", () => {
  _e.getAllWindows().length === 0 && (I.isReady() ? Re() : I.whenReady().then(Re));
});
I.on("will-quit", () => {
  Le.unregisterAll(), D.info("All global shortcuts unregistered");
});
console.log(`App root: ${process.env.APP_ROOT}`);
export {
  br as MAIN_DIST,
  wt as RENDERER_DIST,
  Pe as VITE_DEV_SERVER_URL
};
