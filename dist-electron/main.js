import bt, { app as $r, BrowserWindow as Tl, ipcMain as Xr } from "electron";
import pt from "fs";
import nc from "constants";
import hr from "stream";
import Ji from "util";
import Cl from "assert";
import Ie from "path";
import kr from "child_process";
import bl from "events";
import pr from "crypto";
import Ol from "tty";
import qr from "os";
import $t from "url";
import ic from "string_decoder";
import Pl from "zlib";
import ac from "http";
import { fileURLToPath as oc } from "node:url";
import ht from "node:path";
var Ze = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, St = {}, Kr = {}, Rr = {}, Aa;
function Ye() {
  return Aa || (Aa = 1, Rr.fromCallback = function(r) {
    return Object.defineProperty(function(...d) {
      if (typeof d[d.length - 1] == "function") r.apply(this, d);
      else
        return new Promise((h, u) => {
          d.push((c, l) => c != null ? u(c) : h(l)), r.apply(this, d);
        });
    }, "name", { value: r.name });
  }, Rr.fromPromise = function(r) {
    return Object.defineProperty(function(...d) {
      const h = d[d.length - 1];
      if (typeof h != "function") return r.apply(this, d);
      d.pop(), r.apply(this, d).then((u) => h(null, u), h);
    }, "name", { value: r.name });
  }), Rr;
}
var Jr, Ra;
function sc() {
  if (Ra) return Jr;
  Ra = 1;
  var r = nc, d = process.cwd, h = null, u = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    return h || (h = d.call(process)), h;
  };
  try {
    process.cwd();
  } catch {
  }
  if (typeof process.chdir == "function") {
    var c = process.chdir;
    process.chdir = function(i) {
      h = null, c.call(process, i);
    }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, c);
  }
  Jr = l;
  function l(i) {
    r.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && f(i), i.lutimes || n(i), i.chown = s(i.chown), i.fchown = s(i.fchown), i.lchown = s(i.lchown), i.chmod = o(i.chmod), i.fchmod = o(i.fchmod), i.lchmod = o(i.lchmod), i.chownSync = t(i.chownSync), i.fchownSync = t(i.fchownSync), i.lchownSync = t(i.lchownSync), i.chmodSync = a(i.chmodSync), i.fchmodSync = a(i.fchmodSync), i.lchmodSync = a(i.lchmodSync), i.stat = m(i.stat), i.fstat = m(i.fstat), i.lstat = m(i.lstat), i.statSync = v(i.statSync), i.fstatSync = v(i.fstatSync), i.lstatSync = v(i.lstatSync), i.chmod && !i.lchmod && (i.lchmod = function(p, S, T) {
      T && process.nextTick(T);
    }, i.lchmodSync = function() {
    }), i.chown && !i.lchown && (i.lchown = function(p, S, T, O) {
      O && process.nextTick(O);
    }, i.lchownSync = function() {
    }), u === "win32" && (i.rename = typeof i.rename != "function" ? i.rename : function(p) {
      function S(T, O, P) {
        var M = Date.now(), C = 0;
        p(T, O, function A(R) {
          if (R && (R.code === "EACCES" || R.code === "EPERM" || R.code === "EBUSY") && Date.now() - M < 6e4) {
            setTimeout(function() {
              i.stat(O, function(y, q) {
                y && y.code === "ENOENT" ? p(T, O, A) : P(R);
              });
            }, C), C < 100 && (C += 10);
            return;
          }
          P && P(R);
        });
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(S, p), S;
    }(i.rename)), i.read = typeof i.read != "function" ? i.read : function(p) {
      function S(T, O, P, M, C, A) {
        var R;
        if (A && typeof A == "function") {
          var y = 0;
          R = function(q, U, L) {
            if (q && q.code === "EAGAIN" && y < 10)
              return y++, p.call(i, T, O, P, M, C, R);
            A.apply(this, arguments);
          };
        }
        return p.call(i, T, O, P, M, C, R);
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(S, p), S;
    }(i.read), i.readSync = typeof i.readSync != "function" ? i.readSync : /* @__PURE__ */ function(p) {
      return function(S, T, O, P, M) {
        for (var C = 0; ; )
          try {
            return p.call(i, S, T, O, P, M);
          } catch (A) {
            if (A.code === "EAGAIN" && C < 10) {
              C++;
              continue;
            }
            throw A;
          }
      };
    }(i.readSync);
    function f(p) {
      p.lchmod = function(S, T, O) {
        p.open(
          S,
          r.O_WRONLY | r.O_SYMLINK,
          T,
          function(P, M) {
            if (P) {
              O && O(P);
              return;
            }
            p.fchmod(M, T, function(C) {
              p.close(M, function(A) {
                O && O(C || A);
              });
            });
          }
        );
      }, p.lchmodSync = function(S, T) {
        var O = p.openSync(S, r.O_WRONLY | r.O_SYMLINK, T), P = !0, M;
        try {
          M = p.fchmodSync(O, T), P = !1;
        } finally {
          if (P)
            try {
              p.closeSync(O);
            } catch {
            }
          else
            p.closeSync(O);
        }
        return M;
      };
    }
    function n(p) {
      r.hasOwnProperty("O_SYMLINK") && p.futimes ? (p.lutimes = function(S, T, O, P) {
        p.open(S, r.O_SYMLINK, function(M, C) {
          if (M) {
            P && P(M);
            return;
          }
          p.futimes(C, T, O, function(A) {
            p.close(C, function(R) {
              P && P(A || R);
            });
          });
        });
      }, p.lutimesSync = function(S, T, O) {
        var P = p.openSync(S, r.O_SYMLINK), M, C = !0;
        try {
          M = p.futimesSync(P, T, O), C = !1;
        } finally {
          if (C)
            try {
              p.closeSync(P);
            } catch {
            }
          else
            p.closeSync(P);
        }
        return M;
      }) : p.futimes && (p.lutimes = function(S, T, O, P) {
        P && process.nextTick(P);
      }, p.lutimesSync = function() {
      });
    }
    function o(p) {
      return p && function(S, T, O) {
        return p.call(i, S, T, function(P) {
          E(P) && (P = null), O && O.apply(this, arguments);
        });
      };
    }
    function a(p) {
      return p && function(S, T) {
        try {
          return p.call(i, S, T);
        } catch (O) {
          if (!E(O)) throw O;
        }
      };
    }
    function s(p) {
      return p && function(S, T, O, P) {
        return p.call(i, S, T, O, function(M) {
          E(M) && (M = null), P && P.apply(this, arguments);
        });
      };
    }
    function t(p) {
      return p && function(S, T, O) {
        try {
          return p.call(i, S, T, O);
        } catch (P) {
          if (!E(P)) throw P;
        }
      };
    }
    function m(p) {
      return p && function(S, T, O) {
        typeof T == "function" && (O = T, T = null);
        function P(M, C) {
          C && (C.uid < 0 && (C.uid += 4294967296), C.gid < 0 && (C.gid += 4294967296)), O && O.apply(this, arguments);
        }
        return T ? p.call(i, S, T, P) : p.call(i, S, P);
      };
    }
    function v(p) {
      return p && function(S, T) {
        var O = T ? p.call(i, S, T) : p.call(i, S);
        return O && (O.uid < 0 && (O.uid += 4294967296), O.gid < 0 && (O.gid += 4294967296)), O;
      };
    }
    function E(p) {
      if (!p || p.code === "ENOSYS")
        return !0;
      var S = !process.getuid || process.getuid() !== 0;
      return !!(S && (p.code === "EINVAL" || p.code === "EPERM"));
    }
  }
  return Jr;
}
var Qr, Ta;
function lc() {
  if (Ta) return Qr;
  Ta = 1;
  var r = hr.Stream;
  Qr = d;
  function d(h) {
    return {
      ReadStream: u,
      WriteStream: c
    };
    function u(l, i) {
      if (!(this instanceof u)) return new u(l, i);
      r.call(this);
      var f = this;
      this.path = l, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, i = i || {};
      for (var n = Object.keys(i), o = 0, a = n.length; o < a; o++) {
        var s = n[o];
        this[s] = i[s];
      }
      if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.end === void 0)
          this.end = 1 / 0;
        else if (typeof this.end != "number")
          throw TypeError("end must be a Number");
        if (this.start > this.end)
          throw new Error("start must be <= end");
        this.pos = this.start;
      }
      if (this.fd !== null) {
        process.nextTick(function() {
          f._read();
        });
        return;
      }
      h.open(this.path, this.flags, this.mode, function(t, m) {
        if (t) {
          f.emit("error", t), f.readable = !1;
          return;
        }
        f.fd = m, f.emit("open", m), f._read();
      });
    }
    function c(l, i) {
      if (!(this instanceof c)) return new c(l, i);
      r.call(this), this.path = l, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, i = i || {};
      for (var f = Object.keys(i), n = 0, o = f.length; n < o; n++) {
        var a = f[n];
        this[a] = i[a];
      }
      if (this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.start < 0)
          throw new Error("start must be >= zero");
        this.pos = this.start;
      }
      this.busy = !1, this._queue = [], this.fd === null && (this._open = h.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
    }
  }
  return Qr;
}
var Zr, Ca;
function uc() {
  if (Ca) return Zr;
  Ca = 1, Zr = d;
  var r = Object.getPrototypeOf || function(h) {
    return h.__proto__;
  };
  function d(h) {
    if (h === null || typeof h != "object")
      return h;
    if (h instanceof Object)
      var u = { __proto__: r(h) };
    else
      var u = /* @__PURE__ */ Object.create(null);
    return Object.getOwnPropertyNames(h).forEach(function(c) {
      Object.defineProperty(u, c, Object.getOwnPropertyDescriptor(h, c));
    }), u;
  }
  return Zr;
}
var Tr, ba;
function We() {
  if (ba) return Tr;
  ba = 1;
  var r = pt, d = sc(), h = lc(), u = uc(), c = Ji, l, i;
  typeof Symbol == "function" && typeof Symbol.for == "function" ? (l = Symbol.for("graceful-fs.queue"), i = Symbol.for("graceful-fs.previous")) : (l = "___graceful-fs.queue", i = "___graceful-fs.previous");
  function f() {
  }
  function n(p, S) {
    Object.defineProperty(p, l, {
      get: function() {
        return S;
      }
    });
  }
  var o = f;
  if (c.debuglog ? o = c.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (o = function() {
    var p = c.format.apply(c, arguments);
    p = "GFS4: " + p.split(/\n/).join(`
GFS4: `), console.error(p);
  }), !r[l]) {
    var a = Ze[l] || [];
    n(r, a), r.close = function(p) {
      function S(T, O) {
        return p.call(r, T, function(P) {
          P || v(), typeof O == "function" && O.apply(this, arguments);
        });
      }
      return Object.defineProperty(S, i, {
        value: p
      }), S;
    }(r.close), r.closeSync = function(p) {
      function S(T) {
        p.apply(r, arguments), v();
      }
      return Object.defineProperty(S, i, {
        value: p
      }), S;
    }(r.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
      o(r[l]), Cl.equal(r[l].length, 0);
    });
  }
  Ze[l] || n(Ze, r[l]), Tr = s(u(r)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !r.__patched && (Tr = s(r), r.__patched = !0);
  function s(p) {
    d(p), p.gracefulify = s, p.createReadStream = ce, p.createWriteStream = ue;
    var S = p.readFile;
    p.readFile = T;
    function T(K, Ee, _) {
      return typeof Ee == "function" && (_ = Ee, Ee = null), g(K, Ee, _);
      function g(H, D, le, me) {
        return S(H, D, function(pe) {
          pe && (pe.code === "EMFILE" || pe.code === "ENFILE") ? t([g, [H, D, le], pe, me || Date.now(), Date.now()]) : typeof le == "function" && le.apply(this, arguments);
        });
      }
    }
    var O = p.writeFile;
    p.writeFile = P;
    function P(K, Ee, _, g) {
      return typeof _ == "function" && (g = _, _ = null), H(K, Ee, _, g);
      function H(D, le, me, pe, _e) {
        return O(D, le, me, function(ye) {
          ye && (ye.code === "EMFILE" || ye.code === "ENFILE") ? t([H, [D, le, me, pe], ye, _e || Date.now(), Date.now()]) : typeof pe == "function" && pe.apply(this, arguments);
        });
      }
    }
    var M = p.appendFile;
    M && (p.appendFile = C);
    function C(K, Ee, _, g) {
      return typeof _ == "function" && (g = _, _ = null), H(K, Ee, _, g);
      function H(D, le, me, pe, _e) {
        return M(D, le, me, function(ye) {
          ye && (ye.code === "EMFILE" || ye.code === "ENFILE") ? t([H, [D, le, me, pe], ye, _e || Date.now(), Date.now()]) : typeof pe == "function" && pe.apply(this, arguments);
        });
      }
    }
    var A = p.copyFile;
    A && (p.copyFile = R);
    function R(K, Ee, _, g) {
      return typeof _ == "function" && (g = _, _ = 0), H(K, Ee, _, g);
      function H(D, le, me, pe, _e) {
        return A(D, le, me, function(ye) {
          ye && (ye.code === "EMFILE" || ye.code === "ENFILE") ? t([H, [D, le, me, pe], ye, _e || Date.now(), Date.now()]) : typeof pe == "function" && pe.apply(this, arguments);
        });
      }
    }
    var y = p.readdir;
    p.readdir = U;
    var q = /^v[0-5]\./;
    function U(K, Ee, _) {
      typeof Ee == "function" && (_ = Ee, Ee = null);
      var g = q.test(process.version) ? function(le, me, pe, _e) {
        return y(le, H(
          le,
          me,
          pe,
          _e
        ));
      } : function(le, me, pe, _e) {
        return y(le, me, H(
          le,
          me,
          pe,
          _e
        ));
      };
      return g(K, Ee, _);
      function H(D, le, me, pe) {
        return function(_e, ye) {
          _e && (_e.code === "EMFILE" || _e.code === "ENFILE") ? t([
            g,
            [D, le, me],
            _e,
            pe || Date.now(),
            Date.now()
          ]) : (ye && ye.sort && ye.sort(), typeof me == "function" && me.call(this, _e, ye));
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var L = h(p);
      $ = L.ReadStream, W = L.WriteStream;
    }
    var k = p.ReadStream;
    k && ($.prototype = Object.create(k.prototype), $.prototype.open = J);
    var N = p.WriteStream;
    N && (W.prototype = Object.create(N.prototype), W.prototype.open = ne), Object.defineProperty(p, "ReadStream", {
      get: function() {
        return $;
      },
      set: function(K) {
        $ = K;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(p, "WriteStream", {
      get: function() {
        return W;
      },
      set: function(K) {
        W = K;
      },
      enumerable: !0,
      configurable: !0
    });
    var I = $;
    Object.defineProperty(p, "FileReadStream", {
      get: function() {
        return I;
      },
      set: function(K) {
        I = K;
      },
      enumerable: !0,
      configurable: !0
    });
    var F = W;
    Object.defineProperty(p, "FileWriteStream", {
      get: function() {
        return F;
      },
      set: function(K) {
        F = K;
      },
      enumerable: !0,
      configurable: !0
    });
    function $(K, Ee) {
      return this instanceof $ ? (k.apply(this, arguments), this) : $.apply(Object.create($.prototype), arguments);
    }
    function J() {
      var K = this;
      Ae(K.path, K.flags, K.mode, function(Ee, _) {
        Ee ? (K.autoClose && K.destroy(), K.emit("error", Ee)) : (K.fd = _, K.emit("open", _), K.read());
      });
    }
    function W(K, Ee) {
      return this instanceof W ? (N.apply(this, arguments), this) : W.apply(Object.create(W.prototype), arguments);
    }
    function ne() {
      var K = this;
      Ae(K.path, K.flags, K.mode, function(Ee, _) {
        Ee ? (K.destroy(), K.emit("error", Ee)) : (K.fd = _, K.emit("open", _));
      });
    }
    function ce(K, Ee) {
      return new p.ReadStream(K, Ee);
    }
    function ue(K, Ee) {
      return new p.WriteStream(K, Ee);
    }
    var ie = p.open;
    p.open = Ae;
    function Ae(K, Ee, _, g) {
      return typeof _ == "function" && (g = _, _ = null), H(K, Ee, _, g);
      function H(D, le, me, pe, _e) {
        return ie(D, le, me, function(ye, xe) {
          ye && (ye.code === "EMFILE" || ye.code === "ENFILE") ? t([H, [D, le, me, pe], ye, _e || Date.now(), Date.now()]) : typeof pe == "function" && pe.apply(this, arguments);
        });
      }
    }
    return p;
  }
  function t(p) {
    o("ENQUEUE", p[0].name, p[1]), r[l].push(p), E();
  }
  var m;
  function v() {
    for (var p = Date.now(), S = 0; S < r[l].length; ++S)
      r[l][S].length > 2 && (r[l][S][3] = p, r[l][S][4] = p);
    E();
  }
  function E() {
    if (clearTimeout(m), m = void 0, r[l].length !== 0) {
      var p = r[l].shift(), S = p[0], T = p[1], O = p[2], P = p[3], M = p[4];
      if (P === void 0)
        o("RETRY", S.name, T), S.apply(null, T);
      else if (Date.now() - P >= 6e4) {
        o("TIMEOUT", S.name, T);
        var C = T.pop();
        typeof C == "function" && C.call(null, O);
      } else {
        var A = Date.now() - M, R = Math.max(M - P, 1), y = Math.min(R * 1.2, 100);
        A >= y ? (o("RETRY", S.name, T), S.apply(null, T.concat([P]))) : r[l].push(p);
      }
      m === void 0 && (m = setTimeout(E, 0));
    }
  }
  return Tr;
}
var Oa;
function kt() {
  return Oa || (Oa = 1, function(r) {
    const d = Ye().fromCallback, h = We(), u = [
      "access",
      "appendFile",
      "chmod",
      "chown",
      "close",
      "copyFile",
      "fchmod",
      "fchown",
      "fdatasync",
      "fstat",
      "fsync",
      "ftruncate",
      "futimes",
      "lchmod",
      "lchown",
      "link",
      "lstat",
      "mkdir",
      "mkdtemp",
      "open",
      "opendir",
      "readdir",
      "readFile",
      "readlink",
      "realpath",
      "rename",
      "rm",
      "rmdir",
      "stat",
      "symlink",
      "truncate",
      "unlink",
      "utimes",
      "writeFile"
    ].filter((c) => typeof h[c] == "function");
    Object.assign(r, h), u.forEach((c) => {
      r[c] = d(h[c]);
    }), r.exists = function(c, l) {
      return typeof l == "function" ? h.exists(c, l) : new Promise((i) => h.exists(c, i));
    }, r.read = function(c, l, i, f, n, o) {
      return typeof o == "function" ? h.read(c, l, i, f, n, o) : new Promise((a, s) => {
        h.read(c, l, i, f, n, (t, m, v) => {
          if (t) return s(t);
          a({ bytesRead: m, buffer: v });
        });
      });
    }, r.write = function(c, l, ...i) {
      return typeof i[i.length - 1] == "function" ? h.write(c, l, ...i) : new Promise((f, n) => {
        h.write(c, l, ...i, (o, a, s) => {
          if (o) return n(o);
          f({ bytesWritten: a, buffer: s });
        });
      });
    }, typeof h.writev == "function" && (r.writev = function(c, l, ...i) {
      return typeof i[i.length - 1] == "function" ? h.writev(c, l, ...i) : new Promise((f, n) => {
        h.writev(c, l, ...i, (o, a, s) => {
          if (o) return n(o);
          f({ bytesWritten: a, buffers: s });
        });
      });
    }), typeof h.realpath.native == "function" ? r.realpath.native = d(h.realpath.native) : process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  }(Kr)), Kr;
}
var Cr = {}, en = {}, Pa;
function cc() {
  if (Pa) return en;
  Pa = 1;
  const r = Ie;
  return en.checkPath = function(h) {
    if (process.platform === "win32" && /[<>:"|?*]/.test(h.replace(r.parse(h).root, ""))) {
      const c = new Error(`Path contains invalid characters: ${h}`);
      throw c.code = "EINVAL", c;
    }
  }, en;
}
var Ia;
function fc() {
  if (Ia) return Cr;
  Ia = 1;
  const r = /* @__PURE__ */ kt(), { checkPath: d } = /* @__PURE__ */ cc(), h = (u) => {
    const c = { mode: 511 };
    return typeof u == "number" ? u : { ...c, ...u }.mode;
  };
  return Cr.makeDir = async (u, c) => (d(u), r.mkdir(u, {
    mode: h(c),
    recursive: !0
  })), Cr.makeDirSync = (u, c) => (d(u), r.mkdirSync(u, {
    mode: h(c),
    recursive: !0
  })), Cr;
}
var tn, Da;
function rt() {
  if (Da) return tn;
  Da = 1;
  const r = Ye().fromPromise, { makeDir: d, makeDirSync: h } = /* @__PURE__ */ fc(), u = r(d);
  return tn = {
    mkdirs: u,
    mkdirsSync: h,
    // alias
    mkdirp: u,
    mkdirpSync: h,
    ensureDir: u,
    ensureDirSync: h
  }, tn;
}
var rn, Na;
function Ot() {
  if (Na) return rn;
  Na = 1;
  const r = Ye().fromPromise, d = /* @__PURE__ */ kt();
  function h(u) {
    return d.access(u).then(() => !0).catch(() => !1);
  }
  return rn = {
    pathExists: r(h),
    pathExistsSync: d.existsSync
  }, rn;
}
var nn, Fa;
function Il() {
  if (Fa) return nn;
  Fa = 1;
  const r = We();
  function d(u, c, l, i) {
    r.open(u, "r+", (f, n) => {
      if (f) return i(f);
      r.futimes(n, c, l, (o) => {
        r.close(n, (a) => {
          i && i(o || a);
        });
      });
    });
  }
  function h(u, c, l) {
    const i = r.openSync(u, "r+");
    return r.futimesSync(i, c, l), r.closeSync(i);
  }
  return nn = {
    utimesMillis: d,
    utimesMillisSync: h
  }, nn;
}
var an, xa;
function qt() {
  if (xa) return an;
  xa = 1;
  const r = /* @__PURE__ */ kt(), d = Ie, h = Ji;
  function u(t, m, v) {
    const E = v.dereference ? (p) => r.stat(p, { bigint: !0 }) : (p) => r.lstat(p, { bigint: !0 });
    return Promise.all([
      E(t),
      E(m).catch((p) => {
        if (p.code === "ENOENT") return null;
        throw p;
      })
    ]).then(([p, S]) => ({ srcStat: p, destStat: S }));
  }
  function c(t, m, v) {
    let E;
    const p = v.dereference ? (T) => r.statSync(T, { bigint: !0 }) : (T) => r.lstatSync(T, { bigint: !0 }), S = p(t);
    try {
      E = p(m);
    } catch (T) {
      if (T.code === "ENOENT") return { srcStat: S, destStat: null };
      throw T;
    }
    return { srcStat: S, destStat: E };
  }
  function l(t, m, v, E, p) {
    h.callbackify(u)(t, m, E, (S, T) => {
      if (S) return p(S);
      const { srcStat: O, destStat: P } = T;
      if (P) {
        if (o(O, P)) {
          const M = d.basename(t), C = d.basename(m);
          return v === "move" && M !== C && M.toLowerCase() === C.toLowerCase() ? p(null, { srcStat: O, destStat: P, isChangingCase: !0 }) : p(new Error("Source and destination must not be the same."));
        }
        if (O.isDirectory() && !P.isDirectory())
          return p(new Error(`Cannot overwrite non-directory '${m}' with directory '${t}'.`));
        if (!O.isDirectory() && P.isDirectory())
          return p(new Error(`Cannot overwrite directory '${m}' with non-directory '${t}'.`));
      }
      return O.isDirectory() && a(t, m) ? p(new Error(s(t, m, v))) : p(null, { srcStat: O, destStat: P });
    });
  }
  function i(t, m, v, E) {
    const { srcStat: p, destStat: S } = c(t, m, E);
    if (S) {
      if (o(p, S)) {
        const T = d.basename(t), O = d.basename(m);
        if (v === "move" && T !== O && T.toLowerCase() === O.toLowerCase())
          return { srcStat: p, destStat: S, isChangingCase: !0 };
        throw new Error("Source and destination must not be the same.");
      }
      if (p.isDirectory() && !S.isDirectory())
        throw new Error(`Cannot overwrite non-directory '${m}' with directory '${t}'.`);
      if (!p.isDirectory() && S.isDirectory())
        throw new Error(`Cannot overwrite directory '${m}' with non-directory '${t}'.`);
    }
    if (p.isDirectory() && a(t, m))
      throw new Error(s(t, m, v));
    return { srcStat: p, destStat: S };
  }
  function f(t, m, v, E, p) {
    const S = d.resolve(d.dirname(t)), T = d.resolve(d.dirname(v));
    if (T === S || T === d.parse(T).root) return p();
    r.stat(T, { bigint: !0 }, (O, P) => O ? O.code === "ENOENT" ? p() : p(O) : o(m, P) ? p(new Error(s(t, v, E))) : f(t, m, T, E, p));
  }
  function n(t, m, v, E) {
    const p = d.resolve(d.dirname(t)), S = d.resolve(d.dirname(v));
    if (S === p || S === d.parse(S).root) return;
    let T;
    try {
      T = r.statSync(S, { bigint: !0 });
    } catch (O) {
      if (O.code === "ENOENT") return;
      throw O;
    }
    if (o(m, T))
      throw new Error(s(t, v, E));
    return n(t, m, S, E);
  }
  function o(t, m) {
    return m.ino && m.dev && m.ino === t.ino && m.dev === t.dev;
  }
  function a(t, m) {
    const v = d.resolve(t).split(d.sep).filter((p) => p), E = d.resolve(m).split(d.sep).filter((p) => p);
    return v.reduce((p, S, T) => p && E[T] === S, !0);
  }
  function s(t, m, v) {
    return `Cannot ${v} '${t}' to a subdirectory of itself, '${m}'.`;
  }
  return an = {
    checkPaths: l,
    checkPathsSync: i,
    checkParentPaths: f,
    checkParentPathsSync: n,
    isSrcSubdir: a,
    areIdentical: o
  }, an;
}
var on, La;
function dc() {
  if (La) return on;
  La = 1;
  const r = We(), d = Ie, h = rt().mkdirs, u = Ot().pathExists, c = Il().utimesMillis, l = /* @__PURE__ */ qt();
  function i(U, L, k, N) {
    typeof k == "function" && !N ? (N = k, k = {}) : typeof k == "function" && (k = { filter: k }), N = N || function() {
    }, k = k || {}, k.clobber = "clobber" in k ? !!k.clobber : !0, k.overwrite = "overwrite" in k ? !!k.overwrite : k.clobber, k.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0001"
    ), l.checkPaths(U, L, "copy", k, (I, F) => {
      if (I) return N(I);
      const { srcStat: $, destStat: J } = F;
      l.checkParentPaths(U, $, L, "copy", (W) => W ? N(W) : k.filter ? n(f, J, U, L, k, N) : f(J, U, L, k, N));
    });
  }
  function f(U, L, k, N, I) {
    const F = d.dirname(k);
    u(F, ($, J) => {
      if ($) return I($);
      if (J) return a(U, L, k, N, I);
      h(F, (W) => W ? I(W) : a(U, L, k, N, I));
    });
  }
  function n(U, L, k, N, I, F) {
    Promise.resolve(I.filter(k, N)).then(($) => $ ? U(L, k, N, I, F) : F(), ($) => F($));
  }
  function o(U, L, k, N, I) {
    return N.filter ? n(a, U, L, k, N, I) : a(U, L, k, N, I);
  }
  function a(U, L, k, N, I) {
    (N.dereference ? r.stat : r.lstat)(L, ($, J) => $ ? I($) : J.isDirectory() ? P(J, U, L, k, N, I) : J.isFile() || J.isCharacterDevice() || J.isBlockDevice() ? s(J, U, L, k, N, I) : J.isSymbolicLink() ? y(U, L, k, N, I) : J.isSocket() ? I(new Error(`Cannot copy a socket file: ${L}`)) : J.isFIFO() ? I(new Error(`Cannot copy a FIFO pipe: ${L}`)) : I(new Error(`Unknown file: ${L}`)));
  }
  function s(U, L, k, N, I, F) {
    return L ? t(U, k, N, I, F) : m(U, k, N, I, F);
  }
  function t(U, L, k, N, I) {
    if (N.overwrite)
      r.unlink(k, (F) => F ? I(F) : m(U, L, k, N, I));
    else return N.errorOnExist ? I(new Error(`'${k}' already exists`)) : I();
  }
  function m(U, L, k, N, I) {
    r.copyFile(L, k, (F) => F ? I(F) : N.preserveTimestamps ? v(U.mode, L, k, I) : T(k, U.mode, I));
  }
  function v(U, L, k, N) {
    return E(U) ? p(k, U, (I) => I ? N(I) : S(U, L, k, N)) : S(U, L, k, N);
  }
  function E(U) {
    return (U & 128) === 0;
  }
  function p(U, L, k) {
    return T(U, L | 128, k);
  }
  function S(U, L, k, N) {
    O(L, k, (I) => I ? N(I) : T(k, U, N));
  }
  function T(U, L, k) {
    return r.chmod(U, L, k);
  }
  function O(U, L, k) {
    r.stat(U, (N, I) => N ? k(N) : c(L, I.atime, I.mtime, k));
  }
  function P(U, L, k, N, I, F) {
    return L ? C(k, N, I, F) : M(U.mode, k, N, I, F);
  }
  function M(U, L, k, N, I) {
    r.mkdir(k, (F) => {
      if (F) return I(F);
      C(L, k, N, ($) => $ ? I($) : T(k, U, I));
    });
  }
  function C(U, L, k, N) {
    r.readdir(U, (I, F) => I ? N(I) : A(F, U, L, k, N));
  }
  function A(U, L, k, N, I) {
    const F = U.pop();
    return F ? R(U, F, L, k, N, I) : I();
  }
  function R(U, L, k, N, I, F) {
    const $ = d.join(k, L), J = d.join(N, L);
    l.checkPaths($, J, "copy", I, (W, ne) => {
      if (W) return F(W);
      const { destStat: ce } = ne;
      o(ce, $, J, I, (ue) => ue ? F(ue) : A(U, k, N, I, F));
    });
  }
  function y(U, L, k, N, I) {
    r.readlink(L, (F, $) => {
      if (F) return I(F);
      if (N.dereference && ($ = d.resolve(process.cwd(), $)), U)
        r.readlink(k, (J, W) => J ? J.code === "EINVAL" || J.code === "UNKNOWN" ? r.symlink($, k, I) : I(J) : (N.dereference && (W = d.resolve(process.cwd(), W)), l.isSrcSubdir($, W) ? I(new Error(`Cannot copy '${$}' to a subdirectory of itself, '${W}'.`)) : U.isDirectory() && l.isSrcSubdir(W, $) ? I(new Error(`Cannot overwrite '${W}' with '${$}'.`)) : q($, k, I)));
      else
        return r.symlink($, k, I);
    });
  }
  function q(U, L, k) {
    r.unlink(L, (N) => N ? k(N) : r.symlink(U, L, k));
  }
  return on = i, on;
}
var sn, Ua;
function hc() {
  if (Ua) return sn;
  Ua = 1;
  const r = We(), d = Ie, h = rt().mkdirsSync, u = Il().utimesMillisSync, c = /* @__PURE__ */ qt();
  function l(A, R, y) {
    typeof y == "function" && (y = { filter: y }), y = y || {}, y.clobber = "clobber" in y ? !!y.clobber : !0, y.overwrite = "overwrite" in y ? !!y.overwrite : y.clobber, y.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0002"
    );
    const { srcStat: q, destStat: U } = c.checkPathsSync(A, R, "copy", y);
    return c.checkParentPathsSync(A, q, R, "copy"), i(U, A, R, y);
  }
  function i(A, R, y, q) {
    if (q.filter && !q.filter(R, y)) return;
    const U = d.dirname(y);
    return r.existsSync(U) || h(U), n(A, R, y, q);
  }
  function f(A, R, y, q) {
    if (!(q.filter && !q.filter(R, y)))
      return n(A, R, y, q);
  }
  function n(A, R, y, q) {
    const L = (q.dereference ? r.statSync : r.lstatSync)(R);
    if (L.isDirectory()) return S(L, A, R, y, q);
    if (L.isFile() || L.isCharacterDevice() || L.isBlockDevice()) return o(L, A, R, y, q);
    if (L.isSymbolicLink()) return M(A, R, y, q);
    throw L.isSocket() ? new Error(`Cannot copy a socket file: ${R}`) : L.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${R}`) : new Error(`Unknown file: ${R}`);
  }
  function o(A, R, y, q, U) {
    return R ? a(A, y, q, U) : s(A, y, q, U);
  }
  function a(A, R, y, q) {
    if (q.overwrite)
      return r.unlinkSync(y), s(A, R, y, q);
    if (q.errorOnExist)
      throw new Error(`'${y}' already exists`);
  }
  function s(A, R, y, q) {
    return r.copyFileSync(R, y), q.preserveTimestamps && t(A.mode, R, y), E(y, A.mode);
  }
  function t(A, R, y) {
    return m(A) && v(y, A), p(R, y);
  }
  function m(A) {
    return (A & 128) === 0;
  }
  function v(A, R) {
    return E(A, R | 128);
  }
  function E(A, R) {
    return r.chmodSync(A, R);
  }
  function p(A, R) {
    const y = r.statSync(A);
    return u(R, y.atime, y.mtime);
  }
  function S(A, R, y, q, U) {
    return R ? O(y, q, U) : T(A.mode, y, q, U);
  }
  function T(A, R, y, q) {
    return r.mkdirSync(y), O(R, y, q), E(y, A);
  }
  function O(A, R, y) {
    r.readdirSync(A).forEach((q) => P(q, A, R, y));
  }
  function P(A, R, y, q) {
    const U = d.join(R, A), L = d.join(y, A), { destStat: k } = c.checkPathsSync(U, L, "copy", q);
    return f(k, U, L, q);
  }
  function M(A, R, y, q) {
    let U = r.readlinkSync(R);
    if (q.dereference && (U = d.resolve(process.cwd(), U)), A) {
      let L;
      try {
        L = r.readlinkSync(y);
      } catch (k) {
        if (k.code === "EINVAL" || k.code === "UNKNOWN") return r.symlinkSync(U, y);
        throw k;
      }
      if (q.dereference && (L = d.resolve(process.cwd(), L)), c.isSrcSubdir(U, L))
        throw new Error(`Cannot copy '${U}' to a subdirectory of itself, '${L}'.`);
      if (r.statSync(y).isDirectory() && c.isSrcSubdir(L, U))
        throw new Error(`Cannot overwrite '${L}' with '${U}'.`);
      return C(U, y);
    } else
      return r.symlinkSync(U, y);
  }
  function C(A, R) {
    return r.unlinkSync(R), r.symlinkSync(A, R);
  }
  return sn = l, sn;
}
var ln, $a;
function Qi() {
  if ($a) return ln;
  $a = 1;
  const r = Ye().fromCallback;
  return ln = {
    copy: r(/* @__PURE__ */ dc()),
    copySync: /* @__PURE__ */ hc()
  }, ln;
}
var un, ka;
function pc() {
  if (ka) return un;
  ka = 1;
  const r = We(), d = Ie, h = Cl, u = process.platform === "win32";
  function c(v) {
    [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ].forEach((p) => {
      v[p] = v[p] || r[p], p = p + "Sync", v[p] = v[p] || r[p];
    }), v.maxBusyTries = v.maxBusyTries || 3;
  }
  function l(v, E, p) {
    let S = 0;
    typeof E == "function" && (p = E, E = {}), h(v, "rimraf: missing path"), h.strictEqual(typeof v, "string", "rimraf: path should be a string"), h.strictEqual(typeof p, "function", "rimraf: callback function required"), h(E, "rimraf: invalid options argument provided"), h.strictEqual(typeof E, "object", "rimraf: options should be object"), c(E), i(v, E, function T(O) {
      if (O) {
        if ((O.code === "EBUSY" || O.code === "ENOTEMPTY" || O.code === "EPERM") && S < E.maxBusyTries) {
          S++;
          const P = S * 100;
          return setTimeout(() => i(v, E, T), P);
        }
        O.code === "ENOENT" && (O = null);
      }
      p(O);
    });
  }
  function i(v, E, p) {
    h(v), h(E), h(typeof p == "function"), E.lstat(v, (S, T) => {
      if (S && S.code === "ENOENT")
        return p(null);
      if (S && S.code === "EPERM" && u)
        return f(v, E, S, p);
      if (T && T.isDirectory())
        return o(v, E, S, p);
      E.unlink(v, (O) => {
        if (O) {
          if (O.code === "ENOENT")
            return p(null);
          if (O.code === "EPERM")
            return u ? f(v, E, O, p) : o(v, E, O, p);
          if (O.code === "EISDIR")
            return o(v, E, O, p);
        }
        return p(O);
      });
    });
  }
  function f(v, E, p, S) {
    h(v), h(E), h(typeof S == "function"), E.chmod(v, 438, (T) => {
      T ? S(T.code === "ENOENT" ? null : p) : E.stat(v, (O, P) => {
        O ? S(O.code === "ENOENT" ? null : p) : P.isDirectory() ? o(v, E, p, S) : E.unlink(v, S);
      });
    });
  }
  function n(v, E, p) {
    let S;
    h(v), h(E);
    try {
      E.chmodSync(v, 438);
    } catch (T) {
      if (T.code === "ENOENT")
        return;
      throw p;
    }
    try {
      S = E.statSync(v);
    } catch (T) {
      if (T.code === "ENOENT")
        return;
      throw p;
    }
    S.isDirectory() ? t(v, E, p) : E.unlinkSync(v);
  }
  function o(v, E, p, S) {
    h(v), h(E), h(typeof S == "function"), E.rmdir(v, (T) => {
      T && (T.code === "ENOTEMPTY" || T.code === "EEXIST" || T.code === "EPERM") ? a(v, E, S) : T && T.code === "ENOTDIR" ? S(p) : S(T);
    });
  }
  function a(v, E, p) {
    h(v), h(E), h(typeof p == "function"), E.readdir(v, (S, T) => {
      if (S) return p(S);
      let O = T.length, P;
      if (O === 0) return E.rmdir(v, p);
      T.forEach((M) => {
        l(d.join(v, M), E, (C) => {
          if (!P) {
            if (C) return p(P = C);
            --O === 0 && E.rmdir(v, p);
          }
        });
      });
    });
  }
  function s(v, E) {
    let p;
    E = E || {}, c(E), h(v, "rimraf: missing path"), h.strictEqual(typeof v, "string", "rimraf: path should be a string"), h(E, "rimraf: missing options"), h.strictEqual(typeof E, "object", "rimraf: options should be object");
    try {
      p = E.lstatSync(v);
    } catch (S) {
      if (S.code === "ENOENT")
        return;
      S.code === "EPERM" && u && n(v, E, S);
    }
    try {
      p && p.isDirectory() ? t(v, E, null) : E.unlinkSync(v);
    } catch (S) {
      if (S.code === "ENOENT")
        return;
      if (S.code === "EPERM")
        return u ? n(v, E, S) : t(v, E, S);
      if (S.code !== "EISDIR")
        throw S;
      t(v, E, S);
    }
  }
  function t(v, E, p) {
    h(v), h(E);
    try {
      E.rmdirSync(v);
    } catch (S) {
      if (S.code === "ENOTDIR")
        throw p;
      if (S.code === "ENOTEMPTY" || S.code === "EEXIST" || S.code === "EPERM")
        m(v, E);
      else if (S.code !== "ENOENT")
        throw S;
    }
  }
  function m(v, E) {
    if (h(v), h(E), E.readdirSync(v).forEach((p) => s(d.join(v, p), E)), u) {
      const p = Date.now();
      do
        try {
          return E.rmdirSync(v, E);
        } catch {
        }
      while (Date.now() - p < 500);
    } else
      return E.rmdirSync(v, E);
  }
  return un = l, l.sync = s, un;
}
var cn, qa;
function Mr() {
  if (qa) return cn;
  qa = 1;
  const r = We(), d = Ye().fromCallback, h = /* @__PURE__ */ pc();
  function u(l, i) {
    if (r.rm) return r.rm(l, { recursive: !0, force: !0 }, i);
    h(l, i);
  }
  function c(l) {
    if (r.rmSync) return r.rmSync(l, { recursive: !0, force: !0 });
    h.sync(l);
  }
  return cn = {
    remove: d(u),
    removeSync: c
  }, cn;
}
var fn, Ma;
function mc() {
  if (Ma) return fn;
  Ma = 1;
  const r = Ye().fromPromise, d = /* @__PURE__ */ kt(), h = Ie, u = /* @__PURE__ */ rt(), c = /* @__PURE__ */ Mr(), l = r(async function(n) {
    let o;
    try {
      o = await d.readdir(n);
    } catch {
      return u.mkdirs(n);
    }
    return Promise.all(o.map((a) => c.remove(h.join(n, a))));
  });
  function i(f) {
    let n;
    try {
      n = d.readdirSync(f);
    } catch {
      return u.mkdirsSync(f);
    }
    n.forEach((o) => {
      o = h.join(f, o), c.removeSync(o);
    });
  }
  return fn = {
    emptyDirSync: i,
    emptydirSync: i,
    emptyDir: l,
    emptydir: l
  }, fn;
}
var dn, Ba;
function gc() {
  if (Ba) return dn;
  Ba = 1;
  const r = Ye().fromCallback, d = Ie, h = We(), u = /* @__PURE__ */ rt();
  function c(i, f) {
    function n() {
      h.writeFile(i, "", (o) => {
        if (o) return f(o);
        f();
      });
    }
    h.stat(i, (o, a) => {
      if (!o && a.isFile()) return f();
      const s = d.dirname(i);
      h.stat(s, (t, m) => {
        if (t)
          return t.code === "ENOENT" ? u.mkdirs(s, (v) => {
            if (v) return f(v);
            n();
          }) : f(t);
        m.isDirectory() ? n() : h.readdir(s, (v) => {
          if (v) return f(v);
        });
      });
    });
  }
  function l(i) {
    let f;
    try {
      f = h.statSync(i);
    } catch {
    }
    if (f && f.isFile()) return;
    const n = d.dirname(i);
    try {
      h.statSync(n).isDirectory() || h.readdirSync(n);
    } catch (o) {
      if (o && o.code === "ENOENT") u.mkdirsSync(n);
      else throw o;
    }
    h.writeFileSync(i, "");
  }
  return dn = {
    createFile: r(c),
    createFileSync: l
  }, dn;
}
var hn, Ha;
function vc() {
  if (Ha) return hn;
  Ha = 1;
  const r = Ye().fromCallback, d = Ie, h = We(), u = /* @__PURE__ */ rt(), c = Ot().pathExists, { areIdentical: l } = /* @__PURE__ */ qt();
  function i(n, o, a) {
    function s(t, m) {
      h.link(t, m, (v) => {
        if (v) return a(v);
        a(null);
      });
    }
    h.lstat(o, (t, m) => {
      h.lstat(n, (v, E) => {
        if (v)
          return v.message = v.message.replace("lstat", "ensureLink"), a(v);
        if (m && l(E, m)) return a(null);
        const p = d.dirname(o);
        c(p, (S, T) => {
          if (S) return a(S);
          if (T) return s(n, o);
          u.mkdirs(p, (O) => {
            if (O) return a(O);
            s(n, o);
          });
        });
      });
    });
  }
  function f(n, o) {
    let a;
    try {
      a = h.lstatSync(o);
    } catch {
    }
    try {
      const m = h.lstatSync(n);
      if (a && l(m, a)) return;
    } catch (m) {
      throw m.message = m.message.replace("lstat", "ensureLink"), m;
    }
    const s = d.dirname(o);
    return h.existsSync(s) || u.mkdirsSync(s), h.linkSync(n, o);
  }
  return hn = {
    createLink: r(i),
    createLinkSync: f
  }, hn;
}
var pn, ja;
function Ec() {
  if (ja) return pn;
  ja = 1;
  const r = Ie, d = We(), h = Ot().pathExists;
  function u(l, i, f) {
    if (r.isAbsolute(l))
      return d.lstat(l, (n) => n ? (n.message = n.message.replace("lstat", "ensureSymlink"), f(n)) : f(null, {
        toCwd: l,
        toDst: l
      }));
    {
      const n = r.dirname(i), o = r.join(n, l);
      return h(o, (a, s) => a ? f(a) : s ? f(null, {
        toCwd: o,
        toDst: l
      }) : d.lstat(l, (t) => t ? (t.message = t.message.replace("lstat", "ensureSymlink"), f(t)) : f(null, {
        toCwd: l,
        toDst: r.relative(n, l)
      })));
    }
  }
  function c(l, i) {
    let f;
    if (r.isAbsolute(l)) {
      if (f = d.existsSync(l), !f) throw new Error("absolute srcpath does not exist");
      return {
        toCwd: l,
        toDst: l
      };
    } else {
      const n = r.dirname(i), o = r.join(n, l);
      if (f = d.existsSync(o), f)
        return {
          toCwd: o,
          toDst: l
        };
      if (f = d.existsSync(l), !f) throw new Error("relative srcpath does not exist");
      return {
        toCwd: l,
        toDst: r.relative(n, l)
      };
    }
  }
  return pn = {
    symlinkPaths: u,
    symlinkPathsSync: c
  }, pn;
}
var mn, Ga;
function yc() {
  if (Ga) return mn;
  Ga = 1;
  const r = We();
  function d(u, c, l) {
    if (l = typeof c == "function" ? c : l, c = typeof c == "function" ? !1 : c, c) return l(null, c);
    r.lstat(u, (i, f) => {
      if (i) return l(null, "file");
      c = f && f.isDirectory() ? "dir" : "file", l(null, c);
    });
  }
  function h(u, c) {
    let l;
    if (c) return c;
    try {
      l = r.lstatSync(u);
    } catch {
      return "file";
    }
    return l && l.isDirectory() ? "dir" : "file";
  }
  return mn = {
    symlinkType: d,
    symlinkTypeSync: h
  }, mn;
}
var gn, Wa;
function wc() {
  if (Wa) return gn;
  Wa = 1;
  const r = Ye().fromCallback, d = Ie, h = /* @__PURE__ */ kt(), u = /* @__PURE__ */ rt(), c = u.mkdirs, l = u.mkdirsSync, i = /* @__PURE__ */ Ec(), f = i.symlinkPaths, n = i.symlinkPathsSync, o = /* @__PURE__ */ yc(), a = o.symlinkType, s = o.symlinkTypeSync, t = Ot().pathExists, { areIdentical: m } = /* @__PURE__ */ qt();
  function v(S, T, O, P) {
    P = typeof O == "function" ? O : P, O = typeof O == "function" ? !1 : O, h.lstat(T, (M, C) => {
      !M && C.isSymbolicLink() ? Promise.all([
        h.stat(S),
        h.stat(T)
      ]).then(([A, R]) => {
        if (m(A, R)) return P(null);
        E(S, T, O, P);
      }) : E(S, T, O, P);
    });
  }
  function E(S, T, O, P) {
    f(S, T, (M, C) => {
      if (M) return P(M);
      S = C.toDst, a(C.toCwd, O, (A, R) => {
        if (A) return P(A);
        const y = d.dirname(T);
        t(y, (q, U) => {
          if (q) return P(q);
          if (U) return h.symlink(S, T, R, P);
          c(y, (L) => {
            if (L) return P(L);
            h.symlink(S, T, R, P);
          });
        });
      });
    });
  }
  function p(S, T, O) {
    let P;
    try {
      P = h.lstatSync(T);
    } catch {
    }
    if (P && P.isSymbolicLink()) {
      const R = h.statSync(S), y = h.statSync(T);
      if (m(R, y)) return;
    }
    const M = n(S, T);
    S = M.toDst, O = s(M.toCwd, O);
    const C = d.dirname(T);
    return h.existsSync(C) || l(C), h.symlinkSync(S, T, O);
  }
  return gn = {
    createSymlink: r(v),
    createSymlinkSync: p
  }, gn;
}
var vn, Va;
function _c() {
  if (Va) return vn;
  Va = 1;
  const { createFile: r, createFileSync: d } = /* @__PURE__ */ gc(), { createLink: h, createLinkSync: u } = /* @__PURE__ */ vc(), { createSymlink: c, createSymlinkSync: l } = /* @__PURE__ */ wc();
  return vn = {
    // file
    createFile: r,
    createFileSync: d,
    ensureFile: r,
    ensureFileSync: d,
    // link
    createLink: h,
    createLinkSync: u,
    ensureLink: h,
    ensureLinkSync: u,
    // symlink
    createSymlink: c,
    createSymlinkSync: l,
    ensureSymlink: c,
    ensureSymlinkSync: l
  }, vn;
}
var En, Ya;
function Zi() {
  if (Ya) return En;
  Ya = 1;
  function r(h, { EOL: u = `
`, finalEOL: c = !0, replacer: l = null, spaces: i } = {}) {
    const f = c ? u : "";
    return JSON.stringify(h, l, i).replace(/\n/g, u) + f;
  }
  function d(h) {
    return Buffer.isBuffer(h) && (h = h.toString("utf8")), h.replace(/^\uFEFF/, "");
  }
  return En = { stringify: r, stripBom: d }, En;
}
var yn, za;
function Sc() {
  if (za) return yn;
  za = 1;
  let r;
  try {
    r = We();
  } catch {
    r = pt;
  }
  const d = Ye(), { stringify: h, stripBom: u } = Zi();
  async function c(s, t = {}) {
    typeof t == "string" && (t = { encoding: t });
    const m = t.fs || r, v = "throws" in t ? t.throws : !0;
    let E = await d.fromCallback(m.readFile)(s, t);
    E = u(E);
    let p;
    try {
      p = JSON.parse(E, t ? t.reviver : null);
    } catch (S) {
      if (v)
        throw S.message = `${s}: ${S.message}`, S;
      return null;
    }
    return p;
  }
  const l = d.fromPromise(c);
  function i(s, t = {}) {
    typeof t == "string" && (t = { encoding: t });
    const m = t.fs || r, v = "throws" in t ? t.throws : !0;
    try {
      let E = m.readFileSync(s, t);
      return E = u(E), JSON.parse(E, t.reviver);
    } catch (E) {
      if (v)
        throw E.message = `${s}: ${E.message}`, E;
      return null;
    }
  }
  async function f(s, t, m = {}) {
    const v = m.fs || r, E = h(t, m);
    await d.fromCallback(v.writeFile)(s, E, m);
  }
  const n = d.fromPromise(f);
  function o(s, t, m = {}) {
    const v = m.fs || r, E = h(t, m);
    return v.writeFileSync(s, E, m);
  }
  return yn = {
    readFile: l,
    readFileSync: i,
    writeFile: n,
    writeFileSync: o
  }, yn;
}
var wn, Xa;
function Ac() {
  if (Xa) return wn;
  Xa = 1;
  const r = Sc();
  return wn = {
    // jsonfile exports
    readJson: r.readFile,
    readJsonSync: r.readFileSync,
    writeJson: r.writeFile,
    writeJsonSync: r.writeFileSync
  }, wn;
}
var _n, Ka;
function ea() {
  if (Ka) return _n;
  Ka = 1;
  const r = Ye().fromCallback, d = We(), h = Ie, u = /* @__PURE__ */ rt(), c = Ot().pathExists;
  function l(f, n, o, a) {
    typeof o == "function" && (a = o, o = "utf8");
    const s = h.dirname(f);
    c(s, (t, m) => {
      if (t) return a(t);
      if (m) return d.writeFile(f, n, o, a);
      u.mkdirs(s, (v) => {
        if (v) return a(v);
        d.writeFile(f, n, o, a);
      });
    });
  }
  function i(f, ...n) {
    const o = h.dirname(f);
    if (d.existsSync(o))
      return d.writeFileSync(f, ...n);
    u.mkdirsSync(o), d.writeFileSync(f, ...n);
  }
  return _n = {
    outputFile: r(l),
    outputFileSync: i
  }, _n;
}
var Sn, Ja;
function Rc() {
  if (Ja) return Sn;
  Ja = 1;
  const { stringify: r } = Zi(), { outputFile: d } = /* @__PURE__ */ ea();
  async function h(u, c, l = {}) {
    const i = r(c, l);
    await d(u, i, l);
  }
  return Sn = h, Sn;
}
var An, Qa;
function Tc() {
  if (Qa) return An;
  Qa = 1;
  const { stringify: r } = Zi(), { outputFileSync: d } = /* @__PURE__ */ ea();
  function h(u, c, l) {
    const i = r(c, l);
    d(u, i, l);
  }
  return An = h, An;
}
var Rn, Za;
function Cc() {
  if (Za) return Rn;
  Za = 1;
  const r = Ye().fromPromise, d = /* @__PURE__ */ Ac();
  return d.outputJson = r(/* @__PURE__ */ Rc()), d.outputJsonSync = /* @__PURE__ */ Tc(), d.outputJSON = d.outputJson, d.outputJSONSync = d.outputJsonSync, d.writeJSON = d.writeJson, d.writeJSONSync = d.writeJsonSync, d.readJSON = d.readJson, d.readJSONSync = d.readJsonSync, Rn = d, Rn;
}
var Tn, eo;
function bc() {
  if (eo) return Tn;
  eo = 1;
  const r = We(), d = Ie, h = Qi().copy, u = Mr().remove, c = rt().mkdirp, l = Ot().pathExists, i = /* @__PURE__ */ qt();
  function f(t, m, v, E) {
    typeof v == "function" && (E = v, v = {}), v = v || {};
    const p = v.overwrite || v.clobber || !1;
    i.checkPaths(t, m, "move", v, (S, T) => {
      if (S) return E(S);
      const { srcStat: O, isChangingCase: P = !1 } = T;
      i.checkParentPaths(t, O, m, "move", (M) => {
        if (M) return E(M);
        if (n(m)) return o(t, m, p, P, E);
        c(d.dirname(m), (C) => C ? E(C) : o(t, m, p, P, E));
      });
    });
  }
  function n(t) {
    const m = d.dirname(t);
    return d.parse(m).root === m;
  }
  function o(t, m, v, E, p) {
    if (E) return a(t, m, v, p);
    if (v)
      return u(m, (S) => S ? p(S) : a(t, m, v, p));
    l(m, (S, T) => S ? p(S) : T ? p(new Error("dest already exists.")) : a(t, m, v, p));
  }
  function a(t, m, v, E) {
    r.rename(t, m, (p) => p ? p.code !== "EXDEV" ? E(p) : s(t, m, v, E) : E());
  }
  function s(t, m, v, E) {
    h(t, m, {
      overwrite: v,
      errorOnExist: !0
    }, (S) => S ? E(S) : u(t, E));
  }
  return Tn = f, Tn;
}
var Cn, to;
function Oc() {
  if (to) return Cn;
  to = 1;
  const r = We(), d = Ie, h = Qi().copySync, u = Mr().removeSync, c = rt().mkdirpSync, l = /* @__PURE__ */ qt();
  function i(s, t, m) {
    m = m || {};
    const v = m.overwrite || m.clobber || !1, { srcStat: E, isChangingCase: p = !1 } = l.checkPathsSync(s, t, "move", m);
    return l.checkParentPathsSync(s, E, t, "move"), f(t) || c(d.dirname(t)), n(s, t, v, p);
  }
  function f(s) {
    const t = d.dirname(s);
    return d.parse(t).root === t;
  }
  function n(s, t, m, v) {
    if (v) return o(s, t, m);
    if (m)
      return u(t), o(s, t, m);
    if (r.existsSync(t)) throw new Error("dest already exists.");
    return o(s, t, m);
  }
  function o(s, t, m) {
    try {
      r.renameSync(s, t);
    } catch (v) {
      if (v.code !== "EXDEV") throw v;
      return a(s, t, m);
    }
  }
  function a(s, t, m) {
    return h(s, t, {
      overwrite: m,
      errorOnExist: !0
    }), u(s);
  }
  return Cn = i, Cn;
}
var bn, ro;
function Pc() {
  if (ro) return bn;
  ro = 1;
  const r = Ye().fromCallback;
  return bn = {
    move: r(/* @__PURE__ */ bc()),
    moveSync: /* @__PURE__ */ Oc()
  }, bn;
}
var On, no;
function mt() {
  return no || (no = 1, On = {
    // Export promiseified graceful-fs:
    .../* @__PURE__ */ kt(),
    // Export extra methods:
    .../* @__PURE__ */ Qi(),
    .../* @__PURE__ */ mc(),
    .../* @__PURE__ */ _c(),
    .../* @__PURE__ */ Cc(),
    .../* @__PURE__ */ rt(),
    .../* @__PURE__ */ Pc(),
    .../* @__PURE__ */ ea(),
    .../* @__PURE__ */ Ot(),
    .../* @__PURE__ */ Mr()
  }), On;
}
var Gt = {}, At = {}, Pn = {}, Rt = {}, io;
function ta() {
  if (io) return Rt;
  io = 1, Object.defineProperty(Rt, "__esModule", { value: !0 }), Rt.CancellationError = Rt.CancellationToken = void 0;
  const r = bl;
  let d = class extends r.EventEmitter {
    get cancelled() {
      return this._cancelled || this._parent != null && this._parent.cancelled;
    }
    set parent(c) {
      this.removeParentCancelHandler(), this._parent = c, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
    }
    // babel cannot compile ... correctly for super calls
    constructor(c) {
      super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, c != null && (this.parent = c);
    }
    cancel() {
      this._cancelled = !0, this.emit("cancel");
    }
    onCancel(c) {
      this.cancelled ? c() : this.once("cancel", c);
    }
    createPromise(c) {
      if (this.cancelled)
        return Promise.reject(new h());
      const l = () => {
        if (i != null)
          try {
            this.removeListener("cancel", i), i = null;
          } catch {
          }
      };
      let i = null;
      return new Promise((f, n) => {
        let o = null;
        if (i = () => {
          try {
            o != null && (o(), o = null);
          } finally {
            n(new h());
          }
        }, this.cancelled) {
          i();
          return;
        }
        this.onCancel(i), c(f, n, (a) => {
          o = a;
        });
      }).then((f) => (l(), f)).catch((f) => {
        throw l(), f;
      });
    }
    removeParentCancelHandler() {
      const c = this._parent;
      c != null && this.parentCancelHandler != null && (c.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
    }
    dispose() {
      try {
        this.removeParentCancelHandler();
      } finally {
        this.removeAllListeners(), this._parent = null;
      }
    }
  };
  Rt.CancellationToken = d;
  class h extends Error {
    constructor() {
      super("cancelled");
    }
  }
  return Rt.CancellationError = h, Rt;
}
var br = {}, ao;
function Br() {
  if (ao) return br;
  ao = 1, Object.defineProperty(br, "__esModule", { value: !0 }), br.newError = r;
  function r(d, h) {
    const u = new Error(d);
    return u.code = h, u;
  }
  return br;
}
var Be = {}, Or = { exports: {} }, Pr = { exports: {} }, In, oo;
function Ic() {
  if (oo) return In;
  oo = 1;
  var r = 1e3, d = r * 60, h = d * 60, u = h * 24, c = u * 7, l = u * 365.25;
  In = function(a, s) {
    s = s || {};
    var t = typeof a;
    if (t === "string" && a.length > 0)
      return i(a);
    if (t === "number" && isFinite(a))
      return s.long ? n(a) : f(a);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(a)
    );
  };
  function i(a) {
    if (a = String(a), !(a.length > 100)) {
      var s = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        a
      );
      if (s) {
        var t = parseFloat(s[1]), m = (s[2] || "ms").toLowerCase();
        switch (m) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return t * l;
          case "weeks":
          case "week":
          case "w":
            return t * c;
          case "days":
          case "day":
          case "d":
            return t * u;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return t * h;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return t * d;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return t * r;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return t;
          default:
            return;
        }
      }
    }
  }
  function f(a) {
    var s = Math.abs(a);
    return s >= u ? Math.round(a / u) + "d" : s >= h ? Math.round(a / h) + "h" : s >= d ? Math.round(a / d) + "m" : s >= r ? Math.round(a / r) + "s" : a + "ms";
  }
  function n(a) {
    var s = Math.abs(a);
    return s >= u ? o(a, s, u, "day") : s >= h ? o(a, s, h, "hour") : s >= d ? o(a, s, d, "minute") : s >= r ? o(a, s, r, "second") : a + " ms";
  }
  function o(a, s, t, m) {
    var v = s >= t * 1.5;
    return Math.round(a / t) + " " + m + (v ? "s" : "");
  }
  return In;
}
var Dn, so;
function Dl() {
  if (so) return Dn;
  so = 1;
  function r(d) {
    u.debug = u, u.default = u, u.coerce = o, u.disable = f, u.enable = l, u.enabled = n, u.humanize = Ic(), u.destroy = a, Object.keys(d).forEach((s) => {
      u[s] = d[s];
    }), u.names = [], u.skips = [], u.formatters = {};
    function h(s) {
      let t = 0;
      for (let m = 0; m < s.length; m++)
        t = (t << 5) - t + s.charCodeAt(m), t |= 0;
      return u.colors[Math.abs(t) % u.colors.length];
    }
    u.selectColor = h;
    function u(s) {
      let t, m = null, v, E;
      function p(...S) {
        if (!p.enabled)
          return;
        const T = p, O = Number(/* @__PURE__ */ new Date()), P = O - (t || O);
        T.diff = P, T.prev = t, T.curr = O, t = O, S[0] = u.coerce(S[0]), typeof S[0] != "string" && S.unshift("%O");
        let M = 0;
        S[0] = S[0].replace(/%([a-zA-Z%])/g, (A, R) => {
          if (A === "%%")
            return "%";
          M++;
          const y = u.formatters[R];
          if (typeof y == "function") {
            const q = S[M];
            A = y.call(T, q), S.splice(M, 1), M--;
          }
          return A;
        }), u.formatArgs.call(T, S), (T.log || u.log).apply(T, S);
      }
      return p.namespace = s, p.useColors = u.useColors(), p.color = u.selectColor(s), p.extend = c, p.destroy = u.destroy, Object.defineProperty(p, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => m !== null ? m : (v !== u.namespaces && (v = u.namespaces, E = u.enabled(s)), E),
        set: (S) => {
          m = S;
        }
      }), typeof u.init == "function" && u.init(p), p;
    }
    function c(s, t) {
      const m = u(this.namespace + (typeof t > "u" ? ":" : t) + s);
      return m.log = this.log, m;
    }
    function l(s) {
      u.save(s), u.namespaces = s, u.names = [], u.skips = [];
      const t = (typeof s == "string" ? s : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const m of t)
        m[0] === "-" ? u.skips.push(m.slice(1)) : u.names.push(m);
    }
    function i(s, t) {
      let m = 0, v = 0, E = -1, p = 0;
      for (; m < s.length; )
        if (v < t.length && (t[v] === s[m] || t[v] === "*"))
          t[v] === "*" ? (E = v, p = m, v++) : (m++, v++);
        else if (E !== -1)
          v = E + 1, p++, m = p;
        else
          return !1;
      for (; v < t.length && t[v] === "*"; )
        v++;
      return v === t.length;
    }
    function f() {
      const s = [
        ...u.names,
        ...u.skips.map((t) => "-" + t)
      ].join(",");
      return u.enable(""), s;
    }
    function n(s) {
      for (const t of u.skips)
        if (i(s, t))
          return !1;
      for (const t of u.names)
        if (i(s, t))
          return !0;
      return !1;
    }
    function o(s) {
      return s instanceof Error ? s.stack || s.message : s;
    }
    function a() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return u.enable(u.load()), u;
  }
  return Dn = r, Dn;
}
var lo;
function Dc() {
  return lo || (lo = 1, function(r, d) {
    d.formatArgs = u, d.save = c, d.load = l, d.useColors = h, d.storage = i(), d.destroy = /* @__PURE__ */ (() => {
      let n = !1;
      return () => {
        n || (n = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), d.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function h() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let n;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (n = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(n[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function u(n) {
      if (n[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + n[0] + (this.useColors ? "%c " : " ") + "+" + r.exports.humanize(this.diff), !this.useColors)
        return;
      const o = "color: " + this.color;
      n.splice(1, 0, o, "color: inherit");
      let a = 0, s = 0;
      n[0].replace(/%[a-zA-Z%]/g, (t) => {
        t !== "%%" && (a++, t === "%c" && (s = a));
      }), n.splice(s, 0, o);
    }
    d.log = console.debug || console.log || (() => {
    });
    function c(n) {
      try {
        n ? d.storage.setItem("debug", n) : d.storage.removeItem("debug");
      } catch {
      }
    }
    function l() {
      let n;
      try {
        n = d.storage.getItem("debug") || d.storage.getItem("DEBUG");
      } catch {
      }
      return !n && typeof process < "u" && "env" in process && (n = process.env.DEBUG), n;
    }
    function i() {
      try {
        return localStorage;
      } catch {
      }
    }
    r.exports = Dl()(d);
    const { formatters: f } = r.exports;
    f.j = function(n) {
      try {
        return JSON.stringify(n);
      } catch (o) {
        return "[UnexpectedJSONParseError]: " + o.message;
      }
    };
  }(Pr, Pr.exports)), Pr.exports;
}
var Ir = { exports: {} }, Nn, uo;
function Nc() {
  return uo || (uo = 1, Nn = (r, d = process.argv) => {
    const h = r.startsWith("-") ? "" : r.length === 1 ? "-" : "--", u = d.indexOf(h + r), c = d.indexOf("--");
    return u !== -1 && (c === -1 || u < c);
  }), Nn;
}
var Fn, co;
function Fc() {
  if (co) return Fn;
  co = 1;
  const r = qr, d = Ol, h = Nc(), { env: u } = process;
  let c;
  h("no-color") || h("no-colors") || h("color=false") || h("color=never") ? c = 0 : (h("color") || h("colors") || h("color=true") || h("color=always")) && (c = 1), "FORCE_COLOR" in u && (u.FORCE_COLOR === "true" ? c = 1 : u.FORCE_COLOR === "false" ? c = 0 : c = u.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(u.FORCE_COLOR, 10), 3));
  function l(n) {
    return n === 0 ? !1 : {
      level: n,
      hasBasic: !0,
      has256: n >= 2,
      has16m: n >= 3
    };
  }
  function i(n, o) {
    if (c === 0)
      return 0;
    if (h("color=16m") || h("color=full") || h("color=truecolor"))
      return 3;
    if (h("color=256"))
      return 2;
    if (n && !o && c === void 0)
      return 0;
    const a = c || 0;
    if (u.TERM === "dumb")
      return a;
    if (process.platform === "win32") {
      const s = r.release().split(".");
      return Number(s[0]) >= 10 && Number(s[2]) >= 10586 ? Number(s[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in u)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((s) => s in u) || u.CI_NAME === "codeship" ? 1 : a;
    if ("TEAMCITY_VERSION" in u)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(u.TEAMCITY_VERSION) ? 1 : 0;
    if (u.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in u) {
      const s = parseInt((u.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (u.TERM_PROGRAM) {
        case "iTerm.app":
          return s >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(u.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(u.TERM) || "COLORTERM" in u ? 1 : a;
  }
  function f(n) {
    const o = i(n, n && n.isTTY);
    return l(o);
  }
  return Fn = {
    supportsColor: f,
    stdout: l(i(!0, d.isatty(1))),
    stderr: l(i(!0, d.isatty(2)))
  }, Fn;
}
var fo;
function xc() {
  return fo || (fo = 1, function(r, d) {
    const h = Ol, u = Ji;
    d.init = a, d.log = f, d.formatArgs = l, d.save = n, d.load = o, d.useColors = c, d.destroy = u.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), d.colors = [6, 2, 3, 4, 5, 1];
    try {
      const t = Fc();
      t && (t.stderr || t).level >= 2 && (d.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    d.inspectOpts = Object.keys(process.env).filter((t) => /^debug_/i.test(t)).reduce((t, m) => {
      const v = m.substring(6).toLowerCase().replace(/_([a-z])/g, (p, S) => S.toUpperCase());
      let E = process.env[m];
      return /^(yes|on|true|enabled)$/i.test(E) ? E = !0 : /^(no|off|false|disabled)$/i.test(E) ? E = !1 : E === "null" ? E = null : E = Number(E), t[v] = E, t;
    }, {});
    function c() {
      return "colors" in d.inspectOpts ? !!d.inspectOpts.colors : h.isatty(process.stderr.fd);
    }
    function l(t) {
      const { namespace: m, useColors: v } = this;
      if (v) {
        const E = this.color, p = "\x1B[3" + (E < 8 ? E : "8;5;" + E), S = `  ${p};1m${m} \x1B[0m`;
        t[0] = S + t[0].split(`
`).join(`
` + S), t.push(p + "m+" + r.exports.humanize(this.diff) + "\x1B[0m");
      } else
        t[0] = i() + m + " " + t[0];
    }
    function i() {
      return d.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function f(...t) {
      return process.stderr.write(u.formatWithOptions(d.inspectOpts, ...t) + `
`);
    }
    function n(t) {
      t ? process.env.DEBUG = t : delete process.env.DEBUG;
    }
    function o() {
      return process.env.DEBUG;
    }
    function a(t) {
      t.inspectOpts = {};
      const m = Object.keys(d.inspectOpts);
      for (let v = 0; v < m.length; v++)
        t.inspectOpts[m[v]] = d.inspectOpts[m[v]];
    }
    r.exports = Dl()(d);
    const { formatters: s } = r.exports;
    s.o = function(t) {
      return this.inspectOpts.colors = this.useColors, u.inspect(t, this.inspectOpts).split(`
`).map((m) => m.trim()).join(" ");
    }, s.O = function(t) {
      return this.inspectOpts.colors = this.useColors, u.inspect(t, this.inspectOpts);
    };
  }(Ir, Ir.exports)), Ir.exports;
}
var ho;
function Lc() {
  return ho || (ho = 1, typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? Or.exports = Dc() : Or.exports = xc()), Or.exports;
}
var Wt = {}, po;
function Nl() {
  if (po) return Wt;
  po = 1, Object.defineProperty(Wt, "__esModule", { value: !0 }), Wt.ProgressCallbackTransform = void 0;
  const r = hr;
  let d = class extends r.Transform {
    constructor(u, c, l) {
      super(), this.total = u, this.cancellationToken = c, this.onProgress = l, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
    }
    _transform(u, c, l) {
      if (this.cancellationToken.cancelled) {
        l(new Error("cancelled"), null);
        return;
      }
      this.transferred += u.length, this.delta += u.length;
      const i = Date.now();
      i >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = i + 1e3, this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.total * 100,
        bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
      }), this.delta = 0), l(null, u);
    }
    _flush(u) {
      if (this.cancellationToken.cancelled) {
        u(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.total,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, u(null);
    }
  };
  return Wt.ProgressCallbackTransform = d, Wt;
}
var mo;
function Uc() {
  if (mo) return Be;
  mo = 1, Object.defineProperty(Be, "__esModule", { value: !0 }), Be.DigestTransform = Be.HttpExecutor = Be.HttpError = void 0, Be.createHttpError = o, Be.parseJson = t, Be.configureRequestOptionsFromUrl = v, Be.configureRequestUrl = E, Be.safeGetHeader = T, Be.configureRequestOptions = P, Be.safeStringifyJson = M;
  const r = pr, d = Lc(), h = pt, u = hr, c = $t, l = ta(), i = Br(), f = Nl(), n = (0, d.default)("electron-builder");
  function o(C, A = null) {
    return new s(C.statusCode || -1, `${C.statusCode} ${C.statusMessage}` + (A == null ? "" : `
` + JSON.stringify(A, null, "  ")) + `
Headers: ` + M(C.headers), A);
  }
  const a = /* @__PURE__ */ new Map([
    [429, "Too many requests"],
    [400, "Bad request"],
    [403, "Forbidden"],
    [404, "Not found"],
    [405, "Method not allowed"],
    [406, "Not acceptable"],
    [408, "Request timeout"],
    [413, "Request entity too large"],
    [500, "Internal server error"],
    [502, "Bad gateway"],
    [503, "Service unavailable"],
    [504, "Gateway timeout"],
    [505, "HTTP version not supported"]
  ]);
  class s extends Error {
    constructor(A, R = `HTTP error: ${a.get(A) || A}`, y = null) {
      super(R), this.statusCode = A, this.description = y, this.name = "HttpError", this.code = `HTTP_ERROR_${A}`;
    }
    isServerError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
  }
  Be.HttpError = s;
  function t(C) {
    return C.then((A) => A == null || A.length === 0 ? null : JSON.parse(A));
  }
  class m {
    constructor() {
      this.maxRedirects = 10;
    }
    request(A, R = new l.CancellationToken(), y) {
      P(A);
      const q = y == null ? void 0 : JSON.stringify(y), U = q ? Buffer.from(q) : void 0;
      if (U != null) {
        n(q);
        const { headers: L, ...k } = A;
        A = {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": U.length,
            ...L
          },
          ...k
        };
      }
      return this.doApiRequest(A, R, (L) => L.end(U));
    }
    doApiRequest(A, R, y, q = 0) {
      return n.enabled && n(`Request: ${M(A)}`), R.createPromise((U, L, k) => {
        const N = this.createRequest(A, (I) => {
          try {
            this.handleResponse(I, A, R, U, L, q, y);
          } catch (F) {
            L(F);
          }
        });
        this.addErrorAndTimeoutHandlers(N, L, A.timeout), this.addRedirectHandlers(N, A, L, q, (I) => {
          this.doApiRequest(I, R, y, q).then(U).catch(L);
        }), y(N, L), k(() => N.abort());
      });
    }
    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    addRedirectHandlers(A, R, y, q, U) {
    }
    addErrorAndTimeoutHandlers(A, R, y = 60 * 1e3) {
      this.addTimeOutHandler(A, R, y), A.on("error", R), A.on("aborted", () => {
        R(new Error("Request has been aborted by the server"));
      });
    }
    handleResponse(A, R, y, q, U, L, k) {
      var N;
      if (n.enabled && n(`Response: ${A.statusCode} ${A.statusMessage}, request options: ${M(R)}`), A.statusCode === 404) {
        U(o(A, `method: ${R.method || "GET"} url: ${R.protocol || "https:"}//${R.hostname}${R.port ? `:${R.port}` : ""}${R.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
        return;
      } else if (A.statusCode === 204) {
        q();
        return;
      }
      const I = (N = A.statusCode) !== null && N !== void 0 ? N : 0, F = I >= 300 && I < 400, $ = T(A, "location");
      if (F && $ != null) {
        if (L > this.maxRedirects) {
          U(this.createMaxRedirectError());
          return;
        }
        this.doApiRequest(m.prepareRedirectUrlOptions($, R), y, k, L).then(q).catch(U);
        return;
      }
      A.setEncoding("utf8");
      let J = "";
      A.on("error", U), A.on("data", (W) => J += W), A.on("end", () => {
        try {
          if (A.statusCode != null && A.statusCode >= 400) {
            const W = T(A, "content-type"), ne = W != null && (Array.isArray(W) ? W.find((ce) => ce.includes("json")) != null : W.includes("json"));
            U(o(A, `method: ${R.method || "GET"} url: ${R.protocol || "https:"}//${R.hostname}${R.port ? `:${R.port}` : ""}${R.path}

          Data:
          ${ne ? JSON.stringify(JSON.parse(J)) : J}
          `));
          } else
            q(J.length === 0 ? null : J);
        } catch (W) {
          U(W);
        }
      });
    }
    async downloadToBuffer(A, R) {
      return await R.cancellationToken.createPromise((y, q, U) => {
        const L = [], k = {
          headers: R.headers || void 0,
          // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
          redirect: "manual"
        };
        E(A, k), P(k), this.doDownload(k, {
          destination: null,
          options: R,
          onCancel: U,
          callback: (N) => {
            N == null ? y(Buffer.concat(L)) : q(N);
          },
          responseHandler: (N, I) => {
            let F = 0;
            N.on("data", ($) => {
              if (F += $.length, F > 524288e3) {
                I(new Error("Maximum allowed size is 500 MB"));
                return;
              }
              L.push($);
            }), N.on("end", () => {
              I(null);
            });
          }
        }, 0);
      });
    }
    doDownload(A, R, y) {
      const q = this.createRequest(A, (U) => {
        if (U.statusCode >= 400) {
          R.callback(new Error(`Cannot download "${A.protocol || "https:"}//${A.hostname}${A.path}", status ${U.statusCode}: ${U.statusMessage}`));
          return;
        }
        U.on("error", R.callback);
        const L = T(U, "location");
        if (L != null) {
          y < this.maxRedirects ? this.doDownload(m.prepareRedirectUrlOptions(L, A), R, y++) : R.callback(this.createMaxRedirectError());
          return;
        }
        R.responseHandler == null ? O(R, U) : R.responseHandler(U, R.callback);
      });
      this.addErrorAndTimeoutHandlers(q, R.callback, A.timeout), this.addRedirectHandlers(q, A, R.callback, y, (U) => {
        this.doDownload(U, R, y++);
      }), q.end();
    }
    createMaxRedirectError() {
      return new Error(`Too many redirects (> ${this.maxRedirects})`);
    }
    addTimeOutHandler(A, R, y) {
      A.on("socket", (q) => {
        q.setTimeout(y, () => {
          A.abort(), R(new Error("Request timed out"));
        });
      });
    }
    static prepareRedirectUrlOptions(A, R) {
      const y = v(A, { ...R }), q = y.headers;
      if (q != null && q.authorization) {
        const U = new c.URL(A);
        (U.hostname.endsWith(".amazonaws.com") || U.searchParams.has("X-Amz-Credential")) && delete q.authorization;
      }
      return y;
    }
    static retryOnServerError(A, R = 3) {
      for (let y = 0; ; y++)
        try {
          return A();
        } catch (q) {
          if (y < R && (q instanceof s && q.isServerError() || q.code === "EPIPE"))
            continue;
          throw q;
        }
    }
  }
  Be.HttpExecutor = m;
  function v(C, A) {
    const R = P(A);
    return E(new c.URL(C), R), R;
  }
  function E(C, A) {
    A.protocol = C.protocol, A.hostname = C.hostname, C.port ? A.port = C.port : A.port && delete A.port, A.path = C.pathname + C.search;
  }
  class p extends u.Transform {
    // noinspection JSUnusedGlobalSymbols
    get actual() {
      return this._actual;
    }
    constructor(A, R = "sha512", y = "base64") {
      super(), this.expected = A, this.algorithm = R, this.encoding = y, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, r.createHash)(R);
    }
    // noinspection JSUnusedGlobalSymbols
    _transform(A, R, y) {
      this.digester.update(A), y(null, A);
    }
    // noinspection JSUnusedGlobalSymbols
    _flush(A) {
      if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
        try {
          this.validate();
        } catch (R) {
          A(R);
          return;
        }
      A(null);
    }
    validate() {
      if (this._actual == null)
        throw (0, i.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
      if (this._actual !== this.expected)
        throw (0, i.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
      return null;
    }
  }
  Be.DigestTransform = p;
  function S(C, A, R) {
    return C != null && A != null && C !== A ? (R(new Error(`checksum mismatch: expected ${A} but got ${C} (X-Checksum-Sha2 header)`)), !1) : !0;
  }
  function T(C, A) {
    const R = C.headers[A];
    return R == null ? null : Array.isArray(R) ? R.length === 0 ? null : R[R.length - 1] : R;
  }
  function O(C, A) {
    if (!S(T(A, "X-Checksum-Sha2"), C.options.sha2, C.callback))
      return;
    const R = [];
    if (C.options.onProgress != null) {
      const L = T(A, "content-length");
      L != null && R.push(new f.ProgressCallbackTransform(parseInt(L, 10), C.options.cancellationToken, C.options.onProgress));
    }
    const y = C.options.sha512;
    y != null ? R.push(new p(y, "sha512", y.length === 128 && !y.includes("+") && !y.includes("Z") && !y.includes("=") ? "hex" : "base64")) : C.options.sha2 != null && R.push(new p(C.options.sha2, "sha256", "hex"));
    const q = (0, h.createWriteStream)(C.destination);
    R.push(q);
    let U = A;
    for (const L of R)
      L.on("error", (k) => {
        q.close(), C.options.cancellationToken.cancelled || C.callback(k);
      }), U = U.pipe(L);
    q.on("finish", () => {
      q.close(C.callback);
    });
  }
  function P(C, A, R) {
    R != null && (C.method = R), C.headers = { ...C.headers };
    const y = C.headers;
    return A != null && (y.authorization = A.startsWith("Basic") || A.startsWith("Bearer") ? A : `token ${A}`), y["User-Agent"] == null && (y["User-Agent"] = "electron-builder"), (R == null || R === "GET" || y["Cache-Control"] == null) && (y["Cache-Control"] = "no-cache"), C.protocol == null && process.versions.electron != null && (C.protocol = "https:"), C;
  }
  function M(C, A) {
    return JSON.stringify(C, (R, y) => R.endsWith("Authorization") || R.endsWith("authorization") || R.endsWith("Password") || R.endsWith("PASSWORD") || R.endsWith("Token") || R.includes("password") || R.includes("token") || A != null && A.has(R) ? "<stripped sensitive data>" : y, 2);
  }
  return Be;
}
var Vt = {}, go;
function $c() {
  if (go) return Vt;
  go = 1, Object.defineProperty(Vt, "__esModule", { value: !0 }), Vt.MemoLazy = void 0;
  let r = class {
    constructor(u, c) {
      this.selector = u, this.creator = c, this.selected = void 0, this._value = void 0;
    }
    get hasValue() {
      return this._value !== void 0;
    }
    get value() {
      const u = this.selector();
      if (this._value !== void 0 && d(this.selected, u))
        return this._value;
      this.selected = u;
      const c = this.creator(u);
      return this.value = c, c;
    }
    set value(u) {
      this._value = u;
    }
  };
  Vt.MemoLazy = r;
  function d(h, u) {
    if (typeof h == "object" && h !== null && (typeof u == "object" && u !== null)) {
      const i = Object.keys(h), f = Object.keys(u);
      return i.length === f.length && i.every((n) => d(h[n], u[n]));
    }
    return h === u;
  }
  return Vt;
}
var Yt = {}, vo;
function kc() {
  if (vo) return Yt;
  vo = 1, Object.defineProperty(Yt, "__esModule", { value: !0 }), Yt.githubUrl = r, Yt.getS3LikeProviderBaseUrl = d;
  function r(l, i = "github.com") {
    return `${l.protocol || "https"}://${l.host || i}`;
  }
  function d(l) {
    const i = l.provider;
    if (i === "s3")
      return h(l);
    if (i === "spaces")
      return c(l);
    throw new Error(`Not supported provider: ${i}`);
  }
  function h(l) {
    let i;
    if (l.accelerate == !0)
      i = `https://${l.bucket}.s3-accelerate.amazonaws.com`;
    else if (l.endpoint != null)
      i = `${l.endpoint}/${l.bucket}`;
    else if (l.bucket.includes(".")) {
      if (l.region == null)
        throw new Error(`Bucket name "${l.bucket}" includes a dot, but S3 region is missing`);
      l.region === "us-east-1" ? i = `https://s3.amazonaws.com/${l.bucket}` : i = `https://s3-${l.region}.amazonaws.com/${l.bucket}`;
    } else l.region === "cn-north-1" ? i = `https://${l.bucket}.s3.${l.region}.amazonaws.com.cn` : i = `https://${l.bucket}.s3.amazonaws.com`;
    return u(i, l.path);
  }
  function u(l, i) {
    return i != null && i.length > 0 && (i.startsWith("/") || (l += "/"), l += i), l;
  }
  function c(l) {
    if (l.name == null)
      throw new Error("name is missing");
    if (l.region == null)
      throw new Error("region is missing");
    return u(`https://${l.name}.${l.region}.digitaloceanspaces.com`, l.path);
  }
  return Yt;
}
var Dr = {}, Eo;
function qc() {
  if (Eo) return Dr;
  Eo = 1, Object.defineProperty(Dr, "__esModule", { value: !0 }), Dr.retry = d;
  const r = ta();
  async function d(h, u, c, l = 0, i = 0, f) {
    var n;
    const o = new r.CancellationToken();
    try {
      return await h();
    } catch (a) {
      if ((!((n = f == null ? void 0 : f(a)) !== null && n !== void 0) || n) && u > 0 && !o.cancelled)
        return await new Promise((s) => setTimeout(s, c + l * i)), await d(h, u - 1, c, l, i + 1, f);
      throw a;
    }
  }
  return Dr;
}
var Nr = {}, yo;
function Mc() {
  if (yo) return Nr;
  yo = 1, Object.defineProperty(Nr, "__esModule", { value: !0 }), Nr.parseDn = r;
  function r(d) {
    let h = !1, u = null, c = "", l = 0;
    d = d.trim();
    const i = /* @__PURE__ */ new Map();
    for (let f = 0; f <= d.length; f++) {
      if (f === d.length) {
        u !== null && i.set(u, c);
        break;
      }
      const n = d[f];
      if (h) {
        if (n === '"') {
          h = !1;
          continue;
        }
      } else {
        if (n === '"') {
          h = !0;
          continue;
        }
        if (n === "\\") {
          f++;
          const o = parseInt(d.slice(f, f + 2), 16);
          Number.isNaN(o) ? c += d[f] : (f++, c += String.fromCharCode(o));
          continue;
        }
        if (u === null && n === "=") {
          u = c, c = "";
          continue;
        }
        if (n === "," || n === ";" || n === "+") {
          u !== null && i.set(u, c), u = null, c = "";
          continue;
        }
      }
      if (n === " " && !h) {
        if (c.length === 0)
          continue;
        if (f > l) {
          let o = f;
          for (; d[o] === " "; )
            o++;
          l = o;
        }
        if (l >= d.length || d[l] === "," || d[l] === ";" || u === null && d[l] === "=" || u !== null && d[l] === "+") {
          f = l - 1;
          continue;
        }
      }
      c += n;
    }
    return i;
  }
  return Nr;
}
var Tt = {}, wo;
function Bc() {
  if (wo) return Tt;
  wo = 1, Object.defineProperty(Tt, "__esModule", { value: !0 }), Tt.nil = Tt.UUID = void 0;
  const r = pr, d = Br(), h = "options.name must be either a string or a Buffer", u = (0, r.randomBytes)(16);
  u[0] = u[0] | 1;
  const c = {}, l = [];
  for (let s = 0; s < 256; s++) {
    const t = (s + 256).toString(16).substr(1);
    c[t] = s, l[s] = t;
  }
  class i {
    constructor(t) {
      this.ascii = null, this.binary = null;
      const m = i.check(t);
      if (!m)
        throw new Error("not a UUID");
      this.version = m.version, m.format === "ascii" ? this.ascii = t : this.binary = t;
    }
    static v5(t, m) {
      return o(t, "sha1", 80, m);
    }
    toString() {
      return this.ascii == null && (this.ascii = a(this.binary)), this.ascii;
    }
    inspect() {
      return `UUID v${this.version} ${this.toString()}`;
    }
    static check(t, m = 0) {
      if (typeof t == "string")
        return t = t.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(t) ? t === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
          version: (c[t[14] + t[15]] & 240) >> 4,
          variant: f((c[t[19] + t[20]] & 224) >> 5),
          format: "ascii"
        } : !1;
      if (Buffer.isBuffer(t)) {
        if (t.length < m + 16)
          return !1;
        let v = 0;
        for (; v < 16 && t[m + v] === 0; v++)
          ;
        return v === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
          version: (t[m + 6] & 240) >> 4,
          variant: f((t[m + 8] & 224) >> 5),
          format: "binary"
        };
      }
      throw (0, d.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
    }
    // read stringified uuid into a Buffer
    static parse(t) {
      const m = Buffer.allocUnsafe(16);
      let v = 0;
      for (let E = 0; E < 16; E++)
        m[E] = c[t[v++] + t[v++]], (E === 3 || E === 5 || E === 7 || E === 9) && (v += 1);
      return m;
    }
  }
  Tt.UUID = i, i.OID = i.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
  function f(s) {
    switch (s) {
      case 0:
      case 1:
      case 3:
        return "ncs";
      case 4:
      case 5:
        return "rfc4122";
      case 6:
        return "microsoft";
      default:
        return "future";
    }
  }
  var n;
  (function(s) {
    s[s.ASCII = 0] = "ASCII", s[s.BINARY = 1] = "BINARY", s[s.OBJECT = 2] = "OBJECT";
  })(n || (n = {}));
  function o(s, t, m, v, E = n.ASCII) {
    const p = (0, r.createHash)(t);
    if (typeof s != "string" && !Buffer.isBuffer(s))
      throw (0, d.newError)(h, "ERR_INVALID_UUID_NAME");
    p.update(v), p.update(s);
    const T = p.digest();
    let O;
    switch (E) {
      case n.BINARY:
        T[6] = T[6] & 15 | m, T[8] = T[8] & 63 | 128, O = T;
        break;
      case n.OBJECT:
        T[6] = T[6] & 15 | m, T[8] = T[8] & 63 | 128, O = new i(T);
        break;
      default:
        O = l[T[0]] + l[T[1]] + l[T[2]] + l[T[3]] + "-" + l[T[4]] + l[T[5]] + "-" + l[T[6] & 15 | m] + l[T[7]] + "-" + l[T[8] & 63 | 128] + l[T[9]] + "-" + l[T[10]] + l[T[11]] + l[T[12]] + l[T[13]] + l[T[14]] + l[T[15]];
        break;
    }
    return O;
  }
  function a(s) {
    return l[s[0]] + l[s[1]] + l[s[2]] + l[s[3]] + "-" + l[s[4]] + l[s[5]] + "-" + l[s[6]] + l[s[7]] + "-" + l[s[8]] + l[s[9]] + "-" + l[s[10]] + l[s[11]] + l[s[12]] + l[s[13]] + l[s[14]] + l[s[15]];
  }
  return Tt.nil = new i("00000000-0000-0000-0000-000000000000"), Tt;
}
var Ft = {}, xn = {}, _o;
function Hc() {
  return _o || (_o = 1, function(r) {
    (function(d) {
      d.parser = function(_, g) {
        return new u(_, g);
      }, d.SAXParser = u, d.SAXStream = a, d.createStream = o, d.MAX_BUFFER_LENGTH = 64 * 1024;
      var h = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
      ];
      d.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
      ];
      function u(_, g) {
        if (!(this instanceof u))
          return new u(_, g);
        var H = this;
        l(H), H.q = H.c = "", H.bufferCheckPosition = d.MAX_BUFFER_LENGTH, H.opt = g || {}, H.opt.lowercase = H.opt.lowercase || H.opt.lowercasetags, H.looseCase = H.opt.lowercase ? "toLowerCase" : "toUpperCase", H.tags = [], H.closed = H.closedRoot = H.sawRoot = !1, H.tag = H.error = null, H.strict = !!_, H.noscript = !!(_ || H.opt.noscript), H.state = y.BEGIN, H.strictEntities = H.opt.strictEntities, H.ENTITIES = H.strictEntities ? Object.create(d.XML_ENTITIES) : Object.create(d.ENTITIES), H.attribList = [], H.opt.xmlns && (H.ns = Object.create(E)), H.opt.unquotedAttributeValues === void 0 && (H.opt.unquotedAttributeValues = !_), H.trackPosition = H.opt.position !== !1, H.trackPosition && (H.position = H.line = H.column = 0), U(H, "onready");
      }
      Object.create || (Object.create = function(_) {
        function g() {
        }
        g.prototype = _;
        var H = new g();
        return H;
      }), Object.keys || (Object.keys = function(_) {
        var g = [];
        for (var H in _) _.hasOwnProperty(H) && g.push(H);
        return g;
      });
      function c(_) {
        for (var g = Math.max(d.MAX_BUFFER_LENGTH, 10), H = 0, D = 0, le = h.length; D < le; D++) {
          var me = _[h[D]].length;
          if (me > g)
            switch (h[D]) {
              case "textNode":
                k(_);
                break;
              case "cdata":
                L(_, "oncdata", _.cdata), _.cdata = "";
                break;
              case "script":
                L(_, "onscript", _.script), _.script = "";
                break;
              default:
                I(_, "Max buffer length exceeded: " + h[D]);
            }
          H = Math.max(H, me);
        }
        var pe = d.MAX_BUFFER_LENGTH - H;
        _.bufferCheckPosition = pe + _.position;
      }
      function l(_) {
        for (var g = 0, H = h.length; g < H; g++)
          _[h[g]] = "";
      }
      function i(_) {
        k(_), _.cdata !== "" && (L(_, "oncdata", _.cdata), _.cdata = ""), _.script !== "" && (L(_, "onscript", _.script), _.script = "");
      }
      u.prototype = {
        end: function() {
          F(this);
        },
        write: Ee,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          i(this);
        }
      };
      var f;
      try {
        f = require("stream").Stream;
      } catch {
        f = function() {
        };
      }
      f || (f = function() {
      });
      var n = d.EVENTS.filter(function(_) {
        return _ !== "error" && _ !== "end";
      });
      function o(_, g) {
        return new a(_, g);
      }
      function a(_, g) {
        if (!(this instanceof a))
          return new a(_, g);
        f.apply(this), this._parser = new u(_, g), this.writable = !0, this.readable = !0;
        var H = this;
        this._parser.onend = function() {
          H.emit("end");
        }, this._parser.onerror = function(D) {
          H.emit("error", D), H._parser.error = null;
        }, this._decoder = null, n.forEach(function(D) {
          Object.defineProperty(H, "on" + D, {
            get: function() {
              return H._parser["on" + D];
            },
            set: function(le) {
              if (!le)
                return H.removeAllListeners(D), H._parser["on" + D] = le, le;
              H.on(D, le);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      a.prototype = Object.create(f.prototype, {
        constructor: {
          value: a
        }
      }), a.prototype.write = function(_) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(_)) {
          if (!this._decoder) {
            var g = ic.StringDecoder;
            this._decoder = new g("utf8");
          }
          _ = this._decoder.write(_);
        }
        return this._parser.write(_.toString()), this.emit("data", _), !0;
      }, a.prototype.end = function(_) {
        return _ && _.length && this.write(_), this._parser.end(), !0;
      }, a.prototype.on = function(_, g) {
        var H = this;
        return !H._parser["on" + _] && n.indexOf(_) !== -1 && (H._parser["on" + _] = function() {
          var D = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          D.splice(0, 0, _), H.emit.apply(H, D);
        }), f.prototype.on.call(H, _, g);
      };
      var s = "[CDATA[", t = "DOCTYPE", m = "http://www.w3.org/XML/1998/namespace", v = "http://www.w3.org/2000/xmlns/", E = { xml: m, xmlns: v }, p = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, S = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, T = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, O = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function P(_) {
        return _ === " " || _ === `
` || _ === "\r" || _ === "	";
      }
      function M(_) {
        return _ === '"' || _ === "'";
      }
      function C(_) {
        return _ === ">" || P(_);
      }
      function A(_, g) {
        return _.test(g);
      }
      function R(_, g) {
        return !A(_, g);
      }
      var y = 0;
      d.STATE = {
        BEGIN: y++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: y++,
        // leading whitespace
        TEXT: y++,
        // general stuff
        TEXT_ENTITY: y++,
        // &amp and such.
        OPEN_WAKA: y++,
        // <
        SGML_DECL: y++,
        // <!BLARG
        SGML_DECL_QUOTED: y++,
        // <!BLARG foo "bar
        DOCTYPE: y++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: y++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: y++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: y++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: y++,
        // <!-
        COMMENT: y++,
        // <!--
        COMMENT_ENDING: y++,
        // <!-- blah -
        COMMENT_ENDED: y++,
        // <!-- blah --
        CDATA: y++,
        // <![CDATA[ something
        CDATA_ENDING: y++,
        // ]
        CDATA_ENDING_2: y++,
        // ]]
        PROC_INST: y++,
        // <?hi
        PROC_INST_BODY: y++,
        // <?hi there
        PROC_INST_ENDING: y++,
        // <?hi "there" ?
        OPEN_TAG: y++,
        // <strong
        OPEN_TAG_SLASH: y++,
        // <strong /
        ATTRIB: y++,
        // <a
        ATTRIB_NAME: y++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: y++,
        // <a foo _
        ATTRIB_VALUE: y++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: y++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: y++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: y++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: y++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: y++,
        // <foo bar=&quot
        CLOSE_TAG: y++,
        // </a
        CLOSE_TAG_SAW_WHITE: y++,
        // </a   >
        SCRIPT: y++,
        // <script> ...
        SCRIPT_ENDING: y++
        // <script> ... <
      }, d.XML_ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'"
      }, d.ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830
      }, Object.keys(d.ENTITIES).forEach(function(_) {
        var g = d.ENTITIES[_], H = typeof g == "number" ? String.fromCharCode(g) : g;
        d.ENTITIES[_] = H;
      });
      for (var q in d.STATE)
        d.STATE[d.STATE[q]] = q;
      y = d.STATE;
      function U(_, g, H) {
        _[g] && _[g](H);
      }
      function L(_, g, H) {
        _.textNode && k(_), U(_, g, H);
      }
      function k(_) {
        _.textNode = N(_.opt, _.textNode), _.textNode && U(_, "ontext", _.textNode), _.textNode = "";
      }
      function N(_, g) {
        return _.trim && (g = g.trim()), _.normalize && (g = g.replace(/\s+/g, " ")), g;
      }
      function I(_, g) {
        return k(_), _.trackPosition && (g += `
Line: ` + _.line + `
Column: ` + _.column + `
Char: ` + _.c), g = new Error(g), _.error = g, U(_, "onerror", g), _;
      }
      function F(_) {
        return _.sawRoot && !_.closedRoot && $(_, "Unclosed root tag"), _.state !== y.BEGIN && _.state !== y.BEGIN_WHITESPACE && _.state !== y.TEXT && I(_, "Unexpected end"), k(_), _.c = "", _.closed = !0, U(_, "onend"), u.call(_, _.strict, _.opt), _;
      }
      function $(_, g) {
        if (typeof _ != "object" || !(_ instanceof u))
          throw new Error("bad call to strictFail");
        _.strict && I(_, g);
      }
      function J(_) {
        _.strict || (_.tagName = _.tagName[_.looseCase]());
        var g = _.tags[_.tags.length - 1] || _, H = _.tag = { name: _.tagName, attributes: {} };
        _.opt.xmlns && (H.ns = g.ns), _.attribList.length = 0, L(_, "onopentagstart", H);
      }
      function W(_, g) {
        var H = _.indexOf(":"), D = H < 0 ? ["", _] : _.split(":"), le = D[0], me = D[1];
        return g && _ === "xmlns" && (le = "xmlns", me = ""), { prefix: le, local: me };
      }
      function ne(_) {
        if (_.strict || (_.attribName = _.attribName[_.looseCase]()), _.attribList.indexOf(_.attribName) !== -1 || _.tag.attributes.hasOwnProperty(_.attribName)) {
          _.attribName = _.attribValue = "";
          return;
        }
        if (_.opt.xmlns) {
          var g = W(_.attribName, !0), H = g.prefix, D = g.local;
          if (H === "xmlns")
            if (D === "xml" && _.attribValue !== m)
              $(
                _,
                "xml: prefix must be bound to " + m + `
Actual: ` + _.attribValue
              );
            else if (D === "xmlns" && _.attribValue !== v)
              $(
                _,
                "xmlns: prefix must be bound to " + v + `
Actual: ` + _.attribValue
              );
            else {
              var le = _.tag, me = _.tags[_.tags.length - 1] || _;
              le.ns === me.ns && (le.ns = Object.create(me.ns)), le.ns[D] = _.attribValue;
            }
          _.attribList.push([_.attribName, _.attribValue]);
        } else
          _.tag.attributes[_.attribName] = _.attribValue, L(_, "onattribute", {
            name: _.attribName,
            value: _.attribValue
          });
        _.attribName = _.attribValue = "";
      }
      function ce(_, g) {
        if (_.opt.xmlns) {
          var H = _.tag, D = W(_.tagName);
          H.prefix = D.prefix, H.local = D.local, H.uri = H.ns[D.prefix] || "", H.prefix && !H.uri && ($(_, "Unbound namespace prefix: " + JSON.stringify(_.tagName)), H.uri = D.prefix);
          var le = _.tags[_.tags.length - 1] || _;
          H.ns && le.ns !== H.ns && Object.keys(H.ns).forEach(function(B) {
            L(_, "onopennamespace", {
              prefix: B,
              uri: H.ns[B]
            });
          });
          for (var me = 0, pe = _.attribList.length; me < pe; me++) {
            var _e = _.attribList[me], ye = _e[0], xe = _e[1], Ce = W(ye, !0), qe = Ce.prefix, gt = Ce.local, nt = qe === "" ? "" : H.ns[qe] || "", e = {
              name: ye,
              value: xe,
              prefix: qe,
              local: gt,
              uri: nt
            };
            qe && qe !== "xmlns" && !nt && ($(_, "Unbound namespace prefix: " + JSON.stringify(qe)), e.uri = qe), _.tag.attributes[ye] = e, L(_, "onattribute", e);
          }
          _.attribList.length = 0;
        }
        _.tag.isSelfClosing = !!g, _.sawRoot = !0, _.tags.push(_.tag), L(_, "onopentag", _.tag), g || (!_.noscript && _.tagName.toLowerCase() === "script" ? _.state = y.SCRIPT : _.state = y.TEXT, _.tag = null, _.tagName = ""), _.attribName = _.attribValue = "", _.attribList.length = 0;
      }
      function ue(_) {
        if (!_.tagName) {
          $(_, "Weird empty close tag."), _.textNode += "</>", _.state = y.TEXT;
          return;
        }
        if (_.script) {
          if (_.tagName !== "script") {
            _.script += "</" + _.tagName + ">", _.tagName = "", _.state = y.SCRIPT;
            return;
          }
          L(_, "onscript", _.script), _.script = "";
        }
        var g = _.tags.length, H = _.tagName;
        _.strict || (H = H[_.looseCase]());
        for (var D = H; g--; ) {
          var le = _.tags[g];
          if (le.name !== D)
            $(_, "Unexpected close tag");
          else
            break;
        }
        if (g < 0) {
          $(_, "Unmatched closing tag: " + _.tagName), _.textNode += "</" + _.tagName + ">", _.state = y.TEXT;
          return;
        }
        _.tagName = H;
        for (var me = _.tags.length; me-- > g; ) {
          var pe = _.tag = _.tags.pop();
          _.tagName = _.tag.name, L(_, "onclosetag", _.tagName);
          var _e = {};
          for (var ye in pe.ns)
            _e[ye] = pe.ns[ye];
          var xe = _.tags[_.tags.length - 1] || _;
          _.opt.xmlns && pe.ns !== xe.ns && Object.keys(pe.ns).forEach(function(Ce) {
            var qe = pe.ns[Ce];
            L(_, "onclosenamespace", { prefix: Ce, uri: qe });
          });
        }
        g === 0 && (_.closedRoot = !0), _.tagName = _.attribValue = _.attribName = "", _.attribList.length = 0, _.state = y.TEXT;
      }
      function ie(_) {
        var g = _.entity, H = g.toLowerCase(), D, le = "";
        return _.ENTITIES[g] ? _.ENTITIES[g] : _.ENTITIES[H] ? _.ENTITIES[H] : (g = H, g.charAt(0) === "#" && (g.charAt(1) === "x" ? (g = g.slice(2), D = parseInt(g, 16), le = D.toString(16)) : (g = g.slice(1), D = parseInt(g, 10), le = D.toString(10))), g = g.replace(/^0+/, ""), isNaN(D) || le.toLowerCase() !== g ? ($(_, "Invalid character entity"), "&" + _.entity + ";") : String.fromCodePoint(D));
      }
      function Ae(_, g) {
        g === "<" ? (_.state = y.OPEN_WAKA, _.startTagPosition = _.position) : P(g) || ($(_, "Non-whitespace before first tag."), _.textNode = g, _.state = y.TEXT);
      }
      function K(_, g) {
        var H = "";
        return g < _.length && (H = _.charAt(g)), H;
      }
      function Ee(_) {
        var g = this;
        if (this.error)
          throw this.error;
        if (g.closed)
          return I(
            g,
            "Cannot write after close. Assign an onready handler."
          );
        if (_ === null)
          return F(g);
        typeof _ == "object" && (_ = _.toString());
        for (var H = 0, D = ""; D = K(_, H++), g.c = D, !!D; )
          switch (g.trackPosition && (g.position++, D === `
` ? (g.line++, g.column = 0) : g.column++), g.state) {
            case y.BEGIN:
              if (g.state = y.BEGIN_WHITESPACE, D === "\uFEFF")
                continue;
              Ae(g, D);
              continue;
            case y.BEGIN_WHITESPACE:
              Ae(g, D);
              continue;
            case y.TEXT:
              if (g.sawRoot && !g.closedRoot) {
                for (var le = H - 1; D && D !== "<" && D !== "&"; )
                  D = K(_, H++), D && g.trackPosition && (g.position++, D === `
` ? (g.line++, g.column = 0) : g.column++);
                g.textNode += _.substring(le, H - 1);
              }
              D === "<" && !(g.sawRoot && g.closedRoot && !g.strict) ? (g.state = y.OPEN_WAKA, g.startTagPosition = g.position) : (!P(D) && (!g.sawRoot || g.closedRoot) && $(g, "Text data outside of root node."), D === "&" ? g.state = y.TEXT_ENTITY : g.textNode += D);
              continue;
            case y.SCRIPT:
              D === "<" ? g.state = y.SCRIPT_ENDING : g.script += D;
              continue;
            case y.SCRIPT_ENDING:
              D === "/" ? g.state = y.CLOSE_TAG : (g.script += "<" + D, g.state = y.SCRIPT);
              continue;
            case y.OPEN_WAKA:
              if (D === "!")
                g.state = y.SGML_DECL, g.sgmlDecl = "";
              else if (!P(D)) if (A(p, D))
                g.state = y.OPEN_TAG, g.tagName = D;
              else if (D === "/")
                g.state = y.CLOSE_TAG, g.tagName = "";
              else if (D === "?")
                g.state = y.PROC_INST, g.procInstName = g.procInstBody = "";
              else {
                if ($(g, "Unencoded <"), g.startTagPosition + 1 < g.position) {
                  var me = g.position - g.startTagPosition;
                  D = new Array(me).join(" ") + D;
                }
                g.textNode += "<" + D, g.state = y.TEXT;
              }
              continue;
            case y.SGML_DECL:
              if (g.sgmlDecl + D === "--") {
                g.state = y.COMMENT, g.comment = "", g.sgmlDecl = "";
                continue;
              }
              g.doctype && g.doctype !== !0 && g.sgmlDecl ? (g.state = y.DOCTYPE_DTD, g.doctype += "<!" + g.sgmlDecl + D, g.sgmlDecl = "") : (g.sgmlDecl + D).toUpperCase() === s ? (L(g, "onopencdata"), g.state = y.CDATA, g.sgmlDecl = "", g.cdata = "") : (g.sgmlDecl + D).toUpperCase() === t ? (g.state = y.DOCTYPE, (g.doctype || g.sawRoot) && $(
                g,
                "Inappropriately located doctype declaration"
              ), g.doctype = "", g.sgmlDecl = "") : D === ">" ? (L(g, "onsgmldeclaration", g.sgmlDecl), g.sgmlDecl = "", g.state = y.TEXT) : (M(D) && (g.state = y.SGML_DECL_QUOTED), g.sgmlDecl += D);
              continue;
            case y.SGML_DECL_QUOTED:
              D === g.q && (g.state = y.SGML_DECL, g.q = ""), g.sgmlDecl += D;
              continue;
            case y.DOCTYPE:
              D === ">" ? (g.state = y.TEXT, L(g, "ondoctype", g.doctype), g.doctype = !0) : (g.doctype += D, D === "[" ? g.state = y.DOCTYPE_DTD : M(D) && (g.state = y.DOCTYPE_QUOTED, g.q = D));
              continue;
            case y.DOCTYPE_QUOTED:
              g.doctype += D, D === g.q && (g.q = "", g.state = y.DOCTYPE);
              continue;
            case y.DOCTYPE_DTD:
              D === "]" ? (g.doctype += D, g.state = y.DOCTYPE) : D === "<" ? (g.state = y.OPEN_WAKA, g.startTagPosition = g.position) : M(D) ? (g.doctype += D, g.state = y.DOCTYPE_DTD_QUOTED, g.q = D) : g.doctype += D;
              continue;
            case y.DOCTYPE_DTD_QUOTED:
              g.doctype += D, D === g.q && (g.state = y.DOCTYPE_DTD, g.q = "");
              continue;
            case y.COMMENT:
              D === "-" ? g.state = y.COMMENT_ENDING : g.comment += D;
              continue;
            case y.COMMENT_ENDING:
              D === "-" ? (g.state = y.COMMENT_ENDED, g.comment = N(g.opt, g.comment), g.comment && L(g, "oncomment", g.comment), g.comment = "") : (g.comment += "-" + D, g.state = y.COMMENT);
              continue;
            case y.COMMENT_ENDED:
              D !== ">" ? ($(g, "Malformed comment"), g.comment += "--" + D, g.state = y.COMMENT) : g.doctype && g.doctype !== !0 ? g.state = y.DOCTYPE_DTD : g.state = y.TEXT;
              continue;
            case y.CDATA:
              D === "]" ? g.state = y.CDATA_ENDING : g.cdata += D;
              continue;
            case y.CDATA_ENDING:
              D === "]" ? g.state = y.CDATA_ENDING_2 : (g.cdata += "]" + D, g.state = y.CDATA);
              continue;
            case y.CDATA_ENDING_2:
              D === ">" ? (g.cdata && L(g, "oncdata", g.cdata), L(g, "onclosecdata"), g.cdata = "", g.state = y.TEXT) : D === "]" ? g.cdata += "]" : (g.cdata += "]]" + D, g.state = y.CDATA);
              continue;
            case y.PROC_INST:
              D === "?" ? g.state = y.PROC_INST_ENDING : P(D) ? g.state = y.PROC_INST_BODY : g.procInstName += D;
              continue;
            case y.PROC_INST_BODY:
              if (!g.procInstBody && P(D))
                continue;
              D === "?" ? g.state = y.PROC_INST_ENDING : g.procInstBody += D;
              continue;
            case y.PROC_INST_ENDING:
              D === ">" ? (L(g, "onprocessinginstruction", {
                name: g.procInstName,
                body: g.procInstBody
              }), g.procInstName = g.procInstBody = "", g.state = y.TEXT) : (g.procInstBody += "?" + D, g.state = y.PROC_INST_BODY);
              continue;
            case y.OPEN_TAG:
              A(S, D) ? g.tagName += D : (J(g), D === ">" ? ce(g) : D === "/" ? g.state = y.OPEN_TAG_SLASH : (P(D) || $(g, "Invalid character in tag name"), g.state = y.ATTRIB));
              continue;
            case y.OPEN_TAG_SLASH:
              D === ">" ? (ce(g, !0), ue(g)) : ($(g, "Forward-slash in opening tag not followed by >"), g.state = y.ATTRIB);
              continue;
            case y.ATTRIB:
              if (P(D))
                continue;
              D === ">" ? ce(g) : D === "/" ? g.state = y.OPEN_TAG_SLASH : A(p, D) ? (g.attribName = D, g.attribValue = "", g.state = y.ATTRIB_NAME) : $(g, "Invalid attribute name");
              continue;
            case y.ATTRIB_NAME:
              D === "=" ? g.state = y.ATTRIB_VALUE : D === ">" ? ($(g, "Attribute without value"), g.attribValue = g.attribName, ne(g), ce(g)) : P(D) ? g.state = y.ATTRIB_NAME_SAW_WHITE : A(S, D) ? g.attribName += D : $(g, "Invalid attribute name");
              continue;
            case y.ATTRIB_NAME_SAW_WHITE:
              if (D === "=")
                g.state = y.ATTRIB_VALUE;
              else {
                if (P(D))
                  continue;
                $(g, "Attribute without value"), g.tag.attributes[g.attribName] = "", g.attribValue = "", L(g, "onattribute", {
                  name: g.attribName,
                  value: ""
                }), g.attribName = "", D === ">" ? ce(g) : A(p, D) ? (g.attribName = D, g.state = y.ATTRIB_NAME) : ($(g, "Invalid attribute name"), g.state = y.ATTRIB);
              }
              continue;
            case y.ATTRIB_VALUE:
              if (P(D))
                continue;
              M(D) ? (g.q = D, g.state = y.ATTRIB_VALUE_QUOTED) : (g.opt.unquotedAttributeValues || I(g, "Unquoted attribute value"), g.state = y.ATTRIB_VALUE_UNQUOTED, g.attribValue = D);
              continue;
            case y.ATTRIB_VALUE_QUOTED:
              if (D !== g.q) {
                D === "&" ? g.state = y.ATTRIB_VALUE_ENTITY_Q : g.attribValue += D;
                continue;
              }
              ne(g), g.q = "", g.state = y.ATTRIB_VALUE_CLOSED;
              continue;
            case y.ATTRIB_VALUE_CLOSED:
              P(D) ? g.state = y.ATTRIB : D === ">" ? ce(g) : D === "/" ? g.state = y.OPEN_TAG_SLASH : A(p, D) ? ($(g, "No whitespace between attributes"), g.attribName = D, g.attribValue = "", g.state = y.ATTRIB_NAME) : $(g, "Invalid attribute name");
              continue;
            case y.ATTRIB_VALUE_UNQUOTED:
              if (!C(D)) {
                D === "&" ? g.state = y.ATTRIB_VALUE_ENTITY_U : g.attribValue += D;
                continue;
              }
              ne(g), D === ">" ? ce(g) : g.state = y.ATTRIB;
              continue;
            case y.CLOSE_TAG:
              if (g.tagName)
                D === ">" ? ue(g) : A(S, D) ? g.tagName += D : g.script ? (g.script += "</" + g.tagName, g.tagName = "", g.state = y.SCRIPT) : (P(D) || $(g, "Invalid tagname in closing tag"), g.state = y.CLOSE_TAG_SAW_WHITE);
              else {
                if (P(D))
                  continue;
                R(p, D) ? g.script ? (g.script += "</" + D, g.state = y.SCRIPT) : $(g, "Invalid tagname in closing tag.") : g.tagName = D;
              }
              continue;
            case y.CLOSE_TAG_SAW_WHITE:
              if (P(D))
                continue;
              D === ">" ? ue(g) : $(g, "Invalid characters in closing tag");
              continue;
            case y.TEXT_ENTITY:
            case y.ATTRIB_VALUE_ENTITY_Q:
            case y.ATTRIB_VALUE_ENTITY_U:
              var pe, _e;
              switch (g.state) {
                case y.TEXT_ENTITY:
                  pe = y.TEXT, _e = "textNode";
                  break;
                case y.ATTRIB_VALUE_ENTITY_Q:
                  pe = y.ATTRIB_VALUE_QUOTED, _e = "attribValue";
                  break;
                case y.ATTRIB_VALUE_ENTITY_U:
                  pe = y.ATTRIB_VALUE_UNQUOTED, _e = "attribValue";
                  break;
              }
              if (D === ";") {
                var ye = ie(g);
                g.opt.unparsedEntities && !Object.values(d.XML_ENTITIES).includes(ye) ? (g.entity = "", g.state = pe, g.write(ye)) : (g[_e] += ye, g.entity = "", g.state = pe);
              } else A(g.entity.length ? O : T, D) ? g.entity += D : ($(g, "Invalid character in entity name"), g[_e] += "&" + g.entity + D, g.entity = "", g.state = pe);
              continue;
            default:
              throw new Error(g, "Unknown state: " + g.state);
          }
        return g.position >= g.bufferCheckPosition && c(g), g;
      }
      /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
      String.fromCodePoint || function() {
        var _ = String.fromCharCode, g = Math.floor, H = function() {
          var D = 16384, le = [], me, pe, _e = -1, ye = arguments.length;
          if (!ye)
            return "";
          for (var xe = ""; ++_e < ye; ) {
            var Ce = Number(arguments[_e]);
            if (!isFinite(Ce) || // `NaN`, `+Infinity`, or `-Infinity`
            Ce < 0 || // not a valid Unicode code point
            Ce > 1114111 || // not a valid Unicode code point
            g(Ce) !== Ce)
              throw RangeError("Invalid code point: " + Ce);
            Ce <= 65535 ? le.push(Ce) : (Ce -= 65536, me = (Ce >> 10) + 55296, pe = Ce % 1024 + 56320, le.push(me, pe)), (_e + 1 === ye || le.length > D) && (xe += _.apply(null, le), le.length = 0);
          }
          return xe;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: H,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = H;
      }();
    })(r);
  }(xn)), xn;
}
var So;
function jc() {
  if (So) return Ft;
  So = 1, Object.defineProperty(Ft, "__esModule", { value: !0 }), Ft.XElement = void 0, Ft.parseXml = i;
  const r = Hc(), d = Br();
  class h {
    constructor(n) {
      if (this.name = n, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !n)
        throw (0, d.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
      if (!c(n))
        throw (0, d.newError)(`Invalid element name: ${n}`, "ERR_XML_ELEMENT_INVALID_NAME");
    }
    attribute(n) {
      const o = this.attributes === null ? null : this.attributes[n];
      if (o == null)
        throw (0, d.newError)(`No attribute "${n}"`, "ERR_XML_MISSED_ATTRIBUTE");
      return o;
    }
    removeAttribute(n) {
      this.attributes !== null && delete this.attributes[n];
    }
    element(n, o = !1, a = null) {
      const s = this.elementOrNull(n, o);
      if (s === null)
        throw (0, d.newError)(a || `No element "${n}"`, "ERR_XML_MISSED_ELEMENT");
      return s;
    }
    elementOrNull(n, o = !1) {
      if (this.elements === null)
        return null;
      for (const a of this.elements)
        if (l(a, n, o))
          return a;
      return null;
    }
    getElements(n, o = !1) {
      return this.elements === null ? [] : this.elements.filter((a) => l(a, n, o));
    }
    elementValueOrEmpty(n, o = !1) {
      const a = this.elementOrNull(n, o);
      return a === null ? "" : a.value;
    }
  }
  Ft.XElement = h;
  const u = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
  function c(f) {
    return u.test(f);
  }
  function l(f, n, o) {
    const a = f.name;
    return a === n || o === !0 && a.length === n.length && a.toLowerCase() === n.toLowerCase();
  }
  function i(f) {
    let n = null;
    const o = r.parser(!0, {}), a = [];
    return o.onopentag = (s) => {
      const t = new h(s.name);
      if (t.attributes = s.attributes, n === null)
        n = t;
      else {
        const m = a[a.length - 1];
        m.elements == null && (m.elements = []), m.elements.push(t);
      }
      a.push(t);
    }, o.onclosetag = () => {
      a.pop();
    }, o.ontext = (s) => {
      a.length > 0 && (a[a.length - 1].value = s);
    }, o.oncdata = (s) => {
      const t = a[a.length - 1];
      t.value = s, t.isCData = !0;
    }, o.onerror = (s) => {
      throw s;
    }, o.write(f), n;
  }
  return Ft;
}
var Ao;
function ke() {
  return Ao || (Ao = 1, function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.CURRENT_APP_PACKAGE_FILE_NAME = r.CURRENT_APP_INSTALLER_FILE_NAME = r.XElement = r.parseXml = r.UUID = r.parseDn = r.retry = r.githubUrl = r.getS3LikeProviderBaseUrl = r.ProgressCallbackTransform = r.MemoLazy = r.safeStringifyJson = r.safeGetHeader = r.parseJson = r.HttpExecutor = r.HttpError = r.DigestTransform = r.createHttpError = r.configureRequestUrl = r.configureRequestOptionsFromUrl = r.configureRequestOptions = r.newError = r.CancellationToken = r.CancellationError = void 0, r.asArray = s;
    var d = ta();
    Object.defineProperty(r, "CancellationError", { enumerable: !0, get: function() {
      return d.CancellationError;
    } }), Object.defineProperty(r, "CancellationToken", { enumerable: !0, get: function() {
      return d.CancellationToken;
    } });
    var h = Br();
    Object.defineProperty(r, "newError", { enumerable: !0, get: function() {
      return h.newError;
    } });
    var u = Uc();
    Object.defineProperty(r, "configureRequestOptions", { enumerable: !0, get: function() {
      return u.configureRequestOptions;
    } }), Object.defineProperty(r, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
      return u.configureRequestOptionsFromUrl;
    } }), Object.defineProperty(r, "configureRequestUrl", { enumerable: !0, get: function() {
      return u.configureRequestUrl;
    } }), Object.defineProperty(r, "createHttpError", { enumerable: !0, get: function() {
      return u.createHttpError;
    } }), Object.defineProperty(r, "DigestTransform", { enumerable: !0, get: function() {
      return u.DigestTransform;
    } }), Object.defineProperty(r, "HttpError", { enumerable: !0, get: function() {
      return u.HttpError;
    } }), Object.defineProperty(r, "HttpExecutor", { enumerable: !0, get: function() {
      return u.HttpExecutor;
    } }), Object.defineProperty(r, "parseJson", { enumerable: !0, get: function() {
      return u.parseJson;
    } }), Object.defineProperty(r, "safeGetHeader", { enumerable: !0, get: function() {
      return u.safeGetHeader;
    } }), Object.defineProperty(r, "safeStringifyJson", { enumerable: !0, get: function() {
      return u.safeStringifyJson;
    } });
    var c = $c();
    Object.defineProperty(r, "MemoLazy", { enumerable: !0, get: function() {
      return c.MemoLazy;
    } });
    var l = Nl();
    Object.defineProperty(r, "ProgressCallbackTransform", { enumerable: !0, get: function() {
      return l.ProgressCallbackTransform;
    } });
    var i = kc();
    Object.defineProperty(r, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
      return i.getS3LikeProviderBaseUrl;
    } }), Object.defineProperty(r, "githubUrl", { enumerable: !0, get: function() {
      return i.githubUrl;
    } });
    var f = qc();
    Object.defineProperty(r, "retry", { enumerable: !0, get: function() {
      return f.retry;
    } });
    var n = Mc();
    Object.defineProperty(r, "parseDn", { enumerable: !0, get: function() {
      return n.parseDn;
    } });
    var o = Bc();
    Object.defineProperty(r, "UUID", { enumerable: !0, get: function() {
      return o.UUID;
    } });
    var a = jc();
    Object.defineProperty(r, "parseXml", { enumerable: !0, get: function() {
      return a.parseXml;
    } }), Object.defineProperty(r, "XElement", { enumerable: !0, get: function() {
      return a.XElement;
    } }), r.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", r.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
    function s(t) {
      return t == null ? [] : Array.isArray(t) ? t : [t];
    }
  }(Pn)), Pn;
}
var He = {}, Fr = {}, ct = {}, Ro;
function mr() {
  if (Ro) return ct;
  Ro = 1;
  function r(i) {
    return typeof i > "u" || i === null;
  }
  function d(i) {
    return typeof i == "object" && i !== null;
  }
  function h(i) {
    return Array.isArray(i) ? i : r(i) ? [] : [i];
  }
  function u(i, f) {
    var n, o, a, s;
    if (f)
      for (s = Object.keys(f), n = 0, o = s.length; n < o; n += 1)
        a = s[n], i[a] = f[a];
    return i;
  }
  function c(i, f) {
    var n = "", o;
    for (o = 0; o < f; o += 1)
      n += i;
    return n;
  }
  function l(i) {
    return i === 0 && Number.NEGATIVE_INFINITY === 1 / i;
  }
  return ct.isNothing = r, ct.isObject = d, ct.toArray = h, ct.repeat = c, ct.isNegativeZero = l, ct.extend = u, ct;
}
var Ln, To;
function gr() {
  if (To) return Ln;
  To = 1;
  function r(h, u) {
    var c = "", l = h.reason || "(unknown reason)";
    return h.mark ? (h.mark.name && (c += 'in "' + h.mark.name + '" '), c += "(" + (h.mark.line + 1) + ":" + (h.mark.column + 1) + ")", !u && h.mark.snippet && (c += `

` + h.mark.snippet), l + " " + c) : l;
  }
  function d(h, u) {
    Error.call(this), this.name = "YAMLException", this.reason = h, this.mark = u, this.message = r(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
  }
  return d.prototype = Object.create(Error.prototype), d.prototype.constructor = d, d.prototype.toString = function(u) {
    return this.name + ": " + r(this, u);
  }, Ln = d, Ln;
}
var Un, Co;
function Gc() {
  if (Co) return Un;
  Co = 1;
  var r = mr();
  function d(c, l, i, f, n) {
    var o = "", a = "", s = Math.floor(n / 2) - 1;
    return f - l > s && (o = " ... ", l = f - s + o.length), i - f > s && (a = " ...", i = f + s - a.length), {
      str: o + c.slice(l, i).replace(/\t/g, "→") + a,
      pos: f - l + o.length
      // relative position
    };
  }
  function h(c, l) {
    return r.repeat(" ", l - c.length) + c;
  }
  function u(c, l) {
    if (l = Object.create(l || null), !c.buffer) return null;
    l.maxLength || (l.maxLength = 79), typeof l.indent != "number" && (l.indent = 1), typeof l.linesBefore != "number" && (l.linesBefore = 3), typeof l.linesAfter != "number" && (l.linesAfter = 2);
    for (var i = /\r?\n|\r|\0/g, f = [0], n = [], o, a = -1; o = i.exec(c.buffer); )
      n.push(o.index), f.push(o.index + o[0].length), c.position <= o.index && a < 0 && (a = f.length - 2);
    a < 0 && (a = f.length - 1);
    var s = "", t, m, v = Math.min(c.line + l.linesAfter, n.length).toString().length, E = l.maxLength - (l.indent + v + 3);
    for (t = 1; t <= l.linesBefore && !(a - t < 0); t++)
      m = d(
        c.buffer,
        f[a - t],
        n[a - t],
        c.position - (f[a] - f[a - t]),
        E
      ), s = r.repeat(" ", l.indent) + h((c.line - t + 1).toString(), v) + " | " + m.str + `
` + s;
    for (m = d(c.buffer, f[a], n[a], c.position, E), s += r.repeat(" ", l.indent) + h((c.line + 1).toString(), v) + " | " + m.str + `
`, s += r.repeat("-", l.indent + v + 3 + m.pos) + `^
`, t = 1; t <= l.linesAfter && !(a + t >= n.length); t++)
      m = d(
        c.buffer,
        f[a + t],
        n[a + t],
        c.position - (f[a] - f[a + t]),
        E
      ), s += r.repeat(" ", l.indent) + h((c.line + t + 1).toString(), v) + " | " + m.str + `
`;
    return s.replace(/\n$/, "");
  }
  return Un = u, Un;
}
var $n, bo;
function je() {
  if (bo) return $n;
  bo = 1;
  var r = gr(), d = [
    "kind",
    "multi",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "representName",
    "defaultStyle",
    "styleAliases"
  ], h = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function u(l) {
    var i = {};
    return l !== null && Object.keys(l).forEach(function(f) {
      l[f].forEach(function(n) {
        i[String(n)] = f;
      });
    }), i;
  }
  function c(l, i) {
    if (i = i || {}, Object.keys(i).forEach(function(f) {
      if (d.indexOf(f) === -1)
        throw new r('Unknown option "' + f + '" is met in definition of "' + l + '" YAML type.');
    }), this.options = i, this.tag = l, this.kind = i.kind || null, this.resolve = i.resolve || function() {
      return !0;
    }, this.construct = i.construct || function(f) {
      return f;
    }, this.instanceOf = i.instanceOf || null, this.predicate = i.predicate || null, this.represent = i.represent || null, this.representName = i.representName || null, this.defaultStyle = i.defaultStyle || null, this.multi = i.multi || !1, this.styleAliases = u(i.styleAliases || null), h.indexOf(this.kind) === -1)
      throw new r('Unknown kind "' + this.kind + '" is specified for "' + l + '" YAML type.');
  }
  return $n = c, $n;
}
var kn, Oo;
function Fl() {
  if (Oo) return kn;
  Oo = 1;
  var r = gr(), d = je();
  function h(l, i) {
    var f = [];
    return l[i].forEach(function(n) {
      var o = f.length;
      f.forEach(function(a, s) {
        a.tag === n.tag && a.kind === n.kind && a.multi === n.multi && (o = s);
      }), f[o] = n;
    }), f;
  }
  function u() {
    var l = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    }, i, f;
    function n(o) {
      o.multi ? (l.multi[o.kind].push(o), l.multi.fallback.push(o)) : l[o.kind][o.tag] = l.fallback[o.tag] = o;
    }
    for (i = 0, f = arguments.length; i < f; i += 1)
      arguments[i].forEach(n);
    return l;
  }
  function c(l) {
    return this.extend(l);
  }
  return c.prototype.extend = function(i) {
    var f = [], n = [];
    if (i instanceof d)
      n.push(i);
    else if (Array.isArray(i))
      n = n.concat(i);
    else if (i && (Array.isArray(i.implicit) || Array.isArray(i.explicit)))
      i.implicit && (f = f.concat(i.implicit)), i.explicit && (n = n.concat(i.explicit));
    else
      throw new r("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    f.forEach(function(a) {
      if (!(a instanceof d))
        throw new r("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (a.loadKind && a.loadKind !== "scalar")
        throw new r("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (a.multi)
        throw new r("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }), n.forEach(function(a) {
      if (!(a instanceof d))
        throw new r("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    var o = Object.create(c.prototype);
    return o.implicit = (this.implicit || []).concat(f), o.explicit = (this.explicit || []).concat(n), o.compiledImplicit = h(o, "implicit"), o.compiledExplicit = h(o, "explicit"), o.compiledTypeMap = u(o.compiledImplicit, o.compiledExplicit), o;
  }, kn = c, kn;
}
var qn, Po;
function xl() {
  if (Po) return qn;
  Po = 1;
  var r = je();
  return qn = new r("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(d) {
      return d !== null ? d : "";
    }
  }), qn;
}
var Mn, Io;
function Ll() {
  if (Io) return Mn;
  Io = 1;
  var r = je();
  return Mn = new r("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(d) {
      return d !== null ? d : [];
    }
  }), Mn;
}
var Bn, Do;
function Ul() {
  if (Do) return Bn;
  Do = 1;
  var r = je();
  return Bn = new r("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(d) {
      return d !== null ? d : {};
    }
  }), Bn;
}
var Hn, No;
function $l() {
  if (No) return Hn;
  No = 1;
  var r = Fl();
  return Hn = new r({
    explicit: [
      xl(),
      Ll(),
      Ul()
    ]
  }), Hn;
}
var jn, Fo;
function kl() {
  if (Fo) return jn;
  Fo = 1;
  var r = je();
  function d(c) {
    if (c === null) return !0;
    var l = c.length;
    return l === 1 && c === "~" || l === 4 && (c === "null" || c === "Null" || c === "NULL");
  }
  function h() {
    return null;
  }
  function u(c) {
    return c === null;
  }
  return jn = new r("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: d,
    construct: h,
    predicate: u,
    represent: {
      canonical: function() {
        return "~";
      },
      lowercase: function() {
        return "null";
      },
      uppercase: function() {
        return "NULL";
      },
      camelcase: function() {
        return "Null";
      },
      empty: function() {
        return "";
      }
    },
    defaultStyle: "lowercase"
  }), jn;
}
var Gn, xo;
function ql() {
  if (xo) return Gn;
  xo = 1;
  var r = je();
  function d(c) {
    if (c === null) return !1;
    var l = c.length;
    return l === 4 && (c === "true" || c === "True" || c === "TRUE") || l === 5 && (c === "false" || c === "False" || c === "FALSE");
  }
  function h(c) {
    return c === "true" || c === "True" || c === "TRUE";
  }
  function u(c) {
    return Object.prototype.toString.call(c) === "[object Boolean]";
  }
  return Gn = new r("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: d,
    construct: h,
    predicate: u,
    represent: {
      lowercase: function(c) {
        return c ? "true" : "false";
      },
      uppercase: function(c) {
        return c ? "TRUE" : "FALSE";
      },
      camelcase: function(c) {
        return c ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  }), Gn;
}
var Wn, Lo;
function Ml() {
  if (Lo) return Wn;
  Lo = 1;
  var r = mr(), d = je();
  function h(n) {
    return 48 <= n && n <= 57 || 65 <= n && n <= 70 || 97 <= n && n <= 102;
  }
  function u(n) {
    return 48 <= n && n <= 55;
  }
  function c(n) {
    return 48 <= n && n <= 57;
  }
  function l(n) {
    if (n === null) return !1;
    var o = n.length, a = 0, s = !1, t;
    if (!o) return !1;
    if (t = n[a], (t === "-" || t === "+") && (t = n[++a]), t === "0") {
      if (a + 1 === o) return !0;
      if (t = n[++a], t === "b") {
        for (a++; a < o; a++)
          if (t = n[a], t !== "_") {
            if (t !== "0" && t !== "1") return !1;
            s = !0;
          }
        return s && t !== "_";
      }
      if (t === "x") {
        for (a++; a < o; a++)
          if (t = n[a], t !== "_") {
            if (!h(n.charCodeAt(a))) return !1;
            s = !0;
          }
        return s && t !== "_";
      }
      if (t === "o") {
        for (a++; a < o; a++)
          if (t = n[a], t !== "_") {
            if (!u(n.charCodeAt(a))) return !1;
            s = !0;
          }
        return s && t !== "_";
      }
    }
    if (t === "_") return !1;
    for (; a < o; a++)
      if (t = n[a], t !== "_") {
        if (!c(n.charCodeAt(a)))
          return !1;
        s = !0;
      }
    return !(!s || t === "_");
  }
  function i(n) {
    var o = n, a = 1, s;
    if (o.indexOf("_") !== -1 && (o = o.replace(/_/g, "")), s = o[0], (s === "-" || s === "+") && (s === "-" && (a = -1), o = o.slice(1), s = o[0]), o === "0") return 0;
    if (s === "0") {
      if (o[1] === "b") return a * parseInt(o.slice(2), 2);
      if (o[1] === "x") return a * parseInt(o.slice(2), 16);
      if (o[1] === "o") return a * parseInt(o.slice(2), 8);
    }
    return a * parseInt(o, 10);
  }
  function f(n) {
    return Object.prototype.toString.call(n) === "[object Number]" && n % 1 === 0 && !r.isNegativeZero(n);
  }
  return Wn = new d("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: l,
    construct: i,
    predicate: f,
    represent: {
      binary: function(n) {
        return n >= 0 ? "0b" + n.toString(2) : "-0b" + n.toString(2).slice(1);
      },
      octal: function(n) {
        return n >= 0 ? "0o" + n.toString(8) : "-0o" + n.toString(8).slice(1);
      },
      decimal: function(n) {
        return n.toString(10);
      },
      /* eslint-disable max-len */
      hexadecimal: function(n) {
        return n >= 0 ? "0x" + n.toString(16).toUpperCase() : "-0x" + n.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  }), Wn;
}
var Vn, Uo;
function Bl() {
  if (Uo) return Vn;
  Uo = 1;
  var r = mr(), d = je(), h = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function u(n) {
    return !(n === null || !h.test(n) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    n[n.length - 1] === "_");
  }
  function c(n) {
    var o, a;
    return o = n.replace(/_/g, "").toLowerCase(), a = o[0] === "-" ? -1 : 1, "+-".indexOf(o[0]) >= 0 && (o = o.slice(1)), o === ".inf" ? a === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : o === ".nan" ? NaN : a * parseFloat(o, 10);
  }
  var l = /^[-+]?[0-9]+e/;
  function i(n, o) {
    var a;
    if (isNaN(n))
      switch (o) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    else if (Number.POSITIVE_INFINITY === n)
      switch (o) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    else if (Number.NEGATIVE_INFINITY === n)
      switch (o) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    else if (r.isNegativeZero(n))
      return "-0.0";
    return a = n.toString(10), l.test(a) ? a.replace("e", ".e") : a;
  }
  function f(n) {
    return Object.prototype.toString.call(n) === "[object Number]" && (n % 1 !== 0 || r.isNegativeZero(n));
  }
  return Vn = new d("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: u,
    construct: c,
    predicate: f,
    represent: i,
    defaultStyle: "lowercase"
  }), Vn;
}
var Yn, $o;
function Hl() {
  return $o || ($o = 1, Yn = $l().extend({
    implicit: [
      kl(),
      ql(),
      Ml(),
      Bl()
    ]
  })), Yn;
}
var zn, ko;
function jl() {
  return ko || (ko = 1, zn = Hl()), zn;
}
var Xn, qo;
function Gl() {
  if (qo) return Xn;
  qo = 1;
  var r = je(), d = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  ), h = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function u(i) {
    return i === null ? !1 : d.exec(i) !== null || h.exec(i) !== null;
  }
  function c(i) {
    var f, n, o, a, s, t, m, v = 0, E = null, p, S, T;
    if (f = d.exec(i), f === null && (f = h.exec(i)), f === null) throw new Error("Date resolve error");
    if (n = +f[1], o = +f[2] - 1, a = +f[3], !f[4])
      return new Date(Date.UTC(n, o, a));
    if (s = +f[4], t = +f[5], m = +f[6], f[7]) {
      for (v = f[7].slice(0, 3); v.length < 3; )
        v += "0";
      v = +v;
    }
    return f[9] && (p = +f[10], S = +(f[11] || 0), E = (p * 60 + S) * 6e4, f[9] === "-" && (E = -E)), T = new Date(Date.UTC(n, o, a, s, t, m, v)), E && T.setTime(T.getTime() - E), T;
  }
  function l(i) {
    return i.toISOString();
  }
  return Xn = new r("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: u,
    construct: c,
    instanceOf: Date,
    represent: l
  }), Xn;
}
var Kn, Mo;
function Wl() {
  if (Mo) return Kn;
  Mo = 1;
  var r = je();
  function d(h) {
    return h === "<<" || h === null;
  }
  return Kn = new r("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: d
  }), Kn;
}
var Jn, Bo;
function Vl() {
  if (Bo) return Jn;
  Bo = 1;
  var r = je(), d = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
  function h(i) {
    if (i === null) return !1;
    var f, n, o = 0, a = i.length, s = d;
    for (n = 0; n < a; n++)
      if (f = s.indexOf(i.charAt(n)), !(f > 64)) {
        if (f < 0) return !1;
        o += 6;
      }
    return o % 8 === 0;
  }
  function u(i) {
    var f, n, o = i.replace(/[\r\n=]/g, ""), a = o.length, s = d, t = 0, m = [];
    for (f = 0; f < a; f++)
      f % 4 === 0 && f && (m.push(t >> 16 & 255), m.push(t >> 8 & 255), m.push(t & 255)), t = t << 6 | s.indexOf(o.charAt(f));
    return n = a % 4 * 6, n === 0 ? (m.push(t >> 16 & 255), m.push(t >> 8 & 255), m.push(t & 255)) : n === 18 ? (m.push(t >> 10 & 255), m.push(t >> 2 & 255)) : n === 12 && m.push(t >> 4 & 255), new Uint8Array(m);
  }
  function c(i) {
    var f = "", n = 0, o, a, s = i.length, t = d;
    for (o = 0; o < s; o++)
      o % 3 === 0 && o && (f += t[n >> 18 & 63], f += t[n >> 12 & 63], f += t[n >> 6 & 63], f += t[n & 63]), n = (n << 8) + i[o];
    return a = s % 3, a === 0 ? (f += t[n >> 18 & 63], f += t[n >> 12 & 63], f += t[n >> 6 & 63], f += t[n & 63]) : a === 2 ? (f += t[n >> 10 & 63], f += t[n >> 4 & 63], f += t[n << 2 & 63], f += t[64]) : a === 1 && (f += t[n >> 2 & 63], f += t[n << 4 & 63], f += t[64], f += t[64]), f;
  }
  function l(i) {
    return Object.prototype.toString.call(i) === "[object Uint8Array]";
  }
  return Jn = new r("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: h,
    construct: u,
    predicate: l,
    represent: c
  }), Jn;
}
var Qn, Ho;
function Yl() {
  if (Ho) return Qn;
  Ho = 1;
  var r = je(), d = Object.prototype.hasOwnProperty, h = Object.prototype.toString;
  function u(l) {
    if (l === null) return !0;
    var i = [], f, n, o, a, s, t = l;
    for (f = 0, n = t.length; f < n; f += 1) {
      if (o = t[f], s = !1, h.call(o) !== "[object Object]") return !1;
      for (a in o)
        if (d.call(o, a))
          if (!s) s = !0;
          else return !1;
      if (!s) return !1;
      if (i.indexOf(a) === -1) i.push(a);
      else return !1;
    }
    return !0;
  }
  function c(l) {
    return l !== null ? l : [];
  }
  return Qn = new r("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: u,
    construct: c
  }), Qn;
}
var Zn, jo;
function zl() {
  if (jo) return Zn;
  jo = 1;
  var r = je(), d = Object.prototype.toString;
  function h(c) {
    if (c === null) return !0;
    var l, i, f, n, o, a = c;
    for (o = new Array(a.length), l = 0, i = a.length; l < i; l += 1) {
      if (f = a[l], d.call(f) !== "[object Object]" || (n = Object.keys(f), n.length !== 1)) return !1;
      o[l] = [n[0], f[n[0]]];
    }
    return !0;
  }
  function u(c) {
    if (c === null) return [];
    var l, i, f, n, o, a = c;
    for (o = new Array(a.length), l = 0, i = a.length; l < i; l += 1)
      f = a[l], n = Object.keys(f), o[l] = [n[0], f[n[0]]];
    return o;
  }
  return Zn = new r("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: h,
    construct: u
  }), Zn;
}
var ei, Go;
function Xl() {
  if (Go) return ei;
  Go = 1;
  var r = je(), d = Object.prototype.hasOwnProperty;
  function h(c) {
    if (c === null) return !0;
    var l, i = c;
    for (l in i)
      if (d.call(i, l) && i[l] !== null)
        return !1;
    return !0;
  }
  function u(c) {
    return c !== null ? c : {};
  }
  return ei = new r("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: h,
    construct: u
  }), ei;
}
var ti, Wo;
function ra() {
  return Wo || (Wo = 1, ti = jl().extend({
    implicit: [
      Gl(),
      Wl()
    ],
    explicit: [
      Vl(),
      Yl(),
      zl(),
      Xl()
    ]
  })), ti;
}
var Vo;
function Wc() {
  if (Vo) return Fr;
  Vo = 1;
  var r = mr(), d = gr(), h = Gc(), u = ra(), c = Object.prototype.hasOwnProperty, l = 1, i = 2, f = 3, n = 4, o = 1, a = 2, s = 3, t = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, m = /[\x85\u2028\u2029]/, v = /[,\[\]\{\}]/, E = /^(?:!|!!|![a-z\-]+!)$/i, p = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function S(e) {
    return Object.prototype.toString.call(e);
  }
  function T(e) {
    return e === 10 || e === 13;
  }
  function O(e) {
    return e === 9 || e === 32;
  }
  function P(e) {
    return e === 9 || e === 32 || e === 10 || e === 13;
  }
  function M(e) {
    return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
  }
  function C(e) {
    var B;
    return 48 <= e && e <= 57 ? e - 48 : (B = e | 32, 97 <= B && B <= 102 ? B - 97 + 10 : -1);
  }
  function A(e) {
    return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
  }
  function R(e) {
    return 48 <= e && e <= 57 ? e - 48 : -1;
  }
  function y(e) {
    return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
  }
  function q(e) {
    return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
      (e - 65536 >> 10) + 55296,
      (e - 65536 & 1023) + 56320
    );
  }
  for (var U = new Array(256), L = new Array(256), k = 0; k < 256; k++)
    U[k] = y(k) ? 1 : 0, L[k] = y(k);
  function N(e, B) {
    this.input = e, this.filename = B.filename || null, this.schema = B.schema || u, this.onWarning = B.onWarning || null, this.legacy = B.legacy || !1, this.json = B.json || !1, this.listener = B.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
  }
  function I(e, B) {
    var G = {
      name: e.filename,
      buffer: e.input.slice(0, -1),
      // omit trailing \0
      position: e.position,
      line: e.line,
      column: e.position - e.lineStart
    };
    return G.snippet = h(G), new d(B, G);
  }
  function F(e, B) {
    throw I(e, B);
  }
  function $(e, B) {
    e.onWarning && e.onWarning.call(null, I(e, B));
  }
  var J = {
    YAML: function(B, G, re) {
      var V, te, Z;
      B.version !== null && F(B, "duplication of %YAML directive"), re.length !== 1 && F(B, "YAML directive accepts exactly one argument"), V = /^([0-9]+)\.([0-9]+)$/.exec(re[0]), V === null && F(B, "ill-formed argument of the YAML directive"), te = parseInt(V[1], 10), Z = parseInt(V[2], 10), te !== 1 && F(B, "unacceptable YAML version of the document"), B.version = re[0], B.checkLineBreaks = Z < 2, Z !== 1 && Z !== 2 && $(B, "unsupported YAML version of the document");
    },
    TAG: function(B, G, re) {
      var V, te;
      re.length !== 2 && F(B, "TAG directive accepts exactly two arguments"), V = re[0], te = re[1], E.test(V) || F(B, "ill-formed tag handle (first argument) of the TAG directive"), c.call(B.tagMap, V) && F(B, 'there is a previously declared suffix for "' + V + '" tag handle'), p.test(te) || F(B, "ill-formed tag prefix (second argument) of the TAG directive");
      try {
        te = decodeURIComponent(te);
      } catch {
        F(B, "tag prefix is malformed: " + te);
      }
      B.tagMap[V] = te;
    }
  };
  function W(e, B, G, re) {
    var V, te, Z, ae;
    if (B < G) {
      if (ae = e.input.slice(B, G), re)
        for (V = 0, te = ae.length; V < te; V += 1)
          Z = ae.charCodeAt(V), Z === 9 || 32 <= Z && Z <= 1114111 || F(e, "expected valid JSON character");
      else t.test(ae) && F(e, "the stream contains non-printable characters");
      e.result += ae;
    }
  }
  function ne(e, B, G, re) {
    var V, te, Z, ae;
    for (r.isObject(G) || F(e, "cannot merge mappings; the provided source object is unacceptable"), V = Object.keys(G), Z = 0, ae = V.length; Z < ae; Z += 1)
      te = V[Z], c.call(B, te) || (B[te] = G[te], re[te] = !0);
  }
  function ce(e, B, G, re, V, te, Z, ae, ge) {
    var ve, Re;
    if (Array.isArray(V))
      for (V = Array.prototype.slice.call(V), ve = 0, Re = V.length; ve < Re; ve += 1)
        Array.isArray(V[ve]) && F(e, "nested arrays are not supported inside keys"), typeof V == "object" && S(V[ve]) === "[object Object]" && (V[ve] = "[object Object]");
    if (typeof V == "object" && S(V) === "[object Object]" && (V = "[object Object]"), V = String(V), B === null && (B = {}), re === "tag:yaml.org,2002:merge")
      if (Array.isArray(te))
        for (ve = 0, Re = te.length; ve < Re; ve += 1)
          ne(e, B, te[ve], G);
      else
        ne(e, B, te, G);
    else
      !e.json && !c.call(G, V) && c.call(B, V) && (e.line = Z || e.line, e.lineStart = ae || e.lineStart, e.position = ge || e.position, F(e, "duplicated mapping key")), V === "__proto__" ? Object.defineProperty(B, V, {
        configurable: !0,
        enumerable: !0,
        writable: !0,
        value: te
      }) : B[V] = te, delete G[V];
    return B;
  }
  function ue(e) {
    var B;
    B = e.input.charCodeAt(e.position), B === 10 ? e.position++ : B === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : F(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
  }
  function ie(e, B, G) {
    for (var re = 0, V = e.input.charCodeAt(e.position); V !== 0; ) {
      for (; O(V); )
        V === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), V = e.input.charCodeAt(++e.position);
      if (B && V === 35)
        do
          V = e.input.charCodeAt(++e.position);
        while (V !== 10 && V !== 13 && V !== 0);
      if (T(V))
        for (ue(e), V = e.input.charCodeAt(e.position), re++, e.lineIndent = 0; V === 32; )
          e.lineIndent++, V = e.input.charCodeAt(++e.position);
      else
        break;
    }
    return G !== -1 && re !== 0 && e.lineIndent < G && $(e, "deficient indentation"), re;
  }
  function Ae(e) {
    var B = e.position, G;
    return G = e.input.charCodeAt(B), !!((G === 45 || G === 46) && G === e.input.charCodeAt(B + 1) && G === e.input.charCodeAt(B + 2) && (B += 3, G = e.input.charCodeAt(B), G === 0 || P(G)));
  }
  function K(e, B) {
    B === 1 ? e.result += " " : B > 1 && (e.result += r.repeat(`
`, B - 1));
  }
  function Ee(e, B, G) {
    var re, V, te, Z, ae, ge, ve, Re, de = e.kind, Le = e.result, w;
    if (w = e.input.charCodeAt(e.position), P(w) || M(w) || w === 35 || w === 38 || w === 42 || w === 33 || w === 124 || w === 62 || w === 39 || w === 34 || w === 37 || w === 64 || w === 96 || (w === 63 || w === 45) && (V = e.input.charCodeAt(e.position + 1), P(V) || G && M(V)))
      return !1;
    for (e.kind = "scalar", e.result = "", te = Z = e.position, ae = !1; w !== 0; ) {
      if (w === 58) {
        if (V = e.input.charCodeAt(e.position + 1), P(V) || G && M(V))
          break;
      } else if (w === 35) {
        if (re = e.input.charCodeAt(e.position - 1), P(re))
          break;
      } else {
        if (e.position === e.lineStart && Ae(e) || G && M(w))
          break;
        if (T(w))
          if (ge = e.line, ve = e.lineStart, Re = e.lineIndent, ie(e, !1, -1), e.lineIndent >= B) {
            ae = !0, w = e.input.charCodeAt(e.position);
            continue;
          } else {
            e.position = Z, e.line = ge, e.lineStart = ve, e.lineIndent = Re;
            break;
          }
      }
      ae && (W(e, te, Z, !1), K(e, e.line - ge), te = Z = e.position, ae = !1), O(w) || (Z = e.position + 1), w = e.input.charCodeAt(++e.position);
    }
    return W(e, te, Z, !1), e.result ? !0 : (e.kind = de, e.result = Le, !1);
  }
  function _(e, B) {
    var G, re, V;
    if (G = e.input.charCodeAt(e.position), G !== 39)
      return !1;
    for (e.kind = "scalar", e.result = "", e.position++, re = V = e.position; (G = e.input.charCodeAt(e.position)) !== 0; )
      if (G === 39)
        if (W(e, re, e.position, !0), G = e.input.charCodeAt(++e.position), G === 39)
          re = e.position, e.position++, V = e.position;
        else
          return !0;
      else T(G) ? (W(e, re, V, !0), K(e, ie(e, !1, B)), re = V = e.position) : e.position === e.lineStart && Ae(e) ? F(e, "unexpected end of the document within a single quoted scalar") : (e.position++, V = e.position);
    F(e, "unexpected end of the stream within a single quoted scalar");
  }
  function g(e, B) {
    var G, re, V, te, Z, ae;
    if (ae = e.input.charCodeAt(e.position), ae !== 34)
      return !1;
    for (e.kind = "scalar", e.result = "", e.position++, G = re = e.position; (ae = e.input.charCodeAt(e.position)) !== 0; ) {
      if (ae === 34)
        return W(e, G, e.position, !0), e.position++, !0;
      if (ae === 92) {
        if (W(e, G, e.position, !0), ae = e.input.charCodeAt(++e.position), T(ae))
          ie(e, !1, B);
        else if (ae < 256 && U[ae])
          e.result += L[ae], e.position++;
        else if ((Z = A(ae)) > 0) {
          for (V = Z, te = 0; V > 0; V--)
            ae = e.input.charCodeAt(++e.position), (Z = C(ae)) >= 0 ? te = (te << 4) + Z : F(e, "expected hexadecimal character");
          e.result += q(te), e.position++;
        } else
          F(e, "unknown escape sequence");
        G = re = e.position;
      } else T(ae) ? (W(e, G, re, !0), K(e, ie(e, !1, B)), G = re = e.position) : e.position === e.lineStart && Ae(e) ? F(e, "unexpected end of the document within a double quoted scalar") : (e.position++, re = e.position);
    }
    F(e, "unexpected end of the stream within a double quoted scalar");
  }
  function H(e, B) {
    var G = !0, re, V, te, Z = e.tag, ae, ge = e.anchor, ve, Re, de, Le, w, j = /* @__PURE__ */ Object.create(null), X, Y, Q, ee;
    if (ee = e.input.charCodeAt(e.position), ee === 91)
      Re = 93, w = !1, ae = [];
    else if (ee === 123)
      Re = 125, w = !0, ae = {};
    else
      return !1;
    for (e.anchor !== null && (e.anchorMap[e.anchor] = ae), ee = e.input.charCodeAt(++e.position); ee !== 0; ) {
      if (ie(e, !0, B), ee = e.input.charCodeAt(e.position), ee === Re)
        return e.position++, e.tag = Z, e.anchor = ge, e.kind = w ? "mapping" : "sequence", e.result = ae, !0;
      G ? ee === 44 && F(e, "expected the node content, but found ','") : F(e, "missed comma between flow collection entries"), Y = X = Q = null, de = Le = !1, ee === 63 && (ve = e.input.charCodeAt(e.position + 1), P(ve) && (de = Le = !0, e.position++, ie(e, !0, B))), re = e.line, V = e.lineStart, te = e.position, xe(e, B, l, !1, !0), Y = e.tag, X = e.result, ie(e, !0, B), ee = e.input.charCodeAt(e.position), (Le || e.line === re) && ee === 58 && (de = !0, ee = e.input.charCodeAt(++e.position), ie(e, !0, B), xe(e, B, l, !1, !0), Q = e.result), w ? ce(e, ae, j, Y, X, Q, re, V, te) : de ? ae.push(ce(e, null, j, Y, X, Q, re, V, te)) : ae.push(X), ie(e, !0, B), ee = e.input.charCodeAt(e.position), ee === 44 ? (G = !0, ee = e.input.charCodeAt(++e.position)) : G = !1;
    }
    F(e, "unexpected end of the stream within a flow collection");
  }
  function D(e, B) {
    var G, re, V = o, te = !1, Z = !1, ae = B, ge = 0, ve = !1, Re, de;
    if (de = e.input.charCodeAt(e.position), de === 124)
      re = !1;
    else if (de === 62)
      re = !0;
    else
      return !1;
    for (e.kind = "scalar", e.result = ""; de !== 0; )
      if (de = e.input.charCodeAt(++e.position), de === 43 || de === 45)
        o === V ? V = de === 43 ? s : a : F(e, "repeat of a chomping mode identifier");
      else if ((Re = R(de)) >= 0)
        Re === 0 ? F(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : Z ? F(e, "repeat of an indentation width identifier") : (ae = B + Re - 1, Z = !0);
      else
        break;
    if (O(de)) {
      do
        de = e.input.charCodeAt(++e.position);
      while (O(de));
      if (de === 35)
        do
          de = e.input.charCodeAt(++e.position);
        while (!T(de) && de !== 0);
    }
    for (; de !== 0; ) {
      for (ue(e), e.lineIndent = 0, de = e.input.charCodeAt(e.position); (!Z || e.lineIndent < ae) && de === 32; )
        e.lineIndent++, de = e.input.charCodeAt(++e.position);
      if (!Z && e.lineIndent > ae && (ae = e.lineIndent), T(de)) {
        ge++;
        continue;
      }
      if (e.lineIndent < ae) {
        V === s ? e.result += r.repeat(`
`, te ? 1 + ge : ge) : V === o && te && (e.result += `
`);
        break;
      }
      for (re ? O(de) ? (ve = !0, e.result += r.repeat(`
`, te ? 1 + ge : ge)) : ve ? (ve = !1, e.result += r.repeat(`
`, ge + 1)) : ge === 0 ? te && (e.result += " ") : e.result += r.repeat(`
`, ge) : e.result += r.repeat(`
`, te ? 1 + ge : ge), te = !0, Z = !0, ge = 0, G = e.position; !T(de) && de !== 0; )
        de = e.input.charCodeAt(++e.position);
      W(e, G, e.position, !1);
    }
    return !0;
  }
  function le(e, B) {
    var G, re = e.tag, V = e.anchor, te = [], Z, ae = !1, ge;
    if (e.firstTabInLine !== -1) return !1;
    for (e.anchor !== null && (e.anchorMap[e.anchor] = te), ge = e.input.charCodeAt(e.position); ge !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, F(e, "tab characters must not be used in indentation")), !(ge !== 45 || (Z = e.input.charCodeAt(e.position + 1), !P(Z)))); ) {
      if (ae = !0, e.position++, ie(e, !0, -1) && e.lineIndent <= B) {
        te.push(null), ge = e.input.charCodeAt(e.position);
        continue;
      }
      if (G = e.line, xe(e, B, f, !1, !0), te.push(e.result), ie(e, !0, -1), ge = e.input.charCodeAt(e.position), (e.line === G || e.lineIndent > B) && ge !== 0)
        F(e, "bad indentation of a sequence entry");
      else if (e.lineIndent < B)
        break;
    }
    return ae ? (e.tag = re, e.anchor = V, e.kind = "sequence", e.result = te, !0) : !1;
  }
  function me(e, B, G) {
    var re, V, te, Z, ae, ge, ve = e.tag, Re = e.anchor, de = {}, Le = /* @__PURE__ */ Object.create(null), w = null, j = null, X = null, Y = !1, Q = !1, ee;
    if (e.firstTabInLine !== -1) return !1;
    for (e.anchor !== null && (e.anchorMap[e.anchor] = de), ee = e.input.charCodeAt(e.position); ee !== 0; ) {
      if (!Y && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, F(e, "tab characters must not be used in indentation")), re = e.input.charCodeAt(e.position + 1), te = e.line, (ee === 63 || ee === 58) && P(re))
        ee === 63 ? (Y && (ce(e, de, Le, w, j, null, Z, ae, ge), w = j = X = null), Q = !0, Y = !0, V = !0) : Y ? (Y = !1, V = !0) : F(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, ee = re;
      else {
        if (Z = e.line, ae = e.lineStart, ge = e.position, !xe(e, G, i, !1, !0))
          break;
        if (e.line === te) {
          for (ee = e.input.charCodeAt(e.position); O(ee); )
            ee = e.input.charCodeAt(++e.position);
          if (ee === 58)
            ee = e.input.charCodeAt(++e.position), P(ee) || F(e, "a whitespace character is expected after the key-value separator within a block mapping"), Y && (ce(e, de, Le, w, j, null, Z, ae, ge), w = j = X = null), Q = !0, Y = !1, V = !1, w = e.tag, j = e.result;
          else if (Q)
            F(e, "can not read an implicit mapping pair; a colon is missed");
          else
            return e.tag = ve, e.anchor = Re, !0;
        } else if (Q)
          F(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else
          return e.tag = ve, e.anchor = Re, !0;
      }
      if ((e.line === te || e.lineIndent > B) && (Y && (Z = e.line, ae = e.lineStart, ge = e.position), xe(e, B, n, !0, V) && (Y ? j = e.result : X = e.result), Y || (ce(e, de, Le, w, j, X, Z, ae, ge), w = j = X = null), ie(e, !0, -1), ee = e.input.charCodeAt(e.position)), (e.line === te || e.lineIndent > B) && ee !== 0)
        F(e, "bad indentation of a mapping entry");
      else if (e.lineIndent < B)
        break;
    }
    return Y && ce(e, de, Le, w, j, null, Z, ae, ge), Q && (e.tag = ve, e.anchor = Re, e.kind = "mapping", e.result = de), Q;
  }
  function pe(e) {
    var B, G = !1, re = !1, V, te, Z;
    if (Z = e.input.charCodeAt(e.position), Z !== 33) return !1;
    if (e.tag !== null && F(e, "duplication of a tag property"), Z = e.input.charCodeAt(++e.position), Z === 60 ? (G = !0, Z = e.input.charCodeAt(++e.position)) : Z === 33 ? (re = !0, V = "!!", Z = e.input.charCodeAt(++e.position)) : V = "!", B = e.position, G) {
      do
        Z = e.input.charCodeAt(++e.position);
      while (Z !== 0 && Z !== 62);
      e.position < e.length ? (te = e.input.slice(B, e.position), Z = e.input.charCodeAt(++e.position)) : F(e, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; Z !== 0 && !P(Z); )
        Z === 33 && (re ? F(e, "tag suffix cannot contain exclamation marks") : (V = e.input.slice(B - 1, e.position + 1), E.test(V) || F(e, "named tag handle cannot contain such characters"), re = !0, B = e.position + 1)), Z = e.input.charCodeAt(++e.position);
      te = e.input.slice(B, e.position), v.test(te) && F(e, "tag suffix cannot contain flow indicator characters");
    }
    te && !p.test(te) && F(e, "tag name cannot contain such characters: " + te);
    try {
      te = decodeURIComponent(te);
    } catch {
      F(e, "tag name is malformed: " + te);
    }
    return G ? e.tag = te : c.call(e.tagMap, V) ? e.tag = e.tagMap[V] + te : V === "!" ? e.tag = "!" + te : V === "!!" ? e.tag = "tag:yaml.org,2002:" + te : F(e, 'undeclared tag handle "' + V + '"'), !0;
  }
  function _e(e) {
    var B, G;
    if (G = e.input.charCodeAt(e.position), G !== 38) return !1;
    for (e.anchor !== null && F(e, "duplication of an anchor property"), G = e.input.charCodeAt(++e.position), B = e.position; G !== 0 && !P(G) && !M(G); )
      G = e.input.charCodeAt(++e.position);
    return e.position === B && F(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(B, e.position), !0;
  }
  function ye(e) {
    var B, G, re;
    if (re = e.input.charCodeAt(e.position), re !== 42) return !1;
    for (re = e.input.charCodeAt(++e.position), B = e.position; re !== 0 && !P(re) && !M(re); )
      re = e.input.charCodeAt(++e.position);
    return e.position === B && F(e, "name of an alias node must contain at least one character"), G = e.input.slice(B, e.position), c.call(e.anchorMap, G) || F(e, 'unidentified alias "' + G + '"'), e.result = e.anchorMap[G], ie(e, !0, -1), !0;
  }
  function xe(e, B, G, re, V) {
    var te, Z, ae, ge = 1, ve = !1, Re = !1, de, Le, w, j, X, Y;
    if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, te = Z = ae = n === G || f === G, re && ie(e, !0, -1) && (ve = !0, e.lineIndent > B ? ge = 1 : e.lineIndent === B ? ge = 0 : e.lineIndent < B && (ge = -1)), ge === 1)
      for (; pe(e) || _e(e); )
        ie(e, !0, -1) ? (ve = !0, ae = te, e.lineIndent > B ? ge = 1 : e.lineIndent === B ? ge = 0 : e.lineIndent < B && (ge = -1)) : ae = !1;
    if (ae && (ae = ve || V), (ge === 1 || n === G) && (l === G || i === G ? X = B : X = B + 1, Y = e.position - e.lineStart, ge === 1 ? ae && (le(e, Y) || me(e, Y, X)) || H(e, X) ? Re = !0 : (Z && D(e, X) || _(e, X) || g(e, X) ? Re = !0 : ye(e) ? (Re = !0, (e.tag !== null || e.anchor !== null) && F(e, "alias node should not have any properties")) : Ee(e, X, l === G) && (Re = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : ge === 0 && (Re = ae && le(e, Y))), e.tag === null)
      e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
    else if (e.tag === "?") {
      for (e.result !== null && e.kind !== "scalar" && F(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), de = 0, Le = e.implicitTypes.length; de < Le; de += 1)
        if (j = e.implicitTypes[de], j.resolve(e.result)) {
          e.result = j.construct(e.result), e.tag = j.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
          break;
        }
    } else if (e.tag !== "!") {
      if (c.call(e.typeMap[e.kind || "fallback"], e.tag))
        j = e.typeMap[e.kind || "fallback"][e.tag];
      else
        for (j = null, w = e.typeMap.multi[e.kind || "fallback"], de = 0, Le = w.length; de < Le; de += 1)
          if (e.tag.slice(0, w[de].tag.length) === w[de].tag) {
            j = w[de];
            break;
          }
      j || F(e, "unknown tag !<" + e.tag + ">"), e.result !== null && j.kind !== e.kind && F(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + j.kind + '", not "' + e.kind + '"'), j.resolve(e.result, e.tag) ? (e.result = j.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : F(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
    }
    return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || Re;
  }
  function Ce(e) {
    var B = e.position, G, re, V, te = !1, Z;
    for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (Z = e.input.charCodeAt(e.position)) !== 0 && (ie(e, !0, -1), Z = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || Z !== 37)); ) {
      for (te = !0, Z = e.input.charCodeAt(++e.position), G = e.position; Z !== 0 && !P(Z); )
        Z = e.input.charCodeAt(++e.position);
      for (re = e.input.slice(G, e.position), V = [], re.length < 1 && F(e, "directive name must not be less than one character in length"); Z !== 0; ) {
        for (; O(Z); )
          Z = e.input.charCodeAt(++e.position);
        if (Z === 35) {
          do
            Z = e.input.charCodeAt(++e.position);
          while (Z !== 0 && !T(Z));
          break;
        }
        if (T(Z)) break;
        for (G = e.position; Z !== 0 && !P(Z); )
          Z = e.input.charCodeAt(++e.position);
        V.push(e.input.slice(G, e.position));
      }
      Z !== 0 && ue(e), c.call(J, re) ? J[re](e, re, V) : $(e, 'unknown document directive "' + re + '"');
    }
    if (ie(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, ie(e, !0, -1)) : te && F(e, "directives end mark is expected"), xe(e, e.lineIndent - 1, n, !1, !0), ie(e, !0, -1), e.checkLineBreaks && m.test(e.input.slice(B, e.position)) && $(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && Ae(e)) {
      e.input.charCodeAt(e.position) === 46 && (e.position += 3, ie(e, !0, -1));
      return;
    }
    if (e.position < e.length - 1)
      F(e, "end of the stream or a document separator is expected");
    else
      return;
  }
  function qe(e, B) {
    e = String(e), B = B || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
    var G = new N(e, B), re = e.indexOf("\0");
    for (re !== -1 && (G.position = re, F(G, "null byte is not allowed in input")), G.input += "\0"; G.input.charCodeAt(G.position) === 32; )
      G.lineIndent += 1, G.position += 1;
    for (; G.position < G.length - 1; )
      Ce(G);
    return G.documents;
  }
  function gt(e, B, G) {
    B !== null && typeof B == "object" && typeof G > "u" && (G = B, B = null);
    var re = qe(e, G);
    if (typeof B != "function")
      return re;
    for (var V = 0, te = re.length; V < te; V += 1)
      B(re[V]);
  }
  function nt(e, B) {
    var G = qe(e, B);
    if (G.length !== 0) {
      if (G.length === 1)
        return G[0];
      throw new d("expected a single document in the stream, but found more");
    }
  }
  return Fr.loadAll = gt, Fr.load = nt, Fr;
}
var ri = {}, Yo;
function Vc() {
  if (Yo) return ri;
  Yo = 1;
  var r = mr(), d = gr(), h = ra(), u = Object.prototype.toString, c = Object.prototype.hasOwnProperty, l = 65279, i = 9, f = 10, n = 13, o = 32, a = 33, s = 34, t = 35, m = 37, v = 38, E = 39, p = 42, S = 44, T = 45, O = 58, P = 61, M = 62, C = 63, A = 64, R = 91, y = 93, q = 96, U = 123, L = 124, k = 125, N = {};
  N[0] = "\\0", N[7] = "\\a", N[8] = "\\b", N[9] = "\\t", N[10] = "\\n", N[11] = "\\v", N[12] = "\\f", N[13] = "\\r", N[27] = "\\e", N[34] = '\\"', N[92] = "\\\\", N[133] = "\\N", N[160] = "\\_", N[8232] = "\\L", N[8233] = "\\P";
  var I = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ], F = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function $(w, j) {
    var X, Y, Q, ee, fe, oe, he;
    if (j === null) return {};
    for (X = {}, Y = Object.keys(j), Q = 0, ee = Y.length; Q < ee; Q += 1)
      fe = Y[Q], oe = String(j[fe]), fe.slice(0, 2) === "!!" && (fe = "tag:yaml.org,2002:" + fe.slice(2)), he = w.compiledTypeMap.fallback[fe], he && c.call(he.styleAliases, oe) && (oe = he.styleAliases[oe]), X[fe] = oe;
    return X;
  }
  function J(w) {
    var j, X, Y;
    if (j = w.toString(16).toUpperCase(), w <= 255)
      X = "x", Y = 2;
    else if (w <= 65535)
      X = "u", Y = 4;
    else if (w <= 4294967295)
      X = "U", Y = 8;
    else
      throw new d("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + X + r.repeat("0", Y - j.length) + j;
  }
  var W = 1, ne = 2;
  function ce(w) {
    this.schema = w.schema || h, this.indent = Math.max(1, w.indent || 2), this.noArrayIndent = w.noArrayIndent || !1, this.skipInvalid = w.skipInvalid || !1, this.flowLevel = r.isNothing(w.flowLevel) ? -1 : w.flowLevel, this.styleMap = $(this.schema, w.styles || null), this.sortKeys = w.sortKeys || !1, this.lineWidth = w.lineWidth || 80, this.noRefs = w.noRefs || !1, this.noCompatMode = w.noCompatMode || !1, this.condenseFlow = w.condenseFlow || !1, this.quotingType = w.quotingType === '"' ? ne : W, this.forceQuotes = w.forceQuotes || !1, this.replacer = typeof w.replacer == "function" ? w.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
  }
  function ue(w, j) {
    for (var X = r.repeat(" ", j), Y = 0, Q = -1, ee = "", fe, oe = w.length; Y < oe; )
      Q = w.indexOf(`
`, Y), Q === -1 ? (fe = w.slice(Y), Y = oe) : (fe = w.slice(Y, Q + 1), Y = Q + 1), fe.length && fe !== `
` && (ee += X), ee += fe;
    return ee;
  }
  function ie(w, j) {
    return `
` + r.repeat(" ", w.indent * j);
  }
  function Ae(w, j) {
    var X, Y, Q;
    for (X = 0, Y = w.implicitTypes.length; X < Y; X += 1)
      if (Q = w.implicitTypes[X], Q.resolve(j))
        return !0;
    return !1;
  }
  function K(w) {
    return w === o || w === i;
  }
  function Ee(w) {
    return 32 <= w && w <= 126 || 161 <= w && w <= 55295 && w !== 8232 && w !== 8233 || 57344 <= w && w <= 65533 && w !== l || 65536 <= w && w <= 1114111;
  }
  function _(w) {
    return Ee(w) && w !== l && w !== n && w !== f;
  }
  function g(w, j, X) {
    var Y = _(w), Q = Y && !K(w);
    return (
      // ns-plain-safe
      (X ? (
        // c = flow-in
        Y
      ) : Y && w !== S && w !== R && w !== y && w !== U && w !== k) && w !== t && !(j === O && !Q) || _(j) && !K(j) && w === t || j === O && Q
    );
  }
  function H(w) {
    return Ee(w) && w !== l && !K(w) && w !== T && w !== C && w !== O && w !== S && w !== R && w !== y && w !== U && w !== k && w !== t && w !== v && w !== p && w !== a && w !== L && w !== P && w !== M && w !== E && w !== s && w !== m && w !== A && w !== q;
  }
  function D(w) {
    return !K(w) && w !== O;
  }
  function le(w, j) {
    var X = w.charCodeAt(j), Y;
    return X >= 55296 && X <= 56319 && j + 1 < w.length && (Y = w.charCodeAt(j + 1), Y >= 56320 && Y <= 57343) ? (X - 55296) * 1024 + Y - 56320 + 65536 : X;
  }
  function me(w) {
    var j = /^\n* /;
    return j.test(w);
  }
  var pe = 1, _e = 2, ye = 3, xe = 4, Ce = 5;
  function qe(w, j, X, Y, Q, ee, fe, oe) {
    var he, we = 0, be = null, De = !1, Te = !1, Dt = Y !== -1, Je = -1, vt = H(le(w, 0)) && D(le(w, w.length - 1));
    if (j || fe)
      for (he = 0; he < w.length; we >= 65536 ? he += 2 : he++) {
        if (we = le(w, he), !Ee(we))
          return Ce;
        vt = vt && g(we, be, oe), be = we;
      }
    else {
      for (he = 0; he < w.length; we >= 65536 ? he += 2 : he++) {
        if (we = le(w, he), we === f)
          De = !0, Dt && (Te = Te || // Foldable line = too long, and not more-indented.
          he - Je - 1 > Y && w[Je + 1] !== " ", Je = he);
        else if (!Ee(we))
          return Ce;
        vt = vt && g(we, be, oe), be = we;
      }
      Te = Te || Dt && he - Je - 1 > Y && w[Je + 1] !== " ";
    }
    return !De && !Te ? vt && !fe && !Q(w) ? pe : ee === ne ? Ce : _e : X > 9 && me(w) ? Ce : fe ? ee === ne ? Ce : _e : Te ? xe : ye;
  }
  function gt(w, j, X, Y, Q) {
    w.dump = function() {
      if (j.length === 0)
        return w.quotingType === ne ? '""' : "''";
      if (!w.noCompatMode && (I.indexOf(j) !== -1 || F.test(j)))
        return w.quotingType === ne ? '"' + j + '"' : "'" + j + "'";
      var ee = w.indent * Math.max(1, X), fe = w.lineWidth === -1 ? -1 : Math.max(Math.min(w.lineWidth, 40), w.lineWidth - ee), oe = Y || w.flowLevel > -1 && X >= w.flowLevel;
      function he(we) {
        return Ae(w, we);
      }
      switch (qe(
        j,
        oe,
        w.indent,
        fe,
        he,
        w.quotingType,
        w.forceQuotes && !Y,
        Q
      )) {
        case pe:
          return j;
        case _e:
          return "'" + j.replace(/'/g, "''") + "'";
        case ye:
          return "|" + nt(j, w.indent) + e(ue(j, ee));
        case xe:
          return ">" + nt(j, w.indent) + e(ue(B(j, fe), ee));
        case Ce:
          return '"' + re(j) + '"';
        default:
          throw new d("impossible error: invalid scalar style");
      }
    }();
  }
  function nt(w, j) {
    var X = me(w) ? String(j) : "", Y = w[w.length - 1] === `
`, Q = Y && (w[w.length - 2] === `
` || w === `
`), ee = Q ? "+" : Y ? "" : "-";
    return X + ee + `
`;
  }
  function e(w) {
    return w[w.length - 1] === `
` ? w.slice(0, -1) : w;
  }
  function B(w, j) {
    for (var X = /(\n+)([^\n]*)/g, Y = function() {
      var we = w.indexOf(`
`);
      return we = we !== -1 ? we : w.length, X.lastIndex = we, G(w.slice(0, we), j);
    }(), Q = w[0] === `
` || w[0] === " ", ee, fe; fe = X.exec(w); ) {
      var oe = fe[1], he = fe[2];
      ee = he[0] === " ", Y += oe + (!Q && !ee && he !== "" ? `
` : "") + G(he, j), Q = ee;
    }
    return Y;
  }
  function G(w, j) {
    if (w === "" || w[0] === " ") return w;
    for (var X = / [^ ]/g, Y, Q = 0, ee, fe = 0, oe = 0, he = ""; Y = X.exec(w); )
      oe = Y.index, oe - Q > j && (ee = fe > Q ? fe : oe, he += `
` + w.slice(Q, ee), Q = ee + 1), fe = oe;
    return he += `
`, w.length - Q > j && fe > Q ? he += w.slice(Q, fe) + `
` + w.slice(fe + 1) : he += w.slice(Q), he.slice(1);
  }
  function re(w) {
    for (var j = "", X = 0, Y, Q = 0; Q < w.length; X >= 65536 ? Q += 2 : Q++)
      X = le(w, Q), Y = N[X], !Y && Ee(X) ? (j += w[Q], X >= 65536 && (j += w[Q + 1])) : j += Y || J(X);
    return j;
  }
  function V(w, j, X) {
    var Y = "", Q = w.tag, ee, fe, oe;
    for (ee = 0, fe = X.length; ee < fe; ee += 1)
      oe = X[ee], w.replacer && (oe = w.replacer.call(X, String(ee), oe)), (ve(w, j, oe, !1, !1) || typeof oe > "u" && ve(w, j, null, !1, !1)) && (Y !== "" && (Y += "," + (w.condenseFlow ? "" : " ")), Y += w.dump);
    w.tag = Q, w.dump = "[" + Y + "]";
  }
  function te(w, j, X, Y) {
    var Q = "", ee = w.tag, fe, oe, he;
    for (fe = 0, oe = X.length; fe < oe; fe += 1)
      he = X[fe], w.replacer && (he = w.replacer.call(X, String(fe), he)), (ve(w, j + 1, he, !0, !0, !1, !0) || typeof he > "u" && ve(w, j + 1, null, !0, !0, !1, !0)) && ((!Y || Q !== "") && (Q += ie(w, j)), w.dump && f === w.dump.charCodeAt(0) ? Q += "-" : Q += "- ", Q += w.dump);
    w.tag = ee, w.dump = Q || "[]";
  }
  function Z(w, j, X) {
    var Y = "", Q = w.tag, ee = Object.keys(X), fe, oe, he, we, be;
    for (fe = 0, oe = ee.length; fe < oe; fe += 1)
      be = "", Y !== "" && (be += ", "), w.condenseFlow && (be += '"'), he = ee[fe], we = X[he], w.replacer && (we = w.replacer.call(X, he, we)), ve(w, j, he, !1, !1) && (w.dump.length > 1024 && (be += "? "), be += w.dump + (w.condenseFlow ? '"' : "") + ":" + (w.condenseFlow ? "" : " "), ve(w, j, we, !1, !1) && (be += w.dump, Y += be));
    w.tag = Q, w.dump = "{" + Y + "}";
  }
  function ae(w, j, X, Y) {
    var Q = "", ee = w.tag, fe = Object.keys(X), oe, he, we, be, De, Te;
    if (w.sortKeys === !0)
      fe.sort();
    else if (typeof w.sortKeys == "function")
      fe.sort(w.sortKeys);
    else if (w.sortKeys)
      throw new d("sortKeys must be a boolean or a function");
    for (oe = 0, he = fe.length; oe < he; oe += 1)
      Te = "", (!Y || Q !== "") && (Te += ie(w, j)), we = fe[oe], be = X[we], w.replacer && (be = w.replacer.call(X, we, be)), ve(w, j + 1, we, !0, !0, !0) && (De = w.tag !== null && w.tag !== "?" || w.dump && w.dump.length > 1024, De && (w.dump && f === w.dump.charCodeAt(0) ? Te += "?" : Te += "? "), Te += w.dump, De && (Te += ie(w, j)), ve(w, j + 1, be, !0, De) && (w.dump && f === w.dump.charCodeAt(0) ? Te += ":" : Te += ": ", Te += w.dump, Q += Te));
    w.tag = ee, w.dump = Q || "{}";
  }
  function ge(w, j, X) {
    var Y, Q, ee, fe, oe, he;
    for (Q = X ? w.explicitTypes : w.implicitTypes, ee = 0, fe = Q.length; ee < fe; ee += 1)
      if (oe = Q[ee], (oe.instanceOf || oe.predicate) && (!oe.instanceOf || typeof j == "object" && j instanceof oe.instanceOf) && (!oe.predicate || oe.predicate(j))) {
        if (X ? oe.multi && oe.representName ? w.tag = oe.representName(j) : w.tag = oe.tag : w.tag = "?", oe.represent) {
          if (he = w.styleMap[oe.tag] || oe.defaultStyle, u.call(oe.represent) === "[object Function]")
            Y = oe.represent(j, he);
          else if (c.call(oe.represent, he))
            Y = oe.represent[he](j, he);
          else
            throw new d("!<" + oe.tag + '> tag resolver accepts not "' + he + '" style');
          w.dump = Y;
        }
        return !0;
      }
    return !1;
  }
  function ve(w, j, X, Y, Q, ee, fe) {
    w.tag = null, w.dump = X, ge(w, X, !1) || ge(w, X, !0);
    var oe = u.call(w.dump), he = Y, we;
    Y && (Y = w.flowLevel < 0 || w.flowLevel > j);
    var be = oe === "[object Object]" || oe === "[object Array]", De, Te;
    if (be && (De = w.duplicates.indexOf(X), Te = De !== -1), (w.tag !== null && w.tag !== "?" || Te || w.indent !== 2 && j > 0) && (Q = !1), Te && w.usedDuplicates[De])
      w.dump = "*ref_" + De;
    else {
      if (be && Te && !w.usedDuplicates[De] && (w.usedDuplicates[De] = !0), oe === "[object Object]")
        Y && Object.keys(w.dump).length !== 0 ? (ae(w, j, w.dump, Q), Te && (w.dump = "&ref_" + De + w.dump)) : (Z(w, j, w.dump), Te && (w.dump = "&ref_" + De + " " + w.dump));
      else if (oe === "[object Array]")
        Y && w.dump.length !== 0 ? (w.noArrayIndent && !fe && j > 0 ? te(w, j - 1, w.dump, Q) : te(w, j, w.dump, Q), Te && (w.dump = "&ref_" + De + w.dump)) : (V(w, j, w.dump), Te && (w.dump = "&ref_" + De + " " + w.dump));
      else if (oe === "[object String]")
        w.tag !== "?" && gt(w, w.dump, j, ee, he);
      else {
        if (oe === "[object Undefined]")
          return !1;
        if (w.skipInvalid) return !1;
        throw new d("unacceptable kind of an object to dump " + oe);
      }
      w.tag !== null && w.tag !== "?" && (we = encodeURI(
        w.tag[0] === "!" ? w.tag.slice(1) : w.tag
      ).replace(/!/g, "%21"), w.tag[0] === "!" ? we = "!" + we : we.slice(0, 18) === "tag:yaml.org,2002:" ? we = "!!" + we.slice(18) : we = "!<" + we + ">", w.dump = we + " " + w.dump);
    }
    return !0;
  }
  function Re(w, j) {
    var X = [], Y = [], Q, ee;
    for (de(w, X, Y), Q = 0, ee = Y.length; Q < ee; Q += 1)
      j.duplicates.push(X[Y[Q]]);
    j.usedDuplicates = new Array(ee);
  }
  function de(w, j, X) {
    var Y, Q, ee;
    if (w !== null && typeof w == "object")
      if (Q = j.indexOf(w), Q !== -1)
        X.indexOf(Q) === -1 && X.push(Q);
      else if (j.push(w), Array.isArray(w))
        for (Q = 0, ee = w.length; Q < ee; Q += 1)
          de(w[Q], j, X);
      else
        for (Y = Object.keys(w), Q = 0, ee = Y.length; Q < ee; Q += 1)
          de(w[Y[Q]], j, X);
  }
  function Le(w, j) {
    j = j || {};
    var X = new ce(j);
    X.noRefs || Re(w, X);
    var Y = w;
    return X.replacer && (Y = X.replacer.call({ "": Y }, "", Y)), ve(X, 0, Y, !0, !0) ? X.dump + `
` : "";
  }
  return ri.dump = Le, ri;
}
var zo;
function na() {
  if (zo) return He;
  zo = 1;
  var r = Wc(), d = Vc();
  function h(u, c) {
    return function() {
      throw new Error("Function yaml." + u + " is removed in js-yaml 4. Use yaml." + c + " instead, which is now safe by default.");
    };
  }
  return He.Type = je(), He.Schema = Fl(), He.FAILSAFE_SCHEMA = $l(), He.JSON_SCHEMA = Hl(), He.CORE_SCHEMA = jl(), He.DEFAULT_SCHEMA = ra(), He.load = r.load, He.loadAll = r.loadAll, He.dump = d.dump, He.YAMLException = gr(), He.types = {
    binary: Vl(),
    float: Bl(),
    map: Ul(),
    null: kl(),
    pairs: zl(),
    set: Xl(),
    timestamp: Gl(),
    bool: ql(),
    int: Ml(),
    merge: Wl(),
    omap: Yl(),
    seq: Ll(),
    str: xl()
  }, He.safeLoad = h("safeLoad", "load"), He.safeLoadAll = h("safeLoadAll", "loadAll"), He.safeDump = h("safeDump", "dump"), He;
}
var zt = {}, Xo;
function Yc() {
  if (Xo) return zt;
  Xo = 1, Object.defineProperty(zt, "__esModule", { value: !0 }), zt.Lazy = void 0;
  class r {
    constructor(h) {
      this._value = null, this.creator = h;
    }
    get hasValue() {
      return this.creator == null;
    }
    get value() {
      if (this.creator == null)
        return this._value;
      const h = this.creator();
      return this.value = h, h;
    }
    set value(h) {
      this._value = h, this.creator = null;
    }
  }
  return zt.Lazy = r, zt;
}
var xr = { exports: {} }, ni, Ko;
function Hr() {
  if (Ko) return ni;
  Ko = 1;
  const r = "2.0.0", d = 256, h = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, u = 16, c = d - 6;
  return ni = {
    MAX_LENGTH: d,
    MAX_SAFE_COMPONENT_LENGTH: u,
    MAX_SAFE_BUILD_LENGTH: c,
    MAX_SAFE_INTEGER: h,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: r,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, ni;
}
var ii, Jo;
function jr() {
  return Jo || (Jo = 1, ii = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...d) => console.error("SEMVER", ...d) : () => {
  }), ii;
}
var Qo;
function vr() {
  return Qo || (Qo = 1, function(r, d) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: h,
      MAX_SAFE_BUILD_LENGTH: u,
      MAX_LENGTH: c
    } = Hr(), l = jr();
    d = r.exports = {};
    const i = d.re = [], f = d.safeRe = [], n = d.src = [], o = d.safeSrc = [], a = d.t = {};
    let s = 0;
    const t = "[a-zA-Z0-9-]", m = [
      ["\\s", 1],
      ["\\d", c],
      [t, u]
    ], v = (p) => {
      for (const [S, T] of m)
        p = p.split(`${S}*`).join(`${S}{0,${T}}`).split(`${S}+`).join(`${S}{1,${T}}`);
      return p;
    }, E = (p, S, T) => {
      const O = v(S), P = s++;
      l(p, P, S), a[p] = P, n[P] = S, o[P] = O, i[P] = new RegExp(S, T ? "g" : void 0), f[P] = new RegExp(O, T ? "g" : void 0);
    };
    E("NUMERICIDENTIFIER", "0|[1-9]\\d*"), E("NUMERICIDENTIFIERLOOSE", "\\d+"), E("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${t}*`), E("MAINVERSION", `(${n[a.NUMERICIDENTIFIER]})\\.(${n[a.NUMERICIDENTIFIER]})\\.(${n[a.NUMERICIDENTIFIER]})`), E("MAINVERSIONLOOSE", `(${n[a.NUMERICIDENTIFIERLOOSE]})\\.(${n[a.NUMERICIDENTIFIERLOOSE]})\\.(${n[a.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASEIDENTIFIER", `(?:${n[a.NONNUMERICIDENTIFIER]}|${n[a.NUMERICIDENTIFIER]})`), E("PRERELEASEIDENTIFIERLOOSE", `(?:${n[a.NONNUMERICIDENTIFIER]}|${n[a.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASE", `(?:-(${n[a.PRERELEASEIDENTIFIER]}(?:\\.${n[a.PRERELEASEIDENTIFIER]})*))`), E("PRERELEASELOOSE", `(?:-?(${n[a.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${n[a.PRERELEASEIDENTIFIERLOOSE]})*))`), E("BUILDIDENTIFIER", `${t}+`), E("BUILD", `(?:\\+(${n[a.BUILDIDENTIFIER]}(?:\\.${n[a.BUILDIDENTIFIER]})*))`), E("FULLPLAIN", `v?${n[a.MAINVERSION]}${n[a.PRERELEASE]}?${n[a.BUILD]}?`), E("FULL", `^${n[a.FULLPLAIN]}$`), E("LOOSEPLAIN", `[v=\\s]*${n[a.MAINVERSIONLOOSE]}${n[a.PRERELEASELOOSE]}?${n[a.BUILD]}?`), E("LOOSE", `^${n[a.LOOSEPLAIN]}$`), E("GTLT", "((?:<|>)?=?)"), E("XRANGEIDENTIFIERLOOSE", `${n[a.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), E("XRANGEIDENTIFIER", `${n[a.NUMERICIDENTIFIER]}|x|X|\\*`), E("XRANGEPLAIN", `[v=\\s]*(${n[a.XRANGEIDENTIFIER]})(?:\\.(${n[a.XRANGEIDENTIFIER]})(?:\\.(${n[a.XRANGEIDENTIFIER]})(?:${n[a.PRERELEASE]})?${n[a.BUILD]}?)?)?`), E("XRANGEPLAINLOOSE", `[v=\\s]*(${n[a.XRANGEIDENTIFIERLOOSE]})(?:\\.(${n[a.XRANGEIDENTIFIERLOOSE]})(?:\\.(${n[a.XRANGEIDENTIFIERLOOSE]})(?:${n[a.PRERELEASELOOSE]})?${n[a.BUILD]}?)?)?`), E("XRANGE", `^${n[a.GTLT]}\\s*${n[a.XRANGEPLAIN]}$`), E("XRANGELOOSE", `^${n[a.GTLT]}\\s*${n[a.XRANGEPLAINLOOSE]}$`), E("COERCEPLAIN", `(^|[^\\d])(\\d{1,${h}})(?:\\.(\\d{1,${h}}))?(?:\\.(\\d{1,${h}}))?`), E("COERCE", `${n[a.COERCEPLAIN]}(?:$|[^\\d])`), E("COERCEFULL", n[a.COERCEPLAIN] + `(?:${n[a.PRERELEASE]})?(?:${n[a.BUILD]})?(?:$|[^\\d])`), E("COERCERTL", n[a.COERCE], !0), E("COERCERTLFULL", n[a.COERCEFULL], !0), E("LONETILDE", "(?:~>?)"), E("TILDETRIM", `(\\s*)${n[a.LONETILDE]}\\s+`, !0), d.tildeTrimReplace = "$1~", E("TILDE", `^${n[a.LONETILDE]}${n[a.XRANGEPLAIN]}$`), E("TILDELOOSE", `^${n[a.LONETILDE]}${n[a.XRANGEPLAINLOOSE]}$`), E("LONECARET", "(?:\\^)"), E("CARETTRIM", `(\\s*)${n[a.LONECARET]}\\s+`, !0), d.caretTrimReplace = "$1^", E("CARET", `^${n[a.LONECARET]}${n[a.XRANGEPLAIN]}$`), E("CARETLOOSE", `^${n[a.LONECARET]}${n[a.XRANGEPLAINLOOSE]}$`), E("COMPARATORLOOSE", `^${n[a.GTLT]}\\s*(${n[a.LOOSEPLAIN]})$|^$`), E("COMPARATOR", `^${n[a.GTLT]}\\s*(${n[a.FULLPLAIN]})$|^$`), E("COMPARATORTRIM", `(\\s*)${n[a.GTLT]}\\s*(${n[a.LOOSEPLAIN]}|${n[a.XRANGEPLAIN]})`, !0), d.comparatorTrimReplace = "$1$2$3", E("HYPHENRANGE", `^\\s*(${n[a.XRANGEPLAIN]})\\s+-\\s+(${n[a.XRANGEPLAIN]})\\s*$`), E("HYPHENRANGELOOSE", `^\\s*(${n[a.XRANGEPLAINLOOSE]})\\s+-\\s+(${n[a.XRANGEPLAINLOOSE]})\\s*$`), E("STAR", "(<|>)?=?\\s*\\*"), E("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), E("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }(xr, xr.exports)), xr.exports;
}
var ai, Zo;
function ia() {
  if (Zo) return ai;
  Zo = 1;
  const r = Object.freeze({ loose: !0 }), d = Object.freeze({});
  return ai = (u) => u ? typeof u != "object" ? r : u : d, ai;
}
var oi, es;
function Kl() {
  if (es) return oi;
  es = 1;
  const r = /^[0-9]+$/, d = (u, c) => {
    const l = r.test(u), i = r.test(c);
    return l && i && (u = +u, c = +c), u === c ? 0 : l && !i ? -1 : i && !l ? 1 : u < c ? -1 : 1;
  };
  return oi = {
    compareIdentifiers: d,
    rcompareIdentifiers: (u, c) => d(c, u)
  }, oi;
}
var si, ts;
function Ge() {
  if (ts) return si;
  ts = 1;
  const r = jr(), { MAX_LENGTH: d, MAX_SAFE_INTEGER: h } = Hr(), { safeRe: u, t: c } = vr(), l = ia(), { compareIdentifiers: i } = Kl();
  class f {
    constructor(o, a) {
      if (a = l(a), o instanceof f) {
        if (o.loose === !!a.loose && o.includePrerelease === !!a.includePrerelease)
          return o;
        o = o.version;
      } else if (typeof o != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof o}".`);
      if (o.length > d)
        throw new TypeError(
          `version is longer than ${d} characters`
        );
      r("SemVer", o, a), this.options = a, this.loose = !!a.loose, this.includePrerelease = !!a.includePrerelease;
      const s = o.trim().match(a.loose ? u[c.LOOSE] : u[c.FULL]);
      if (!s)
        throw new TypeError(`Invalid Version: ${o}`);
      if (this.raw = o, this.major = +s[1], this.minor = +s[2], this.patch = +s[3], this.major > h || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > h || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > h || this.patch < 0)
        throw new TypeError("Invalid patch version");
      s[4] ? this.prerelease = s[4].split(".").map((t) => {
        if (/^[0-9]+$/.test(t)) {
          const m = +t;
          if (m >= 0 && m < h)
            return m;
        }
        return t;
      }) : this.prerelease = [], this.build = s[5] ? s[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(o) {
      if (r("SemVer.compare", this.version, this.options, o), !(o instanceof f)) {
        if (typeof o == "string" && o === this.version)
          return 0;
        o = new f(o, this.options);
      }
      return o.version === this.version ? 0 : this.compareMain(o) || this.comparePre(o);
    }
    compareMain(o) {
      return o instanceof f || (o = new f(o, this.options)), i(this.major, o.major) || i(this.minor, o.minor) || i(this.patch, o.patch);
    }
    comparePre(o) {
      if (o instanceof f || (o = new f(o, this.options)), this.prerelease.length && !o.prerelease.length)
        return -1;
      if (!this.prerelease.length && o.prerelease.length)
        return 1;
      if (!this.prerelease.length && !o.prerelease.length)
        return 0;
      let a = 0;
      do {
        const s = this.prerelease[a], t = o.prerelease[a];
        if (r("prerelease compare", a, s, t), s === void 0 && t === void 0)
          return 0;
        if (t === void 0)
          return 1;
        if (s === void 0)
          return -1;
        if (s === t)
          continue;
        return i(s, t);
      } while (++a);
    }
    compareBuild(o) {
      o instanceof f || (o = new f(o, this.options));
      let a = 0;
      do {
        const s = this.build[a], t = o.build[a];
        if (r("build compare", a, s, t), s === void 0 && t === void 0)
          return 0;
        if (t === void 0)
          return 1;
        if (s === void 0)
          return -1;
        if (s === t)
          continue;
        return i(s, t);
      } while (++a);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(o, a, s) {
      if (o.startsWith("pre")) {
        if (!a && s === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (a) {
          const t = `-${a}`.match(this.options.loose ? u[c.PRERELEASELOOSE] : u[c.PRERELEASE]);
          if (!t || t[1] !== a)
            throw new Error(`invalid identifier: ${a}`);
        }
      }
      switch (o) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", a, s);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", a, s);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", a, s), this.inc("pre", a, s);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", a, s), this.inc("pre", a, s);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const t = Number(s) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [t];
          else {
            let m = this.prerelease.length;
            for (; --m >= 0; )
              typeof this.prerelease[m] == "number" && (this.prerelease[m]++, m = -2);
            if (m === -1) {
              if (a === this.prerelease.join(".") && s === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(t);
            }
          }
          if (a) {
            let m = [a, t];
            s === !1 && (m = [a]), i(this.prerelease[0], a) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = m) : this.prerelease = m;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${o}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return si = f, si;
}
var li, rs;
function Mt() {
  if (rs) return li;
  rs = 1;
  const r = Ge();
  return li = (h, u, c = !1) => {
    if (h instanceof r)
      return h;
    try {
      return new r(h, u);
    } catch (l) {
      if (!c)
        return null;
      throw l;
    }
  }, li;
}
var ui, ns;
function zc() {
  if (ns) return ui;
  ns = 1;
  const r = Mt();
  return ui = (h, u) => {
    const c = r(h, u);
    return c ? c.version : null;
  }, ui;
}
var ci, is;
function Xc() {
  if (is) return ci;
  is = 1;
  const r = Mt();
  return ci = (h, u) => {
    const c = r(h.trim().replace(/^[=v]+/, ""), u);
    return c ? c.version : null;
  }, ci;
}
var fi, as;
function Kc() {
  if (as) return fi;
  as = 1;
  const r = Ge();
  return fi = (h, u, c, l, i) => {
    typeof c == "string" && (i = l, l = c, c = void 0);
    try {
      return new r(
        h instanceof r ? h.version : h,
        c
      ).inc(u, l, i).version;
    } catch {
      return null;
    }
  }, fi;
}
var di, os;
function Jc() {
  if (os) return di;
  os = 1;
  const r = Mt();
  return di = (h, u) => {
    const c = r(h, null, !0), l = r(u, null, !0), i = c.compare(l);
    if (i === 0)
      return null;
    const f = i > 0, n = f ? c : l, o = f ? l : c, a = !!n.prerelease.length;
    if (!!o.prerelease.length && !a) {
      if (!o.patch && !o.minor)
        return "major";
      if (o.compareMain(n) === 0)
        return o.minor && !o.patch ? "minor" : "patch";
    }
    const t = a ? "pre" : "";
    return c.major !== l.major ? t + "major" : c.minor !== l.minor ? t + "minor" : c.patch !== l.patch ? t + "patch" : "prerelease";
  }, di;
}
var hi, ss;
function Qc() {
  if (ss) return hi;
  ss = 1;
  const r = Ge();
  return hi = (h, u) => new r(h, u).major, hi;
}
var pi, ls;
function Zc() {
  if (ls) return pi;
  ls = 1;
  const r = Ge();
  return pi = (h, u) => new r(h, u).minor, pi;
}
var mi, us;
function ef() {
  if (us) return mi;
  us = 1;
  const r = Ge();
  return mi = (h, u) => new r(h, u).patch, mi;
}
var gi, cs;
function tf() {
  if (cs) return gi;
  cs = 1;
  const r = Mt();
  return gi = (h, u) => {
    const c = r(h, u);
    return c && c.prerelease.length ? c.prerelease : null;
  }, gi;
}
var vi, fs;
function et() {
  if (fs) return vi;
  fs = 1;
  const r = Ge();
  return vi = (h, u, c) => new r(h, c).compare(new r(u, c)), vi;
}
var Ei, ds;
function rf() {
  if (ds) return Ei;
  ds = 1;
  const r = et();
  return Ei = (h, u, c) => r(u, h, c), Ei;
}
var yi, hs;
function nf() {
  if (hs) return yi;
  hs = 1;
  const r = et();
  return yi = (h, u) => r(h, u, !0), yi;
}
var wi, ps;
function aa() {
  if (ps) return wi;
  ps = 1;
  const r = Ge();
  return wi = (h, u, c) => {
    const l = new r(h, c), i = new r(u, c);
    return l.compare(i) || l.compareBuild(i);
  }, wi;
}
var _i, ms;
function af() {
  if (ms) return _i;
  ms = 1;
  const r = aa();
  return _i = (h, u) => h.sort((c, l) => r(c, l, u)), _i;
}
var Si, gs;
function of() {
  if (gs) return Si;
  gs = 1;
  const r = aa();
  return Si = (h, u) => h.sort((c, l) => r(l, c, u)), Si;
}
var Ai, vs;
function Gr() {
  if (vs) return Ai;
  vs = 1;
  const r = et();
  return Ai = (h, u, c) => r(h, u, c) > 0, Ai;
}
var Ri, Es;
function oa() {
  if (Es) return Ri;
  Es = 1;
  const r = et();
  return Ri = (h, u, c) => r(h, u, c) < 0, Ri;
}
var Ti, ys;
function Jl() {
  if (ys) return Ti;
  ys = 1;
  const r = et();
  return Ti = (h, u, c) => r(h, u, c) === 0, Ti;
}
var Ci, ws;
function Ql() {
  if (ws) return Ci;
  ws = 1;
  const r = et();
  return Ci = (h, u, c) => r(h, u, c) !== 0, Ci;
}
var bi, _s;
function sa() {
  if (_s) return bi;
  _s = 1;
  const r = et();
  return bi = (h, u, c) => r(h, u, c) >= 0, bi;
}
var Oi, Ss;
function la() {
  if (Ss) return Oi;
  Ss = 1;
  const r = et();
  return Oi = (h, u, c) => r(h, u, c) <= 0, Oi;
}
var Pi, As;
function Zl() {
  if (As) return Pi;
  As = 1;
  const r = Jl(), d = Ql(), h = Gr(), u = sa(), c = oa(), l = la();
  return Pi = (f, n, o, a) => {
    switch (n) {
      case "===":
        return typeof f == "object" && (f = f.version), typeof o == "object" && (o = o.version), f === o;
      case "!==":
        return typeof f == "object" && (f = f.version), typeof o == "object" && (o = o.version), f !== o;
      case "":
      case "=":
      case "==":
        return r(f, o, a);
      case "!=":
        return d(f, o, a);
      case ">":
        return h(f, o, a);
      case ">=":
        return u(f, o, a);
      case "<":
        return c(f, o, a);
      case "<=":
        return l(f, o, a);
      default:
        throw new TypeError(`Invalid operator: ${n}`);
    }
  }, Pi;
}
var Ii, Rs;
function sf() {
  if (Rs) return Ii;
  Rs = 1;
  const r = Ge(), d = Mt(), { safeRe: h, t: u } = vr();
  return Ii = (l, i) => {
    if (l instanceof r)
      return l;
    if (typeof l == "number" && (l = String(l)), typeof l != "string")
      return null;
    i = i || {};
    let f = null;
    if (!i.rtl)
      f = l.match(i.includePrerelease ? h[u.COERCEFULL] : h[u.COERCE]);
    else {
      const m = i.includePrerelease ? h[u.COERCERTLFULL] : h[u.COERCERTL];
      let v;
      for (; (v = m.exec(l)) && (!f || f.index + f[0].length !== l.length); )
        (!f || v.index + v[0].length !== f.index + f[0].length) && (f = v), m.lastIndex = v.index + v[1].length + v[2].length;
      m.lastIndex = -1;
    }
    if (f === null)
      return null;
    const n = f[2], o = f[3] || "0", a = f[4] || "0", s = i.includePrerelease && f[5] ? `-${f[5]}` : "", t = i.includePrerelease && f[6] ? `+${f[6]}` : "";
    return d(`${n}.${o}.${a}${s}${t}`, i);
  }, Ii;
}
var Di, Ts;
function lf() {
  if (Ts) return Di;
  Ts = 1;
  class r {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(h) {
      const u = this.map.get(h);
      if (u !== void 0)
        return this.map.delete(h), this.map.set(h, u), u;
    }
    delete(h) {
      return this.map.delete(h);
    }
    set(h, u) {
      if (!this.delete(h) && u !== void 0) {
        if (this.map.size >= this.max) {
          const l = this.map.keys().next().value;
          this.delete(l);
        }
        this.map.set(h, u);
      }
      return this;
    }
  }
  return Di = r, Di;
}
var Ni, Cs;
function tt() {
  if (Cs) return Ni;
  Cs = 1;
  const r = /\s+/g;
  class d {
    constructor(I, F) {
      if (F = c(F), I instanceof d)
        return I.loose === !!F.loose && I.includePrerelease === !!F.includePrerelease ? I : new d(I.raw, F);
      if (I instanceof l)
        return this.raw = I.value, this.set = [[I]], this.formatted = void 0, this;
      if (this.options = F, this.loose = !!F.loose, this.includePrerelease = !!F.includePrerelease, this.raw = I.trim().replace(r, " "), this.set = this.raw.split("||").map(($) => this.parseRange($.trim())).filter(($) => $.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const $ = this.set[0];
        if (this.set = this.set.filter((J) => !E(J[0])), this.set.length === 0)
          this.set = [$];
        else if (this.set.length > 1) {
          for (const J of this.set)
            if (J.length === 1 && p(J[0])) {
              this.set = [J];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let I = 0; I < this.set.length; I++) {
          I > 0 && (this.formatted += "||");
          const F = this.set[I];
          for (let $ = 0; $ < F.length; $++)
            $ > 0 && (this.formatted += " "), this.formatted += F[$].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(I) {
      const $ = ((this.options.includePrerelease && m) | (this.options.loose && v)) + ":" + I, J = u.get($);
      if (J)
        return J;
      const W = this.options.loose, ne = W ? n[o.HYPHENRANGELOOSE] : n[o.HYPHENRANGE];
      I = I.replace(ne, L(this.options.includePrerelease)), i("hyphen replace", I), I = I.replace(n[o.COMPARATORTRIM], a), i("comparator trim", I), I = I.replace(n[o.TILDETRIM], s), i("tilde trim", I), I = I.replace(n[o.CARETTRIM], t), i("caret trim", I);
      let ce = I.split(" ").map((K) => T(K, this.options)).join(" ").split(/\s+/).map((K) => U(K, this.options));
      W && (ce = ce.filter((K) => (i("loose invalid filter", K, this.options), !!K.match(n[o.COMPARATORLOOSE])))), i("range list", ce);
      const ue = /* @__PURE__ */ new Map(), ie = ce.map((K) => new l(K, this.options));
      for (const K of ie) {
        if (E(K))
          return [K];
        ue.set(K.value, K);
      }
      ue.size > 1 && ue.has("") && ue.delete("");
      const Ae = [...ue.values()];
      return u.set($, Ae), Ae;
    }
    intersects(I, F) {
      if (!(I instanceof d))
        throw new TypeError("a Range is required");
      return this.set.some(($) => S($, F) && I.set.some((J) => S(J, F) && $.every((W) => J.every((ne) => W.intersects(ne, F)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(I) {
      if (!I)
        return !1;
      if (typeof I == "string")
        try {
          I = new f(I, this.options);
        } catch {
          return !1;
        }
      for (let F = 0; F < this.set.length; F++)
        if (k(this.set[F], I, this.options))
          return !0;
      return !1;
    }
  }
  Ni = d;
  const h = lf(), u = new h(), c = ia(), l = Wr(), i = jr(), f = Ge(), {
    safeRe: n,
    t: o,
    comparatorTrimReplace: a,
    tildeTrimReplace: s,
    caretTrimReplace: t
  } = vr(), { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: v } = Hr(), E = (N) => N.value === "<0.0.0-0", p = (N) => N.value === "", S = (N, I) => {
    let F = !0;
    const $ = N.slice();
    let J = $.pop();
    for (; F && $.length; )
      F = $.every((W) => J.intersects(W, I)), J = $.pop();
    return F;
  }, T = (N, I) => (i("comp", N, I), N = C(N, I), i("caret", N), N = P(N, I), i("tildes", N), N = R(N, I), i("xrange", N), N = q(N, I), i("stars", N), N), O = (N) => !N || N.toLowerCase() === "x" || N === "*", P = (N, I) => N.trim().split(/\s+/).map((F) => M(F, I)).join(" "), M = (N, I) => {
    const F = I.loose ? n[o.TILDELOOSE] : n[o.TILDE];
    return N.replace(F, ($, J, W, ne, ce) => {
      i("tilde", N, $, J, W, ne, ce);
      let ue;
      return O(J) ? ue = "" : O(W) ? ue = `>=${J}.0.0 <${+J + 1}.0.0-0` : O(ne) ? ue = `>=${J}.${W}.0 <${J}.${+W + 1}.0-0` : ce ? (i("replaceTilde pr", ce), ue = `>=${J}.${W}.${ne}-${ce} <${J}.${+W + 1}.0-0`) : ue = `>=${J}.${W}.${ne} <${J}.${+W + 1}.0-0`, i("tilde return", ue), ue;
    });
  }, C = (N, I) => N.trim().split(/\s+/).map((F) => A(F, I)).join(" "), A = (N, I) => {
    i("caret", N, I);
    const F = I.loose ? n[o.CARETLOOSE] : n[o.CARET], $ = I.includePrerelease ? "-0" : "";
    return N.replace(F, (J, W, ne, ce, ue) => {
      i("caret", N, J, W, ne, ce, ue);
      let ie;
      return O(W) ? ie = "" : O(ne) ? ie = `>=${W}.0.0${$} <${+W + 1}.0.0-0` : O(ce) ? W === "0" ? ie = `>=${W}.${ne}.0${$} <${W}.${+ne + 1}.0-0` : ie = `>=${W}.${ne}.0${$} <${+W + 1}.0.0-0` : ue ? (i("replaceCaret pr", ue), W === "0" ? ne === "0" ? ie = `>=${W}.${ne}.${ce}-${ue} <${W}.${ne}.${+ce + 1}-0` : ie = `>=${W}.${ne}.${ce}-${ue} <${W}.${+ne + 1}.0-0` : ie = `>=${W}.${ne}.${ce}-${ue} <${+W + 1}.0.0-0`) : (i("no pr"), W === "0" ? ne === "0" ? ie = `>=${W}.${ne}.${ce}${$} <${W}.${ne}.${+ce + 1}-0` : ie = `>=${W}.${ne}.${ce}${$} <${W}.${+ne + 1}.0-0` : ie = `>=${W}.${ne}.${ce} <${+W + 1}.0.0-0`), i("caret return", ie), ie;
    });
  }, R = (N, I) => (i("replaceXRanges", N, I), N.split(/\s+/).map((F) => y(F, I)).join(" ")), y = (N, I) => {
    N = N.trim();
    const F = I.loose ? n[o.XRANGELOOSE] : n[o.XRANGE];
    return N.replace(F, ($, J, W, ne, ce, ue) => {
      i("xRange", N, $, J, W, ne, ce, ue);
      const ie = O(W), Ae = ie || O(ne), K = Ae || O(ce), Ee = K;
      return J === "=" && Ee && (J = ""), ue = I.includePrerelease ? "-0" : "", ie ? J === ">" || J === "<" ? $ = "<0.0.0-0" : $ = "*" : J && Ee ? (Ae && (ne = 0), ce = 0, J === ">" ? (J = ">=", Ae ? (W = +W + 1, ne = 0, ce = 0) : (ne = +ne + 1, ce = 0)) : J === "<=" && (J = "<", Ae ? W = +W + 1 : ne = +ne + 1), J === "<" && (ue = "-0"), $ = `${J + W}.${ne}.${ce}${ue}`) : Ae ? $ = `>=${W}.0.0${ue} <${+W + 1}.0.0-0` : K && ($ = `>=${W}.${ne}.0${ue} <${W}.${+ne + 1}.0-0`), i("xRange return", $), $;
    });
  }, q = (N, I) => (i("replaceStars", N, I), N.trim().replace(n[o.STAR], "")), U = (N, I) => (i("replaceGTE0", N, I), N.trim().replace(n[I.includePrerelease ? o.GTE0PRE : o.GTE0], "")), L = (N) => (I, F, $, J, W, ne, ce, ue, ie, Ae, K, Ee) => (O($) ? F = "" : O(J) ? F = `>=${$}.0.0${N ? "-0" : ""}` : O(W) ? F = `>=${$}.${J}.0${N ? "-0" : ""}` : ne ? F = `>=${F}` : F = `>=${F}${N ? "-0" : ""}`, O(ie) ? ue = "" : O(Ae) ? ue = `<${+ie + 1}.0.0-0` : O(K) ? ue = `<${ie}.${+Ae + 1}.0-0` : Ee ? ue = `<=${ie}.${Ae}.${K}-${Ee}` : N ? ue = `<${ie}.${Ae}.${+K + 1}-0` : ue = `<=${ue}`, `${F} ${ue}`.trim()), k = (N, I, F) => {
    for (let $ = 0; $ < N.length; $++)
      if (!N[$].test(I))
        return !1;
    if (I.prerelease.length && !F.includePrerelease) {
      for (let $ = 0; $ < N.length; $++)
        if (i(N[$].semver), N[$].semver !== l.ANY && N[$].semver.prerelease.length > 0) {
          const J = N[$].semver;
          if (J.major === I.major && J.minor === I.minor && J.patch === I.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Ni;
}
var Fi, bs;
function Wr() {
  if (bs) return Fi;
  bs = 1;
  const r = Symbol("SemVer ANY");
  class d {
    static get ANY() {
      return r;
    }
    constructor(a, s) {
      if (s = h(s), a instanceof d) {
        if (a.loose === !!s.loose)
          return a;
        a = a.value;
      }
      a = a.trim().split(/\s+/).join(" "), i("comparator", a, s), this.options = s, this.loose = !!s.loose, this.parse(a), this.semver === r ? this.value = "" : this.value = this.operator + this.semver.version, i("comp", this);
    }
    parse(a) {
      const s = this.options.loose ? u[c.COMPARATORLOOSE] : u[c.COMPARATOR], t = a.match(s);
      if (!t)
        throw new TypeError(`Invalid comparator: ${a}`);
      this.operator = t[1] !== void 0 ? t[1] : "", this.operator === "=" && (this.operator = ""), t[2] ? this.semver = new f(t[2], this.options.loose) : this.semver = r;
    }
    toString() {
      return this.value;
    }
    test(a) {
      if (i("Comparator.test", a, this.options.loose), this.semver === r || a === r)
        return !0;
      if (typeof a == "string")
        try {
          a = new f(a, this.options);
        } catch {
          return !1;
        }
      return l(a, this.operator, this.semver, this.options);
    }
    intersects(a, s) {
      if (!(a instanceof d))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new n(a.value, s).test(this.value) : a.operator === "" ? a.value === "" ? !0 : new n(this.value, s).test(a.semver) : (s = h(s), s.includePrerelease && (this.value === "<0.0.0-0" || a.value === "<0.0.0-0") || !s.includePrerelease && (this.value.startsWith("<0.0.0") || a.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && a.operator.startsWith(">") || this.operator.startsWith("<") && a.operator.startsWith("<") || this.semver.version === a.semver.version && this.operator.includes("=") && a.operator.includes("=") || l(this.semver, "<", a.semver, s) && this.operator.startsWith(">") && a.operator.startsWith("<") || l(this.semver, ">", a.semver, s) && this.operator.startsWith("<") && a.operator.startsWith(">")));
    }
  }
  Fi = d;
  const h = ia(), { safeRe: u, t: c } = vr(), l = Zl(), i = jr(), f = Ge(), n = tt();
  return Fi;
}
var xi, Os;
function Vr() {
  if (Os) return xi;
  Os = 1;
  const r = tt();
  return xi = (h, u, c) => {
    try {
      u = new r(u, c);
    } catch {
      return !1;
    }
    return u.test(h);
  }, xi;
}
var Li, Ps;
function uf() {
  if (Ps) return Li;
  Ps = 1;
  const r = tt();
  return Li = (h, u) => new r(h, u).set.map((c) => c.map((l) => l.value).join(" ").trim().split(" ")), Li;
}
var Ui, Is;
function cf() {
  if (Is) return Ui;
  Is = 1;
  const r = Ge(), d = tt();
  return Ui = (u, c, l) => {
    let i = null, f = null, n = null;
    try {
      n = new d(c, l);
    } catch {
      return null;
    }
    return u.forEach((o) => {
      n.test(o) && (!i || f.compare(o) === -1) && (i = o, f = new r(i, l));
    }), i;
  }, Ui;
}
var $i, Ds;
function ff() {
  if (Ds) return $i;
  Ds = 1;
  const r = Ge(), d = tt();
  return $i = (u, c, l) => {
    let i = null, f = null, n = null;
    try {
      n = new d(c, l);
    } catch {
      return null;
    }
    return u.forEach((o) => {
      n.test(o) && (!i || f.compare(o) === 1) && (i = o, f = new r(i, l));
    }), i;
  }, $i;
}
var ki, Ns;
function df() {
  if (Ns) return ki;
  Ns = 1;
  const r = Ge(), d = tt(), h = Gr();
  return ki = (c, l) => {
    c = new d(c, l);
    let i = new r("0.0.0");
    if (c.test(i) || (i = new r("0.0.0-0"), c.test(i)))
      return i;
    i = null;
    for (let f = 0; f < c.set.length; ++f) {
      const n = c.set[f];
      let o = null;
      n.forEach((a) => {
        const s = new r(a.semver.version);
        switch (a.operator) {
          case ">":
            s.prerelease.length === 0 ? s.patch++ : s.prerelease.push(0), s.raw = s.format();
          /* fallthrough */
          case "":
          case ">=":
            (!o || h(s, o)) && (o = s);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${a.operator}`);
        }
      }), o && (!i || h(i, o)) && (i = o);
    }
    return i && c.test(i) ? i : null;
  }, ki;
}
var qi, Fs;
function hf() {
  if (Fs) return qi;
  Fs = 1;
  const r = tt();
  return qi = (h, u) => {
    try {
      return new r(h, u).range || "*";
    } catch {
      return null;
    }
  }, qi;
}
var Mi, xs;
function ua() {
  if (xs) return Mi;
  xs = 1;
  const r = Ge(), d = Wr(), { ANY: h } = d, u = tt(), c = Vr(), l = Gr(), i = oa(), f = la(), n = sa();
  return Mi = (a, s, t, m) => {
    a = new r(a, m), s = new u(s, m);
    let v, E, p, S, T;
    switch (t) {
      case ">":
        v = l, E = f, p = i, S = ">", T = ">=";
        break;
      case "<":
        v = i, E = n, p = l, S = "<", T = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (c(a, s, m))
      return !1;
    for (let O = 0; O < s.set.length; ++O) {
      const P = s.set[O];
      let M = null, C = null;
      if (P.forEach((A) => {
        A.semver === h && (A = new d(">=0.0.0")), M = M || A, C = C || A, v(A.semver, M.semver, m) ? M = A : p(A.semver, C.semver, m) && (C = A);
      }), M.operator === S || M.operator === T || (!C.operator || C.operator === S) && E(a, C.semver))
        return !1;
      if (C.operator === T && p(a, C.semver))
        return !1;
    }
    return !0;
  }, Mi;
}
var Bi, Ls;
function pf() {
  if (Ls) return Bi;
  Ls = 1;
  const r = ua();
  return Bi = (h, u, c) => r(h, u, ">", c), Bi;
}
var Hi, Us;
function mf() {
  if (Us) return Hi;
  Us = 1;
  const r = ua();
  return Hi = (h, u, c) => r(h, u, "<", c), Hi;
}
var ji, $s;
function gf() {
  if ($s) return ji;
  $s = 1;
  const r = tt();
  return ji = (h, u, c) => (h = new r(h, c), u = new r(u, c), h.intersects(u, c)), ji;
}
var Gi, ks;
function vf() {
  if (ks) return Gi;
  ks = 1;
  const r = Vr(), d = et();
  return Gi = (h, u, c) => {
    const l = [];
    let i = null, f = null;
    const n = h.sort((t, m) => d(t, m, c));
    for (const t of n)
      r(t, u, c) ? (f = t, i || (i = t)) : (f && l.push([i, f]), f = null, i = null);
    i && l.push([i, null]);
    const o = [];
    for (const [t, m] of l)
      t === m ? o.push(t) : !m && t === n[0] ? o.push("*") : m ? t === n[0] ? o.push(`<=${m}`) : o.push(`${t} - ${m}`) : o.push(`>=${t}`);
    const a = o.join(" || "), s = typeof u.raw == "string" ? u.raw : String(u);
    return a.length < s.length ? a : u;
  }, Gi;
}
var Wi, qs;
function Ef() {
  if (qs) return Wi;
  qs = 1;
  const r = tt(), d = Wr(), { ANY: h } = d, u = Vr(), c = et(), l = (s, t, m = {}) => {
    if (s === t)
      return !0;
    s = new r(s, m), t = new r(t, m);
    let v = !1;
    e: for (const E of s.set) {
      for (const p of t.set) {
        const S = n(E, p, m);
        if (v = v || S !== null, S)
          continue e;
      }
      if (v)
        return !1;
    }
    return !0;
  }, i = [new d(">=0.0.0-0")], f = [new d(">=0.0.0")], n = (s, t, m) => {
    if (s === t)
      return !0;
    if (s.length === 1 && s[0].semver === h) {
      if (t.length === 1 && t[0].semver === h)
        return !0;
      m.includePrerelease ? s = i : s = f;
    }
    if (t.length === 1 && t[0].semver === h) {
      if (m.includePrerelease)
        return !0;
      t = f;
    }
    const v = /* @__PURE__ */ new Set();
    let E, p;
    for (const R of s)
      R.operator === ">" || R.operator === ">=" ? E = o(E, R, m) : R.operator === "<" || R.operator === "<=" ? p = a(p, R, m) : v.add(R.semver);
    if (v.size > 1)
      return null;
    let S;
    if (E && p) {
      if (S = c(E.semver, p.semver, m), S > 0)
        return null;
      if (S === 0 && (E.operator !== ">=" || p.operator !== "<="))
        return null;
    }
    for (const R of v) {
      if (E && !u(R, String(E), m) || p && !u(R, String(p), m))
        return null;
      for (const y of t)
        if (!u(R, String(y), m))
          return !1;
      return !0;
    }
    let T, O, P, M, C = p && !m.includePrerelease && p.semver.prerelease.length ? p.semver : !1, A = E && !m.includePrerelease && E.semver.prerelease.length ? E.semver : !1;
    C && C.prerelease.length === 1 && p.operator === "<" && C.prerelease[0] === 0 && (C = !1);
    for (const R of t) {
      if (M = M || R.operator === ">" || R.operator === ">=", P = P || R.operator === "<" || R.operator === "<=", E) {
        if (A && R.semver.prerelease && R.semver.prerelease.length && R.semver.major === A.major && R.semver.minor === A.minor && R.semver.patch === A.patch && (A = !1), R.operator === ">" || R.operator === ">=") {
          if (T = o(E, R, m), T === R && T !== E)
            return !1;
        } else if (E.operator === ">=" && !u(E.semver, String(R), m))
          return !1;
      }
      if (p) {
        if (C && R.semver.prerelease && R.semver.prerelease.length && R.semver.major === C.major && R.semver.minor === C.minor && R.semver.patch === C.patch && (C = !1), R.operator === "<" || R.operator === "<=") {
          if (O = a(p, R, m), O === R && O !== p)
            return !1;
        } else if (p.operator === "<=" && !u(p.semver, String(R), m))
          return !1;
      }
      if (!R.operator && (p || E) && S !== 0)
        return !1;
    }
    return !(E && P && !p && S !== 0 || p && M && !E && S !== 0 || A || C);
  }, o = (s, t, m) => {
    if (!s)
      return t;
    const v = c(s.semver, t.semver, m);
    return v > 0 ? s : v < 0 || t.operator === ">" && s.operator === ">=" ? t : s;
  }, a = (s, t, m) => {
    if (!s)
      return t;
    const v = c(s.semver, t.semver, m);
    return v < 0 ? s : v > 0 || t.operator === "<" && s.operator === "<=" ? t : s;
  };
  return Wi = l, Wi;
}
var Vi, Ms;
function eu() {
  if (Ms) return Vi;
  Ms = 1;
  const r = vr(), d = Hr(), h = Ge(), u = Kl(), c = Mt(), l = zc(), i = Xc(), f = Kc(), n = Jc(), o = Qc(), a = Zc(), s = ef(), t = tf(), m = et(), v = rf(), E = nf(), p = aa(), S = af(), T = of(), O = Gr(), P = oa(), M = Jl(), C = Ql(), A = sa(), R = la(), y = Zl(), q = sf(), U = Wr(), L = tt(), k = Vr(), N = uf(), I = cf(), F = ff(), $ = df(), J = hf(), W = ua(), ne = pf(), ce = mf(), ue = gf(), ie = vf(), Ae = Ef();
  return Vi = {
    parse: c,
    valid: l,
    clean: i,
    inc: f,
    diff: n,
    major: o,
    minor: a,
    patch: s,
    prerelease: t,
    compare: m,
    rcompare: v,
    compareLoose: E,
    compareBuild: p,
    sort: S,
    rsort: T,
    gt: O,
    lt: P,
    eq: M,
    neq: C,
    gte: A,
    lte: R,
    cmp: y,
    coerce: q,
    Comparator: U,
    Range: L,
    satisfies: k,
    toComparators: N,
    maxSatisfying: I,
    minSatisfying: F,
    minVersion: $,
    validRange: J,
    outside: W,
    gtr: ne,
    ltr: ce,
    intersects: ue,
    simplifyRange: ie,
    subset: Ae,
    SemVer: h,
    re: r.re,
    src: r.src,
    tokens: r.t,
    SEMVER_SPEC_VERSION: d.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: d.RELEASE_TYPES,
    compareIdentifiers: u.compareIdentifiers,
    rcompareIdentifiers: u.rcompareIdentifiers
  }, Vi;
}
var xt = {}, dr = { exports: {} };
dr.exports;
var Bs;
function yf() {
  return Bs || (Bs = 1, function(r, d) {
    var h = 200, u = "__lodash_hash_undefined__", c = 1, l = 2, i = 9007199254740991, f = "[object Arguments]", n = "[object Array]", o = "[object AsyncFunction]", a = "[object Boolean]", s = "[object Date]", t = "[object Error]", m = "[object Function]", v = "[object GeneratorFunction]", E = "[object Map]", p = "[object Number]", S = "[object Null]", T = "[object Object]", O = "[object Promise]", P = "[object Proxy]", M = "[object RegExp]", C = "[object Set]", A = "[object String]", R = "[object Symbol]", y = "[object Undefined]", q = "[object WeakMap]", U = "[object ArrayBuffer]", L = "[object DataView]", k = "[object Float32Array]", N = "[object Float64Array]", I = "[object Int8Array]", F = "[object Int16Array]", $ = "[object Int32Array]", J = "[object Uint8Array]", W = "[object Uint8ClampedArray]", ne = "[object Uint16Array]", ce = "[object Uint32Array]", ue = /[\\^$.*+?()[\]{}|]/g, ie = /^\[object .+?Constructor\]$/, Ae = /^(?:0|[1-9]\d*)$/, K = {};
    K[k] = K[N] = K[I] = K[F] = K[$] = K[J] = K[W] = K[ne] = K[ce] = !0, K[f] = K[n] = K[U] = K[a] = K[L] = K[s] = K[t] = K[m] = K[E] = K[p] = K[T] = K[M] = K[C] = K[A] = K[q] = !1;
    var Ee = typeof Ze == "object" && Ze && Ze.Object === Object && Ze, _ = typeof self == "object" && self && self.Object === Object && self, g = Ee || _ || Function("return this")(), H = d && !d.nodeType && d, D = H && !0 && r && !r.nodeType && r, le = D && D.exports === H, me = le && Ee.process, pe = function() {
      try {
        return me && me.binding && me.binding("util");
      } catch {
      }
    }(), _e = pe && pe.isTypedArray;
    function ye(b, x) {
      for (var z = -1, se = b == null ? 0 : b.length, Oe = 0, Se = []; ++z < se; ) {
        var Ne = b[z];
        x(Ne, z, b) && (Se[Oe++] = Ne);
      }
      return Se;
    }
    function xe(b, x) {
      for (var z = -1, se = x.length, Oe = b.length; ++z < se; )
        b[Oe + z] = x[z];
      return b;
    }
    function Ce(b, x) {
      for (var z = -1, se = b == null ? 0 : b.length; ++z < se; )
        if (x(b[z], z, b))
          return !0;
      return !1;
    }
    function qe(b, x) {
      for (var z = -1, se = Array(b); ++z < b; )
        se[z] = x(z);
      return se;
    }
    function gt(b) {
      return function(x) {
        return b(x);
      };
    }
    function nt(b, x) {
      return b.has(x);
    }
    function e(b, x) {
      return b == null ? void 0 : b[x];
    }
    function B(b) {
      var x = -1, z = Array(b.size);
      return b.forEach(function(se, Oe) {
        z[++x] = [Oe, se];
      }), z;
    }
    function G(b, x) {
      return function(z) {
        return b(x(z));
      };
    }
    function re(b) {
      var x = -1, z = Array(b.size);
      return b.forEach(function(se) {
        z[++x] = se;
      }), z;
    }
    var V = Array.prototype, te = Function.prototype, Z = Object.prototype, ae = g["__core-js_shared__"], ge = te.toString, ve = Z.hasOwnProperty, Re = function() {
      var b = /[^.]+$/.exec(ae && ae.keys && ae.keys.IE_PROTO || "");
      return b ? "Symbol(src)_1." + b : "";
    }(), de = Z.toString, Le = RegExp(
      "^" + ge.call(ve).replace(ue, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), w = le ? g.Buffer : void 0, j = g.Symbol, X = g.Uint8Array, Y = Z.propertyIsEnumerable, Q = V.splice, ee = j ? j.toStringTag : void 0, fe = Object.getOwnPropertySymbols, oe = w ? w.isBuffer : void 0, he = G(Object.keys, Object), we = Nt(g, "DataView"), be = Nt(g, "Map"), De = Nt(g, "Promise"), Te = Nt(g, "Set"), Dt = Nt(g, "WeakMap"), Je = Nt(Object, "create"), vt = wt(we), cu = wt(be), fu = wt(De), du = wt(Te), hu = wt(Dt), da = j ? j.prototype : void 0, Yr = da ? da.valueOf : void 0;
    function Et(b) {
      var x = -1, z = b == null ? 0 : b.length;
      for (this.clear(); ++x < z; ) {
        var se = b[x];
        this.set(se[0], se[1]);
      }
    }
    function pu() {
      this.__data__ = Je ? Je(null) : {}, this.size = 0;
    }
    function mu(b) {
      var x = this.has(b) && delete this.__data__[b];
      return this.size -= x ? 1 : 0, x;
    }
    function gu(b) {
      var x = this.__data__;
      if (Je) {
        var z = x[b];
        return z === u ? void 0 : z;
      }
      return ve.call(x, b) ? x[b] : void 0;
    }
    function vu(b) {
      var x = this.__data__;
      return Je ? x[b] !== void 0 : ve.call(x, b);
    }
    function Eu(b, x) {
      var z = this.__data__;
      return this.size += this.has(b) ? 0 : 1, z[b] = Je && x === void 0 ? u : x, this;
    }
    Et.prototype.clear = pu, Et.prototype.delete = mu, Et.prototype.get = gu, Et.prototype.has = vu, Et.prototype.set = Eu;
    function it(b) {
      var x = -1, z = b == null ? 0 : b.length;
      for (this.clear(); ++x < z; ) {
        var se = b[x];
        this.set(se[0], se[1]);
      }
    }
    function yu() {
      this.__data__ = [], this.size = 0;
    }
    function wu(b) {
      var x = this.__data__, z = yr(x, b);
      if (z < 0)
        return !1;
      var se = x.length - 1;
      return z == se ? x.pop() : Q.call(x, z, 1), --this.size, !0;
    }
    function _u(b) {
      var x = this.__data__, z = yr(x, b);
      return z < 0 ? void 0 : x[z][1];
    }
    function Su(b) {
      return yr(this.__data__, b) > -1;
    }
    function Au(b, x) {
      var z = this.__data__, se = yr(z, b);
      return se < 0 ? (++this.size, z.push([b, x])) : z[se][1] = x, this;
    }
    it.prototype.clear = yu, it.prototype.delete = wu, it.prototype.get = _u, it.prototype.has = Su, it.prototype.set = Au;
    function yt(b) {
      var x = -1, z = b == null ? 0 : b.length;
      for (this.clear(); ++x < z; ) {
        var se = b[x];
        this.set(se[0], se[1]);
      }
    }
    function Ru() {
      this.size = 0, this.__data__ = {
        hash: new Et(),
        map: new (be || it)(),
        string: new Et()
      };
    }
    function Tu(b) {
      var x = wr(this, b).delete(b);
      return this.size -= x ? 1 : 0, x;
    }
    function Cu(b) {
      return wr(this, b).get(b);
    }
    function bu(b) {
      return wr(this, b).has(b);
    }
    function Ou(b, x) {
      var z = wr(this, b), se = z.size;
      return z.set(b, x), this.size += z.size == se ? 0 : 1, this;
    }
    yt.prototype.clear = Ru, yt.prototype.delete = Tu, yt.prototype.get = Cu, yt.prototype.has = bu, yt.prototype.set = Ou;
    function Er(b) {
      var x = -1, z = b == null ? 0 : b.length;
      for (this.__data__ = new yt(); ++x < z; )
        this.add(b[x]);
    }
    function Pu(b) {
      return this.__data__.set(b, u), this;
    }
    function Iu(b) {
      return this.__data__.has(b);
    }
    Er.prototype.add = Er.prototype.push = Pu, Er.prototype.has = Iu;
    function st(b) {
      var x = this.__data__ = new it(b);
      this.size = x.size;
    }
    function Du() {
      this.__data__ = new it(), this.size = 0;
    }
    function Nu(b) {
      var x = this.__data__, z = x.delete(b);
      return this.size = x.size, z;
    }
    function Fu(b) {
      return this.__data__.get(b);
    }
    function xu(b) {
      return this.__data__.has(b);
    }
    function Lu(b, x) {
      var z = this.__data__;
      if (z instanceof it) {
        var se = z.__data__;
        if (!be || se.length < h - 1)
          return se.push([b, x]), this.size = ++z.size, this;
        z = this.__data__ = new yt(se);
      }
      return z.set(b, x), this.size = z.size, this;
    }
    st.prototype.clear = Du, st.prototype.delete = Nu, st.prototype.get = Fu, st.prototype.has = xu, st.prototype.set = Lu;
    function Uu(b, x) {
      var z = _r(b), se = !z && Ju(b), Oe = !z && !se && zr(b), Se = !z && !se && !Oe && _a(b), Ne = z || se || Oe || Se, Ue = Ne ? qe(b.length, String) : [], $e = Ue.length;
      for (var Pe in b)
        ve.call(b, Pe) && !(Ne && // Safari 9 has enumerable `arguments.length` in strict mode.
        (Pe == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        Oe && (Pe == "offset" || Pe == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        Se && (Pe == "buffer" || Pe == "byteLength" || Pe == "byteOffset") || // Skip index properties.
        Vu(Pe, $e))) && Ue.push(Pe);
      return Ue;
    }
    function yr(b, x) {
      for (var z = b.length; z--; )
        if (va(b[z][0], x))
          return z;
      return -1;
    }
    function $u(b, x, z) {
      var se = x(b);
      return _r(b) ? se : xe(se, z(b));
    }
    function Ht(b) {
      return b == null ? b === void 0 ? y : S : ee && ee in Object(b) ? Gu(b) : Ku(b);
    }
    function ha(b) {
      return jt(b) && Ht(b) == f;
    }
    function pa(b, x, z, se, Oe) {
      return b === x ? !0 : b == null || x == null || !jt(b) && !jt(x) ? b !== b && x !== x : ku(b, x, z, se, pa, Oe);
    }
    function ku(b, x, z, se, Oe, Se) {
      var Ne = _r(b), Ue = _r(x), $e = Ne ? n : lt(b), Pe = Ue ? n : lt(x);
      $e = $e == f ? T : $e, Pe = Pe == f ? T : Pe;
      var Ve = $e == T, Qe = Pe == T, Me = $e == Pe;
      if (Me && zr(b)) {
        if (!zr(x))
          return !1;
        Ne = !0, Ve = !1;
      }
      if (Me && !Ve)
        return Se || (Se = new st()), Ne || _a(b) ? ma(b, x, z, se, Oe, Se) : Hu(b, x, $e, z, se, Oe, Se);
      if (!(z & c)) {
        var ze = Ve && ve.call(b, "__wrapped__"), Xe = Qe && ve.call(x, "__wrapped__");
        if (ze || Xe) {
          var ut = ze ? b.value() : b, at = Xe ? x.value() : x;
          return Se || (Se = new st()), Oe(ut, at, z, se, Se);
        }
      }
      return Me ? (Se || (Se = new st()), ju(b, x, z, se, Oe, Se)) : !1;
    }
    function qu(b) {
      if (!wa(b) || zu(b))
        return !1;
      var x = Ea(b) ? Le : ie;
      return x.test(wt(b));
    }
    function Mu(b) {
      return jt(b) && ya(b.length) && !!K[Ht(b)];
    }
    function Bu(b) {
      if (!Xu(b))
        return he(b);
      var x = [];
      for (var z in Object(b))
        ve.call(b, z) && z != "constructor" && x.push(z);
      return x;
    }
    function ma(b, x, z, se, Oe, Se) {
      var Ne = z & c, Ue = b.length, $e = x.length;
      if (Ue != $e && !(Ne && $e > Ue))
        return !1;
      var Pe = Se.get(b);
      if (Pe && Se.get(x))
        return Pe == x;
      var Ve = -1, Qe = !0, Me = z & l ? new Er() : void 0;
      for (Se.set(b, x), Se.set(x, b); ++Ve < Ue; ) {
        var ze = b[Ve], Xe = x[Ve];
        if (se)
          var ut = Ne ? se(Xe, ze, Ve, x, b, Se) : se(ze, Xe, Ve, b, x, Se);
        if (ut !== void 0) {
          if (ut)
            continue;
          Qe = !1;
          break;
        }
        if (Me) {
          if (!Ce(x, function(at, _t) {
            if (!nt(Me, _t) && (ze === at || Oe(ze, at, z, se, Se)))
              return Me.push(_t);
          })) {
            Qe = !1;
            break;
          }
        } else if (!(ze === Xe || Oe(ze, Xe, z, se, Se))) {
          Qe = !1;
          break;
        }
      }
      return Se.delete(b), Se.delete(x), Qe;
    }
    function Hu(b, x, z, se, Oe, Se, Ne) {
      switch (z) {
        case L:
          if (b.byteLength != x.byteLength || b.byteOffset != x.byteOffset)
            return !1;
          b = b.buffer, x = x.buffer;
        case U:
          return !(b.byteLength != x.byteLength || !Se(new X(b), new X(x)));
        case a:
        case s:
        case p:
          return va(+b, +x);
        case t:
          return b.name == x.name && b.message == x.message;
        case M:
        case A:
          return b == x + "";
        case E:
          var Ue = B;
        case C:
          var $e = se & c;
          if (Ue || (Ue = re), b.size != x.size && !$e)
            return !1;
          var Pe = Ne.get(b);
          if (Pe)
            return Pe == x;
          se |= l, Ne.set(b, x);
          var Ve = ma(Ue(b), Ue(x), se, Oe, Se, Ne);
          return Ne.delete(b), Ve;
        case R:
          if (Yr)
            return Yr.call(b) == Yr.call(x);
      }
      return !1;
    }
    function ju(b, x, z, se, Oe, Se) {
      var Ne = z & c, Ue = ga(b), $e = Ue.length, Pe = ga(x), Ve = Pe.length;
      if ($e != Ve && !Ne)
        return !1;
      for (var Qe = $e; Qe--; ) {
        var Me = Ue[Qe];
        if (!(Ne ? Me in x : ve.call(x, Me)))
          return !1;
      }
      var ze = Se.get(b);
      if (ze && Se.get(x))
        return ze == x;
      var Xe = !0;
      Se.set(b, x), Se.set(x, b);
      for (var ut = Ne; ++Qe < $e; ) {
        Me = Ue[Qe];
        var at = b[Me], _t = x[Me];
        if (se)
          var Sa = Ne ? se(_t, at, Me, x, b, Se) : se(at, _t, Me, b, x, Se);
        if (!(Sa === void 0 ? at === _t || Oe(at, _t, z, se, Se) : Sa)) {
          Xe = !1;
          break;
        }
        ut || (ut = Me == "constructor");
      }
      if (Xe && !ut) {
        var Sr = b.constructor, Ar = x.constructor;
        Sr != Ar && "constructor" in b && "constructor" in x && !(typeof Sr == "function" && Sr instanceof Sr && typeof Ar == "function" && Ar instanceof Ar) && (Xe = !1);
      }
      return Se.delete(b), Se.delete(x), Xe;
    }
    function ga(b) {
      return $u(b, ec, Wu);
    }
    function wr(b, x) {
      var z = b.__data__;
      return Yu(x) ? z[typeof x == "string" ? "string" : "hash"] : z.map;
    }
    function Nt(b, x) {
      var z = e(b, x);
      return qu(z) ? z : void 0;
    }
    function Gu(b) {
      var x = ve.call(b, ee), z = b[ee];
      try {
        b[ee] = void 0;
        var se = !0;
      } catch {
      }
      var Oe = de.call(b);
      return se && (x ? b[ee] = z : delete b[ee]), Oe;
    }
    var Wu = fe ? function(b) {
      return b == null ? [] : (b = Object(b), ye(fe(b), function(x) {
        return Y.call(b, x);
      }));
    } : tc, lt = Ht;
    (we && lt(new we(new ArrayBuffer(1))) != L || be && lt(new be()) != E || De && lt(De.resolve()) != O || Te && lt(new Te()) != C || Dt && lt(new Dt()) != q) && (lt = function(b) {
      var x = Ht(b), z = x == T ? b.constructor : void 0, se = z ? wt(z) : "";
      if (se)
        switch (se) {
          case vt:
            return L;
          case cu:
            return E;
          case fu:
            return O;
          case du:
            return C;
          case hu:
            return q;
        }
      return x;
    });
    function Vu(b, x) {
      return x = x ?? i, !!x && (typeof b == "number" || Ae.test(b)) && b > -1 && b % 1 == 0 && b < x;
    }
    function Yu(b) {
      var x = typeof b;
      return x == "string" || x == "number" || x == "symbol" || x == "boolean" ? b !== "__proto__" : b === null;
    }
    function zu(b) {
      return !!Re && Re in b;
    }
    function Xu(b) {
      var x = b && b.constructor, z = typeof x == "function" && x.prototype || Z;
      return b === z;
    }
    function Ku(b) {
      return de.call(b);
    }
    function wt(b) {
      if (b != null) {
        try {
          return ge.call(b);
        } catch {
        }
        try {
          return b + "";
        } catch {
        }
      }
      return "";
    }
    function va(b, x) {
      return b === x || b !== b && x !== x;
    }
    var Ju = ha(/* @__PURE__ */ function() {
      return arguments;
    }()) ? ha : function(b) {
      return jt(b) && ve.call(b, "callee") && !Y.call(b, "callee");
    }, _r = Array.isArray;
    function Qu(b) {
      return b != null && ya(b.length) && !Ea(b);
    }
    var zr = oe || rc;
    function Zu(b, x) {
      return pa(b, x);
    }
    function Ea(b) {
      if (!wa(b))
        return !1;
      var x = Ht(b);
      return x == m || x == v || x == o || x == P;
    }
    function ya(b) {
      return typeof b == "number" && b > -1 && b % 1 == 0 && b <= i;
    }
    function wa(b) {
      var x = typeof b;
      return b != null && (x == "object" || x == "function");
    }
    function jt(b) {
      return b != null && typeof b == "object";
    }
    var _a = _e ? gt(_e) : Mu;
    function ec(b) {
      return Qu(b) ? Uu(b) : Bu(b);
    }
    function tc() {
      return [];
    }
    function rc() {
      return !1;
    }
    r.exports = Zu;
  }(dr, dr.exports)), dr.exports;
}
var Hs;
function wf() {
  if (Hs) return xt;
  Hs = 1, Object.defineProperty(xt, "__esModule", { value: !0 }), xt.DownloadedUpdateHelper = void 0, xt.createTempUpdateFile = f;
  const r = pr, d = pt, h = yf(), u = /* @__PURE__ */ mt(), c = Ie;
  let l = class {
    constructor(o) {
      this.cacheDir = o, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
    }
    get downloadedFileInfo() {
      return this._downloadedFileInfo;
    }
    get file() {
      return this._file;
    }
    get packageFile() {
      return this._packageFile;
    }
    get cacheDirForPendingUpdate() {
      return c.join(this.cacheDir, "pending");
    }
    async validateDownloadedPath(o, a, s, t) {
      if (this.versionInfo != null && this.file === o && this.fileInfo != null)
        return h(this.versionInfo, a) && h(this.fileInfo.info, s.info) && await (0, u.pathExists)(o) ? o : null;
      const m = await this.getValidCachedUpdateFile(s, t);
      return m === null ? null : (t.info(`Update has already been downloaded to ${o}).`), this._file = m, m);
    }
    async setDownloadedFile(o, a, s, t, m, v) {
      this._file = o, this._packageFile = a, this.versionInfo = s, this.fileInfo = t, this._downloadedFileInfo = {
        fileName: m,
        sha512: t.info.sha512,
        isAdminRightsRequired: t.info.isAdminRightsRequired === !0
      }, v && await (0, u.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
    }
    async clear() {
      this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
    }
    async cleanCacheDirForPendingUpdate() {
      try {
        await (0, u.emptyDir)(this.cacheDirForPendingUpdate);
      } catch {
      }
    }
    /**
     * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
     * @param fileInfo
     * @param logger
     */
    async getValidCachedUpdateFile(o, a) {
      const s = this.getUpdateInfoFile();
      if (!await (0, u.pathExists)(s))
        return null;
      let m;
      try {
        m = await (0, u.readJson)(s);
      } catch (S) {
        let T = "No cached update info available";
        return S.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), T += ` (error on read: ${S.message})`), a.info(T), null;
      }
      if (!((m == null ? void 0 : m.fileName) !== null))
        return a.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
      if (o.info.sha512 !== m.sha512)
        return a.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${m.sha512}, expected: ${o.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
      const E = c.join(this.cacheDirForPendingUpdate, m.fileName);
      if (!await (0, u.pathExists)(E))
        return a.info("Cached update file doesn't exist"), null;
      const p = await i(E);
      return o.info.sha512 !== p ? (a.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${p}, expected: ${o.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = m, E);
    }
    getUpdateInfoFile() {
      return c.join(this.cacheDirForPendingUpdate, "update-info.json");
    }
  };
  xt.DownloadedUpdateHelper = l;
  function i(n, o = "sha512", a = "base64", s) {
    return new Promise((t, m) => {
      const v = (0, r.createHash)(o);
      v.on("error", m).setEncoding(a), (0, d.createReadStream)(n, {
        ...s,
        highWaterMark: 1024 * 1024
        /* better to use more memory but hash faster */
      }).on("error", m).on("end", () => {
        v.end(), t(v.read());
      }).pipe(v, { end: !1 });
    });
  }
  async function f(n, o, a) {
    let s = 0, t = c.join(o, n);
    for (let m = 0; m < 3; m++)
      try {
        return await (0, u.unlink)(t), t;
      } catch (v) {
        if (v.code === "ENOENT")
          return t;
        a.warn(`Error on remove temp update file: ${v}`), t = c.join(o, `${s++}-${n}`);
      }
    return t;
  }
  return xt;
}
var Xt = {}, Lr = {}, js;
function _f() {
  if (js) return Lr;
  js = 1, Object.defineProperty(Lr, "__esModule", { value: !0 }), Lr.getAppCacheDir = h;
  const r = Ie, d = qr;
  function h() {
    const u = (0, d.homedir)();
    let c;
    return process.platform === "win32" ? c = process.env.LOCALAPPDATA || r.join(u, "AppData", "Local") : process.platform === "darwin" ? c = r.join(u, "Library", "Caches") : c = process.env.XDG_CACHE_HOME || r.join(u, ".cache"), c;
  }
  return Lr;
}
var Gs;
function Sf() {
  if (Gs) return Xt;
  Gs = 1, Object.defineProperty(Xt, "__esModule", { value: !0 }), Xt.ElectronAppAdapter = void 0;
  const r = Ie, d = _f();
  let h = class {
    constructor(c = bt.app) {
      this.app = c;
    }
    whenReady() {
      return this.app.whenReady();
    }
    get version() {
      return this.app.getVersion();
    }
    get name() {
      return this.app.getName();
    }
    get isPackaged() {
      return this.app.isPackaged === !0;
    }
    get appUpdateConfigPath() {
      return this.isPackaged ? r.join(process.resourcesPath, "app-update.yml") : r.join(this.app.getAppPath(), "dev-app-update.yml");
    }
    get userDataPath() {
      return this.app.getPath("userData");
    }
    get baseCachePath() {
      return (0, d.getAppCacheDir)();
    }
    quit() {
      this.app.quit();
    }
    relaunch() {
      this.app.relaunch();
    }
    onQuit(c) {
      this.app.once("quit", (l, i) => c(i));
    }
  };
  return Xt.ElectronAppAdapter = h, Xt;
}
var Yi = {}, Ws;
function Af() {
  return Ws || (Ws = 1, function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.ElectronHttpExecutor = r.NET_SESSION_NAME = void 0, r.getNetSession = h;
    const d = ke();
    r.NET_SESSION_NAME = "electron-updater";
    function h() {
      return bt.session.fromPartition(r.NET_SESSION_NAME, {
        cache: !1
      });
    }
    class u extends d.HttpExecutor {
      constructor(l) {
        super(), this.proxyLoginCallback = l, this.cachedSession = null;
      }
      async download(l, i, f) {
        return await f.cancellationToken.createPromise((n, o, a) => {
          const s = {
            headers: f.headers || void 0,
            redirect: "manual"
          };
          (0, d.configureRequestUrl)(l, s), (0, d.configureRequestOptions)(s), this.doDownload(s, {
            destination: i,
            options: f,
            onCancel: a,
            callback: (t) => {
              t == null ? n(i) : o(t);
            },
            responseHandler: null
          }, 0);
        });
      }
      createRequest(l, i) {
        l.headers && l.headers.Host && (l.host = l.headers.Host, delete l.headers.Host), this.cachedSession == null && (this.cachedSession = h());
        const f = bt.net.request({
          ...l,
          session: this.cachedSession
        });
        return f.on("response", i), this.proxyLoginCallback != null && f.on("login", this.proxyLoginCallback), f;
      }
      addRedirectHandlers(l, i, f, n, o) {
        l.on("redirect", (a, s, t) => {
          l.abort(), n > this.maxRedirects ? f(this.createMaxRedirectError()) : o(d.HttpExecutor.prepareRedirectUrlOptions(t, i));
        });
      }
    }
    r.ElectronHttpExecutor = u;
  }(Yi)), Yi;
}
var Kt = {}, Ct = {}, zi, Vs;
function Rf() {
  if (Vs) return zi;
  Vs = 1;
  var r = "[object Symbol]", d = /[\\^$.*+?()[\]{}|]/g, h = RegExp(d.source), u = typeof Ze == "object" && Ze && Ze.Object === Object && Ze, c = typeof self == "object" && self && self.Object === Object && self, l = u || c || Function("return this")(), i = Object.prototype, f = i.toString, n = l.Symbol, o = n ? n.prototype : void 0, a = o ? o.toString : void 0;
  function s(p) {
    if (typeof p == "string")
      return p;
    if (m(p))
      return a ? a.call(p) : "";
    var S = p + "";
    return S == "0" && 1 / p == -1 / 0 ? "-0" : S;
  }
  function t(p) {
    return !!p && typeof p == "object";
  }
  function m(p) {
    return typeof p == "symbol" || t(p) && f.call(p) == r;
  }
  function v(p) {
    return p == null ? "" : s(p);
  }
  function E(p) {
    return p = v(p), p && h.test(p) ? p.replace(d, "\\$&") : p;
  }
  return zi = E, zi;
}
var Ys;
function Pt() {
  if (Ys) return Ct;
  Ys = 1, Object.defineProperty(Ct, "__esModule", { value: !0 }), Ct.newBaseUrl = h, Ct.newUrlFromBase = u, Ct.getChannelFilename = c, Ct.blockmapFiles = l;
  const r = $t, d = Rf();
  function h(i) {
    const f = new r.URL(i);
    return f.pathname.endsWith("/") || (f.pathname += "/"), f;
  }
  function u(i, f, n = !1) {
    const o = new r.URL(i, f), a = f.search;
    return a != null && a.length !== 0 ? o.search = a : n && (o.search = `noCache=${Date.now().toString(32)}`), o;
  }
  function c(i) {
    return `${i}.yml`;
  }
  function l(i, f, n) {
    const o = u(`${i.pathname}.blockmap`, i);
    return [u(`${i.pathname.replace(new RegExp(d(n), "g"), f)}.blockmap`, i), o];
  }
  return Ct;
}
var ot = {}, zs;
function Ke() {
  if (zs) return ot;
  zs = 1, Object.defineProperty(ot, "__esModule", { value: !0 }), ot.Provider = void 0, ot.findFile = c, ot.parseUpdateInfo = l, ot.getFileList = i, ot.resolveFiles = f;
  const r = ke(), d = na(), h = Pt();
  let u = class {
    constructor(o) {
      this.runtimeOptions = o, this.requestHeaders = null, this.executor = o.executor;
    }
    get isUseMultipleRangeRequest() {
      return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
    }
    getChannelFilePrefix() {
      if (this.runtimeOptions.platform === "linux") {
        const o = process.env.TEST_UPDATER_ARCH || process.arch;
        return "-linux" + (o === "x64" ? "" : `-${o}`);
      } else
        return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
    }
    // due to historical reasons for windows we use channel name without platform specifier
    getDefaultChannelName() {
      return this.getCustomChannelName("latest");
    }
    getCustomChannelName(o) {
      return `${o}${this.getChannelFilePrefix()}`;
    }
    get fileExtraDownloadHeaders() {
      return null;
    }
    setRequestHeaders(o) {
      this.requestHeaders = o;
    }
    /**
     * Method to perform API request only to resolve update info, but not to download update.
     */
    httpRequest(o, a, s) {
      return this.executor.request(this.createRequestOptions(o, a), s);
    }
    createRequestOptions(o, a) {
      const s = {};
      return this.requestHeaders == null ? a != null && (s.headers = a) : s.headers = a == null ? this.requestHeaders : { ...this.requestHeaders, ...a }, (0, r.configureRequestUrl)(o, s), s;
    }
  };
  ot.Provider = u;
  function c(n, o, a) {
    if (n.length === 0)
      throw (0, r.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
    const s = n.find((t) => t.url.pathname.toLowerCase().endsWith(`.${o}`));
    return s ?? (a == null ? n[0] : n.find((t) => !a.some((m) => t.url.pathname.toLowerCase().endsWith(`.${m}`))));
  }
  function l(n, o, a) {
    if (n == null)
      throw (0, r.newError)(`Cannot parse update info from ${o} in the latest release artifacts (${a}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    let s;
    try {
      s = (0, d.load)(n);
    } catch (t) {
      throw (0, r.newError)(`Cannot parse update info from ${o} in the latest release artifacts (${a}): ${t.stack || t.message}, rawData: ${n}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    }
    return s;
  }
  function i(n) {
    const o = n.files;
    if (o != null && o.length > 0)
      return o;
    if (n.path != null)
      return [
        {
          url: n.path,
          sha2: n.sha2,
          sha512: n.sha512
        }
      ];
    throw (0, r.newError)(`No files provided: ${(0, r.safeStringifyJson)(n)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
  }
  function f(n, o, a = (s) => s) {
    const t = i(n).map((E) => {
      if (E.sha2 == null && E.sha512 == null)
        throw (0, r.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, r.safeStringifyJson)(E)}`, "ERR_UPDATER_NO_CHECKSUM");
      return {
        url: (0, h.newUrlFromBase)(a(E.url), o),
        info: E
      };
    }), m = n.packages, v = m == null ? null : m[process.arch] || m.ia32;
    return v != null && (t[0].packageInfo = {
      ...v,
      path: (0, h.newUrlFromBase)(a(v.path), o).href
    }), t;
  }
  return ot;
}
var Xs;
function tu() {
  if (Xs) return Kt;
  Xs = 1, Object.defineProperty(Kt, "__esModule", { value: !0 }), Kt.GenericProvider = void 0;
  const r = ke(), d = Pt(), h = Ke();
  let u = class extends h.Provider {
    constructor(l, i, f) {
      super(f), this.configuration = l, this.updater = i, this.baseUrl = (0, d.newBaseUrl)(this.configuration.url);
    }
    get channel() {
      const l = this.updater.channel || this.configuration.channel;
      return l == null ? this.getDefaultChannelName() : this.getCustomChannelName(l);
    }
    async getLatestVersion() {
      const l = (0, d.getChannelFilename)(this.channel), i = (0, d.newUrlFromBase)(l, this.baseUrl, this.updater.isAddNoCacheQuery);
      for (let f = 0; ; f++)
        try {
          return (0, h.parseUpdateInfo)(await this.httpRequest(i), l, i);
        } catch (n) {
          if (n instanceof r.HttpError && n.statusCode === 404)
            throw (0, r.newError)(`Cannot find channel "${l}" update info: ${n.stack || n.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          if (n.code === "ECONNREFUSED" && f < 3) {
            await new Promise((o, a) => {
              try {
                setTimeout(o, 1e3 * f);
              } catch (s) {
                a(s);
              }
            });
            continue;
          }
          throw n;
        }
    }
    resolveFiles(l) {
      return (0, h.resolveFiles)(l, this.baseUrl);
    }
  };
  return Kt.GenericProvider = u, Kt;
}
var Jt = {}, Qt = {}, Ks;
function Tf() {
  if (Ks) return Qt;
  Ks = 1, Object.defineProperty(Qt, "__esModule", { value: !0 }), Qt.BitbucketProvider = void 0;
  const r = ke(), d = Pt(), h = Ke();
  let u = class extends h.Provider {
    constructor(l, i, f) {
      super({
        ...f,
        isUseMultipleRangeRequest: !1
      }), this.configuration = l, this.updater = i;
      const { owner: n, slug: o } = l;
      this.baseUrl = (0, d.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${n}/${o}/downloads`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "latest";
    }
    async getLatestVersion() {
      const l = new r.CancellationToken(), i = (0, d.getChannelFilename)(this.getCustomChannelName(this.channel)), f = (0, d.newUrlFromBase)(i, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const n = await this.httpRequest(f, void 0, l);
        return (0, h.parseUpdateInfo)(n, i, f);
      } catch (n) {
        throw (0, r.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${n.stack || n.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(l) {
      return (0, h.resolveFiles)(l, this.baseUrl);
    }
    toString() {
      const { owner: l, slug: i } = this.configuration;
      return `Bitbucket (owner: ${l}, slug: ${i}, channel: ${this.channel})`;
    }
  };
  return Qt.BitbucketProvider = u, Qt;
}
var ft = {}, Js;
function ru() {
  if (Js) return ft;
  Js = 1, Object.defineProperty(ft, "__esModule", { value: !0 }), ft.GitHubProvider = ft.BaseGitHubProvider = void 0, ft.computeReleaseNotes = o;
  const r = ke(), d = eu(), h = $t, u = Pt(), c = Ke(), l = /\/tag\/([^/]+)$/;
  class i extends c.Provider {
    constructor(s, t, m) {
      super({
        ...m,
        /* because GitHib uses S3 */
        isUseMultipleRangeRequest: !1
      }), this.options = s, this.baseUrl = (0, u.newBaseUrl)((0, r.githubUrl)(s, t));
      const v = t === "github.com" ? "api.github.com" : t;
      this.baseApiUrl = (0, u.newBaseUrl)((0, r.githubUrl)(s, v));
    }
    computeGithubBasePath(s) {
      const t = this.options.host;
      return t && !["github.com", "api.github.com"].includes(t) ? `/api/v3${s}` : s;
    }
  }
  ft.BaseGitHubProvider = i;
  let f = class extends i {
    constructor(s, t, m) {
      super(s, "github.com", m), this.options = s, this.updater = t;
    }
    get channel() {
      const s = this.updater.channel || this.options.channel;
      return s == null ? this.getDefaultChannelName() : this.getCustomChannelName(s);
    }
    async getLatestVersion() {
      var s, t, m, v, E;
      const p = new r.CancellationToken(), S = await this.httpRequest((0, u.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
        accept: "application/xml, application/atom+xml, text/xml, */*"
      }, p), T = (0, r.parseXml)(S);
      let O = T.element("entry", !1, "No published versions on GitHub"), P = null;
      try {
        if (this.updater.allowPrerelease) {
          const q = ((s = this.updater) === null || s === void 0 ? void 0 : s.channel) || ((t = d.prerelease(this.updater.currentVersion)) === null || t === void 0 ? void 0 : t[0]) || null;
          if (q === null)
            P = l.exec(O.element("link").attribute("href"))[1];
          else
            for (const U of T.getElements("entry")) {
              const L = l.exec(U.element("link").attribute("href"));
              if (L === null)
                continue;
              const k = L[1], N = ((m = d.prerelease(k)) === null || m === void 0 ? void 0 : m[0]) || null, I = !q || ["alpha", "beta"].includes(q), F = N !== null && !["alpha", "beta"].includes(String(N));
              if (I && !F && !(q === "beta" && N === "alpha")) {
                P = k;
                break;
              }
              if (N && N === q) {
                P = k;
                break;
              }
            }
        } else {
          P = await this.getLatestTagName(p);
          for (const q of T.getElements("entry"))
            if (l.exec(q.element("link").attribute("href"))[1] === P) {
              O = q;
              break;
            }
        }
      } catch (q) {
        throw (0, r.newError)(`Cannot parse releases feed: ${q.stack || q.message},
XML:
${S}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
      }
      if (P == null)
        throw (0, r.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      let M, C = "", A = "";
      const R = async (q) => {
        C = (0, u.getChannelFilename)(q), A = (0, u.newUrlFromBase)(this.getBaseDownloadPath(String(P), C), this.baseUrl);
        const U = this.createRequestOptions(A);
        try {
          return await this.executor.request(U, p);
        } catch (L) {
          throw L instanceof r.HttpError && L.statusCode === 404 ? (0, r.newError)(`Cannot find ${C} in the latest release artifacts (${A}): ${L.stack || L.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : L;
        }
      };
      try {
        let q = this.channel;
        this.updater.allowPrerelease && (!((v = d.prerelease(P)) === null || v === void 0) && v[0]) && (q = this.getCustomChannelName(String((E = d.prerelease(P)) === null || E === void 0 ? void 0 : E[0]))), M = await R(q);
      } catch (q) {
        if (this.updater.allowPrerelease)
          M = await R(this.getDefaultChannelName());
        else
          throw q;
      }
      const y = (0, c.parseUpdateInfo)(M, C, A);
      return y.releaseName == null && (y.releaseName = O.elementValueOrEmpty("title")), y.releaseNotes == null && (y.releaseNotes = o(this.updater.currentVersion, this.updater.fullChangelog, T, O)), {
        tag: P,
        ...y
      };
    }
    async getLatestTagName(s) {
      const t = this.options, m = t.host == null || t.host === "github.com" ? (0, u.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new h.URL(`${this.computeGithubBasePath(`/repos/${t.owner}/${t.repo}/releases`)}/latest`, this.baseApiUrl);
      try {
        const v = await this.httpRequest(m, { Accept: "application/json" }, s);
        return v == null ? null : JSON.parse(v).tag_name;
      } catch (v) {
        throw (0, r.newError)(`Unable to find latest version on GitHub (${m}), please ensure a production release exists: ${v.stack || v.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    resolveFiles(s) {
      return (0, c.resolveFiles)(s, this.baseUrl, (t) => this.getBaseDownloadPath(s.tag, t.replace(/ /g, "-")));
    }
    getBaseDownloadPath(s, t) {
      return `${this.basePath}/download/${s}/${t}`;
    }
  };
  ft.GitHubProvider = f;
  function n(a) {
    const s = a.elementValueOrEmpty("content");
    return s === "No content." ? "" : s;
  }
  function o(a, s, t, m) {
    if (!s)
      return n(m);
    const v = [];
    for (const E of t.getElements("entry")) {
      const p = /\/tag\/v?([^/]+)$/.exec(E.element("link").attribute("href"))[1];
      d.lt(a, p) && v.push({
        version: p,
        note: n(E)
      });
    }
    return v.sort((E, p) => d.rcompare(E.version, p.version));
  }
  return ft;
}
var Zt = {}, Qs;
function Cf() {
  if (Qs) return Zt;
  Qs = 1, Object.defineProperty(Zt, "__esModule", { value: !0 }), Zt.KeygenProvider = void 0;
  const r = ke(), d = Pt(), h = Ke();
  let u = class extends h.Provider {
    constructor(l, i, f) {
      super({
        ...f,
        isUseMultipleRangeRequest: !1
      }), this.configuration = l, this.updater = i, this.defaultHostname = "api.keygen.sh";
      const n = this.configuration.host || this.defaultHostname;
      this.baseUrl = (0, d.newBaseUrl)(`https://${n}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "stable";
    }
    async getLatestVersion() {
      const l = new r.CancellationToken(), i = (0, d.getChannelFilename)(this.getCustomChannelName(this.channel)), f = (0, d.newUrlFromBase)(i, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const n = await this.httpRequest(f, {
          Accept: "application/vnd.api+json",
          "Keygen-Version": "1.1"
        }, l);
        return (0, h.parseUpdateInfo)(n, i, f);
      } catch (n) {
        throw (0, r.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${n.stack || n.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(l) {
      return (0, h.resolveFiles)(l, this.baseUrl);
    }
    toString() {
      const { account: l, product: i, platform: f } = this.configuration;
      return `Keygen (account: ${l}, product: ${i}, platform: ${f}, channel: ${this.channel})`;
    }
  };
  return Zt.KeygenProvider = u, Zt;
}
var er = {}, Zs;
function bf() {
  if (Zs) return er;
  Zs = 1, Object.defineProperty(er, "__esModule", { value: !0 }), er.PrivateGitHubProvider = void 0;
  const r = ke(), d = na(), h = Ie, u = $t, c = Pt(), l = ru(), i = Ke();
  let f = class extends l.BaseGitHubProvider {
    constructor(o, a, s, t) {
      super(o, "api.github.com", t), this.updater = a, this.token = s;
    }
    createRequestOptions(o, a) {
      const s = super.createRequestOptions(o, a);
      return s.redirect = "manual", s;
    }
    async getLatestVersion() {
      const o = new r.CancellationToken(), a = (0, c.getChannelFilename)(this.getDefaultChannelName()), s = await this.getLatestVersionInfo(o), t = s.assets.find((E) => E.name === a);
      if (t == null)
        throw (0, r.newError)(`Cannot find ${a} in the release ${s.html_url || s.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      const m = new u.URL(t.url);
      let v;
      try {
        v = (0, d.load)(await this.httpRequest(m, this.configureHeaders("application/octet-stream"), o));
      } catch (E) {
        throw E instanceof r.HttpError && E.statusCode === 404 ? (0, r.newError)(`Cannot find ${a} in the latest release artifacts (${m}): ${E.stack || E.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : E;
      }
      return v.assets = s.assets, v;
    }
    get fileExtraDownloadHeaders() {
      return this.configureHeaders("application/octet-stream");
    }
    configureHeaders(o) {
      return {
        accept: o,
        authorization: `token ${this.token}`
      };
    }
    async getLatestVersionInfo(o) {
      const a = this.updater.allowPrerelease;
      let s = this.basePath;
      a || (s = `${s}/latest`);
      const t = (0, c.newUrlFromBase)(s, this.baseUrl);
      try {
        const m = JSON.parse(await this.httpRequest(t, this.configureHeaders("application/vnd.github.v3+json"), o));
        return a ? m.find((v) => v.prerelease) || m[0] : m;
      } catch (m) {
        throw (0, r.newError)(`Unable to find latest version on GitHub (${t}), please ensure a production release exists: ${m.stack || m.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
    }
    resolveFiles(o) {
      return (0, i.getFileList)(o).map((a) => {
        const s = h.posix.basename(a.url).replace(/ /g, "-"), t = o.assets.find((m) => m != null && m.name === s);
        if (t == null)
          throw (0, r.newError)(`Cannot find asset "${s}" in: ${JSON.stringify(o.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new u.URL(t.url),
          info: a
        };
      });
    }
  };
  return er.PrivateGitHubProvider = f, er;
}
var el;
function Of() {
  if (el) return Jt;
  el = 1, Object.defineProperty(Jt, "__esModule", { value: !0 }), Jt.isUrlProbablySupportMultiRangeRequests = i, Jt.createClient = f;
  const r = ke(), d = Tf(), h = tu(), u = ru(), c = Cf(), l = bf();
  function i(n) {
    return !n.includes("s3.amazonaws.com");
  }
  function f(n, o, a) {
    if (typeof n == "string")
      throw (0, r.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
    const s = n.provider;
    switch (s) {
      case "github": {
        const t = n, m = (t.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || t.token;
        return m == null ? new u.GitHubProvider(t, o, a) : new l.PrivateGitHubProvider(t, o, m, a);
      }
      case "bitbucket":
        return new d.BitbucketProvider(n, o, a);
      case "keygen":
        return new c.KeygenProvider(n, o, a);
      case "s3":
      case "spaces":
        return new h.GenericProvider({
          provider: "generic",
          url: (0, r.getS3LikeProviderBaseUrl)(n),
          channel: n.channel || null
        }, o, {
          ...a,
          // https://github.com/minio/minio/issues/5285#issuecomment-350428955
          isUseMultipleRangeRequest: !1
        });
      case "generic": {
        const t = n;
        return new h.GenericProvider(t, o, {
          ...a,
          isUseMultipleRangeRequest: t.useMultipleRangeRequest !== !1 && i(t.url)
        });
      }
      case "custom": {
        const t = n, m = t.updateProvider;
        if (!m)
          throw (0, r.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
        return new m(t, o, a);
      }
      default:
        throw (0, r.newError)(`Unsupported provider: ${s}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
    }
  }
  return Jt;
}
var tr = {}, rr = {}, Lt = {}, Ut = {}, tl;
function ca() {
  if (tl) return Ut;
  tl = 1, Object.defineProperty(Ut, "__esModule", { value: !0 }), Ut.OperationKind = void 0, Ut.computeOperations = d;
  var r;
  (function(i) {
    i[i.COPY = 0] = "COPY", i[i.DOWNLOAD = 1] = "DOWNLOAD";
  })(r || (Ut.OperationKind = r = {}));
  function d(i, f, n) {
    const o = l(i.files), a = l(f.files);
    let s = null;
    const t = f.files[0], m = [], v = t.name, E = o.get(v);
    if (E == null)
      throw new Error(`no file ${v} in old blockmap`);
    const p = a.get(v);
    let S = 0;
    const { checksumToOffset: T, checksumToOldSize: O } = c(o.get(v), E.offset, n);
    let P = t.offset;
    for (let M = 0; M < p.checksums.length; P += p.sizes[M], M++) {
      const C = p.sizes[M], A = p.checksums[M];
      let R = T.get(A);
      R != null && O.get(A) !== C && (n.warn(`Checksum ("${A}") matches, but size differs (old: ${O.get(A)}, new: ${C})`), R = void 0), R === void 0 ? (S++, s != null && s.kind === r.DOWNLOAD && s.end === P ? s.end += C : (s = {
        kind: r.DOWNLOAD,
        start: P,
        end: P + C
        // oldBlocks: null,
      }, u(s, m, A, M))) : s != null && s.kind === r.COPY && s.end === R ? s.end += C : (s = {
        kind: r.COPY,
        start: R,
        end: R + C
        // oldBlocks: [checksum]
      }, u(s, m, A, M));
    }
    return S > 0 && n.info(`File${t.name === "file" ? "" : " " + t.name} has ${S} changed blocks`), m;
  }
  const h = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
  function u(i, f, n, o) {
    if (h && f.length !== 0) {
      const a = f[f.length - 1];
      if (a.kind === i.kind && i.start < a.end && i.start > a.start) {
        const s = [a.start, a.end, i.start, i.end].reduce((t, m) => t < m ? t : m);
        throw new Error(`operation (block index: ${o}, checksum: ${n}, kind: ${r[i.kind]}) overlaps previous operation (checksum: ${n}):
abs: ${a.start} until ${a.end} and ${i.start} until ${i.end}
rel: ${a.start - s} until ${a.end - s} and ${i.start - s} until ${i.end - s}`);
      }
    }
    f.push(i);
  }
  function c(i, f, n) {
    const o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
    let s = f;
    for (let t = 0; t < i.checksums.length; t++) {
      const m = i.checksums[t], v = i.sizes[t], E = a.get(m);
      if (E === void 0)
        o.set(m, s), a.set(m, v);
      else if (n.debug != null) {
        const p = E === v ? "(same size)" : `(size: ${E}, this size: ${v})`;
        n.debug(`${m} duplicated in blockmap ${p}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
      }
      s += v;
    }
    return { checksumToOffset: o, checksumToOldSize: a };
  }
  function l(i) {
    const f = /* @__PURE__ */ new Map();
    for (const n of i)
      f.set(n.name, n);
    return f;
  }
  return Ut;
}
var rl;
function nu() {
  if (rl) return Lt;
  rl = 1, Object.defineProperty(Lt, "__esModule", { value: !0 }), Lt.DataSplitter = void 0, Lt.copyData = i;
  const r = ke(), d = pt, h = hr, u = ca(), c = Buffer.from(`\r
\r
`);
  var l;
  (function(n) {
    n[n.INIT = 0] = "INIT", n[n.HEADER = 1] = "HEADER", n[n.BODY = 2] = "BODY";
  })(l || (l = {}));
  function i(n, o, a, s, t) {
    const m = (0, d.createReadStream)("", {
      fd: a,
      autoClose: !1,
      start: n.start,
      // end is inclusive
      end: n.end - 1
    });
    m.on("error", s), m.once("end", t), m.pipe(o, {
      end: !1
    });
  }
  let f = class extends h.Writable {
    constructor(o, a, s, t, m, v) {
      super(), this.out = o, this.options = a, this.partIndexToTaskIndex = s, this.partIndexToLength = m, this.finishHandler = v, this.partIndex = -1, this.headerListBuffer = null, this.readState = l.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = t.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
    }
    get isFinished() {
      return this.partIndex === this.partIndexToLength.length;
    }
    // noinspection JSUnusedGlobalSymbols
    _write(o, a, s) {
      if (this.isFinished) {
        console.error(`Trailing ignored data: ${o.length} bytes`);
        return;
      }
      this.handleData(o).then(s).catch(s);
    }
    async handleData(o) {
      let a = 0;
      if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
        throw (0, r.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
      if (this.ignoreByteCount > 0) {
        const s = Math.min(this.ignoreByteCount, o.length);
        this.ignoreByteCount -= s, a = s;
      } else if (this.remainingPartDataCount > 0) {
        const s = Math.min(this.remainingPartDataCount, o.length);
        this.remainingPartDataCount -= s, await this.processPartData(o, 0, s), a = s;
      }
      if (a !== o.length) {
        if (this.readState === l.HEADER) {
          const s = this.searchHeaderListEnd(o, a);
          if (s === -1)
            return;
          a = s, this.readState = l.BODY, this.headerListBuffer = null;
        }
        for (; ; ) {
          if (this.readState === l.BODY)
            this.readState = l.INIT;
          else {
            this.partIndex++;
            let v = this.partIndexToTaskIndex.get(this.partIndex);
            if (v == null)
              if (this.isFinished)
                v = this.options.end;
              else
                throw (0, r.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
            const E = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
            if (E < v)
              await this.copyExistingData(E, v);
            else if (E > v)
              throw (0, r.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
            if (this.isFinished) {
              this.onPartEnd(), this.finishHandler();
              return;
            }
            if (a = this.searchHeaderListEnd(o, a), a === -1) {
              this.readState = l.HEADER;
              return;
            }
          }
          const s = this.partIndexToLength[this.partIndex], t = a + s, m = Math.min(t, o.length);
          if (await this.processPartStarted(o, a, m), this.remainingPartDataCount = s - (m - a), this.remainingPartDataCount > 0)
            return;
          if (a = t + this.boundaryLength, a >= o.length) {
            this.ignoreByteCount = this.boundaryLength - (o.length - t);
            return;
          }
        }
      }
    }
    copyExistingData(o, a) {
      return new Promise((s, t) => {
        const m = () => {
          if (o === a) {
            s();
            return;
          }
          const v = this.options.tasks[o];
          if (v.kind !== u.OperationKind.COPY) {
            t(new Error("Task kind must be COPY"));
            return;
          }
          i(v, this.out, this.options.oldFileFd, t, () => {
            o++, m();
          });
        };
        m();
      });
    }
    searchHeaderListEnd(o, a) {
      const s = o.indexOf(c, a);
      if (s !== -1)
        return s + c.length;
      const t = a === 0 ? o : o.slice(a);
      return this.headerListBuffer == null ? this.headerListBuffer = t : this.headerListBuffer = Buffer.concat([this.headerListBuffer, t]), -1;
    }
    onPartEnd() {
      const o = this.partIndexToLength[this.partIndex - 1];
      if (this.actualPartLength !== o)
        throw (0, r.newError)(`Expected length: ${o} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
      this.actualPartLength = 0;
    }
    processPartStarted(o, a, s) {
      return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(o, a, s);
    }
    processPartData(o, a, s) {
      this.actualPartLength += s - a;
      const t = this.out;
      return t.write(a === 0 && o.length === s ? o : o.slice(a, s)) ? Promise.resolve() : new Promise((m, v) => {
        t.on("error", v), t.once("drain", () => {
          t.removeListener("error", v), m();
        });
      });
    }
  };
  return Lt.DataSplitter = f, Lt;
}
var nr = {}, nl;
function Pf() {
  if (nl) return nr;
  nl = 1, Object.defineProperty(nr, "__esModule", { value: !0 }), nr.executeTasksUsingMultipleRangeRequests = u, nr.checkIsRangesSupported = l;
  const r = ke(), d = nu(), h = ca();
  function u(i, f, n, o, a) {
    const s = (t) => {
      if (t >= f.length) {
        i.fileMetadataBuffer != null && n.write(i.fileMetadataBuffer), n.end();
        return;
      }
      const m = t + 1e3;
      c(i, {
        tasks: f,
        start: t,
        end: Math.min(f.length, m),
        oldFileFd: o
      }, n, () => s(m), a);
    };
    return s;
  }
  function c(i, f, n, o, a) {
    let s = "bytes=", t = 0;
    const m = /* @__PURE__ */ new Map(), v = [];
    for (let S = f.start; S < f.end; S++) {
      const T = f.tasks[S];
      T.kind === h.OperationKind.DOWNLOAD && (s += `${T.start}-${T.end - 1}, `, m.set(t, S), t++, v.push(T.end - T.start));
    }
    if (t <= 1) {
      const S = (T) => {
        if (T >= f.end) {
          o();
          return;
        }
        const O = f.tasks[T++];
        if (O.kind === h.OperationKind.COPY)
          (0, d.copyData)(O, n, f.oldFileFd, a, () => S(T));
        else {
          const P = i.createRequestOptions();
          P.headers.Range = `bytes=${O.start}-${O.end - 1}`;
          const M = i.httpExecutor.createRequest(P, (C) => {
            l(C, a) && (C.pipe(n, {
              end: !1
            }), C.once("end", () => S(T)));
          });
          i.httpExecutor.addErrorAndTimeoutHandlers(M, a), M.end();
        }
      };
      S(f.start);
      return;
    }
    const E = i.createRequestOptions();
    E.headers.Range = s.substring(0, s.length - 2);
    const p = i.httpExecutor.createRequest(E, (S) => {
      if (!l(S, a))
        return;
      const T = (0, r.safeGetHeader)(S, "content-type"), O = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i.exec(T);
      if (O == null) {
        a(new Error(`Content-Type "multipart/byteranges" is expected, but got "${T}"`));
        return;
      }
      const P = new d.DataSplitter(n, f, m, O[1] || O[2], v, o);
      P.on("error", a), S.pipe(P), S.on("end", () => {
        setTimeout(() => {
          p.abort(), a(new Error("Response ends without calling any handlers"));
        }, 1e4);
      });
    });
    i.httpExecutor.addErrorAndTimeoutHandlers(p, a), p.end();
  }
  function l(i, f) {
    if (i.statusCode >= 400)
      return f((0, r.createHttpError)(i)), !1;
    if (i.statusCode !== 206) {
      const n = (0, r.safeGetHeader)(i, "accept-ranges");
      if (n == null || n === "none")
        return f(new Error(`Server doesn't support Accept-Ranges (response code ${i.statusCode})`)), !1;
    }
    return !0;
  }
  return nr;
}
var ir = {}, il;
function If() {
  if (il) return ir;
  il = 1, Object.defineProperty(ir, "__esModule", { value: !0 }), ir.ProgressDifferentialDownloadCallbackTransform = void 0;
  const r = hr;
  var d;
  (function(u) {
    u[u.COPY = 0] = "COPY", u[u.DOWNLOAD = 1] = "DOWNLOAD";
  })(d || (d = {}));
  let h = class extends r.Transform {
    constructor(c, l, i) {
      super(), this.progressDifferentialDownloadInfo = c, this.cancellationToken = l, this.onProgress = i, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = d.COPY, this.nextUpdate = this.start + 1e3;
    }
    _transform(c, l, i) {
      if (this.cancellationToken.cancelled) {
        i(new Error("cancelled"), null);
        return;
      }
      if (this.operationType == d.COPY) {
        i(null, c);
        return;
      }
      this.transferred += c.length, this.delta += c.length;
      const f = Date.now();
      f >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = f + 1e3, this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((f - this.start) / 1e3))
      }), this.delta = 0), i(null, c);
    }
    beginFileCopy() {
      this.operationType = d.COPY;
    }
    beginRangeDownload() {
      this.operationType = d.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
    }
    endRangeDownload() {
      this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      });
    }
    // Called when we are 100% done with the connection/download
    _flush(c) {
      if (this.cancellationToken.cancelled) {
        c(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, this.transferred = 0, c(null);
    }
  };
  return ir.ProgressDifferentialDownloadCallbackTransform = h, ir;
}
var al;
function iu() {
  if (al) return rr;
  al = 1, Object.defineProperty(rr, "__esModule", { value: !0 }), rr.DifferentialDownloader = void 0;
  const r = ke(), d = /* @__PURE__ */ mt(), h = pt, u = nu(), c = $t, l = ca(), i = Pf(), f = If();
  let n = class {
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(t, m, v) {
      this.blockAwareFileInfo = t, this.httpExecutor = m, this.options = v, this.fileMetadataBuffer = null, this.logger = v.logger;
    }
    createRequestOptions() {
      const t = {
        headers: {
          ...this.options.requestHeaders,
          accept: "*/*"
        }
      };
      return (0, r.configureRequestUrl)(this.options.newUrl, t), (0, r.configureRequestOptions)(t), t;
    }
    doDownload(t, m) {
      if (t.version !== m.version)
        throw new Error(`version is different (${t.version} - ${m.version}), full download is required`);
      const v = this.logger, E = (0, l.computeOperations)(t, m, v);
      v.debug != null && v.debug(JSON.stringify(E, null, 2));
      let p = 0, S = 0;
      for (const O of E) {
        const P = O.end - O.start;
        O.kind === l.OperationKind.DOWNLOAD ? p += P : S += P;
      }
      const T = this.blockAwareFileInfo.size;
      if (p + S + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== T)
        throw new Error(`Internal error, size mismatch: downloadSize: ${p}, copySize: ${S}, newSize: ${T}`);
      return v.info(`Full: ${o(T)}, To download: ${o(p)} (${Math.round(p / (T / 100))}%)`), this.downloadFile(E);
    }
    downloadFile(t) {
      const m = [], v = () => Promise.all(m.map((E) => (0, d.close)(E.descriptor).catch((p) => {
        this.logger.error(`cannot close file "${E.path}": ${p}`);
      })));
      return this.doDownloadFile(t, m).then(v).catch((E) => v().catch((p) => {
        try {
          this.logger.error(`cannot close files: ${p}`);
        } catch (S) {
          try {
            console.error(S);
          } catch {
          }
        }
        throw E;
      }).then(() => {
        throw E;
      }));
    }
    async doDownloadFile(t, m) {
      const v = await (0, d.open)(this.options.oldFile, "r");
      m.push({ descriptor: v, path: this.options.oldFile });
      const E = await (0, d.open)(this.options.newFile, "w");
      m.push({ descriptor: E, path: this.options.newFile });
      const p = (0, h.createWriteStream)(this.options.newFile, { fd: E });
      await new Promise((S, T) => {
        const O = [];
        let P;
        if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
          const L = [];
          let k = 0;
          for (const I of t)
            I.kind === l.OperationKind.DOWNLOAD && (L.push(I.end - I.start), k += I.end - I.start);
          const N = {
            expectedByteCounts: L,
            grandTotal: k
          };
          P = new f.ProgressDifferentialDownloadCallbackTransform(N, this.options.cancellationToken, this.options.onProgress), O.push(P);
        }
        const M = new r.DigestTransform(this.blockAwareFileInfo.sha512);
        M.isValidateOnEnd = !1, O.push(M), p.on("finish", () => {
          p.close(() => {
            m.splice(1, 1);
            try {
              M.validate();
            } catch (L) {
              T(L);
              return;
            }
            S(void 0);
          });
        }), O.push(p);
        let C = null;
        for (const L of O)
          L.on("error", T), C == null ? C = L : C = C.pipe(L);
        const A = O[0];
        let R;
        if (this.options.isUseMultipleRangeRequest) {
          R = (0, i.executeTasksUsingMultipleRangeRequests)(this, t, A, v, T), R(0);
          return;
        }
        let y = 0, q = null;
        this.logger.info(`Differential download: ${this.options.newUrl}`);
        const U = this.createRequestOptions();
        U.redirect = "manual", R = (L) => {
          var k, N;
          if (L >= t.length) {
            this.fileMetadataBuffer != null && A.write(this.fileMetadataBuffer), A.end();
            return;
          }
          const I = t[L++];
          if (I.kind === l.OperationKind.COPY) {
            P && P.beginFileCopy(), (0, u.copyData)(I, A, v, T, () => R(L));
            return;
          }
          const F = `bytes=${I.start}-${I.end - 1}`;
          U.headers.range = F, (N = (k = this.logger) === null || k === void 0 ? void 0 : k.debug) === null || N === void 0 || N.call(k, `download range: ${F}`), P && P.beginRangeDownload();
          const $ = this.httpExecutor.createRequest(U, (J) => {
            J.on("error", T), J.on("aborted", () => {
              T(new Error("response has been aborted by the server"));
            }), J.statusCode >= 400 && T((0, r.createHttpError)(J)), J.pipe(A, {
              end: !1
            }), J.once("end", () => {
              P && P.endRangeDownload(), ++y === 100 ? (y = 0, setTimeout(() => R(L), 1e3)) : R(L);
            });
          });
          $.on("redirect", (J, W, ne) => {
            this.logger.info(`Redirect to ${a(ne)}`), q = ne, (0, r.configureRequestUrl)(new c.URL(q), U), $.followRedirect();
          }), this.httpExecutor.addErrorAndTimeoutHandlers($, T), $.end();
        }, R(0);
      });
    }
    async readRemoteBytes(t, m) {
      const v = Buffer.allocUnsafe(m + 1 - t), E = this.createRequestOptions();
      E.headers.range = `bytes=${t}-${m}`;
      let p = 0;
      if (await this.request(E, (S) => {
        S.copy(v, p), p += S.length;
      }), p !== v.length)
        throw new Error(`Received data length ${p} is not equal to expected ${v.length}`);
      return v;
    }
    request(t, m) {
      return new Promise((v, E) => {
        const p = this.httpExecutor.createRequest(t, (S) => {
          (0, i.checkIsRangesSupported)(S, E) && (S.on("error", E), S.on("aborted", () => {
            E(new Error("response has been aborted by the server"));
          }), S.on("data", m), S.on("end", () => v()));
        });
        this.httpExecutor.addErrorAndTimeoutHandlers(p, E), p.end();
      });
    }
  };
  rr.DifferentialDownloader = n;
  function o(s, t = " KB") {
    return new Intl.NumberFormat("en").format((s / 1024).toFixed(2)) + t;
  }
  function a(s) {
    const t = s.indexOf("?");
    return t < 0 ? s : s.substring(0, t);
  }
  return rr;
}
var ol;
function Df() {
  if (ol) return tr;
  ol = 1, Object.defineProperty(tr, "__esModule", { value: !0 }), tr.GenericDifferentialDownloader = void 0;
  const r = iu();
  let d = class extends r.DifferentialDownloader {
    download(u, c) {
      return this.doDownload(u, c);
    }
  };
  return tr.GenericDifferentialDownloader = d, tr;
}
var Xi = {}, sl;
function It() {
  return sl || (sl = 1, function(r) {
    Object.defineProperty(r, "__esModule", { value: !0 }), r.UpdaterSignal = r.UPDATE_DOWNLOADED = r.DOWNLOAD_PROGRESS = r.CancellationToken = void 0, r.addHandler = u;
    const d = ke();
    Object.defineProperty(r, "CancellationToken", { enumerable: !0, get: function() {
      return d.CancellationToken;
    } }), r.DOWNLOAD_PROGRESS = "download-progress", r.UPDATE_DOWNLOADED = "update-downloaded";
    class h {
      constructor(l) {
        this.emitter = l;
      }
      /**
       * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
       */
      login(l) {
        u(this.emitter, "login", l);
      }
      progress(l) {
        u(this.emitter, r.DOWNLOAD_PROGRESS, l);
      }
      updateDownloaded(l) {
        u(this.emitter, r.UPDATE_DOWNLOADED, l);
      }
      updateCancelled(l) {
        u(this.emitter, "update-cancelled", l);
      }
    }
    r.UpdaterSignal = h;
    function u(c, l, i) {
      c.on(l, i);
    }
  }(Xi)), Xi;
}
var ll;
function fa() {
  if (ll) return At;
  ll = 1, Object.defineProperty(At, "__esModule", { value: !0 }), At.NoOpLogger = At.AppUpdater = void 0;
  const r = ke(), d = pr, h = qr, u = bl, c = /* @__PURE__ */ mt(), l = na(), i = Yc(), f = Ie, n = eu(), o = wf(), a = Sf(), s = Af(), t = tu(), m = Of(), v = Pl, E = Pt(), p = Df(), S = It();
  let T = class au extends u.EventEmitter {
    /**
     * Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
     */
    get channel() {
      return this._channel;
    }
    /**
     * Set the update channel. Overrides `channel` in the update configuration.
     *
     * `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
     */
    set channel(C) {
      if (this._channel != null) {
        if (typeof C != "string")
          throw (0, r.newError)(`Channel must be a string, but got: ${C}`, "ERR_UPDATER_INVALID_CHANNEL");
        if (C.length === 0)
          throw (0, r.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
      }
      this._channel = C, this.allowDowngrade = !0;
    }
    /**
     *  Shortcut for explicitly adding auth tokens to request headers
     */
    addAuthHeader(C) {
      this.requestHeaders = Object.assign({}, this.requestHeaders, {
        authorization: C
      });
    }
    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    get netSession() {
      return (0, s.getNetSession)();
    }
    /**
     * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
     * Set it to `null` if you would like to disable a logging feature.
     */
    get logger() {
      return this._logger;
    }
    set logger(C) {
      this._logger = C ?? new P();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * test only
     * @private
     */
    set updateConfigPath(C) {
      this.clientPromise = null, this._appUpdateConfigPath = C, this.configOnDisk = new i.Lazy(() => this.loadUpdateConfig());
    }
    /**
     * Allows developer to override default logic for determining if an update is supported.
     * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
     */
    get isUpdateSupported() {
      return this._isUpdateSupported;
    }
    set isUpdateSupported(C) {
      C && (this._isUpdateSupported = C);
    }
    constructor(C, A) {
      super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new S.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (q) => this.checkIfUpdateSupported(q), this.clientPromise = null, this.stagingUserIdPromise = new i.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new i.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (q) => {
        this._logger.error(`Error: ${q.stack || q.message}`);
      }), A == null ? (this.app = new a.ElectronAppAdapter(), this.httpExecutor = new s.ElectronHttpExecutor((q, U) => this.emit("login", q, U))) : (this.app = A, this.httpExecutor = null);
      const R = this.app.version, y = (0, n.parse)(R);
      if (y == null)
        throw (0, r.newError)(`App version is not a valid semver version: "${R}"`, "ERR_UPDATER_INVALID_VERSION");
      this.currentVersion = y, this.allowPrerelease = O(y), C != null && (this.setFeedURL(C), typeof C != "string" && C.requestHeaders && (this.requestHeaders = C.requestHeaders));
    }
    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getFeedURL() {
      return "Deprecated. Do not use it.";
    }
    /**
     * Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(C) {
      const A = this.createProviderRuntimeOptions();
      let R;
      typeof C == "string" ? R = new t.GenericProvider({ provider: "generic", url: C }, this, {
        ...A,
        isUseMultipleRangeRequest: (0, m.isUrlProbablySupportMultiRangeRequests)(C)
      }) : R = (0, m.createClient)(C, this, A), this.clientPromise = Promise.resolve(R);
    }
    /**
     * Asks the server whether there is an update.
     * @returns null if the updater is disabled, otherwise info about the latest version
     */
    checkForUpdates() {
      if (!this.isUpdaterActive())
        return Promise.resolve(null);
      let C = this.checkForUpdatesPromise;
      if (C != null)
        return this._logger.info("Checking for update (already in progress)"), C;
      const A = () => this.checkForUpdatesPromise = null;
      return this._logger.info("Checking for update"), C = this.doCheckForUpdates().then((R) => (A(), R)).catch((R) => {
        throw A(), this.emit("error", R, `Cannot check for updates: ${(R.stack || R).toString()}`), R;
      }), this.checkForUpdatesPromise = C, C;
    }
    isUpdaterActive() {
      return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
    }
    // noinspection JSUnusedGlobalSymbols
    checkForUpdatesAndNotify(C) {
      return this.checkForUpdates().then((A) => A != null && A.downloadPromise ? (A.downloadPromise.then(() => {
        const R = au.formatDownloadNotification(A.updateInfo.version, this.app.name, C);
        new bt.Notification(R).show();
      }), A) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), A));
    }
    static formatDownloadNotification(C, A, R) {
      return R == null && (R = {
        title: "A new update is ready to install",
        body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
      }), R = {
        title: R.title.replace("{appName}", A).replace("{version}", C),
        body: R.body.replace("{appName}", A).replace("{version}", C)
      }, R;
    }
    async isStagingMatch(C) {
      const A = C.stagingPercentage;
      let R = A;
      if (R == null)
        return !0;
      if (R = parseInt(R, 10), isNaN(R))
        return this._logger.warn(`Staging percentage is NaN: ${A}`), !0;
      R = R / 100;
      const y = await this.stagingUserIdPromise.value, U = r.UUID.parse(y).readUInt32BE(12) / 4294967295;
      return this._logger.info(`Staging percentage: ${R}, percentage: ${U}, user id: ${y}`), U < R;
    }
    computeFinalHeaders(C) {
      return this.requestHeaders != null && Object.assign(C, this.requestHeaders), C;
    }
    async isUpdateAvailable(C) {
      const A = (0, n.parse)(C.version);
      if (A == null)
        throw (0, r.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${C.version}"`, "ERR_UPDATER_INVALID_VERSION");
      const R = this.currentVersion;
      if ((0, n.eq)(A, R) || !await Promise.resolve(this.isUpdateSupported(C)) || !await this.isStagingMatch(C))
        return !1;
      const q = (0, n.gt)(A, R), U = (0, n.lt)(A, R);
      return q ? !0 : this.allowDowngrade && U;
    }
    checkIfUpdateSupported(C) {
      const A = C == null ? void 0 : C.minimumSystemVersion, R = (0, h.release)();
      if (A)
        try {
          if ((0, n.lt)(R, A))
            return this._logger.info(`Current OS version ${R} is less than the minimum OS version required ${A} for version ${R}`), !1;
        } catch (y) {
          this._logger.warn(`Failed to compare current OS version(${R}) with minimum OS version(${A}): ${(y.message || y).toString()}`);
        }
      return !0;
    }
    async getUpdateInfoAndProvider() {
      await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((R) => (0, m.createClient)(R, this, this.createProviderRuntimeOptions())));
      const C = await this.clientPromise, A = await this.stagingUserIdPromise.value;
      return C.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": A })), {
        info: await C.getLatestVersion(),
        provider: C
      };
    }
    createProviderRuntimeOptions() {
      return {
        isUseMultipleRangeRequest: !0,
        platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
        executor: this.httpExecutor
      };
    }
    async doCheckForUpdates() {
      this.emit("checking-for-update");
      const C = await this.getUpdateInfoAndProvider(), A = C.info;
      if (!await this.isUpdateAvailable(A))
        return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${A.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", A), {
          isUpdateAvailable: !1,
          versionInfo: A,
          updateInfo: A
        };
      this.updateInfoAndProvider = C, this.onUpdateAvailable(A);
      const R = new r.CancellationToken();
      return {
        isUpdateAvailable: !0,
        versionInfo: A,
        updateInfo: A,
        cancellationToken: R,
        downloadPromise: this.autoDownload ? this.downloadUpdate(R) : null
      };
    }
    onUpdateAvailable(C) {
      this._logger.info(`Found version ${C.version} (url: ${(0, r.asArray)(C.files).map((A) => A.url).join(", ")})`), this.emit("update-available", C);
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<Array<string>>} Paths to downloaded files.
     */
    downloadUpdate(C = new r.CancellationToken()) {
      const A = this.updateInfoAndProvider;
      if (A == null) {
        const y = new Error("Please check update first");
        return this.dispatchError(y), Promise.reject(y);
      }
      if (this.downloadPromise != null)
        return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
      this._logger.info(`Downloading update from ${(0, r.asArray)(A.info.files).map((y) => y.url).join(", ")}`);
      const R = (y) => {
        if (!(y instanceof r.CancellationError))
          try {
            this.dispatchError(y);
          } catch (q) {
            this._logger.warn(`Cannot dispatch error event: ${q.stack || q}`);
          }
        return y;
      };
      return this.downloadPromise = this.doDownloadUpdate({
        updateInfoAndProvider: A,
        requestHeaders: this.computeRequestHeaders(A.provider),
        cancellationToken: C,
        disableWebInstaller: this.disableWebInstaller,
        disableDifferentialDownload: this.disableDifferentialDownload
      }).catch((y) => {
        throw R(y);
      }).finally(() => {
        this.downloadPromise = null;
      }), this.downloadPromise;
    }
    dispatchError(C) {
      this.emit("error", C, (C.stack || C).toString());
    }
    dispatchUpdateDownloaded(C) {
      this.emit(S.UPDATE_DOWNLOADED, C);
    }
    async loadUpdateConfig() {
      return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, l.load)(await (0, c.readFile)(this._appUpdateConfigPath, "utf-8"));
    }
    computeRequestHeaders(C) {
      const A = C.fileExtraDownloadHeaders;
      if (A != null) {
        const R = this.requestHeaders;
        return R == null ? A : {
          ...A,
          ...R
        };
      }
      return this.computeFinalHeaders({ accept: "*/*" });
    }
    async getOrCreateStagingUserId() {
      const C = f.join(this.app.userDataPath, ".updaterId");
      try {
        const R = await (0, c.readFile)(C, "utf-8");
        if (r.UUID.check(R))
          return R;
        this._logger.warn(`Staging user id file exists, but content was invalid: ${R}`);
      } catch (R) {
        R.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${R}`);
      }
      const A = r.UUID.v5((0, d.randomBytes)(4096), r.UUID.OID);
      this._logger.info(`Generated new staging user ID: ${A}`);
      try {
        await (0, c.outputFile)(C, A);
      } catch (R) {
        this._logger.warn(`Couldn't write out staging user ID: ${R}`);
      }
      return A;
    }
    /** @internal */
    get isAddNoCacheQuery() {
      const C = this.requestHeaders;
      if (C == null)
        return !0;
      for (const A of Object.keys(C)) {
        const R = A.toLowerCase();
        if (R === "authorization" || R === "private-token")
          return !1;
      }
      return !0;
    }
    async getOrCreateDownloadHelper() {
      let C = this.downloadedUpdateHelper;
      if (C == null) {
        const A = (await this.configOnDisk.value).updaterCacheDirName, R = this._logger;
        A == null && R.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
        const y = f.join(this.app.baseCachePath, A || this.app.name);
        R.debug != null && R.debug(`updater cache dir: ${y}`), C = new o.DownloadedUpdateHelper(y), this.downloadedUpdateHelper = C;
      }
      return C;
    }
    async executeDownload(C) {
      const A = C.fileInfo, R = {
        headers: C.downloadUpdateOptions.requestHeaders,
        cancellationToken: C.downloadUpdateOptions.cancellationToken,
        sha2: A.info.sha2,
        sha512: A.info.sha512
      };
      this.listenerCount(S.DOWNLOAD_PROGRESS) > 0 && (R.onProgress = (ie) => this.emit(S.DOWNLOAD_PROGRESS, ie));
      const y = C.downloadUpdateOptions.updateInfoAndProvider.info, q = y.version, U = A.packageInfo;
      function L() {
        const ie = decodeURIComponent(C.fileInfo.url.pathname);
        return ie.endsWith(`.${C.fileExtension}`) ? f.basename(ie) : C.fileInfo.info.url;
      }
      const k = await this.getOrCreateDownloadHelper(), N = k.cacheDirForPendingUpdate;
      await (0, c.mkdir)(N, { recursive: !0 });
      const I = L();
      let F = f.join(N, I);
      const $ = U == null ? null : f.join(N, `package-${q}${f.extname(U.path) || ".7z"}`), J = async (ie) => (await k.setDownloadedFile(F, $, y, A, I, ie), await C.done({
        ...y,
        downloadedFile: F
      }), $ == null ? [F] : [F, $]), W = this._logger, ne = await k.validateDownloadedPath(F, y, A, W);
      if (ne != null)
        return F = ne, await J(!1);
      const ce = async () => (await k.clear().catch(() => {
      }), await (0, c.unlink)(F).catch(() => {
      })), ue = await (0, o.createTempUpdateFile)(`temp-${I}`, N, W);
      try {
        await C.task(ue, R, $, ce), await (0, r.retry)(() => (0, c.rename)(ue, F), 60, 500, 0, 0, (ie) => ie instanceof Error && /^EBUSY:/.test(ie.message));
      } catch (ie) {
        throw await ce(), ie instanceof r.CancellationError && (W.info("cancelled"), this.emit("update-cancelled", y)), ie;
      }
      return W.info(`New version ${q} has been downloaded to ${F}`), await J(!0);
    }
    async differentialDownloadInstaller(C, A, R, y, q) {
      try {
        if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
          return !0;
        const U = (0, E.blockmapFiles)(C.url, this.app.version, A.updateInfoAndProvider.info.version);
        this._logger.info(`Download block maps (old: "${U[0]}", new: ${U[1]})`);
        const L = async (I) => {
          const F = await this.httpExecutor.downloadToBuffer(I, {
            headers: A.requestHeaders,
            cancellationToken: A.cancellationToken
          });
          if (F == null || F.length === 0)
            throw new Error(`Blockmap "${I.href}" is empty`);
          try {
            return JSON.parse((0, v.gunzipSync)(F).toString());
          } catch ($) {
            throw new Error(`Cannot parse blockmap "${I.href}", error: ${$}`);
          }
        }, k = {
          newUrl: C.url,
          oldFile: f.join(this.downloadedUpdateHelper.cacheDir, q),
          logger: this._logger,
          newFile: R,
          isUseMultipleRangeRequest: y.isUseMultipleRangeRequest,
          requestHeaders: A.requestHeaders,
          cancellationToken: A.cancellationToken
        };
        this.listenerCount(S.DOWNLOAD_PROGRESS) > 0 && (k.onProgress = (I) => this.emit(S.DOWNLOAD_PROGRESS, I));
        const N = await Promise.all(U.map((I) => L(I)));
        return await new p.GenericDifferentialDownloader(C.info, this.httpExecutor, k).download(N[0], N[1]), !1;
      } catch (U) {
        if (this._logger.error(`Cannot download differentially, fallback to full download: ${U.stack || U}`), this._testOnlyOptions != null)
          throw U;
        return !0;
      }
    }
  };
  At.AppUpdater = T;
  function O(M) {
    const C = (0, n.prerelease)(M);
    return C != null && C.length > 0;
  }
  class P {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info(C) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    warn(C) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error(C) {
    }
  }
  return At.NoOpLogger = P, At;
}
var ul;
function Bt() {
  if (ul) return Gt;
  ul = 1, Object.defineProperty(Gt, "__esModule", { value: !0 }), Gt.BaseUpdater = void 0;
  const r = kr, d = fa();
  let h = class extends d.AppUpdater {
    constructor(c, l) {
      super(c, l), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
    }
    quitAndInstall(c = !1, l = !1) {
      this._logger.info("Install on explicit quitAndInstall"), this.install(c, c ? l : this.autoRunAppAfterInstall) ? setImmediate(() => {
        bt.autoUpdater.emit("before-quit-for-update"), this.app.quit();
      }) : this.quitAndInstallCalled = !1;
    }
    executeDownload(c) {
      return super.executeDownload({
        ...c,
        done: (l) => (this.dispatchUpdateDownloaded(l), this.addQuitHandler(), Promise.resolve())
      });
    }
    get installerPath() {
      return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
    }
    // must be sync (because quit even handler is not async)
    install(c = !1, l = !1) {
      if (this.quitAndInstallCalled)
        return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
      const i = this.downloadedUpdateHelper, f = this.installerPath, n = i == null ? null : i.downloadedFileInfo;
      if (f == null || n == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      this.quitAndInstallCalled = !0;
      try {
        return this._logger.info(`Install: isSilent: ${c}, isForceRunAfter: ${l}`), this.doInstall({
          isSilent: c,
          isForceRunAfter: l,
          isAdminRightsRequired: n.isAdminRightsRequired
        });
      } catch (o) {
        return this.dispatchError(o), !1;
      }
    }
    addQuitHandler() {
      this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((c) => {
        if (this.quitAndInstallCalled) {
          this._logger.info("Update installer has already been triggered. Quitting application.");
          return;
        }
        if (!this.autoInstallOnAppQuit) {
          this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
          return;
        }
        if (c !== 0) {
          this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${c}`);
          return;
        }
        this._logger.info("Auto install update on quit"), this.install(!0, !1);
      }));
    }
    wrapSudo() {
      const { name: c } = this.app, l = `"${c} would like to update"`, i = this.spawnSyncLog("which gksudo || which kdesudo || which pkexec || which beesu"), f = [i];
      return /kdesudo/i.test(i) ? (f.push("--comment", l), f.push("-c")) : /gksudo/i.test(i) ? f.push("--message", l) : /pkexec/i.test(i) && f.push("--disable-internal-agent"), f.join(" ");
    }
    spawnSyncLog(c, l = [], i = {}) {
      this._logger.info(`Executing: ${c} with args: ${l}`);
      const f = (0, r.spawnSync)(c, l, {
        env: { ...process.env, ...i },
        encoding: "utf-8",
        shell: !0
      }), { error: n, status: o, stdout: a, stderr: s } = f;
      if (n != null)
        throw this._logger.error(s), n;
      if (o != null && o !== 0)
        throw this._logger.error(s), new Error(`Command ${c} exited with code ${o}`);
      return a.trim();
    }
    /**
     * This handles both node 8 and node 10 way of emitting error when spawning a process
     *   - node 8: Throws the error
     *   - node 10: Emit the error(Need to listen with on)
     */
    // https://github.com/electron-userland/electron-builder/issues/1129
    // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
    async spawnLog(c, l = [], i = void 0, f = "ignore") {
      return this._logger.info(`Executing: ${c} with args: ${l}`), new Promise((n, o) => {
        try {
          const a = { stdio: f, env: i, detached: !0 }, s = (0, r.spawn)(c, l, a);
          s.on("error", (t) => {
            o(t);
          }), s.unref(), s.pid !== void 0 && n(!0);
        } catch (a) {
          o(a);
        }
      });
    }
  };
  return Gt.BaseUpdater = h, Gt;
}
var ar = {}, or = {}, cl;
function ou() {
  if (cl) return or;
  cl = 1, Object.defineProperty(or, "__esModule", { value: !0 }), or.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
  const r = /* @__PURE__ */ mt(), d = iu(), h = Pl;
  let u = class extends d.DifferentialDownloader {
    async download() {
      const f = this.blockAwareFileInfo, n = f.size, o = n - (f.blockMapSize + 4);
      this.fileMetadataBuffer = await this.readRemoteBytes(o, n - 1);
      const a = c(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
      await this.doDownload(await l(this.options.oldFile), a);
    }
  };
  or.FileWithEmbeddedBlockMapDifferentialDownloader = u;
  function c(i) {
    return JSON.parse((0, h.inflateRawSync)(i).toString());
  }
  async function l(i) {
    const f = await (0, r.open)(i, "r");
    try {
      const n = (await (0, r.fstat)(f)).size, o = Buffer.allocUnsafe(4);
      await (0, r.read)(f, o, 0, o.length, n - o.length);
      const a = Buffer.allocUnsafe(o.readUInt32BE(0));
      return await (0, r.read)(f, a, 0, a.length, n - o.length - a.length), await (0, r.close)(f), c(a);
    } catch (n) {
      throw await (0, r.close)(f), n;
    }
  }
  return or;
}
var fl;
function dl() {
  if (fl) return ar;
  fl = 1, Object.defineProperty(ar, "__esModule", { value: !0 }), ar.AppImageUpdater = void 0;
  const r = ke(), d = kr, h = /* @__PURE__ */ mt(), u = pt, c = Ie, l = Bt(), i = ou(), f = Ke(), n = It();
  let o = class extends l.BaseUpdater {
    constructor(s, t) {
      super(s, t);
    }
    isUpdaterActive() {
      return process.env.APPIMAGE == null ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
    }
    /*** @private */
    doDownloadUpdate(s) {
      const t = s.updateInfoAndProvider.provider, m = (0, f.findFile)(t.resolveFiles(s.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "AppImage",
        fileInfo: m,
        downloadUpdateOptions: s,
        task: async (v, E) => {
          const p = process.env.APPIMAGE;
          if (p == null)
            throw (0, r.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
          (s.disableDifferentialDownload || await this.downloadDifferential(m, p, v, t, s)) && await this.httpExecutor.download(m.url, v, E), await (0, h.chmod)(v, 493);
        }
      });
    }
    async downloadDifferential(s, t, m, v, E) {
      try {
        const p = {
          newUrl: s.url,
          oldFile: t,
          logger: this._logger,
          newFile: m,
          isUseMultipleRangeRequest: v.isUseMultipleRangeRequest,
          requestHeaders: E.requestHeaders,
          cancellationToken: E.cancellationToken
        };
        return this.listenerCount(n.DOWNLOAD_PROGRESS) > 0 && (p.onProgress = (S) => this.emit(n.DOWNLOAD_PROGRESS, S)), await new i.FileWithEmbeddedBlockMapDifferentialDownloader(s.info, this.httpExecutor, p).download(), !1;
      } catch (p) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${p.stack || p}`), process.platform === "linux";
      }
    }
    doInstall(s) {
      const t = process.env.APPIMAGE;
      if (t == null)
        throw (0, r.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      (0, u.unlinkSync)(t);
      let m;
      const v = c.basename(t), E = this.installerPath;
      if (E == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      c.basename(E) === v || !/\d+\.\d+\.\d+/.test(v) ? m = t : m = c.join(c.dirname(t), c.basename(E)), (0, d.execFileSync)("mv", ["-f", E, m]), m !== t && this.emit("appimage-filename-updated", m);
      const p = {
        ...process.env,
        APPIMAGE_SILENT_INSTALL: "true"
      };
      return s.isForceRunAfter ? this.spawnLog(m, [], p) : (p.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, d.execFileSync)(m, [], { env: p })), !0;
    }
  };
  return ar.AppImageUpdater = o, ar;
}
var sr = {}, hl;
function pl() {
  if (hl) return sr;
  hl = 1, Object.defineProperty(sr, "__esModule", { value: !0 }), sr.DebUpdater = void 0;
  const r = Bt(), d = Ke(), h = It();
  let u = class extends r.BaseUpdater {
    constructor(l, i) {
      super(l, i);
    }
    /*** @private */
    doDownloadUpdate(l) {
      const i = l.updateInfoAndProvider.provider, f = (0, d.findFile)(i.resolveFiles(l.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
      return this.executeDownload({
        fileExtension: "deb",
        fileInfo: f,
        downloadUpdateOptions: l,
        task: async (n, o) => {
          this.listenerCount(h.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(h.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(f.url, n, o);
        }
      });
    }
    get installerPath() {
      var l, i;
      return (i = (l = super.installerPath) === null || l === void 0 ? void 0 : l.replace(/ /g, "\\ ")) !== null && i !== void 0 ? i : null;
    }
    doInstall(l) {
      const i = this.wrapSudo(), f = /pkexec/i.test(i) ? "" : '"', n = this.installerPath;
      if (n == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const o = ["dpkg", "-i", n, "||", "apt-get", "install", "-f", "-y"];
      return this.spawnSyncLog(i, [`${f}/bin/bash`, "-c", `'${o.join(" ")}'${f}`]), l.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return sr.DebUpdater = u, sr;
}
var lr = {}, ml;
function gl() {
  if (ml) return lr;
  ml = 1, Object.defineProperty(lr, "__esModule", { value: !0 }), lr.PacmanUpdater = void 0;
  const r = Bt(), d = It(), h = Ke();
  let u = class extends r.BaseUpdater {
    constructor(l, i) {
      super(l, i);
    }
    /*** @private */
    doDownloadUpdate(l) {
      const i = l.updateInfoAndProvider.provider, f = (0, h.findFile)(i.resolveFiles(l.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
      return this.executeDownload({
        fileExtension: "pacman",
        fileInfo: f,
        downloadUpdateOptions: l,
        task: async (n, o) => {
          this.listenerCount(d.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(d.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(f.url, n, o);
        }
      });
    }
    get installerPath() {
      var l, i;
      return (i = (l = super.installerPath) === null || l === void 0 ? void 0 : l.replace(/ /g, "\\ ")) !== null && i !== void 0 ? i : null;
    }
    doInstall(l) {
      const i = this.wrapSudo(), f = /pkexec/i.test(i) ? "" : '"', n = this.installerPath;
      if (n == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const o = ["pacman", "-U", "--noconfirm", n];
      return this.spawnSyncLog(i, [`${f}/bin/bash`, "-c", `'${o.join(" ")}'${f}`]), l.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return lr.PacmanUpdater = u, lr;
}
var ur = {}, vl;
function El() {
  if (vl) return ur;
  vl = 1, Object.defineProperty(ur, "__esModule", { value: !0 }), ur.RpmUpdater = void 0;
  const r = Bt(), d = It(), h = Ke();
  let u = class extends r.BaseUpdater {
    constructor(l, i) {
      super(l, i);
    }
    /*** @private */
    doDownloadUpdate(l) {
      const i = l.updateInfoAndProvider.provider, f = (0, h.findFile)(i.resolveFiles(l.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "rpm",
        fileInfo: f,
        downloadUpdateOptions: l,
        task: async (n, o) => {
          this.listenerCount(d.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(d.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(f.url, n, o);
        }
      });
    }
    get installerPath() {
      var l, i;
      return (i = (l = super.installerPath) === null || l === void 0 ? void 0 : l.replace(/ /g, "\\ ")) !== null && i !== void 0 ? i : null;
    }
    doInstall(l) {
      const i = this.wrapSudo(), f = /pkexec/i.test(i) ? "" : '"', n = this.spawnSyncLog("which zypper"), o = this.installerPath;
      if (o == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      let a;
      return n ? a = [n, "--no-refresh", "install", "--allow-unsigned-rpm", "-y", "-f", o] : a = [this.spawnSyncLog("which dnf || which yum"), "-y", "install", o], this.spawnSyncLog(i, [`${f}/bin/bash`, "-c", `'${a.join(" ")}'${f}`]), l.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return ur.RpmUpdater = u, ur;
}
var cr = {}, yl;
function wl() {
  if (yl) return cr;
  yl = 1, Object.defineProperty(cr, "__esModule", { value: !0 }), cr.MacUpdater = void 0;
  const r = ke(), d = /* @__PURE__ */ mt(), h = pt, u = Ie, c = ac, l = fa(), i = Ke(), f = kr, n = pr;
  let o = class extends l.AppUpdater {
    constructor(s, t) {
      super(s, t), this.nativeUpdater = bt.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (m) => {
        this._logger.warn(m), this.emit("error", m);
      }), this.nativeUpdater.on("update-downloaded", () => {
        this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
      });
    }
    debug(s) {
      this._logger.debug != null && this._logger.debug(s);
    }
    closeServerIfExists() {
      this.server && (this.debug("Closing proxy server"), this.server.close((s) => {
        s && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
      }));
    }
    async doDownloadUpdate(s) {
      let t = s.updateInfoAndProvider.provider.resolveFiles(s.updateInfoAndProvider.info);
      const m = this._logger, v = "sysctl.proc_translated";
      let E = !1;
      try {
        this.debug("Checking for macOS Rosetta environment"), E = (0, f.execFileSync)("sysctl", [v], { encoding: "utf8" }).includes(`${v}: 1`), m.info(`Checked for macOS Rosetta environment (isRosetta=${E})`);
      } catch (M) {
        m.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${M}`);
      }
      let p = !1;
      try {
        this.debug("Checking for arm64 in uname");
        const C = (0, f.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
        m.info(`Checked 'uname -a': arm64=${C}`), p = p || C;
      } catch (M) {
        m.warn(`uname shell command to check for arm64 failed: ${M}`);
      }
      p = p || process.arch === "arm64" || E;
      const S = (M) => {
        var C;
        return M.url.pathname.includes("arm64") || ((C = M.info.url) === null || C === void 0 ? void 0 : C.includes("arm64"));
      };
      p && t.some(S) ? t = t.filter((M) => p === S(M)) : t = t.filter((M) => !S(M));
      const T = (0, i.findFile)(t, "zip", ["pkg", "dmg"]);
      if (T == null)
        throw (0, r.newError)(`ZIP file not provided: ${(0, r.safeStringifyJson)(t)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
      const O = s.updateInfoAndProvider.provider, P = "update.zip";
      return this.executeDownload({
        fileExtension: "zip",
        fileInfo: T,
        downloadUpdateOptions: s,
        task: async (M, C) => {
          const A = u.join(this.downloadedUpdateHelper.cacheDir, P), R = () => (0, d.pathExistsSync)(A) ? !s.disableDifferentialDownload : (m.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
          let y = !0;
          R() && (y = await this.differentialDownloadInstaller(T, s, M, O, P)), y && await this.httpExecutor.download(T.url, M, C);
        },
        done: async (M) => {
          if (!s.disableDifferentialDownload)
            try {
              const C = u.join(this.downloadedUpdateHelper.cacheDir, P);
              await (0, d.copyFile)(M.downloadedFile, C);
            } catch (C) {
              this._logger.warn(`Unable to copy file for caching for future differential downloads: ${C.message}`);
            }
          return this.updateDownloaded(T, M);
        }
      });
    }
    async updateDownloaded(s, t) {
      var m;
      const v = t.downloadedFile, E = (m = s.info.size) !== null && m !== void 0 ? m : (await (0, d.stat)(v)).size, p = this._logger, S = `fileToProxy=${s.url.href}`;
      this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${S})`), this.server = (0, c.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${S})`), this.server.on("close", () => {
        p.info(`Proxy server for native Squirrel.Mac is closed (${S})`);
      });
      const T = (O) => {
        const P = O.address();
        return typeof P == "string" ? P : `http://127.0.0.1:${P == null ? void 0 : P.port}`;
      };
      return await new Promise((O, P) => {
        const M = (0, n.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), C = Buffer.from(`autoupdater:${M}`, "ascii"), A = `/${(0, n.randomBytes)(64).toString("hex")}.zip`;
        this.server.on("request", (R, y) => {
          const q = R.url;
          if (p.info(`${q} requested`), q === "/") {
            if (!R.headers.authorization || R.headers.authorization.indexOf("Basic ") === -1) {
              y.statusCode = 401, y.statusMessage = "Invalid Authentication Credentials", y.end(), p.warn("No authenthication info");
              return;
            }
            const k = R.headers.authorization.split(" ")[1], N = Buffer.from(k, "base64").toString("ascii"), [I, F] = N.split(":");
            if (I !== "autoupdater" || F !== M) {
              y.statusCode = 401, y.statusMessage = "Invalid Authentication Credentials", y.end(), p.warn("Invalid authenthication credentials");
              return;
            }
            const $ = Buffer.from(`{ "url": "${T(this.server)}${A}" }`);
            y.writeHead(200, { "Content-Type": "application/json", "Content-Length": $.length }), y.end($);
            return;
          }
          if (!q.startsWith(A)) {
            p.warn(`${q} requested, but not supported`), y.writeHead(404), y.end();
            return;
          }
          p.info(`${A} requested by Squirrel.Mac, pipe ${v}`);
          let U = !1;
          y.on("finish", () => {
            U || (this.nativeUpdater.removeListener("error", P), O([]));
          });
          const L = (0, h.createReadStream)(v);
          L.on("error", (k) => {
            try {
              y.end();
            } catch (N) {
              p.warn(`cannot end response: ${N}`);
            }
            U = !0, this.nativeUpdater.removeListener("error", P), P(new Error(`Cannot pipe "${v}": ${k}`));
          }), y.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-Length": E
          }), L.pipe(y);
        }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${S})`), this.server.listen(0, "127.0.0.1", () => {
          this.debug(`Proxy server for native Squirrel.Mac is listening (address=${T(this.server)}, ${S})`), this.nativeUpdater.setFeedURL({
            url: T(this.server),
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Basic ${C.toString("base64")}`
            }
          }), this.dispatchUpdateDownloaded(t), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", P), this.nativeUpdater.checkForUpdates()) : O([]);
        });
      });
    }
    handleUpdateDownloaded() {
      this.autoRunAppAfterInstall ? this.nativeUpdater.quitAndInstall() : this.app.quit(), this.closeServerIfExists();
    }
    quitAndInstall() {
      this.squirrelDownloadedUpdate ? this.handleUpdateDownloaded() : (this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded()), this.autoInstallOnAppQuit || this.nativeUpdater.checkForUpdates());
    }
  };
  return cr.MacUpdater = o, cr;
}
var fr = {}, Ur = {}, _l;
function Nf() {
  if (_l) return Ur;
  _l = 1, Object.defineProperty(Ur, "__esModule", { value: !0 }), Ur.verifySignature = c;
  const r = ke(), d = kr, h = qr, u = Ie;
  function c(n, o, a) {
    return new Promise((s, t) => {
      const m = o.replace(/'/g, "''");
      a.info(`Verifying signature ${m}`), (0, d.execFile)('set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", `"Get-AuthenticodeSignature -LiteralPath '${m}' | ConvertTo-Json -Compress"`], {
        shell: !0,
        timeout: 20 * 1e3
      }, (v, E, p) => {
        var S;
        try {
          if (v != null || p) {
            i(a, v, p, t), s(null);
            return;
          }
          const T = l(E);
          if (T.Status === 0) {
            try {
              const C = u.normalize(T.Path), A = u.normalize(o);
              if (a.info(`LiteralPath: ${C}. Update Path: ${A}`), C !== A) {
                i(a, new Error(`LiteralPath of ${C} is different than ${A}`), p, t), s(null);
                return;
              }
            } catch (C) {
              a.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(S = C.message) !== null && S !== void 0 ? S : C.stack}`);
            }
            const P = (0, r.parseDn)(T.SignerCertificate.Subject);
            let M = !1;
            for (const C of n) {
              const A = (0, r.parseDn)(C);
              if (A.size ? M = Array.from(A.keys()).every((y) => A.get(y) === P.get(y)) : C === P.get("CN") && (a.warn(`Signature validated using only CN ${C}. Please add your full Distinguished Name (DN) to publisherNames configuration`), M = !0), M) {
                s(null);
                return;
              }
            }
          }
          const O = `publisherNames: ${n.join(" | ")}, raw info: ` + JSON.stringify(T, (P, M) => P === "RawData" ? void 0 : M, 2);
          a.warn(`Sign verification failed, installer signed with incorrect certificate: ${O}`), s(O);
        } catch (T) {
          i(a, T, null, t), s(null);
          return;
        }
      });
    });
  }
  function l(n) {
    const o = JSON.parse(n);
    delete o.PrivateKey, delete o.IsOSBinary, delete o.SignatureType;
    const a = o.SignerCertificate;
    return a != null && (delete a.Archived, delete a.Extensions, delete a.Handle, delete a.HasPrivateKey, delete a.SubjectName), o;
  }
  function i(n, o, a, s) {
    if (f()) {
      n.warn(`Cannot execute Get-AuthenticodeSignature: ${o || a}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    try {
      (0, d.execFileSync)("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "ConvertTo-Json test"], { timeout: 10 * 1e3 });
    } catch (t) {
      n.warn(`Cannot execute ConvertTo-Json: ${t.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    o != null && s(o), a && s(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${a}. Failing signature validation due to unknown stderr.`));
  }
  function f() {
    const n = h.release();
    return n.startsWith("6.") && !n.startsWith("6.3");
  }
  return Ur;
}
var Sl;
function Al() {
  if (Sl) return fr;
  Sl = 1, Object.defineProperty(fr, "__esModule", { value: !0 }), fr.NsisUpdater = void 0;
  const r = ke(), d = Ie, h = Bt(), u = ou(), c = It(), l = Ke(), i = /* @__PURE__ */ mt(), f = Nf(), n = $t;
  let o = class extends h.BaseUpdater {
    constructor(s, t) {
      super(s, t), this._verifyUpdateCodeSignature = (m, v) => (0, f.verifySignature)(m, v, this._logger);
    }
    /**
     * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
     * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
     */
    get verifyUpdateCodeSignature() {
      return this._verifyUpdateCodeSignature;
    }
    set verifyUpdateCodeSignature(s) {
      s && (this._verifyUpdateCodeSignature = s);
    }
    /*** @private */
    doDownloadUpdate(s) {
      const t = s.updateInfoAndProvider.provider, m = (0, l.findFile)(t.resolveFiles(s.updateInfoAndProvider.info), "exe");
      return this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions: s,
        fileInfo: m,
        task: async (v, E, p, S) => {
          const T = m.packageInfo, O = T != null && p != null;
          if (O && s.disableWebInstaller)
            throw (0, r.newError)(`Unable to download new version ${s.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
          !O && !s.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (O || s.disableDifferentialDownload || await this.differentialDownloadInstaller(m, s, v, t, r.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(m.url, v, E);
          const P = await this.verifySignature(v);
          if (P != null)
            throw await S(), (0, r.newError)(`New version ${s.updateInfoAndProvider.info.version} is not signed by the application owner: ${P}`, "ERR_UPDATER_INVALID_SIGNATURE");
          if (O && await this.differentialDownloadWebPackage(s, T, p, t))
            try {
              await this.httpExecutor.download(new n.URL(T.path), p, {
                headers: s.requestHeaders,
                cancellationToken: s.cancellationToken,
                sha512: T.sha512
              });
            } catch (M) {
              try {
                await (0, i.unlink)(p);
              } catch {
              }
              throw M;
            }
        }
      });
    }
    // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
    // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
    // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
    async verifySignature(s) {
      let t;
      try {
        if (t = (await this.configOnDisk.value).publisherName, t == null)
          return null;
      } catch (m) {
        if (m.code === "ENOENT")
          return null;
        throw m;
      }
      return await this._verifyUpdateCodeSignature(Array.isArray(t) ? t : [t], s);
    }
    doInstall(s) {
      const t = this.installerPath;
      if (t == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const m = ["--updated"];
      s.isSilent && m.push("/S"), s.isForceRunAfter && m.push("--force-run"), this.installDirectory && m.push(`/D=${this.installDirectory}`);
      const v = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
      v != null && m.push(`--package-file=${v}`);
      const E = () => {
        this.spawnLog(d.join(process.resourcesPath, "elevate.exe"), [t].concat(m)).catch((p) => this.dispatchError(p));
      };
      return s.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), E(), !0) : (this.spawnLog(t, m).catch((p) => {
        const S = p.code;
        this._logger.info(`Cannot run installer: error code: ${S}, error message: "${p.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), S === "UNKNOWN" || S === "EACCES" ? E() : S === "ENOENT" ? bt.shell.openPath(t).catch((T) => this.dispatchError(T)) : this.dispatchError(p);
      }), !0);
    }
    async differentialDownloadWebPackage(s, t, m, v) {
      if (t.blockMapSize == null)
        return !0;
      try {
        const E = {
          newUrl: new n.URL(t.path),
          oldFile: d.join(this.downloadedUpdateHelper.cacheDir, r.CURRENT_APP_PACKAGE_FILE_NAME),
          logger: this._logger,
          newFile: m,
          requestHeaders: this.requestHeaders,
          isUseMultipleRangeRequest: v.isUseMultipleRangeRequest,
          cancellationToken: s.cancellationToken
        };
        this.listenerCount(c.DOWNLOAD_PROGRESS) > 0 && (E.onProgress = (p) => this.emit(c.DOWNLOAD_PROGRESS, p)), await new u.FileWithEmbeddedBlockMapDifferentialDownloader(t, this.httpExecutor, E).download();
      } catch (E) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${E.stack || E}`), process.platform === "win32";
      }
      return !1;
    }
  };
  return fr.NsisUpdater = o, fr;
}
var Rl;
function Ff() {
  return Rl || (Rl = 1, function(r) {
    var d = St && St.__createBinding || (Object.create ? function(p, S, T, O) {
      O === void 0 && (O = T);
      var P = Object.getOwnPropertyDescriptor(S, T);
      (!P || ("get" in P ? !S.__esModule : P.writable || P.configurable)) && (P = { enumerable: !0, get: function() {
        return S[T];
      } }), Object.defineProperty(p, O, P);
    } : function(p, S, T, O) {
      O === void 0 && (O = T), p[O] = S[T];
    }), h = St && St.__exportStar || function(p, S) {
      for (var T in p) T !== "default" && !Object.prototype.hasOwnProperty.call(S, T) && d(S, p, T);
    };
    Object.defineProperty(r, "__esModule", { value: !0 }), r.NsisUpdater = r.MacUpdater = r.RpmUpdater = r.PacmanUpdater = r.DebUpdater = r.AppImageUpdater = r.Provider = r.NoOpLogger = r.AppUpdater = r.BaseUpdater = void 0;
    const u = /* @__PURE__ */ mt(), c = Ie;
    var l = Bt();
    Object.defineProperty(r, "BaseUpdater", { enumerable: !0, get: function() {
      return l.BaseUpdater;
    } });
    var i = fa();
    Object.defineProperty(r, "AppUpdater", { enumerable: !0, get: function() {
      return i.AppUpdater;
    } }), Object.defineProperty(r, "NoOpLogger", { enumerable: !0, get: function() {
      return i.NoOpLogger;
    } });
    var f = Ke();
    Object.defineProperty(r, "Provider", { enumerable: !0, get: function() {
      return f.Provider;
    } });
    var n = dl();
    Object.defineProperty(r, "AppImageUpdater", { enumerable: !0, get: function() {
      return n.AppImageUpdater;
    } });
    var o = pl();
    Object.defineProperty(r, "DebUpdater", { enumerable: !0, get: function() {
      return o.DebUpdater;
    } });
    var a = gl();
    Object.defineProperty(r, "PacmanUpdater", { enumerable: !0, get: function() {
      return a.PacmanUpdater;
    } });
    var s = El();
    Object.defineProperty(r, "RpmUpdater", { enumerable: !0, get: function() {
      return s.RpmUpdater;
    } });
    var t = wl();
    Object.defineProperty(r, "MacUpdater", { enumerable: !0, get: function() {
      return t.MacUpdater;
    } });
    var m = Al();
    Object.defineProperty(r, "NsisUpdater", { enumerable: !0, get: function() {
      return m.NsisUpdater;
    } }), h(It(), r);
    let v;
    function E() {
      if (process.platform === "win32")
        v = new (Al()).NsisUpdater();
      else if (process.platform === "darwin")
        v = new (wl()).MacUpdater();
      else {
        v = new (dl()).AppImageUpdater();
        try {
          const p = c.join(process.resourcesPath, "package-type");
          if (!(0, u.existsSync)(p))
            return v;
          console.info("Checking for beta autoupdate feature for deb/rpm distributions");
          const S = (0, u.readFileSync)(p).toString().trim();
          switch (console.info("Found package-type:", S), S) {
            case "deb":
              v = new (pl()).DebUpdater();
              break;
            case "rpm":
              v = new (El()).RpmUpdater();
              break;
            case "pacman":
              v = new (gl()).PacmanUpdater();
              break;
            default:
              break;
          }
        } catch (p) {
          console.warn("Unable to detect 'package-type' for autoUpdater (beta rpm/deb support). If you'd like to expand support, please consider contributing to electron-builder", p.message);
        }
      }
      return v;
    }
    Object.defineProperty(r, "autoUpdater", {
      enumerable: !0,
      get: () => v || E()
    });
  }(St)), St;
}
var dt = Ff();
const su = ht.dirname(oc(import.meta.url));
process.env.APP_ROOT = ht.join(su, "..");
const Ki = process.env.VITE_DEV_SERVER_URL, _d = ht.join(process.env.APP_ROOT, "dist-electron"), lu = ht.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Ki ? ht.join(process.env.APP_ROOT, "public") : lu;
let Fe;
function uu() {
  Fe = new Tl({
    icon: ht.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: ht.join(su, "preload.mjs")
    }
  }), Fe.webContents.on("did-finish-load", () => {
    Fe == null || Fe.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), Ki ? Fe.loadURL(Ki) : Fe.loadFile(ht.join(lu, "index.html"));
}
$r.on("window-all-closed", () => {
  process.platform !== "darwin" && ($r.quit(), Fe = null);
});
$r.on("activate", () => {
  Tl.getAllWindows().length === 0 && uu();
});
$r.whenReady().then(() => {
  uu(), dt.autoUpdater.autoDownload = !1, Xr.handle("check-update", async () => {
    try {
      const r = await dt.autoUpdater.checkForUpdates();
      return (r == null ? void 0 : r.updateInfo) || {};
    } catch (r) {
      return { error: { message: r.message || "Check failed" } };
    }
  }), Xr.handle("start-download", () => {
    dt.autoUpdater.downloadUpdate();
  }), Xr.handle("quit-and-install", () => {
    dt.autoUpdater.quitAndInstall();
  }), dt.autoUpdater.on("update-available", (r) => {
    Fe == null || Fe.webContents.send("update-can-available", r);
  }), dt.autoUpdater.on("download-progress", (r) => {
    Fe == null || Fe.webContents.send("download-progress", r);
  }), dt.autoUpdater.on("update-downloaded", () => {
    Fe == null || Fe.webContents.send("update-downloaded");
  }), dt.autoUpdater.on("error", (r) => {
    Fe == null || Fe.webContents.send("update-error", { message: r.message });
  });
});
export {
  _d as MAIN_DIST,
  lu as RENDERER_DIST,
  Ki as VITE_DEV_SERVER_URL
};
