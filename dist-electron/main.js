var Et = Object.defineProperty;
var bt = (f, u, i) => u in f ? Et(f, u, { enumerable: !0, configurable: !0, writable: !0, value: i }) : f[u] = i;
var g = (f, u, i) => bt(f, typeof u != "symbol" ? u + "" : u, i);
import St, { app as N, session as G, shell as Q, globalShortcut as lt, Notification as $e, ipcMain as H, BrowserWindow as Le } from "electron";
import { fileURLToPath as Ot } from "node:url";
import F from "node:path";
import J from "node:fs";
import Dt from "node:os";
import { spawn as Ne } from "node:child_process";
import V from "fs";
import C from "path";
import W from "os";
import At from "crypto";
import Lt from "child_process";
import _t from "util";
import ut from "events";
import Pt from "http";
import xt from "https";
function ft(f) {
  return f && f.__esModule && Object.prototype.hasOwnProperty.call(f, "default") ? f.default : f;
}
var T = { exports: {} };
const Rt = "16.6.1", $t = {
  version: Rt
};
var Fe;
function Nt() {
  if (Fe) return T.exports;
  Fe = 1;
  const f = V, u = C, i = W, a = At, r = $t.version, e = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
  function t(l) {
    const m = {};
    let E = l.toString();
    E = E.replace(/\r\n?/mg, `
`);
    let S;
    for (; (S = e.exec(E)) != null; ) {
      const P = S[1];
      let w = S[2] || "";
      w = w.trim();
      const O = w[0];
      w = w.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), O === '"' && (w = w.replace(/\\n/g, `
`), w = w.replace(/\\r/g, "\r")), m[P] = w;
    }
    return m;
  }
  function n(l) {
    l = l || {};
    const m = L(l);
    l.path = m;
    const E = v.configDotenv(l);
    if (!E.parsed) {
      const O = new Error(`MISSING_DATA: Cannot parse ${m} for an unknown reason`);
      throw O.code = "MISSING_DATA", O;
    }
    const S = d(l).split(","), P = S.length;
    let w;
    for (let O = 0; O < P; O++)
      try {
        const D = S[O].trim(), I = h(E, D);
        w = v.decrypt(I.ciphertext, I.key);
        break;
      } catch (D) {
        if (O + 1 >= P)
          throw D;
      }
    return v.parse(w);
  }
  function s(l) {
    console.log(`[dotenv@${r}][WARN] ${l}`);
  }
  function c(l) {
    console.log(`[dotenv@${r}][DEBUG] ${l}`);
  }
  function p(l) {
    console.log(`[dotenv@${r}] ${l}`);
  }
  function d(l) {
    return l && l.DOTENV_KEY && l.DOTENV_KEY.length > 0 ? l.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
  }
  function h(l, m) {
    let E;
    try {
      E = new URL(m);
    } catch (D) {
      if (D.code === "ERR_INVALID_URL") {
        const I = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
        throw I.code = "INVALID_DOTENV_KEY", I;
      }
      throw D;
    }
    const S = E.password;
    if (!S) {
      const D = new Error("INVALID_DOTENV_KEY: Missing key part");
      throw D.code = "INVALID_DOTENV_KEY", D;
    }
    const P = E.searchParams.get("environment");
    if (!P) {
      const D = new Error("INVALID_DOTENV_KEY: Missing environment part");
      throw D.code = "INVALID_DOTENV_KEY", D;
    }
    const w = `DOTENV_VAULT_${P.toUpperCase()}`, O = l.parsed[w];
    if (!O) {
      const D = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${w} in your .env.vault file.`);
      throw D.code = "NOT_FOUND_DOTENV_ENVIRONMENT", D;
    }
    return { ciphertext: O, key: S };
  }
  function L(l) {
    let m = null;
    if (l && l.path && l.path.length > 0)
      if (Array.isArray(l.path))
        for (const E of l.path)
          f.existsSync(E) && (m = E.endsWith(".vault") ? E : `${E}.vault`);
      else
        m = l.path.endsWith(".vault") ? l.path : `${l.path}.vault`;
    else
      m = u.resolve(process.cwd(), ".env.vault");
    return f.existsSync(m) ? m : null;
  }
  function b(l) {
    return l[0] === "~" ? u.join(i.homedir(), l.slice(1)) : l;
  }
  function y(l) {
    const m = !!(l && l.debug), E = l && "quiet" in l ? l.quiet : !0;
    (m || !E) && p("Loading env from encrypted .env.vault");
    const S = v._parseVault(l);
    let P = process.env;
    return l && l.processEnv != null && (P = l.processEnv), v.populate(P, S, l), { parsed: S };
  }
  function _(l) {
    const m = u.resolve(process.cwd(), ".env");
    let E = "utf8";
    const S = !!(l && l.debug), P = l && "quiet" in l ? l.quiet : !0;
    l && l.encoding ? E = l.encoding : S && c("No encoding is specified. UTF-8 is used by default");
    let w = [m];
    if (l && l.path)
      if (!Array.isArray(l.path))
        w = [b(l.path)];
      else {
        w = [];
        for (const j of l.path)
          w.push(b(j));
      }
    let O;
    const D = {};
    for (const j of w)
      try {
        const R = v.parse(f.readFileSync(j, { encoding: E }));
        v.populate(D, R, l);
      } catch (R) {
        S && c(`Failed to load ${j} ${R.message}`), O = R;
      }
    let I = process.env;
    if (l && l.processEnv != null && (I = l.processEnv), v.populate(I, D, l), S || !P) {
      const j = Object.keys(D).length, R = [];
      for (const Re of w)
        try {
          const B = u.relative(process.cwd(), Re);
          R.push(B);
        } catch (B) {
          S && c(`Failed to load ${Re} ${B.message}`), O = B;
        }
      p(`injecting env (${j}) from ${R.join(",")}`);
    }
    return O ? { parsed: D, error: O } : { parsed: D };
  }
  function x(l) {
    if (d(l).length === 0)
      return v.configDotenv(l);
    const m = L(l);
    return m ? v._configVault(l) : (s(`You set DOTENV_KEY but you are missing a .env.vault file at ${m}. Did you forget to build it?`), v.configDotenv(l));
  }
  function M(l, m) {
    const E = Buffer.from(m.slice(-64), "hex");
    let S = Buffer.from(l, "base64");
    const P = S.subarray(0, 12), w = S.subarray(-16);
    S = S.subarray(12, -16);
    try {
      const O = a.createDecipheriv("aes-256-gcm", E, P);
      return O.setAuthTag(w), `${O.update(S)}${O.final()}`;
    } catch (O) {
      const D = O instanceof RangeError, I = O.message === "Invalid key length", j = O.message === "Unsupported state or unable to authenticate data";
      if (D || I) {
        const R = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
        throw R.code = "INVALID_DOTENV_KEY", R;
      } else if (j) {
        const R = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
        throw R.code = "DECRYPTION_FAILED", R;
      } else
        throw O;
    }
  }
  function K(l, m, E = {}) {
    const S = !!(E && E.debug), P = !!(E && E.override);
    if (typeof m != "object") {
      const w = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
      throw w.code = "OBJECT_REQUIRED", w;
    }
    for (const w of Object.keys(m))
      Object.prototype.hasOwnProperty.call(l, w) ? (P === !0 && (l[w] = m[w]), S && c(P === !0 ? `"${w}" is already defined and WAS overwritten` : `"${w}" is already defined and was NOT overwritten`)) : l[w] = m[w];
  }
  const v = {
    configDotenv: _,
    _configVault: y,
    _parseVault: n,
    config: x,
    decrypt: M,
    parse: t,
    populate: K
  };
  return T.exports.configDotenv = v.configDotenv, T.exports._configVault = v._configVault, T.exports._parseVault = v._parseVault, T.exports.config = v.config, T.exports.decrypt = v.decrypt, T.exports.parse = v.parse, T.exports.populate = v.populate, T.exports = v, T.exports;
}
var Ft = Nt();
const It = /* @__PURE__ */ ft(Ft);
var U = { exports: {} }, X = { exports: {} }, Ie;
function pt() {
  return Ie || (Ie = 1, (function(f) {
    let u = {};
    try {
      u = require("electron");
    } catch {
    }
    u.ipcRenderer && i(u), f.exports = i;
    function i({ contextBridge: a, ipcRenderer: o }) {
      if (!o)
        return;
      o.on("__ELECTRON_LOG_IPC__", (e, t) => {
        window.postMessage({ cmd: "message", ...t });
      }), o.invoke("__ELECTRON_LOG__", { cmd: "getOptions" }).catch((e) => console.error(new Error(
        `electron-log isn't initialized in the main process. Please call log.initialize() before. ${e.message}`
      )));
      const r = {
        sendToMain(e) {
          try {
            o.send("__ELECTRON_LOG__", e);
          } catch (t) {
            console.error("electronLog.sendToMain ", t, "data:", e), o.send("__ELECTRON_LOG__", {
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
var Z = { exports: {} }, ee, Te;
function Tt() {
  if (Te) return ee;
  Te = 1, ee = f;
  function f(u) {
    return Object.defineProperties(i, {
      defaultLabel: { value: "", writable: !0 },
      labelPadding: { value: !0, writable: !0 },
      maxLabelLength: { value: 0, writable: !0 },
      labelLength: {
        get() {
          switch (typeof i.labelPadding) {
            case "boolean":
              return i.labelPadding ? i.maxLabelLength : 0;
            case "number":
              return i.labelPadding;
            default:
              return 0;
          }
        }
      }
    });
    function i(a) {
      i.maxLabelLength = Math.max(i.maxLabelLength, a.length);
      const o = {};
      for (const r of u.levels)
        o[r] = (...e) => u.logData(e, { level: r, scope: a });
      return o.log = o.info, o;
    }
  }
  return ee;
}
var te, je;
function jt() {
  if (je) return te;
  je = 1;
  class f {
    constructor({ processMessage: i }) {
      this.processMessage = i, this.buffer = [], this.enabled = !1, this.begin = this.begin.bind(this), this.commit = this.commit.bind(this), this.reject = this.reject.bind(this);
    }
    addMessage(i) {
      this.buffer.push(i);
    }
    begin() {
      this.enabled = [];
    }
    commit() {
      this.enabled = !1, this.buffer.forEach((i) => this.processMessage(i)), this.buffer = [];
    }
    reject() {
      this.enabled = !1, this.buffer = [];
    }
  }
  return te = f, te;
}
var re, Ce;
function dt() {
  if (Ce) return re;
  Ce = 1;
  const f = Tt(), u = jt(), a = class a {
    constructor({
      allowUnknownLevel: r = !1,
      dependencies: e = {},
      errorHandler: t,
      eventLogger: n,
      initializeFn: s,
      isDev: c = !1,
      levels: p = ["error", "warn", "info", "verbose", "debug", "silly"],
      logId: d,
      transportFactories: h = {},
      variables: L
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
      this.addLevel = this.addLevel.bind(this), this.create = this.create.bind(this), this.initialize = this.initialize.bind(this), this.logData = this.logData.bind(this), this.processMessage = this.processMessage.bind(this), this.allowUnknownLevel = r, this.buffering = new u(this), this.dependencies = e, this.initializeFn = s, this.isDev = c, this.levels = p, this.logId = d, this.scope = f(this), this.transportFactories = h, this.variables = L || {};
      for (const b of this.levels)
        this.addLevel(b, !1);
      this.log = this.info, this.functions.log = this.log, this.errorHandler = t, t == null || t.setOptions({ ...e, logFn: this.error }), this.eventLogger = n, n == null || n.setOptions({ ...e, logger: this });
      for (const [b, y] of Object.entries(h))
        this.transports[b] = y(this, e);
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
            const p = this.hooks.reduce((d, h) => d && h(d, c, s), n);
            p && c({ ...p, data: [...p.data] });
          } catch (p) {
            this.processInternalErrorFn(p);
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
  let i = a;
  return re = i, re;
}
var ne, qe;
function Ct() {
  if (qe) return ne;
  qe = 1;
  const f = console.error;
  class u {
    constructor({ logFn: a = null } = {}) {
      g(this, "logFn", null);
      g(this, "onError", null);
      g(this, "showDialog", !1);
      g(this, "preventDefault", !0);
      this.handleError = this.handleError.bind(this), this.handleRejection = this.handleRejection.bind(this), this.startCatching = this.startCatching.bind(this), this.logFn = a;
    }
    handle(a, {
      logFn: o = this.logFn,
      errorName: r = "",
      onError: e = this.onError,
      showDialog: t = this.showDialog
    } = {}) {
      try {
        (e == null ? void 0 : e({ error: a, errorName: r, processType: "renderer" })) !== !1 && o({ error: a, errorName: r, showDialog: t });
      } catch {
        f(a);
      }
    }
    setOptions({ logFn: a, onError: o, preventDefault: r, showDialog: e }) {
      typeof a == "function" && (this.logFn = a), typeof o == "function" && (this.onError = o), typeof r == "boolean" && (this.preventDefault = r), typeof e == "boolean" && (this.showDialog = e);
    }
    startCatching({ onError: a, showDialog: o } = {}) {
      this.isActive || (this.isActive = !0, this.setOptions({ onError: a, showDialog: o }), window.addEventListener("error", (r) => {
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
      const o = a instanceof Error ? a : new Error(JSON.stringify(a));
      this.handle(o, { errorName: "Unhandled rejection" });
    }
  }
  return ne = u, ne;
}
var se, ke;
function q() {
  if (ke) return se;
  ke = 1, se = { transform: f };
  function f({
    logger: u,
    message: i,
    transport: a,
    initialData: o = (i == null ? void 0 : i.data) || [],
    transforms: r = a == null ? void 0 : a.transforms
  }) {
    return r.reduce((e, t) => typeof t == "function" ? t({ data: e, logger: u, message: i, transport: a }) : e, o);
  }
  return se;
}
var oe, Ve;
function qt() {
  if (Ve) return oe;
  Ve = 1;
  const { transform: f } = q();
  oe = i;
  const u = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    verbose: console.info,
    debug: console.debug,
    silly: console.debug,
    log: console.log
  };
  function i(o) {
    return Object.assign(r, {
      format: "{h}:{i}:{s}.{ms}{scope} › {text}",
      transforms: [a],
      writeFn({ message: { level: e, data: t } }) {
        const n = u[e] || u.info;
        setTimeout(() => n(...t));
      }
    });
    function r(e) {
      r.writeFn({
        message: { ...e, data: f({ logger: o, message: e, transport: r }) }
      });
    }
  }
  function a({
    data: o = [],
    logger: r = {},
    message: e = {},
    transport: t = {}
  }) {
    if (typeof t.format == "function")
      return t.format({
        data: o,
        level: (e == null ? void 0 : e.level) || "info",
        logger: r,
        message: e,
        transport: t
      });
    if (typeof t.format != "string")
      return o;
    o.unshift(t.format), typeof o[1] == "string" && o[1].match(/%[1cdfiOos]/) && (o = [`${o[0]}${o[1]}`, ...o.slice(2)]);
    const n = e.date || /* @__PURE__ */ new Date();
    return o[0] = o[0].replace(/\{(\w+)}/g, (s, c) => {
      var p, d;
      switch (c) {
        case "level":
          return e.level;
        case "logId":
          return e.logId;
        case "scope": {
          const h = e.scope || ((p = r.scope) == null ? void 0 : p.defaultLabel);
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
    }).trim(), o;
  }
  return oe;
}
var ie, Me;
function kt() {
  if (Me) return ie;
  Me = 1;
  const { transform: f } = q();
  ie = i;
  const u = /* @__PURE__ */ new Set([Promise, WeakMap, WeakSet]);
  function i(r) {
    return Object.assign(e, {
      depth: 5,
      transforms: [o]
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
        const n = f({
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
  function o({
    data: r,
    depth: e,
    seen: t = /* @__PURE__ */ new WeakSet(),
    transport: n = {}
  } = {}) {
    const s = e || n.depth || 5;
    return t.has(r) ? "[Circular]" : s < 1 ? a(r) ? r : Array.isArray(r) ? "[Array]" : `[${typeof r}]` : ["function", "symbol"].includes(typeof r) ? r.toString() : a(r) ? r : u.has(r.constructor) ? `[${r.constructor.name}]` : Array.isArray(r) ? r.map((c) => o({
      data: c,
      depth: s - 1,
      seen: t
    })) : r instanceof Date ? r.toISOString() : r instanceof Error ? r.stack : r instanceof Map ? new Map(
      Array.from(r).map(([c, p]) => [
        o({ data: c, depth: s - 1, seen: t }),
        o({ data: p, depth: s - 1, seen: t })
      ])
    ) : r instanceof Set ? new Set(
      Array.from(r).map(
        (c) => o({ data: c, depth: s - 1, seen: t })
      )
    ) : (t.add(r), Object.fromEntries(
      Object.entries(r).map(
        ([c, p]) => [
          c,
          o({ data: p, depth: s - 1, seen: t })
        ]
      )
    ));
  }
  return ie;
}
var Ue;
function Vt() {
  return Ue || (Ue = 1, (function(f) {
    const u = dt(), i = Ct(), a = qt(), o = kt();
    typeof process == "object" && process.type === "browser" && console.warn(
      "electron-log/renderer is loaded in the main process. It could cause unexpected behaviour."
    ), f.exports = r(), f.exports.Logger = u, f.exports.default = f.exports;
    function r() {
      const e = new u({
        allowUnknownLevel: !0,
        errorHandler: new i(),
        initializeFn: () => {
        },
        logId: "default",
        transportFactories: {
          console: a,
          ipc: o
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
        const { cmd: n, logId: s, ...c } = t.data || {}, p = u.getInstance({ logId: s });
        n === "message" && p.processMessage(c, { transports: ["console"] });
      }), new Proxy(e, {
        get(t, n) {
          return typeof t[n] < "u" ? t[n] : (...s) => e.logData(s, { level: n });
        }
      });
    }
  })(Z)), Z.exports;
}
var ae, ze;
function Mt() {
  if (ze) return ae;
  ze = 1;
  const f = V, u = C;
  ae = {
    findAndReadPackageJson: i,
    tryReadJsonAt: a
  };
  function i() {
    return a(e()) || a(r()) || a(process.resourcesPath, "app.asar") || a(process.resourcesPath, "app") || a(process.cwd()) || { name: void 0, version: void 0 };
  }
  function a(...t) {
    if (t[0])
      try {
        const n = u.join(...t), s = o("package.json", n);
        if (!s)
          return;
        const c = JSON.parse(f.readFileSync(s, "utf8")), p = (c == null ? void 0 : c.productName) || (c == null ? void 0 : c.name);
        return !p || p.toLowerCase() === "electron" ? void 0 : p ? { name: p, version: c == null ? void 0 : c.version } : void 0;
      } catch {
        return;
      }
  }
  function o(t, n) {
    let s = n;
    for (; ; ) {
      const c = u.parse(s), p = c.root, d = c.dir;
      if (f.existsSync(u.join(s, t)))
        return u.resolve(u.join(s, t));
      if (s === p)
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
var ce, We;
function ht() {
  if (We) return ce;
  We = 1;
  const f = Lt, u = W, i = C, a = Mt();
  class o {
    constructor() {
      g(this, "appName");
      g(this, "appPackageJson");
      g(this, "platform", process.platform);
    }
    getAppLogPath(e = this.getAppName()) {
      return this.platform === "darwin" ? i.join(this.getSystemPathHome(), "Library/Logs", e) : i.join(this.getAppUserDataPath(e), "logs");
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
      return e ? i.join(this.getSystemPathAppData(), e) : void 0;
    }
    getAppVersion() {
      var e;
      return (e = this.getAppPackageJson()) == null ? void 0 : e.version;
    }
    getElectronLogPath() {
      return this.getAppLogPath();
    }
    getMacOsVersion() {
      const e = Number(u.release().split(".")[0]);
      return e <= 19 ? `10.${e - 4}` : e - 9;
    }
    /**
     * @protected
     * @returns {string}
     */
    getOsVersion() {
      let e = u.type().replace("_", " "), t = u.release();
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
          return i.join(e, "Library/Application Support");
        case "win32":
          return process.env.APPDATA || i.join(e, "AppData/Roaming");
        default:
          return process.env.XDG_CONFIG_HOME || i.join(e, ".config");
      }
    }
    getSystemPathHome() {
      var e;
      return ((e = u.homedir) == null ? void 0 : e.call(u)) || process.env.HOME;
    }
    getSystemPathTemp() {
      return u.tmpdir();
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
      f.exec(`${s} ${e}`, {}, (c) => {
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
  return ce = o, ce;
}
var le, Be;
function Ut() {
  if (Be) return le;
  Be = 1;
  const f = C, u = ht();
  class i extends u {
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
      return ((r = this.electron.app) == null ? void 0 : r.isPackaged) !== void 0 ? !this.electron.app.isPackaged : typeof process.execPath == "string" ? f.basename(process.execPath).toLowerCase().startsWith("electron") : super.isDev();
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
      return (s = (n = this.electron.webContents) == null ? void 0 : n.getAllWebContents()) == null || s.forEach((p) => {
        p.on(r, e);
      }), (c = this.electron.app) == null || c.on("web-contents-created", t), () => {
        var p, d;
        (p = this.electron.webContents) == null || p.getAllWebContents().forEach((h) => {
          h.off(r, e);
        }), (d = this.electron.app) == null || d.off("web-contents-created", t);
      };
      function t(p, d) {
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
        var c, p;
        ((c = s.webContents) == null ? void 0 : c.isDestroyed()) === !1 && ((p = s.webContents) == null ? void 0 : p.isCrashed()) === !1 && s.webContents.send(r, e);
      });
    }
    showErrorBox(r, e) {
      var t;
      (t = this.electron.dialog) == null || t.showErrorBox(r, e);
    }
  }
  return le = i, le;
}
var ue, He;
function zt() {
  if (He) return ue;
  He = 1;
  const f = V, u = W, i = C, a = pt();
  let o = !1, r = !1;
  ue = {
    initialize({
      externalApi: n,
      getSessions: s,
      includeFutureSession: c,
      logger: p,
      preload: d = !0,
      spyRendererConsole: h = !1
    }) {
      n.onAppReady(() => {
        try {
          d && e({
            externalApi: n,
            getSessions: s,
            includeFutureSession: c,
            logger: p,
            preloadOption: d
          }), h && t({ externalApi: n, logger: p });
        } catch (L) {
          p.warn(L);
        }
      });
    }
  };
  function e({
    externalApi: n,
    getSessions: s,
    includeFutureSession: c,
    logger: p,
    preloadOption: d
  }) {
    let h = typeof d == "string" ? d : void 0;
    if (o) {
      p.warn(new Error("log.initialize({ preload }) already called").stack);
      return;
    }
    o = !0;
    try {
      h = i.resolve(
        __dirname,
        "../renderer/electron-log-preload.js"
      );
    } catch {
    }
    if (!h || !f.existsSync(h)) {
      h = i.join(
        n.getAppUserDataPath() || u.tmpdir(),
        "electron-log-preload.js"
      );
      const L = `
      try {
        (${a.toString()})(require('electron'));
      } catch(e) {
        console.error(e);
      }
    `;
      f.writeFileSync(h, L, "utf8");
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
      (p, d, h) => {
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
var fe, Je;
function Wt() {
  if (Je) return fe;
  Je = 1;
  class f {
    constructor({
      externalApi: a,
      logFn: o = void 0,
      onError: r = void 0,
      showDialog: e = void 0
    } = {}) {
      g(this, "externalApi");
      g(this, "isActive", !1);
      g(this, "logFn");
      g(this, "onError");
      g(this, "showDialog", !0);
      this.createIssue = this.createIssue.bind(this), this.handleError = this.handleError.bind(this), this.handleRejection = this.handleRejection.bind(this), this.setOptions({ externalApi: a, logFn: o, onError: r, showDialog: e }), this.startCatching = this.startCatching.bind(this), this.stopCatching = this.stopCatching.bind(this);
    }
    handle(a, {
      logFn: o = this.logFn,
      onError: r = this.onError,
      processType: e = "browser",
      showDialog: t = this.showDialog,
      errorName: n = ""
    } = {}) {
      var s;
      a = u(a);
      try {
        if (typeof r == "function") {
          const c = ((s = this.externalApi) == null ? void 0 : s.getVersions()) || {}, p = this.createIssue;
          if (r({
            createIssue: p,
            error: a,
            errorName: n,
            processType: e,
            versions: c
          }) === !1)
            return;
        }
        n ? o(n, a) : o(a), t && !n.includes("rejection") && this.externalApi && this.externalApi.showErrorBox(
          `A JavaScript error occurred in the ${e} process`,
          a.stack
        );
      } catch {
        console.error(a);
      }
    }
    setOptions({ externalApi: a, logFn: o, onError: r, showDialog: e }) {
      typeof a == "object" && (this.externalApi = a), typeof o == "function" && (this.logFn = o), typeof r == "function" && (this.onError = r), typeof e == "boolean" && (this.showDialog = e);
    }
    startCatching({ onError: a, showDialog: o } = {}) {
      this.isActive || (this.isActive = !0, this.setOptions({ onError: a, showDialog: o }), process.on("uncaughtException", this.handleError), process.on("unhandledRejection", this.handleRejection));
    }
    stopCatching() {
      this.isActive = !1, process.removeListener("uncaughtException", this.handleError), process.removeListener("unhandledRejection", this.handleRejection);
    }
    createIssue(a, o) {
      var r;
      (r = this.externalApi) == null || r.openUrl(
        `${a}?${new URLSearchParams(o).toString()}`
      );
    }
    handleError(a) {
      this.handle(a, { errorName: "Unhandled" });
    }
    handleRejection(a) {
      const o = a instanceof Error ? a : new Error(JSON.stringify(a));
      this.handle(o, { errorName: "Unhandled rejection" });
    }
  }
  function u(i) {
    if (i instanceof Error)
      return i;
    if (i && typeof i == "object") {
      if (i.message)
        return Object.assign(new Error(i.message), i);
      try {
        return new Error(JSON.stringify(i));
      } catch (a) {
        return new Error(`Couldn't normalize error ${String(i)}: ${a}`);
      }
    }
    return new Error(`Can't normalize error ${String(i)}`);
  }
  return fe = f, fe;
}
var pe, Ye;
function Bt() {
  if (Ye) return pe;
  Ye = 1;
  class f {
    constructor(i = {}) {
      g(this, "disposers", []);
      g(this, "format", "{eventSource}#{eventName}:");
      g(this, "formatters", {
        app: {
          "certificate-error": ({ args: i }) => this.arrayToObject(i.slice(1, 4), [
            "url",
            "error",
            "certificate"
          ]),
          "child-process-gone": ({ args: i }) => i.length === 1 ? i[0] : i,
          "render-process-gone": ({ args: [i, a] }) => a && typeof a == "object" ? { ...a, ...this.getWebContentsDetails(i) } : []
        },
        webContents: {
          "console-message": ({ args: [i, a, o, r] }) => {
            if (!(i < 3))
              return { message: a, source: `${r}:${o}` };
          },
          "did-fail-load": ({ args: i }) => this.arrayToObject(i, [
            "errorCode",
            "errorDescription",
            "validatedURL",
            "isMainFrame",
            "frameProcessId",
            "frameRoutingId"
          ]),
          "did-fail-provisional-load": ({ args: i }) => this.arrayToObject(i, [
            "errorCode",
            "errorDescription",
            "validatedURL",
            "isMainFrame",
            "frameProcessId",
            "frameRoutingId"
          ]),
          "plugin-crashed": ({ args: i }) => this.arrayToObject(i, ["name", "version"]),
          "preload-error": ({ args: i }) => this.arrayToObject(i, ["preloadPath", "error"])
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
      this.setOptions(i);
    }
    setOptions({
      events: i,
      externalApi: a,
      level: o,
      logger: r,
      format: e,
      formatters: t,
      scope: n
    }) {
      typeof i == "object" && (this.events = i), typeof a == "object" && (this.externalApi = a), typeof o == "string" && (this.level = o), typeof r == "object" && (this.logger = r), (typeof e == "string" || typeof e == "function") && (this.format = e), typeof t == "object" && (this.formatters = t), typeof n == "string" && (this.scope = n);
    }
    startLogging(i = {}) {
      this.setOptions(i), this.disposeListeners();
      for (const a of this.getEventNames(this.events.app))
        this.disposers.push(
          this.externalApi.onAppEvent(a, (...o) => {
            this.handleEvent({ eventSource: "app", eventName: a, handlerArgs: o });
          })
        );
      for (const a of this.getEventNames(this.events.webContents))
        this.disposers.push(
          this.externalApi.onEveryWebContentsEvent(
            a,
            (...o) => {
              this.handleEvent(
                { eventSource: "webContents", eventName: a, handlerArgs: o }
              );
            }
          )
        );
    }
    stopLogging() {
      this.disposeListeners();
    }
    arrayToObject(i, a) {
      const o = {};
      return a.forEach((r, e) => {
        o[r] = i[e];
      }), i.length > a.length && (o.unknownArgs = i.slice(a.length)), o;
    }
    disposeListeners() {
      this.disposers.forEach((i) => i()), this.disposers = [];
    }
    formatEventLog({ eventName: i, eventSource: a, handlerArgs: o }) {
      var p;
      const [r, ...e] = o;
      if (typeof this.format == "function")
        return this.format({ args: e, event: r, eventName: i, eventSource: a });
      const t = (p = this.formatters[a]) == null ? void 0 : p[i];
      let n = e;
      if (typeof t == "function" && (n = t({ args: e, event: r, eventName: i, eventSource: a })), !n)
        return;
      const s = {};
      return Array.isArray(n) ? s.args = n : typeof n == "object" && Object.assign(s, n), a === "webContents" && Object.assign(s, this.getWebContentsDetails(r == null ? void 0 : r.sender)), [this.format.replace("{eventSource}", a === "app" ? "App" : "WebContents").replace("{eventName}", i), s];
    }
    getEventNames(i) {
      return !i || typeof i != "object" ? [] : Object.entries(i).filter(([a, o]) => o).map(([a]) => a);
    }
    getWebContentsDetails(i) {
      if (!(i != null && i.loadURL))
        return {};
      try {
        return {
          webContents: {
            id: i.id,
            url: i.getURL()
          }
        };
      } catch {
        return {};
      }
    }
    handleEvent({ eventName: i, eventSource: a, handlerArgs: o }) {
      var e;
      const r = this.formatEventLog({ eventName: i, eventSource: a, handlerArgs: o });
      if (r) {
        const t = this.scope ? this.logger.scope(this.scope) : this.logger;
        (e = t == null ? void 0 : t[this.level]) == null || e.call(t, ...r);
      }
    }
  }
  return pe = f, pe;
}
var de, Ke;
function gt() {
  if (Ke) return de;
  Ke = 1;
  const { transform: f } = q();
  de = {
    concatFirstStringElements: u,
    formatScope: a,
    formatText: r,
    formatVariables: o,
    timeZoneFromOffset: i,
    format({ message: e, logger: t, transport: n, data: s = e == null ? void 0 : e.data }) {
      switch (typeof n.format) {
        case "string":
          return f({
            message: e,
            logger: t,
            transforms: [o, a, r],
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
  function u({ data: e }) {
    return typeof e[0] != "string" || typeof e[1] != "string" || e[0].match(/%[1cdfiOos]/) ? e : [`${e[0]} ${e[1]}`, ...e.slice(2)];
  }
  function i(e) {
    const t = Math.abs(e), n = e > 0 ? "-" : "+", s = Math.floor(t / 60).toString().padStart(2, "0"), c = (t % 60).toString().padStart(2, "0");
    return `${n}${s}:${c}`;
  }
  function a({ data: e, logger: t, message: n }) {
    const { defaultLabel: s, labelLength: c } = (t == null ? void 0 : t.scope) || {}, p = e[0];
    let d = n.scope;
    d || (d = s);
    let h;
    return d === "" ? h = c > 0 ? "".padEnd(c + 3) : "" : typeof d == "string" ? h = ` (${d})`.padEnd(c + 3) : h = "", e[0] = p.replace("{scope}", h), e;
  }
  function o({ data: e, message: t }) {
    let n = e[0];
    if (typeof n != "string")
      return e;
    n = n.replace("{level}]", `${t.level}]`.padEnd(6, " "));
    const s = t.date || /* @__PURE__ */ new Date();
    return e[0] = n.replace(/\{(\w+)}/g, (c, p) => {
      var d;
      switch (p) {
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
          return i(s.getTimezoneOffset());
        case "iso":
          return s.toISOString();
        default:
          return ((d = t.variables) == null ? void 0 : d[p]) || c;
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
var he = { exports: {} }, Ge;
function Y() {
  return Ge || (Ge = 1, (function(f) {
    const u = _t;
    f.exports = {
      serialize: a,
      maxDepth({ data: o, transport: r, depth: e = (r == null ? void 0 : r.depth) ?? 6 }) {
        if (!o)
          return o;
        if (e < 1)
          return Array.isArray(o) ? "[array]" : typeof o == "object" && o ? "[object]" : o;
        if (Array.isArray(o))
          return o.map((n) => f.exports.maxDepth({
            data: n,
            depth: e - 1
          }));
        if (typeof o != "object" || o && typeof o.toISOString == "function")
          return o;
        if (o === null)
          return null;
        if (o instanceof Error)
          return o;
        const t = {};
        for (const n in o)
          Object.prototype.hasOwnProperty.call(o, n) && (t[n] = f.exports.maxDepth({
            data: o[n],
            depth: e - 1
          }));
        return t;
      },
      toJSON({ data: o }) {
        return JSON.parse(JSON.stringify(o, i()));
      },
      toString({ data: o, transport: r }) {
        const e = (r == null ? void 0 : r.inspectOptions) || {}, t = o.map((n) => {
          if (n !== void 0)
            try {
              const s = JSON.stringify(n, i(), "  ");
              return s === void 0 ? void 0 : JSON.parse(s);
            } catch {
              return n;
            }
        });
        return u.formatWithOptions(e, ...t);
      }
    };
    function i(o = {}) {
      const r = /* @__PURE__ */ new WeakSet();
      return function(e, t) {
        if (typeof t == "object" && t !== null) {
          if (r.has(t))
            return;
          r.add(t);
        }
        return a(e, t, o);
      };
    }
    function a(o, r, e = {}) {
      const t = (e == null ? void 0 : e.serializeMapAndSet) !== !1;
      return r instanceof Error ? r.stack : r && (typeof r == "function" ? `[function] ${r.toString()}` : r instanceof Date ? r.toISOString() : t && r instanceof Map && Object.fromEntries ? Object.fromEntries(r) : t && r instanceof Set && Array.from ? Array.from(r) : r);
    }
  })(he)), he.exports;
}
var ge, Qe;
function xe() {
  if (Qe) return ge;
  Qe = 1, ge = {
    transformStyles: a,
    applyAnsiStyles({ data: o }) {
      return a(o, u, i);
    },
    removeStyles({ data: o }) {
      return a(o, () => "");
    }
  };
  const f = {
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
  function u(o) {
    const r = o.replace(/color:\s*(\w+).*/, "$1").toLowerCase();
    return f[r] || "";
  }
  function i(o) {
    return o + f.unset;
  }
  function a(o, r, e) {
    const t = {};
    return o.reduce((n, s, c, p) => {
      if (t[c])
        return n;
      if (typeof s == "string") {
        let d = c, h = !1;
        s = s.replace(/%[1cdfiOos]/g, (L) => {
          if (d += 1, L !== "%c")
            return L;
          const b = p[d];
          return typeof b == "string" ? (t[d] = !0, h = !0, r(b, s)) : L;
        }), h && e && (s = e(s));
      }
      return n.push(s), n;
    }, []);
  }
  return ge;
}
var me, Xe;
function Ht() {
  if (Xe) return me;
  Xe = 1;
  const {
    concatFirstStringElements: f,
    format: u
  } = gt(), { maxDepth: i, toJSON: a } = Y(), {
    applyAnsiStyles: o,
    removeStyles: r
  } = xe(), { transform: e } = q(), t = {
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
  function c(b) {
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
        p,
        u,
        h,
        f,
        i,
        a
      ],
      useStyles: process.env.FORCE_STYLES,
      writeFn({ message: _ }) {
        (t[_.level] || t.info)(..._.data);
      }
    });
    function y(_) {
      const x = e({ logger: b, message: _, transport: y });
      y.writeFn({
        message: { ..._, data: x }
      });
    }
  }
  function p({ data: b, message: y, transport: _ }) {
    return typeof _.format != "string" || !_.format.includes("%c") ? b : [
      `color:${L(y.level, _)}`,
      "color:unset",
      ...b
    ];
  }
  function d(b, y) {
    if (typeof b == "boolean")
      return b;
    const x = y === "error" || y === "warn" ? process.stderr : process.stdout;
    return x && x.isTTY;
  }
  function h(b) {
    const { message: y, transport: _ } = b;
    return (d(_.useStyles, y.level) ? o : r)(b);
  }
  function L(b, y) {
    return y.colorMap[b] || y.colorMap.default;
  }
  return me;
}
var ye, Ze;
function mt() {
  if (Ze) return ye;
  Ze = 1;
  const f = ut, u = V, i = W;
  class a extends f {
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
        return u.writeFileSync(this.path, "", {
          mode: this.writeOptions.mode,
          flag: "w"
        }), this.reset(), !0;
      } catch (t) {
        return t.code === "ENOENT" ? !0 : (this.emit("error", t, this), !1);
      }
    }
    crop(t) {
      try {
        const n = o(this.path, t || 4096);
        this.clear(), this.writeLine(`[log cropped]${i.EOL}${n}`);
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
          const t = u.statSync(this.path);
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
      this.asyncWriteQueue = [], this.hasActiveAsyncWriting = !0, u.writeFile(this.path, n, this.writeOptions, (s) => {
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
      if (t += i.EOL, this.writeAsync) {
        this.asyncWriteQueue.push(t), this.nextAsyncWrite();
        return;
      }
      try {
        u.writeFileSync(this.path, t, this.writeOptions), this.increaseBytesWrittenCounter(t);
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
  function o(r, e) {
    const t = Buffer.alloc(e), n = u.statSync(r), s = Math.min(n.size, e), c = Math.max(0, n.size - e), p = u.openSync(r, "r"), d = u.readSync(p, t, 0, s, c);
    return u.closeSync(p), t.toString("utf8", 0, d);
  }
  return ye;
}
var ve, et;
function Jt() {
  if (et) return ve;
  et = 1;
  const f = mt();
  class u extends f {
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
  return ve = u, ve;
}
var we, tt;
function Yt() {
  if (tt) return we;
  tt = 1;
  const f = ut, u = V, i = C, a = mt(), o = Jt();
  class r extends f {
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
      let p;
      try {
        if (n = i.resolve(n), this.store[n])
          return this.store[n];
        p = this.createFile({ filePath: n, writeOptions: s, writeAsync: c });
      } catch (d) {
        p = new o({ path: n }), this.emitError(d, p);
      }
      return p.on("error", this.emitError), this.store[n] = p, p;
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
      u.mkdirSync(i.dirname(n), { recursive: !0 }), u.writeFileSync(n, "", { flag: "a", mode: s.mode });
    }
  }
  return we = r, we;
}
var Ee, rt;
function Kt() {
  if (rt) return Ee;
  rt = 1;
  const f = V, u = W, i = C, a = Yt(), { transform: o } = q(), { removeStyles: r } = xe(), {
    format: e,
    concatFirstStringElements: t
  } = gt(), { toString: n } = Y();
  Ee = c;
  const s = new a();
  function c(d, { registry: h = s, externalApi: L } = {}) {
    let b;
    return h.listenerCount("error") < 1 && h.on("error", (v, l) => {
      x(`Can't write to ${l}`, v);
    }), Object.assign(y, {
      fileName: p(d.variables.processType),
      format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}",
      getFile: M,
      inspectOptions: { depth: 5 },
      level: "silly",
      maxSize: 1024 ** 2,
      readAllLogs: K,
      sync: !0,
      transforms: [r, e, t, n],
      writeOptions: { flag: "a", mode: 438, encoding: "utf8" },
      archiveLogFn(v) {
        const l = v.toString(), m = i.parse(l);
        try {
          f.renameSync(l, i.join(m.dir, `${m.name}.old${m.ext}`));
        } catch (E) {
          x("Could not rotate log", E);
          const S = Math.round(y.maxSize / 4);
          v.crop(Math.min(S, 256 * 1024));
        }
      },
      resolvePathFn(v) {
        return i.join(v.libraryDefaultDir, v.fileName);
      },
      setAppName(v) {
        d.dependencies.externalApi.setAppName(v);
      }
    });
    function y(v) {
      const l = M(v);
      y.maxSize > 0 && l.size > y.maxSize && (y.archiveLogFn(l), l.reset());
      const E = o({ logger: d, message: v, transport: y });
      l.writeLine(E);
    }
    function _() {
      b || (b = Object.create(
        Object.prototype,
        {
          ...Object.getOwnPropertyDescriptors(
            L.getPathVariables()
          ),
          fileName: {
            get() {
              return y.fileName;
            },
            enumerable: !0
          }
        }
      ), typeof y.archiveLog == "function" && (y.archiveLogFn = y.archiveLog, x("archiveLog is deprecated. Use archiveLogFn instead")), typeof y.resolvePath == "function" && (y.resolvePathFn = y.resolvePath, x("resolvePath is deprecated. Use resolvePathFn instead")));
    }
    function x(v, l = null, m = "error") {
      const E = [`electron-log.transports.file: ${v}`];
      l && E.push(l), d.transports.console({ data: E, date: /* @__PURE__ */ new Date(), level: m });
    }
    function M(v) {
      _();
      const l = y.resolvePathFn(b, v);
      return h.provide({
        filePath: l,
        writeAsync: !y.sync,
        writeOptions: y.writeOptions
      });
    }
    function K({ fileFilter: v = (l) => l.endsWith(".log") } = {}) {
      _();
      const l = i.dirname(y.resolvePathFn(b));
      return f.existsSync(l) ? f.readdirSync(l).map((m) => i.join(l, m)).filter(v).map((m) => {
        try {
          return {
            path: m,
            lines: f.readFileSync(m, "utf8").split(u.EOL)
          };
        } catch {
          return null;
        }
      }).filter(Boolean) : [];
    }
  }
  function p(d = process.type) {
    switch (d) {
      case "renderer":
        return "renderer.log";
      case "worker":
        return "worker.log";
      default:
        return "main.log";
    }
  }
  return Ee;
}
var be, nt;
function Gt() {
  if (nt) return be;
  nt = 1;
  const { maxDepth: f, toJSON: u } = Y(), { transform: i } = q();
  be = a;
  function a(o, { externalApi: r }) {
    return Object.assign(e, {
      depth: 3,
      eventId: "__ELECTRON_LOG_IPC__",
      level: o.isDev ? "silly" : !1,
      transforms: [u, f]
    }), r != null && r.isElectron() ? e : void 0;
    function e(t) {
      var n;
      ((n = t == null ? void 0 : t.variables) == null ? void 0 : n.processType) !== "renderer" && (r == null || r.sendIpc(e.eventId, {
        ...t,
        data: i({ logger: o, message: t, transport: e })
      }));
    }
  }
  return be;
}
var Se, st;
function Qt() {
  if (st) return Se;
  st = 1;
  const f = Pt, u = xt, { transform: i } = q(), { removeStyles: a } = xe(), { toJSON: o, maxDepth: r } = Y();
  Se = e;
  function e(t) {
    return Object.assign(n, {
      client: { name: "electron-application" },
      depth: 6,
      level: !1,
      requestOptions: {},
      transforms: [a, o, r],
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
      sendRequestFn({ serverUrl: s, requestOptions: c, body: p }) {
        const h = (s.startsWith("https:") ? u : f).request(s, {
          method: "POST",
          ...c,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": p.length,
            ...c.headers
          }
        });
        return h.write(p), h.end(), h;
      }
    });
    function n(s) {
      if (!n.url)
        return;
      const c = n.makeBodyFn({
        logger: t,
        message: { ...s, data: i({ logger: t, message: s, transport: n }) },
        transport: n
      }), p = n.sendRequestFn({
        serverUrl: n.url,
        requestOptions: n.requestOptions,
        body: Buffer.from(c, "utf8")
      });
      p.on("error", (d) => n.processErrorFn({
        error: d,
        logger: t,
        message: s,
        request: p,
        transport: n
      }));
    }
  }
  return Se;
}
var Oe, ot;
function yt() {
  if (ot) return Oe;
  ot = 1;
  const f = dt(), u = Wt(), i = Bt(), a = Ht(), o = Kt(), r = Gt(), e = Qt();
  Oe = t;
  function t({ dependencies: n, initializeFn: s }) {
    var p;
    const c = new f({
      dependencies: n,
      errorHandler: new u(),
      eventLogger: new i(),
      initializeFn: s,
      isDev: (p = n.externalApi) == null ? void 0 : p.isDev(),
      logId: "default",
      transportFactories: {
        console: a,
        file: o,
        ipc: r,
        remote: e
      },
      variables: {
        processType: "main"
      }
    });
    return c.default = c, c.Logger = f, c.processInternalErrorFn = (d) => {
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
var De, it;
function Xt() {
  if (it) return De;
  it = 1;
  const f = St, u = Ut(), { initialize: i } = zt(), a = yt(), o = new u({ electron: f }), r = a({
    dependencies: { externalApi: o },
    initializeFn: i
  });
  De = r, o.onIpc("__ELECTRON_LOG__", (t, n) => {
    n.scope && r.Logger.getInstance(n).scope(n.scope);
    const s = new Date(n.date);
    e({
      ...n,
      date: s.getTime() ? s : /* @__PURE__ */ new Date()
    });
  }), o.onIpcInvoke("__ELECTRON_LOG__", (t, { cmd: n = "", logId: s }) => {
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
var Ae, at;
function Zt() {
  if (at) return Ae;
  at = 1;
  const f = ht(), u = yt(), i = new f();
  return Ae = u({
    dependencies: { externalApi: i }
  }), Ae;
}
var ct;
function er() {
  if (ct) return U.exports;
  ct = 1;
  const f = typeof process > "u" || process.type === "renderer" || process.type === "worker", u = typeof process == "object" && process.type === "browser";
  return f ? (pt(), U.exports = Vt()) : u ? U.exports = Xt() : U.exports = Zt(), U.exports;
}
var tr = er();
const A = /* @__PURE__ */ ft(tr);
It.config();
const rr = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Required for Vite dev mode
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' http://localhost:* ws://localhost:* wss://* https://api.github.com https://*.27infinity.in https://*.execute-api.ap-south-1.amazonaws.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:"
].join("; "), vt = F.dirname(Ot(import.meta.url));
process.env.APP_ROOT = F.join(vt, "..");
const _e = process.env.VITE_DEV_SERVER_URL, wr = F.join(process.env.APP_ROOT, "dist-electron"), wt = F.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = _e ? F.join(process.env.APP_ROOT, "public") : wt;
let $ = null, z = null, k = null;
function Pe() {
  return z = new Le({
    width: 400,
    height: 300,
    frame: !1,
    transparent: !0,
    alwaysOnTop: !0,
    resizable: !1
  }), z.loadFile(F.join(process.env.VITE_PUBLIC, "splash.html")), $ = new Le({
    show: !1,
    width: 1200,
    height: 800,
    icon: F.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
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
  }), _e ? $.loadURL(_e) : $.loadFile(F.join(wt, "index.html")), $;
}
N.whenReady().then(() => {
  A.transports.file.level = "info", A.info("Logger initialized"), A.info("App version:", N.getVersion()), G.defaultSession.webRequest.onHeadersReceived((e, t) => {
    t({
      responseHeaders: {
        ...e.responseHeaders,
        "Content-Security-Policy": [rr],
        "X-Content-Type-Options": ["nosniff"],
        "X-Frame-Options": ["DENY"],
        "X-XSS-Protection": ["1; mode=block"]
      }
    });
  }), N.on("web-contents-created", (e, t) => {
    t.on("will-navigate", (n, s) => {
      const c = new URL(s);
      c.hostname !== "localhost" && !c.hostname.endsWith("27infinity.in") && (A.warn(`Blocked navigation to: ${s}`), n.preventDefault());
    }), t.setWindowOpenHandler(({ url: n }) => {
      const s = new URL(n);
      return s.hostname.endsWith("27infinity.in") || s.hostname === "github.com" ? Q.openExternal(n) : A.warn(`Blocked popup to: ${n}`), { action: "deny" };
    });
  }), G.defaultSession.setPermissionRequestHandler((e, t, n) => {
    ["media", "microphone", "audioCapture"].includes(t) ? (A.info(`Permission granted: ${t}`), n(!0)) : (A.info(`Permission denied: ${t}`), n(!1));
  }), G.defaultSession.setPermissionCheckHandler((e, t) => ["media", "microphone", "audioCapture"].includes(t));
  const f = Pe(), u = process.platform === "darwin" ? "Command+R" : "Control+R";
  lt.register(u, () => {
    A.info("Refresh shortcut triggered - clearing storage and reloading"), f && !f.isDestroyed() && f.webContents.send("clear-storage-and-reload");
  }) ? A.info(`Refresh shortcut registered: ${u}`) : A.error(`Failed to register refresh shortcut: ${u}`);
  const a = () => {
    const e = "https://27infinity.in/products";
    return process.platform === "darwin" ? process.arch === "arm64" ? `${e}?download=mac-arm64` : `${e}?download=mac-intel` : process.platform === "win32" ? process.arch === "x64" || process.arch === "arm64" ? `${e}?download=win64` : `${e}?download=win32` : e;
  }, o = async () => {
    try {
      const e = await fetch(
        "https://api.github.com/repos/gopalsingh2727/Diamond-Polymers/releases/latest"
      );
      if (!e.ok)
        throw new Error(`GitHub API error: ${e.status}`);
      const t = await e.json(), n = t.tag_name.replace("v", ""), s = N.getVersion(), c = n !== s && n.localeCompare(s, void 0, { numeric: !0 }) > 0;
      return {
        version: s,
        newVersion: n,
        update: c,
        releaseNotes: t.body || ""
      };
    } catch (e) {
      return A.error("Update check failed:", e.message), {
        error: {
          message: e.message || "Failed to check for updates"
        },
        version: N.getVersion()
      };
    }
  };
  setTimeout(async () => {
    const e = await o();
    if (e.update) {
      if (A.info("Update available:", e.newVersion), $e.isSupported()) {
        const t = new $e({
          title: "Update Available",
          body: `Version ${e.newVersion} is available. Click to download.`,
          icon: F.join(process.env.VITE_PUBLIC, "electron-vite.svg")
        });
        t.on("click", () => {
          Q.openExternal(a());
        }), t.show();
      }
      f == null || f.webContents.send("update-can-available", e);
    }
  }, 3e3), H.handle("check-update", async () => await o()), H.handle("open-download-page", async () => {
    try {
      const e = a();
      return A.info("Opening download URL:", e), await Q.openExternal(e), { success: !0 };
    } catch (e) {
      return A.error("Failed to open download page:", e.message), { success: !1, error: e.message };
    }
  });
  const r = async () => {
    try {
      const e = await fetch(
        "https://api.github.com/repos/gopalsingh2727/Diamond-Polymers/releases/latest"
      );
      if (!e.ok)
        throw new Error(`GitHub API error: ${e.status}`);
      const n = (await e.json()).assets || [];
      let s = null;
      return process.platform === "win32" ? process.arch === "x64" || process.arch === "arm64" ? s = n.find(
        (c) => c.name.endsWith(".exe") && !c.name.includes("ia32")
      ) : s = n.find(
        (c) => c.name.endsWith(".exe") && c.name.includes("ia32")
      ) : process.platform === "darwin" && (process.arch === "arm64" ? s = n.find(
        (c) => c.name.includes("arm64") && c.name.endsWith(".dmg")
      ) : s = n.find(
        (c) => c.name.includes("x64") && c.name.endsWith(".dmg")
      ) || n.find(
        (c) => c.name.endsWith(".dmg") && !c.name.includes("arm64")
      )), s ? {
        url: s.browser_download_url,
        filename: s.name
      } : null;
    } catch (e) {
      return A.error("Failed to get installer URL:", e.message), null;
    }
  };
  H.handle("download-update", async () => {
    var e;
    try {
      const t = await r();
      if (!t)
        return { success: !1, error: "No installer found for your platform" };
      A.info("Downloading installer:", t.url);
      const n = F.join(Dt.tmpdir(), "27-manufacturing-update");
      J.existsSync(n) || J.mkdirSync(n, { recursive: !0 });
      const s = F.join(n, t.filename), c = await fetch(t.url);
      if (!c.ok)
        throw new Error(`Download failed: ${c.status}`);
      const p = parseInt(c.headers.get("content-length") || "0", 10);
      let d = 0;
      const h = J.createWriteStream(s), L = (e = c.body) == null ? void 0 : e.getReader();
      if (!L)
        throw new Error("Failed to get response reader");
      for (; ; ) {
        const { done: b, value: y } = await L.read();
        if (b) break;
        h.write(y), d += y.length;
        const _ = p > 0 ? Math.round(d / p * 100) : 0;
        f == null || f.webContents.send("download-progress", {
          progress: _,
          downloaded: d,
          total: p
        });
      }
      return h.end(), await new Promise((b) => h.on("finish", b)), k = s, A.info("Download complete:", s), {
        success: !0,
        filePath: s,
        filename: t.filename
      };
    } catch (t) {
      return A.error("Download failed:", t.message), { success: !1, error: t.message };
    }
  }), H.handle("install-update", async () => {
    try {
      return !k || !J.existsSync(k) ? { success: !1, error: "No downloaded installer found" } : (A.info("Installing update from:", k), process.platform === "win32" ? Ne(k, [], {
        detached: !0,
        stdio: "ignore"
      }).unref() : process.platform === "darwin" && Ne("open", [k], {
        detached: !0,
        stdio: "ignore"
      }).unref(), setTimeout(() => {
        N.quit();
      }, 1e3), { success: !0 });
    } catch (e) {
      return A.error("Installation failed:", e.message), { success: !1, error: e.message };
    }
  });
});
N.on("window-all-closed", () => {
  process.platform !== "darwin" && (N.quit(), $ = null);
});
N.on("activate", () => {
  Le.getAllWindows().length === 0 && (N.isReady() ? Pe() : N.whenReady().then(Pe));
});
N.on("will-quit", () => {
  lt.unregisterAll(), A.info("All global shortcuts unregistered");
});
console.log(`App root: ${process.env.APP_ROOT}`);
export {
  wr as MAIN_DIST,
  wt as RENDERER_DIST,
  _e as VITE_DEV_SERVER_URL
};
