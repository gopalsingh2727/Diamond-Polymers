var bf = Object.defineProperty;
var Rf = (o, h, d) => h in o ? bf(o, h, { enumerable: !0, configurable: !0, writable: !0, value: d }) : o[h] = d;
var Ae = (o, h, d) => Rf(o, typeof h != "symbol" ? h + "" : h, d);
import yt, { app as wr, ipcMain as on, BrowserWindow as xo } from "electron";
import Ve from "fs";
import Tf from "constants";
import _r from "stream";
import Vr from "util";
import qu from "assert";
import Ce from "path";
import Sr from "child_process";
import Wr from "events";
import Bt from "crypto";
import Mu from "tty";
import dt from "os";
import jt from "url";
import Cf from "string_decoder";
import Bu from "zlib";
import ju from "http";
import { fileURLToPath as Of } from "node:url";
import ft from "node:path";
import Df from "https";
var rt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Hu(o) {
  return o && o.__esModule && Object.prototype.hasOwnProperty.call(o, "default") ? o.default : o;
}
var Tt = {}, an = {}, Nr = {}, la;
function Ye() {
  return la || (la = 1, Nr.fromCallback = function(o) {
    return Object.defineProperty(function(...h) {
      if (typeof h[h.length - 1] == "function") o.apply(this, h);
      else
        return new Promise((d, f) => {
          h.push((c, t) => c != null ? f(c) : d(t)), o.apply(this, h);
        });
    }, "name", { value: o.name });
  }, Nr.fromPromise = function(o) {
    return Object.defineProperty(function(...h) {
      const d = h[h.length - 1];
      if (typeof d != "function") return o.apply(this, h);
      h.pop(), o.apply(this, h).then((f) => d(null, f), d);
    }, "name", { value: o.name });
  }), Nr;
}
var sn, ua;
function Pf() {
  if (ua) return sn;
  ua = 1;
  var o = Tf, h = process.cwd, d = null, f = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    return d || (d = h.call(process)), d;
  };
  try {
    process.cwd();
  } catch {
  }
  if (typeof process.chdir == "function") {
    var c = process.chdir;
    process.chdir = function(e) {
      d = null, c.call(process, e);
    }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, c);
  }
  sn = t;
  function t(e) {
    o.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && n(e), e.lutimes || r(e), e.chown = u(e.chown), e.fchown = u(e.fchown), e.lchown = u(e.lchown), e.chmod = i(e.chmod), e.fchmod = i(e.fchmod), e.lchmod = i(e.lchmod), e.chownSync = s(e.chownSync), e.fchownSync = s(e.fchownSync), e.lchownSync = s(e.lchownSync), e.chmodSync = a(e.chmodSync), e.fchmodSync = a(e.fchmodSync), e.lchmodSync = a(e.lchmodSync), e.stat = m(e.stat), e.fstat = m(e.fstat), e.lstat = m(e.lstat), e.statSync = v(e.statSync), e.fstatSync = v(e.fstatSync), e.lstatSync = v(e.lstatSync), e.chmod && !e.lchmod && (e.lchmod = function(p, A, T) {
      T && process.nextTick(T);
    }, e.lchmodSync = function() {
    }), e.chown && !e.lchown && (e.lchown = function(p, A, T, O) {
      O && process.nextTick(O);
    }, e.lchownSync = function() {
    }), f === "win32" && (e.rename = typeof e.rename != "function" ? e.rename : function(p) {
      function A(T, O, D) {
        var P = Date.now(), b = 0;
        p(T, O, function w(_) {
          if (_ && (_.code === "EACCES" || _.code === "EPERM" || _.code === "EBUSY") && Date.now() - P < 6e4) {
            setTimeout(function() {
              e.stat(O, function(E, U) {
                E && E.code === "ENOENT" ? p(T, O, w) : D(_);
              });
            }, b), b < 100 && (b += 10);
            return;
          }
          D && D(_);
        });
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(A, p), A;
    }(e.rename)), e.read = typeof e.read != "function" ? e.read : function(p) {
      function A(T, O, D, P, b, w) {
        var _;
        if (w && typeof w == "function") {
          var E = 0;
          _ = function(U, F, x) {
            if (U && U.code === "EAGAIN" && E < 10)
              return E++, p.call(e, T, O, D, P, b, _);
            w.apply(this, arguments);
          };
        }
        return p.call(e, T, O, D, P, b, _);
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(A, p), A;
    }(e.read), e.readSync = typeof e.readSync != "function" ? e.readSync : /* @__PURE__ */ function(p) {
      return function(A, T, O, D, P) {
        for (var b = 0; ; )
          try {
            return p.call(e, A, T, O, D, P);
          } catch (w) {
            if (w.code === "EAGAIN" && b < 10) {
              b++;
              continue;
            }
            throw w;
          }
      };
    }(e.readSync);
    function n(p) {
      p.lchmod = function(A, T, O) {
        p.open(
          A,
          o.O_WRONLY | o.O_SYMLINK,
          T,
          function(D, P) {
            if (D) {
              O && O(D);
              return;
            }
            p.fchmod(P, T, function(b) {
              p.close(P, function(w) {
                O && O(b || w);
              });
            });
          }
        );
      }, p.lchmodSync = function(A, T) {
        var O = p.openSync(A, o.O_WRONLY | o.O_SYMLINK, T), D = !0, P;
        try {
          P = p.fchmodSync(O, T), D = !1;
        } finally {
          if (D)
            try {
              p.closeSync(O);
            } catch {
            }
          else
            p.closeSync(O);
        }
        return P;
      };
    }
    function r(p) {
      o.hasOwnProperty("O_SYMLINK") && p.futimes ? (p.lutimes = function(A, T, O, D) {
        p.open(A, o.O_SYMLINK, function(P, b) {
          if (P) {
            D && D(P);
            return;
          }
          p.futimes(b, T, O, function(w) {
            p.close(b, function(_) {
              D && D(w || _);
            });
          });
        });
      }, p.lutimesSync = function(A, T, O) {
        var D = p.openSync(A, o.O_SYMLINK), P, b = !0;
        try {
          P = p.futimesSync(D, T, O), b = !1;
        } finally {
          if (b)
            try {
              p.closeSync(D);
            } catch {
            }
          else
            p.closeSync(D);
        }
        return P;
      }) : p.futimes && (p.lutimes = function(A, T, O, D) {
        D && process.nextTick(D);
      }, p.lutimesSync = function() {
      });
    }
    function i(p) {
      return p && function(A, T, O) {
        return p.call(e, A, T, function(D) {
          g(D) && (D = null), O && O.apply(this, arguments);
        });
      };
    }
    function a(p) {
      return p && function(A, T) {
        try {
          return p.call(e, A, T);
        } catch (O) {
          if (!g(O)) throw O;
        }
      };
    }
    function u(p) {
      return p && function(A, T, O, D) {
        return p.call(e, A, T, O, function(P) {
          g(P) && (P = null), D && D.apply(this, arguments);
        });
      };
    }
    function s(p) {
      return p && function(A, T, O) {
        try {
          return p.call(e, A, T, O);
        } catch (D) {
          if (!g(D)) throw D;
        }
      };
    }
    function m(p) {
      return p && function(A, T, O) {
        typeof T == "function" && (O = T, T = null);
        function D(P, b) {
          b && (b.uid < 0 && (b.uid += 4294967296), b.gid < 0 && (b.gid += 4294967296)), O && O.apply(this, arguments);
        }
        return T ? p.call(e, A, T, D) : p.call(e, A, D);
      };
    }
    function v(p) {
      return p && function(A, T) {
        var O = T ? p.call(e, A, T) : p.call(e, A);
        return O && (O.uid < 0 && (O.uid += 4294967296), O.gid < 0 && (O.gid += 4294967296)), O;
      };
    }
    function g(p) {
      if (!p || p.code === "ENOSYS")
        return !0;
      var A = !process.getuid || process.getuid() !== 0;
      return !!(A && (p.code === "EINVAL" || p.code === "EPERM"));
    }
  }
  return sn;
}
var ln, ca;
function If() {
  if (ca) return ln;
  ca = 1;
  var o = _r.Stream;
  ln = h;
  function h(d) {
    return {
      ReadStream: f,
      WriteStream: c
    };
    function f(t, e) {
      if (!(this instanceof f)) return new f(t, e);
      o.call(this);
      var n = this;
      this.path = t, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, e = e || {};
      for (var r = Object.keys(e), i = 0, a = r.length; i < a; i++) {
        var u = r[i];
        this[u] = e[u];
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
          n._read();
        });
        return;
      }
      d.open(this.path, this.flags, this.mode, function(s, m) {
        if (s) {
          n.emit("error", s), n.readable = !1;
          return;
        }
        n.fd = m, n.emit("open", m), n._read();
      });
    }
    function c(t, e) {
      if (!(this instanceof c)) return new c(t, e);
      o.call(this), this.path = t, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, e = e || {};
      for (var n = Object.keys(e), r = 0, i = n.length; r < i; r++) {
        var a = n[r];
        this[a] = e[a];
      }
      if (this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.start < 0)
          throw new Error("start must be >= zero");
        this.pos = this.start;
      }
      this.busy = !1, this._queue = [], this.fd === null && (this._open = d.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
    }
  }
  return ln;
}
var un, fa;
function Nf() {
  if (fa) return un;
  fa = 1, un = h;
  var o = Object.getPrototypeOf || function(d) {
    return d.__proto__;
  };
  function h(d) {
    if (d === null || typeof d != "object")
      return d;
    if (d instanceof Object)
      var f = { __proto__: o(d) };
    else
      var f = /* @__PURE__ */ Object.create(null);
    return Object.getOwnPropertyNames(d).forEach(function(c) {
      Object.defineProperty(f, c, Object.getOwnPropertyDescriptor(d, c));
    }), f;
  }
  return un;
}
var Fr, da;
function We() {
  if (da) return Fr;
  da = 1;
  var o = Ve, h = Pf(), d = If(), f = Nf(), c = Vr, t, e;
  typeof Symbol == "function" && typeof Symbol.for == "function" ? (t = Symbol.for("graceful-fs.queue"), e = Symbol.for("graceful-fs.previous")) : (t = "___graceful-fs.queue", e = "___graceful-fs.previous");
  function n() {
  }
  function r(p, A) {
    Object.defineProperty(p, t, {
      get: function() {
        return A;
      }
    });
  }
  var i = n;
  if (c.debuglog ? i = c.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (i = function() {
    var p = c.format.apply(c, arguments);
    p = "GFS4: " + p.split(/\n/).join(`
GFS4: `), console.error(p);
  }), !o[t]) {
    var a = rt[t] || [];
    r(o, a), o.close = function(p) {
      function A(T, O) {
        return p.call(o, T, function(D) {
          D || v(), typeof O == "function" && O.apply(this, arguments);
        });
      }
      return Object.defineProperty(A, e, {
        value: p
      }), A;
    }(o.close), o.closeSync = function(p) {
      function A(T) {
        p.apply(o, arguments), v();
      }
      return Object.defineProperty(A, e, {
        value: p
      }), A;
    }(o.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
      i(o[t]), qu.equal(o[t].length, 0);
    });
  }
  rt[t] || r(rt, o[t]), Fr = u(f(o)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !o.__patched && (Fr = u(o), o.__patched = !0);
  function u(p) {
    h(p), p.gracefulify = u, p.createReadStream = ce, p.createWriteStream = ue;
    var A = p.readFile;
    p.readFile = T;
    function T(J, ye, R) {
      return typeof ye == "function" && (R = ye, ye = null), y(J, ye, R);
      function y(j, L, le, me) {
        return A(j, L, function(pe) {
          pe && (pe.code === "EMFILE" || pe.code === "ENFILE") ? s([y, [j, L, le], pe, me || Date.now(), Date.now()]) : typeof le == "function" && le.apply(this, arguments);
        });
      }
    }
    var O = p.writeFile;
    p.writeFile = D;
    function D(J, ye, R, y) {
      return typeof R == "function" && (y = R, R = null), j(J, ye, R, y);
      function j(L, le, me, pe, _e) {
        return O(L, le, me, function(Ee) {
          Ee && (Ee.code === "EMFILE" || Ee.code === "ENFILE") ? s([j, [L, le, me, pe], Ee, _e || Date.now(), Date.now()]) : typeof pe == "function" && pe.apply(this, arguments);
        });
      }
    }
    var P = p.appendFile;
    P && (p.appendFile = b);
    function b(J, ye, R, y) {
      return typeof R == "function" && (y = R, R = null), j(J, ye, R, y);
      function j(L, le, me, pe, _e) {
        return P(L, le, me, function(Ee) {
          Ee && (Ee.code === "EMFILE" || Ee.code === "ENFILE") ? s([j, [L, le, me, pe], Ee, _e || Date.now(), Date.now()]) : typeof pe == "function" && pe.apply(this, arguments);
        });
      }
    }
    var w = p.copyFile;
    w && (p.copyFile = _);
    function _(J, ye, R, y) {
      return typeof R == "function" && (y = R, R = 0), j(J, ye, R, y);
      function j(L, le, me, pe, _e) {
        return w(L, le, me, function(Ee) {
          Ee && (Ee.code === "EMFILE" || Ee.code === "ENFILE") ? s([j, [L, le, me, pe], Ee, _e || Date.now(), Date.now()]) : typeof pe == "function" && pe.apply(this, arguments);
        });
      }
    }
    var E = p.readdir;
    p.readdir = F;
    var U = /^v[0-5]\./;
    function F(J, ye, R) {
      typeof ye == "function" && (R = ye, ye = null);
      var y = U.test(process.version) ? function(le, me, pe, _e) {
        return E(le, j(
          le,
          me,
          pe,
          _e
        ));
      } : function(le, me, pe, _e) {
        return E(le, me, j(
          le,
          me,
          pe,
          _e
        ));
      };
      return y(J, ye, R);
      function j(L, le, me, pe) {
        return function(_e, Ee) {
          _e && (_e.code === "EMFILE" || _e.code === "ENFILE") ? s([
            y,
            [L, le, me],
            _e,
            pe || Date.now(),
            Date.now()
          ]) : (Ee && Ee.sort && Ee.sort(), typeof me == "function" && me.call(this, _e, Ee));
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var x = d(p);
      M = x.ReadStream, V = x.WriteStream;
    }
    var q = p.ReadStream;
    q && (M.prototype = Object.create(q.prototype), M.prototype.open = K);
    var N = p.WriteStream;
    N && (V.prototype = Object.create(N.prototype), V.prototype.open = ne), Object.defineProperty(p, "ReadStream", {
      get: function() {
        return M;
      },
      set: function(J) {
        M = J;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(p, "WriteStream", {
      get: function() {
        return V;
      },
      set: function(J) {
        V = J;
      },
      enumerable: !0,
      configurable: !0
    });
    var I = M;
    Object.defineProperty(p, "FileReadStream", {
      get: function() {
        return I;
      },
      set: function(J) {
        I = J;
      },
      enumerable: !0,
      configurable: !0
    });
    var $ = V;
    Object.defineProperty(p, "FileWriteStream", {
      get: function() {
        return $;
      },
      set: function(J) {
        $ = J;
      },
      enumerable: !0,
      configurable: !0
    });
    function M(J, ye) {
      return this instanceof M ? (q.apply(this, arguments), this) : M.apply(Object.create(M.prototype), arguments);
    }
    function K() {
      var J = this;
      be(J.path, J.flags, J.mode, function(ye, R) {
        ye ? (J.autoClose && J.destroy(), J.emit("error", ye)) : (J.fd = R, J.emit("open", R), J.read());
      });
    }
    function V(J, ye) {
      return this instanceof V ? (N.apply(this, arguments), this) : V.apply(Object.create(V.prototype), arguments);
    }
    function ne() {
      var J = this;
      be(J.path, J.flags, J.mode, function(ye, R) {
        ye ? (J.destroy(), J.emit("error", ye)) : (J.fd = R, J.emit("open", R));
      });
    }
    function ce(J, ye) {
      return new p.ReadStream(J, ye);
    }
    function ue(J, ye) {
      return new p.WriteStream(J, ye);
    }
    var ie = p.open;
    p.open = be;
    function be(J, ye, R, y) {
      return typeof R == "function" && (y = R, R = null), j(J, ye, R, y);
      function j(L, le, me, pe, _e) {
        return ie(L, le, me, function(Ee, xe) {
          Ee && (Ee.code === "EMFILE" || Ee.code === "ENFILE") ? s([j, [L, le, me, pe], Ee, _e || Date.now(), Date.now()]) : typeof pe == "function" && pe.apply(this, arguments);
        });
      }
    }
    return p;
  }
  function s(p) {
    i("ENQUEUE", p[0].name, p[1]), o[t].push(p), g();
  }
  var m;
  function v() {
    for (var p = Date.now(), A = 0; A < o[t].length; ++A)
      o[t][A].length > 2 && (o[t][A][3] = p, o[t][A][4] = p);
    g();
  }
  function g() {
    if (clearTimeout(m), m = void 0, o[t].length !== 0) {
      var p = o[t].shift(), A = p[0], T = p[1], O = p[2], D = p[3], P = p[4];
      if (D === void 0)
        i("RETRY", A.name, T), A.apply(null, T);
      else if (Date.now() - D >= 6e4) {
        i("TIMEOUT", A.name, T);
        var b = T.pop();
        typeof b == "function" && b.call(null, O);
      } else {
        var w = Date.now() - P, _ = Math.max(P - D, 1), E = Math.min(_ * 1.2, 100);
        w >= E ? (i("RETRY", A.name, T), A.apply(null, T.concat([D]))) : o[t].push(p);
      }
      m === void 0 && (m = setTimeout(g, 0));
    }
  }
  return Fr;
}
var ha;
function Ht() {
  return ha || (ha = 1, function(o) {
    const h = Ye().fromCallback, d = We(), f = [
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
    ].filter((c) => typeof d[c] == "function");
    Object.assign(o, d), f.forEach((c) => {
      o[c] = h(d[c]);
    }), o.exists = function(c, t) {
      return typeof t == "function" ? d.exists(c, t) : new Promise((e) => d.exists(c, e));
    }, o.read = function(c, t, e, n, r, i) {
      return typeof i == "function" ? d.read(c, t, e, n, r, i) : new Promise((a, u) => {
        d.read(c, t, e, n, r, (s, m, v) => {
          if (s) return u(s);
          a({ bytesRead: m, buffer: v });
        });
      });
    }, o.write = function(c, t, ...e) {
      return typeof e[e.length - 1] == "function" ? d.write(c, t, ...e) : new Promise((n, r) => {
        d.write(c, t, ...e, (i, a, u) => {
          if (i) return r(i);
          n({ bytesWritten: a, buffer: u });
        });
      });
    }, typeof d.writev == "function" && (o.writev = function(c, t, ...e) {
      return typeof e[e.length - 1] == "function" ? d.writev(c, t, ...e) : new Promise((n, r) => {
        d.writev(c, t, ...e, (i, a, u) => {
          if (i) return r(i);
          n({ bytesWritten: a, buffers: u });
        });
      });
    }), typeof d.realpath.native == "function" ? o.realpath.native = h(d.realpath.native) : process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  }(an)), an;
}
var xr = {}, cn = {}, pa;
function Ff() {
  if (pa) return cn;
  pa = 1;
  const o = Ce;
  return cn.checkPath = function(d) {
    if (process.platform === "win32" && /[<>:"|?*]/.test(d.replace(o.parse(d).root, ""))) {
      const c = new Error(`Path contains invalid characters: ${d}`);
      throw c.code = "EINVAL", c;
    }
  }, cn;
}
var ma;
function xf() {
  if (ma) return xr;
  ma = 1;
  const o = /* @__PURE__ */ Ht(), { checkPath: h } = /* @__PURE__ */ Ff(), d = (f) => {
    const c = { mode: 511 };
    return typeof f == "number" ? f : { ...c, ...f }.mode;
  };
  return xr.makeDir = async (f, c) => (h(f), o.mkdir(f, {
    mode: d(c),
    recursive: !0
  })), xr.makeDirSync = (f, c) => (h(f), o.mkdirSync(f, {
    mode: d(c),
    recursive: !0
  })), xr;
}
var fn, ga;
function at() {
  if (ga) return fn;
  ga = 1;
  const o = Ye().fromPromise, { makeDir: h, makeDirSync: d } = /* @__PURE__ */ xf(), f = o(h);
  return fn = {
    mkdirs: f,
    mkdirsSync: d,
    // alias
    mkdirp: f,
    mkdirpSync: d,
    ensureDir: f,
    ensureDirSync: d
  }, fn;
}
var dn, va;
function It() {
  if (va) return dn;
  va = 1;
  const o = Ye().fromPromise, h = /* @__PURE__ */ Ht();
  function d(f) {
    return h.access(f).then(() => !0).catch(() => !1);
  }
  return dn = {
    pathExists: o(d),
    pathExistsSync: h.existsSync
  }, dn;
}
var hn, ya;
function Gu() {
  if (ya) return hn;
  ya = 1;
  const o = We();
  function h(f, c, t, e) {
    o.open(f, "r+", (n, r) => {
      if (n) return e(n);
      o.futimes(r, c, t, (i) => {
        o.close(r, (a) => {
          e && e(i || a);
        });
      });
    });
  }
  function d(f, c, t) {
    const e = o.openSync(f, "r+");
    return o.futimesSync(e, c, t), o.closeSync(e);
  }
  return hn = {
    utimesMillis: h,
    utimesMillisSync: d
  }, hn;
}
var pn, Ea;
function Gt() {
  if (Ea) return pn;
  Ea = 1;
  const o = /* @__PURE__ */ Ht(), h = Ce, d = Vr;
  function f(s, m, v) {
    const g = v.dereference ? (p) => o.stat(p, { bigint: !0 }) : (p) => o.lstat(p, { bigint: !0 });
    return Promise.all([
      g(s),
      g(m).catch((p) => {
        if (p.code === "ENOENT") return null;
        throw p;
      })
    ]).then(([p, A]) => ({ srcStat: p, destStat: A }));
  }
  function c(s, m, v) {
    let g;
    const p = v.dereference ? (T) => o.statSync(T, { bigint: !0 }) : (T) => o.lstatSync(T, { bigint: !0 }), A = p(s);
    try {
      g = p(m);
    } catch (T) {
      if (T.code === "ENOENT") return { srcStat: A, destStat: null };
      throw T;
    }
    return { srcStat: A, destStat: g };
  }
  function t(s, m, v, g, p) {
    d.callbackify(f)(s, m, g, (A, T) => {
      if (A) return p(A);
      const { srcStat: O, destStat: D } = T;
      if (D) {
        if (i(O, D)) {
          const P = h.basename(s), b = h.basename(m);
          return v === "move" && P !== b && P.toLowerCase() === b.toLowerCase() ? p(null, { srcStat: O, destStat: D, isChangingCase: !0 }) : p(new Error("Source and destination must not be the same."));
        }
        if (O.isDirectory() && !D.isDirectory())
          return p(new Error(`Cannot overwrite non-directory '${m}' with directory '${s}'.`));
        if (!O.isDirectory() && D.isDirectory())
          return p(new Error(`Cannot overwrite directory '${m}' with non-directory '${s}'.`));
      }
      return O.isDirectory() && a(s, m) ? p(new Error(u(s, m, v))) : p(null, { srcStat: O, destStat: D });
    });
  }
  function e(s, m, v, g) {
    const { srcStat: p, destStat: A } = c(s, m, g);
    if (A) {
      if (i(p, A)) {
        const T = h.basename(s), O = h.basename(m);
        if (v === "move" && T !== O && T.toLowerCase() === O.toLowerCase())
          return { srcStat: p, destStat: A, isChangingCase: !0 };
        throw new Error("Source and destination must not be the same.");
      }
      if (p.isDirectory() && !A.isDirectory())
        throw new Error(`Cannot overwrite non-directory '${m}' with directory '${s}'.`);
      if (!p.isDirectory() && A.isDirectory())
        throw new Error(`Cannot overwrite directory '${m}' with non-directory '${s}'.`);
    }
    if (p.isDirectory() && a(s, m))
      throw new Error(u(s, m, v));
    return { srcStat: p, destStat: A };
  }
  function n(s, m, v, g, p) {
    const A = h.resolve(h.dirname(s)), T = h.resolve(h.dirname(v));
    if (T === A || T === h.parse(T).root) return p();
    o.stat(T, { bigint: !0 }, (O, D) => O ? O.code === "ENOENT" ? p() : p(O) : i(m, D) ? p(new Error(u(s, v, g))) : n(s, m, T, g, p));
  }
  function r(s, m, v, g) {
    const p = h.resolve(h.dirname(s)), A = h.resolve(h.dirname(v));
    if (A === p || A === h.parse(A).root) return;
    let T;
    try {
      T = o.statSync(A, { bigint: !0 });
    } catch (O) {
      if (O.code === "ENOENT") return;
      throw O;
    }
    if (i(m, T))
      throw new Error(u(s, v, g));
    return r(s, m, A, g);
  }
  function i(s, m) {
    return m.ino && m.dev && m.ino === s.ino && m.dev === s.dev;
  }
  function a(s, m) {
    const v = h.resolve(s).split(h.sep).filter((p) => p), g = h.resolve(m).split(h.sep).filter((p) => p);
    return v.reduce((p, A, T) => p && g[T] === A, !0);
  }
  function u(s, m, v) {
    return `Cannot ${v} '${s}' to a subdirectory of itself, '${m}'.`;
  }
  return pn = {
    checkPaths: t,
    checkPathsSync: e,
    checkParentPaths: n,
    checkParentPathsSync: r,
    isSrcSubdir: a,
    areIdentical: i
  }, pn;
}
var mn, wa;
function Lf() {
  if (wa) return mn;
  wa = 1;
  const o = We(), h = Ce, d = at().mkdirs, f = It().pathExists, c = Gu().utimesMillis, t = /* @__PURE__ */ Gt();
  function e(F, x, q, N) {
    typeof q == "function" && !N ? (N = q, q = {}) : typeof q == "function" && (q = { filter: q }), N = N || function() {
    }, q = q || {}, q.clobber = "clobber" in q ? !!q.clobber : !0, q.overwrite = "overwrite" in q ? !!q.overwrite : q.clobber, q.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0001"
    ), t.checkPaths(F, x, "copy", q, (I, $) => {
      if (I) return N(I);
      const { srcStat: M, destStat: K } = $;
      t.checkParentPaths(F, M, x, "copy", (V) => V ? N(V) : q.filter ? r(n, K, F, x, q, N) : n(K, F, x, q, N));
    });
  }
  function n(F, x, q, N, I) {
    const $ = h.dirname(q);
    f($, (M, K) => {
      if (M) return I(M);
      if (K) return a(F, x, q, N, I);
      d($, (V) => V ? I(V) : a(F, x, q, N, I));
    });
  }
  function r(F, x, q, N, I, $) {
    Promise.resolve(I.filter(q, N)).then((M) => M ? F(x, q, N, I, $) : $(), (M) => $(M));
  }
  function i(F, x, q, N, I) {
    return N.filter ? r(a, F, x, q, N, I) : a(F, x, q, N, I);
  }
  function a(F, x, q, N, I) {
    (N.dereference ? o.stat : o.lstat)(x, (M, K) => M ? I(M) : K.isDirectory() ? D(K, F, x, q, N, I) : K.isFile() || K.isCharacterDevice() || K.isBlockDevice() ? u(K, F, x, q, N, I) : K.isSymbolicLink() ? E(F, x, q, N, I) : K.isSocket() ? I(new Error(`Cannot copy a socket file: ${x}`)) : K.isFIFO() ? I(new Error(`Cannot copy a FIFO pipe: ${x}`)) : I(new Error(`Unknown file: ${x}`)));
  }
  function u(F, x, q, N, I, $) {
    return x ? s(F, q, N, I, $) : m(F, q, N, I, $);
  }
  function s(F, x, q, N, I) {
    if (N.overwrite)
      o.unlink(q, ($) => $ ? I($) : m(F, x, q, N, I));
    else return N.errorOnExist ? I(new Error(`'${q}' already exists`)) : I();
  }
  function m(F, x, q, N, I) {
    o.copyFile(x, q, ($) => $ ? I($) : N.preserveTimestamps ? v(F.mode, x, q, I) : T(q, F.mode, I));
  }
  function v(F, x, q, N) {
    return g(F) ? p(q, F, (I) => I ? N(I) : A(F, x, q, N)) : A(F, x, q, N);
  }
  function g(F) {
    return (F & 128) === 0;
  }
  function p(F, x, q) {
    return T(F, x | 128, q);
  }
  function A(F, x, q, N) {
    O(x, q, (I) => I ? N(I) : T(q, F, N));
  }
  function T(F, x, q) {
    return o.chmod(F, x, q);
  }
  function O(F, x, q) {
    o.stat(F, (N, I) => N ? q(N) : c(x, I.atime, I.mtime, q));
  }
  function D(F, x, q, N, I, $) {
    return x ? b(q, N, I, $) : P(F.mode, q, N, I, $);
  }
  function P(F, x, q, N, I) {
    o.mkdir(q, ($) => {
      if ($) return I($);
      b(x, q, N, (M) => M ? I(M) : T(q, F, I));
    });
  }
  function b(F, x, q, N) {
    o.readdir(F, (I, $) => I ? N(I) : w($, F, x, q, N));
  }
  function w(F, x, q, N, I) {
    const $ = F.pop();
    return $ ? _(F, $, x, q, N, I) : I();
  }
  function _(F, x, q, N, I, $) {
    const M = h.join(q, x), K = h.join(N, x);
    t.checkPaths(M, K, "copy", I, (V, ne) => {
      if (V) return $(V);
      const { destStat: ce } = ne;
      i(ce, M, K, I, (ue) => ue ? $(ue) : w(F, q, N, I, $));
    });
  }
  function E(F, x, q, N, I) {
    o.readlink(x, ($, M) => {
      if ($) return I($);
      if (N.dereference && (M = h.resolve(process.cwd(), M)), F)
        o.readlink(q, (K, V) => K ? K.code === "EINVAL" || K.code === "UNKNOWN" ? o.symlink(M, q, I) : I(K) : (N.dereference && (V = h.resolve(process.cwd(), V)), t.isSrcSubdir(M, V) ? I(new Error(`Cannot copy '${M}' to a subdirectory of itself, '${V}'.`)) : F.isDirectory() && t.isSrcSubdir(V, M) ? I(new Error(`Cannot overwrite '${V}' with '${M}'.`)) : U(M, q, I)));
      else
        return o.symlink(M, q, I);
    });
  }
  function U(F, x, q) {
    o.unlink(x, (N) => N ? q(N) : o.symlink(F, x, q));
  }
  return mn = e, mn;
}
var gn, _a;
function $f() {
  if (_a) return gn;
  _a = 1;
  const o = We(), h = Ce, d = at().mkdirsSync, f = Gu().utimesMillisSync, c = /* @__PURE__ */ Gt();
  function t(w, _, E) {
    typeof E == "function" && (E = { filter: E }), E = E || {}, E.clobber = "clobber" in E ? !!E.clobber : !0, E.overwrite = "overwrite" in E ? !!E.overwrite : E.clobber, E.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0002"
    );
    const { srcStat: U, destStat: F } = c.checkPathsSync(w, _, "copy", E);
    return c.checkParentPathsSync(w, U, _, "copy"), e(F, w, _, E);
  }
  function e(w, _, E, U) {
    if (U.filter && !U.filter(_, E)) return;
    const F = h.dirname(E);
    return o.existsSync(F) || d(F), r(w, _, E, U);
  }
  function n(w, _, E, U) {
    if (!(U.filter && !U.filter(_, E)))
      return r(w, _, E, U);
  }
  function r(w, _, E, U) {
    const x = (U.dereference ? o.statSync : o.lstatSync)(_);
    if (x.isDirectory()) return A(x, w, _, E, U);
    if (x.isFile() || x.isCharacterDevice() || x.isBlockDevice()) return i(x, w, _, E, U);
    if (x.isSymbolicLink()) return P(w, _, E, U);
    throw x.isSocket() ? new Error(`Cannot copy a socket file: ${_}`) : x.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${_}`) : new Error(`Unknown file: ${_}`);
  }
  function i(w, _, E, U, F) {
    return _ ? a(w, E, U, F) : u(w, E, U, F);
  }
  function a(w, _, E, U) {
    if (U.overwrite)
      return o.unlinkSync(E), u(w, _, E, U);
    if (U.errorOnExist)
      throw new Error(`'${E}' already exists`);
  }
  function u(w, _, E, U) {
    return o.copyFileSync(_, E), U.preserveTimestamps && s(w.mode, _, E), g(E, w.mode);
  }
  function s(w, _, E) {
    return m(w) && v(E, w), p(_, E);
  }
  function m(w) {
    return (w & 128) === 0;
  }
  function v(w, _) {
    return g(w, _ | 128);
  }
  function g(w, _) {
    return o.chmodSync(w, _);
  }
  function p(w, _) {
    const E = o.statSync(w);
    return f(_, E.atime, E.mtime);
  }
  function A(w, _, E, U, F) {
    return _ ? O(E, U, F) : T(w.mode, E, U, F);
  }
  function T(w, _, E, U) {
    return o.mkdirSync(E), O(_, E, U), g(E, w);
  }
  function O(w, _, E) {
    o.readdirSync(w).forEach((U) => D(U, w, _, E));
  }
  function D(w, _, E, U) {
    const F = h.join(_, w), x = h.join(E, w), { destStat: q } = c.checkPathsSync(F, x, "copy", U);
    return n(q, F, x, U);
  }
  function P(w, _, E, U) {
    let F = o.readlinkSync(_);
    if (U.dereference && (F = h.resolve(process.cwd(), F)), w) {
      let x;
      try {
        x = o.readlinkSync(E);
      } catch (q) {
        if (q.code === "EINVAL" || q.code === "UNKNOWN") return o.symlinkSync(F, E);
        throw q;
      }
      if (U.dereference && (x = h.resolve(process.cwd(), x)), c.isSrcSubdir(F, x))
        throw new Error(`Cannot copy '${F}' to a subdirectory of itself, '${x}'.`);
      if (o.statSync(E).isDirectory() && c.isSrcSubdir(x, F))
        throw new Error(`Cannot overwrite '${x}' with '${F}'.`);
      return b(F, E);
    } else
      return o.symlinkSync(F, E);
  }
  function b(w, _) {
    return o.unlinkSync(_), o.symlinkSync(w, _);
  }
  return gn = t, gn;
}
var vn, Sa;
function $o() {
  if (Sa) return vn;
  Sa = 1;
  const o = Ye().fromCallback;
  return vn = {
    copy: o(/* @__PURE__ */ Lf()),
    copySync: /* @__PURE__ */ $f()
  }, vn;
}
var yn, Aa;
function Uf() {
  if (Aa) return yn;
  Aa = 1;
  const o = We(), h = Ce, d = qu, f = process.platform === "win32";
  function c(v) {
    [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ].forEach((p) => {
      v[p] = v[p] || o[p], p = p + "Sync", v[p] = v[p] || o[p];
    }), v.maxBusyTries = v.maxBusyTries || 3;
  }
  function t(v, g, p) {
    let A = 0;
    typeof g == "function" && (p = g, g = {}), d(v, "rimraf: missing path"), d.strictEqual(typeof v, "string", "rimraf: path should be a string"), d.strictEqual(typeof p, "function", "rimraf: callback function required"), d(g, "rimraf: invalid options argument provided"), d.strictEqual(typeof g, "object", "rimraf: options should be object"), c(g), e(v, g, function T(O) {
      if (O) {
        if ((O.code === "EBUSY" || O.code === "ENOTEMPTY" || O.code === "EPERM") && A < g.maxBusyTries) {
          A++;
          const D = A * 100;
          return setTimeout(() => e(v, g, T), D);
        }
        O.code === "ENOENT" && (O = null);
      }
      p(O);
    });
  }
  function e(v, g, p) {
    d(v), d(g), d(typeof p == "function"), g.lstat(v, (A, T) => {
      if (A && A.code === "ENOENT")
        return p(null);
      if (A && A.code === "EPERM" && f)
        return n(v, g, A, p);
      if (T && T.isDirectory())
        return i(v, g, A, p);
      g.unlink(v, (O) => {
        if (O) {
          if (O.code === "ENOENT")
            return p(null);
          if (O.code === "EPERM")
            return f ? n(v, g, O, p) : i(v, g, O, p);
          if (O.code === "EISDIR")
            return i(v, g, O, p);
        }
        return p(O);
      });
    });
  }
  function n(v, g, p, A) {
    d(v), d(g), d(typeof A == "function"), g.chmod(v, 438, (T) => {
      T ? A(T.code === "ENOENT" ? null : p) : g.stat(v, (O, D) => {
        O ? A(O.code === "ENOENT" ? null : p) : D.isDirectory() ? i(v, g, p, A) : g.unlink(v, A);
      });
    });
  }
  function r(v, g, p) {
    let A;
    d(v), d(g);
    try {
      g.chmodSync(v, 438);
    } catch (T) {
      if (T.code === "ENOENT")
        return;
      throw p;
    }
    try {
      A = g.statSync(v);
    } catch (T) {
      if (T.code === "ENOENT")
        return;
      throw p;
    }
    A.isDirectory() ? s(v, g, p) : g.unlinkSync(v);
  }
  function i(v, g, p, A) {
    d(v), d(g), d(typeof A == "function"), g.rmdir(v, (T) => {
      T && (T.code === "ENOTEMPTY" || T.code === "EEXIST" || T.code === "EPERM") ? a(v, g, A) : T && T.code === "ENOTDIR" ? A(p) : A(T);
    });
  }
  function a(v, g, p) {
    d(v), d(g), d(typeof p == "function"), g.readdir(v, (A, T) => {
      if (A) return p(A);
      let O = T.length, D;
      if (O === 0) return g.rmdir(v, p);
      T.forEach((P) => {
        t(h.join(v, P), g, (b) => {
          if (!D) {
            if (b) return p(D = b);
            --O === 0 && g.rmdir(v, p);
          }
        });
      });
    });
  }
  function u(v, g) {
    let p;
    g = g || {}, c(g), d(v, "rimraf: missing path"), d.strictEqual(typeof v, "string", "rimraf: path should be a string"), d(g, "rimraf: missing options"), d.strictEqual(typeof g, "object", "rimraf: options should be object");
    try {
      p = g.lstatSync(v);
    } catch (A) {
      if (A.code === "ENOENT")
        return;
      A.code === "EPERM" && f && r(v, g, A);
    }
    try {
      p && p.isDirectory() ? s(v, g, null) : g.unlinkSync(v);
    } catch (A) {
      if (A.code === "ENOENT")
        return;
      if (A.code === "EPERM")
        return f ? r(v, g, A) : s(v, g, A);
      if (A.code !== "EISDIR")
        throw A;
      s(v, g, A);
    }
  }
  function s(v, g, p) {
    d(v), d(g);
    try {
      g.rmdirSync(v);
    } catch (A) {
      if (A.code === "ENOTDIR")
        throw p;
      if (A.code === "ENOTEMPTY" || A.code === "EEXIST" || A.code === "EPERM")
        m(v, g);
      else if (A.code !== "ENOENT")
        throw A;
    }
  }
  function m(v, g) {
    if (d(v), d(g), g.readdirSync(v).forEach((p) => u(h.join(v, p), g)), f) {
      const p = Date.now();
      do
        try {
          return g.rmdirSync(v, g);
        } catch {
        }
      while (Date.now() - p < 500);
    } else
      return g.rmdirSync(v, g);
  }
  return yn = t, t.sync = u, yn;
}
var En, ba;
function zr() {
  if (ba) return En;
  ba = 1;
  const o = We(), h = Ye().fromCallback, d = /* @__PURE__ */ Uf();
  function f(t, e) {
    if (o.rm) return o.rm(t, { recursive: !0, force: !0 }, e);
    d(t, e);
  }
  function c(t) {
    if (o.rmSync) return o.rmSync(t, { recursive: !0, force: !0 });
    d.sync(t);
  }
  return En = {
    remove: h(f),
    removeSync: c
  }, En;
}
var wn, Ra;
function kf() {
  if (Ra) return wn;
  Ra = 1;
  const o = Ye().fromPromise, h = /* @__PURE__ */ Ht(), d = Ce, f = /* @__PURE__ */ at(), c = /* @__PURE__ */ zr(), t = o(async function(r) {
    let i;
    try {
      i = await h.readdir(r);
    } catch {
      return f.mkdirs(r);
    }
    return Promise.all(i.map((a) => c.remove(d.join(r, a))));
  });
  function e(n) {
    let r;
    try {
      r = h.readdirSync(n);
    } catch {
      return f.mkdirsSync(n);
    }
    r.forEach((i) => {
      i = d.join(n, i), c.removeSync(i);
    });
  }
  return wn = {
    emptyDirSync: e,
    emptydirSync: e,
    emptyDir: t,
    emptydir: t
  }, wn;
}
var _n, Ta;
function qf() {
  if (Ta) return _n;
  Ta = 1;
  const o = Ye().fromCallback, h = Ce, d = We(), f = /* @__PURE__ */ at();
  function c(e, n) {
    function r() {
      d.writeFile(e, "", (i) => {
        if (i) return n(i);
        n();
      });
    }
    d.stat(e, (i, a) => {
      if (!i && a.isFile()) return n();
      const u = h.dirname(e);
      d.stat(u, (s, m) => {
        if (s)
          return s.code === "ENOENT" ? f.mkdirs(u, (v) => {
            if (v) return n(v);
            r();
          }) : n(s);
        m.isDirectory() ? r() : d.readdir(u, (v) => {
          if (v) return n(v);
        });
      });
    });
  }
  function t(e) {
    let n;
    try {
      n = d.statSync(e);
    } catch {
    }
    if (n && n.isFile()) return;
    const r = h.dirname(e);
    try {
      d.statSync(r).isDirectory() || d.readdirSync(r);
    } catch (i) {
      if (i && i.code === "ENOENT") f.mkdirsSync(r);
      else throw i;
    }
    d.writeFileSync(e, "");
  }
  return _n = {
    createFile: o(c),
    createFileSync: t
  }, _n;
}
var Sn, Ca;
function Mf() {
  if (Ca) return Sn;
  Ca = 1;
  const o = Ye().fromCallback, h = Ce, d = We(), f = /* @__PURE__ */ at(), c = It().pathExists, { areIdentical: t } = /* @__PURE__ */ Gt();
  function e(r, i, a) {
    function u(s, m) {
      d.link(s, m, (v) => {
        if (v) return a(v);
        a(null);
      });
    }
    d.lstat(i, (s, m) => {
      d.lstat(r, (v, g) => {
        if (v)
          return v.message = v.message.replace("lstat", "ensureLink"), a(v);
        if (m && t(g, m)) return a(null);
        const p = h.dirname(i);
        c(p, (A, T) => {
          if (A) return a(A);
          if (T) return u(r, i);
          f.mkdirs(p, (O) => {
            if (O) return a(O);
            u(r, i);
          });
        });
      });
    });
  }
  function n(r, i) {
    let a;
    try {
      a = d.lstatSync(i);
    } catch {
    }
    try {
      const m = d.lstatSync(r);
      if (a && t(m, a)) return;
    } catch (m) {
      throw m.message = m.message.replace("lstat", "ensureLink"), m;
    }
    const u = h.dirname(i);
    return d.existsSync(u) || f.mkdirsSync(u), d.linkSync(r, i);
  }
  return Sn = {
    createLink: o(e),
    createLinkSync: n
  }, Sn;
}
var An, Oa;
function Bf() {
  if (Oa) return An;
  Oa = 1;
  const o = Ce, h = We(), d = It().pathExists;
  function f(t, e, n) {
    if (o.isAbsolute(t))
      return h.lstat(t, (r) => r ? (r.message = r.message.replace("lstat", "ensureSymlink"), n(r)) : n(null, {
        toCwd: t,
        toDst: t
      }));
    {
      const r = o.dirname(e), i = o.join(r, t);
      return d(i, (a, u) => a ? n(a) : u ? n(null, {
        toCwd: i,
        toDst: t
      }) : h.lstat(t, (s) => s ? (s.message = s.message.replace("lstat", "ensureSymlink"), n(s)) : n(null, {
        toCwd: t,
        toDst: o.relative(r, t)
      })));
    }
  }
  function c(t, e) {
    let n;
    if (o.isAbsolute(t)) {
      if (n = h.existsSync(t), !n) throw new Error("absolute srcpath does not exist");
      return {
        toCwd: t,
        toDst: t
      };
    } else {
      const r = o.dirname(e), i = o.join(r, t);
      if (n = h.existsSync(i), n)
        return {
          toCwd: i,
          toDst: t
        };
      if (n = h.existsSync(t), !n) throw new Error("relative srcpath does not exist");
      return {
        toCwd: t,
        toDst: o.relative(r, t)
      };
    }
  }
  return An = {
    symlinkPaths: f,
    symlinkPathsSync: c
  }, An;
}
var bn, Da;
function jf() {
  if (Da) return bn;
  Da = 1;
  const o = We();
  function h(f, c, t) {
    if (t = typeof c == "function" ? c : t, c = typeof c == "function" ? !1 : c, c) return t(null, c);
    o.lstat(f, (e, n) => {
      if (e) return t(null, "file");
      c = n && n.isDirectory() ? "dir" : "file", t(null, c);
    });
  }
  function d(f, c) {
    let t;
    if (c) return c;
    try {
      t = o.lstatSync(f);
    } catch {
      return "file";
    }
    return t && t.isDirectory() ? "dir" : "file";
  }
  return bn = {
    symlinkType: h,
    symlinkTypeSync: d
  }, bn;
}
var Rn, Pa;
function Hf() {
  if (Pa) return Rn;
  Pa = 1;
  const o = Ye().fromCallback, h = Ce, d = /* @__PURE__ */ Ht(), f = /* @__PURE__ */ at(), c = f.mkdirs, t = f.mkdirsSync, e = /* @__PURE__ */ Bf(), n = e.symlinkPaths, r = e.symlinkPathsSync, i = /* @__PURE__ */ jf(), a = i.symlinkType, u = i.symlinkTypeSync, s = It().pathExists, { areIdentical: m } = /* @__PURE__ */ Gt();
  function v(A, T, O, D) {
    D = typeof O == "function" ? O : D, O = typeof O == "function" ? !1 : O, d.lstat(T, (P, b) => {
      !P && b.isSymbolicLink() ? Promise.all([
        d.stat(A),
        d.stat(T)
      ]).then(([w, _]) => {
        if (m(w, _)) return D(null);
        g(A, T, O, D);
      }) : g(A, T, O, D);
    });
  }
  function g(A, T, O, D) {
    n(A, T, (P, b) => {
      if (P) return D(P);
      A = b.toDst, a(b.toCwd, O, (w, _) => {
        if (w) return D(w);
        const E = h.dirname(T);
        s(E, (U, F) => {
          if (U) return D(U);
          if (F) return d.symlink(A, T, _, D);
          c(E, (x) => {
            if (x) return D(x);
            d.symlink(A, T, _, D);
          });
        });
      });
    });
  }
  function p(A, T, O) {
    let D;
    try {
      D = d.lstatSync(T);
    } catch {
    }
    if (D && D.isSymbolicLink()) {
      const _ = d.statSync(A), E = d.statSync(T);
      if (m(_, E)) return;
    }
    const P = r(A, T);
    A = P.toDst, O = u(P.toCwd, O);
    const b = h.dirname(T);
    return d.existsSync(b) || t(b), d.symlinkSync(A, T, O);
  }
  return Rn = {
    createSymlink: o(v),
    createSymlinkSync: p
  }, Rn;
}
var Tn, Ia;
function Gf() {
  if (Ia) return Tn;
  Ia = 1;
  const { createFile: o, createFileSync: h } = /* @__PURE__ */ qf(), { createLink: d, createLinkSync: f } = /* @__PURE__ */ Mf(), { createSymlink: c, createSymlinkSync: t } = /* @__PURE__ */ Hf();
  return Tn = {
    // file
    createFile: o,
    createFileSync: h,
    ensureFile: o,
    ensureFileSync: h,
    // link
    createLink: d,
    createLinkSync: f,
    ensureLink: d,
    ensureLinkSync: f,
    // symlink
    createSymlink: c,
    createSymlinkSync: t,
    ensureSymlink: c,
    ensureSymlinkSync: t
  }, Tn;
}
var Cn, Na;
function Uo() {
  if (Na) return Cn;
  Na = 1;
  function o(d, { EOL: f = `
`, finalEOL: c = !0, replacer: t = null, spaces: e } = {}) {
    const n = c ? f : "";
    return JSON.stringify(d, t, e).replace(/\n/g, f) + n;
  }
  function h(d) {
    return Buffer.isBuffer(d) && (d = d.toString("utf8")), d.replace(/^\uFEFF/, "");
  }
  return Cn = { stringify: o, stripBom: h }, Cn;
}
var On, Fa;
function Vf() {
  if (Fa) return On;
  Fa = 1;
  let o;
  try {
    o = We();
  } catch {
    o = Ve;
  }
  const h = Ye(), { stringify: d, stripBom: f } = Uo();
  async function c(u, s = {}) {
    typeof s == "string" && (s = { encoding: s });
    const m = s.fs || o, v = "throws" in s ? s.throws : !0;
    let g = await h.fromCallback(m.readFile)(u, s);
    g = f(g);
    let p;
    try {
      p = JSON.parse(g, s ? s.reviver : null);
    } catch (A) {
      if (v)
        throw A.message = `${u}: ${A.message}`, A;
      return null;
    }
    return p;
  }
  const t = h.fromPromise(c);
  function e(u, s = {}) {
    typeof s == "string" && (s = { encoding: s });
    const m = s.fs || o, v = "throws" in s ? s.throws : !0;
    try {
      let g = m.readFileSync(u, s);
      return g = f(g), JSON.parse(g, s.reviver);
    } catch (g) {
      if (v)
        throw g.message = `${u}: ${g.message}`, g;
      return null;
    }
  }
  async function n(u, s, m = {}) {
    const v = m.fs || o, g = d(s, m);
    await h.fromCallback(v.writeFile)(u, g, m);
  }
  const r = h.fromPromise(n);
  function i(u, s, m = {}) {
    const v = m.fs || o, g = d(s, m);
    return v.writeFileSync(u, g, m);
  }
  return On = {
    readFile: t,
    readFileSync: e,
    writeFile: r,
    writeFileSync: i
  }, On;
}
var Dn, xa;
function Wf() {
  if (xa) return Dn;
  xa = 1;
  const o = Vf();
  return Dn = {
    // jsonfile exports
    readJson: o.readFile,
    readJsonSync: o.readFileSync,
    writeJson: o.writeFile,
    writeJsonSync: o.writeFileSync
  }, Dn;
}
var Pn, La;
function ko() {
  if (La) return Pn;
  La = 1;
  const o = Ye().fromCallback, h = We(), d = Ce, f = /* @__PURE__ */ at(), c = It().pathExists;
  function t(n, r, i, a) {
    typeof i == "function" && (a = i, i = "utf8");
    const u = d.dirname(n);
    c(u, (s, m) => {
      if (s) return a(s);
      if (m) return h.writeFile(n, r, i, a);
      f.mkdirs(u, (v) => {
        if (v) return a(v);
        h.writeFile(n, r, i, a);
      });
    });
  }
  function e(n, ...r) {
    const i = d.dirname(n);
    if (h.existsSync(i))
      return h.writeFileSync(n, ...r);
    f.mkdirsSync(i), h.writeFileSync(n, ...r);
  }
  return Pn = {
    outputFile: o(t),
    outputFileSync: e
  }, Pn;
}
var In, $a;
function zf() {
  if ($a) return In;
  $a = 1;
  const { stringify: o } = Uo(), { outputFile: h } = /* @__PURE__ */ ko();
  async function d(f, c, t = {}) {
    const e = o(c, t);
    await h(f, e, t);
  }
  return In = d, In;
}
var Nn, Ua;
function Yf() {
  if (Ua) return Nn;
  Ua = 1;
  const { stringify: o } = Uo(), { outputFileSync: h } = /* @__PURE__ */ ko();
  function d(f, c, t) {
    const e = o(c, t);
    h(f, e, t);
  }
  return Nn = d, Nn;
}
var Fn, ka;
function Xf() {
  if (ka) return Fn;
  ka = 1;
  const o = Ye().fromPromise, h = /* @__PURE__ */ Wf();
  return h.outputJson = o(/* @__PURE__ */ zf()), h.outputJsonSync = /* @__PURE__ */ Yf(), h.outputJSON = h.outputJson, h.outputJSONSync = h.outputJsonSync, h.writeJSON = h.writeJson, h.writeJSONSync = h.writeJsonSync, h.readJSON = h.readJson, h.readJSONSync = h.readJsonSync, Fn = h, Fn;
}
var xn, qa;
function Jf() {
  if (qa) return xn;
  qa = 1;
  const o = We(), h = Ce, d = $o().copy, f = zr().remove, c = at().mkdirp, t = It().pathExists, e = /* @__PURE__ */ Gt();
  function n(s, m, v, g) {
    typeof v == "function" && (g = v, v = {}), v = v || {};
    const p = v.overwrite || v.clobber || !1;
    e.checkPaths(s, m, "move", v, (A, T) => {
      if (A) return g(A);
      const { srcStat: O, isChangingCase: D = !1 } = T;
      e.checkParentPaths(s, O, m, "move", (P) => {
        if (P) return g(P);
        if (r(m)) return i(s, m, p, D, g);
        c(h.dirname(m), (b) => b ? g(b) : i(s, m, p, D, g));
      });
    });
  }
  function r(s) {
    const m = h.dirname(s);
    return h.parse(m).root === m;
  }
  function i(s, m, v, g, p) {
    if (g) return a(s, m, v, p);
    if (v)
      return f(m, (A) => A ? p(A) : a(s, m, v, p));
    t(m, (A, T) => A ? p(A) : T ? p(new Error("dest already exists.")) : a(s, m, v, p));
  }
  function a(s, m, v, g) {
    o.rename(s, m, (p) => p ? p.code !== "EXDEV" ? g(p) : u(s, m, v, g) : g());
  }
  function u(s, m, v, g) {
    d(s, m, {
      overwrite: v,
      errorOnExist: !0
    }, (A) => A ? g(A) : f(s, g));
  }
  return xn = n, xn;
}
var Ln, Ma;
function Kf() {
  if (Ma) return Ln;
  Ma = 1;
  const o = We(), h = Ce, d = $o().copySync, f = zr().removeSync, c = at().mkdirpSync, t = /* @__PURE__ */ Gt();
  function e(u, s, m) {
    m = m || {};
    const v = m.overwrite || m.clobber || !1, { srcStat: g, isChangingCase: p = !1 } = t.checkPathsSync(u, s, "move", m);
    return t.checkParentPathsSync(u, g, s, "move"), n(s) || c(h.dirname(s)), r(u, s, v, p);
  }
  function n(u) {
    const s = h.dirname(u);
    return h.parse(s).root === s;
  }
  function r(u, s, m, v) {
    if (v) return i(u, s, m);
    if (m)
      return f(s), i(u, s, m);
    if (o.existsSync(s)) throw new Error("dest already exists.");
    return i(u, s, m);
  }
  function i(u, s, m) {
    try {
      o.renameSync(u, s);
    } catch (v) {
      if (v.code !== "EXDEV") throw v;
      return a(u, s, m);
    }
  }
  function a(u, s, m) {
    return d(u, s, {
      overwrite: m,
      errorOnExist: !0
    }), f(u);
  }
  return Ln = e, Ln;
}
var $n, Ba;
function Qf() {
  if (Ba) return $n;
  Ba = 1;
  const o = Ye().fromCallback;
  return $n = {
    move: o(/* @__PURE__ */ Jf()),
    moveSync: /* @__PURE__ */ Kf()
  }, $n;
}
var Un, ja;
function Et() {
  return ja || (ja = 1, Un = {
    // Export promiseified graceful-fs:
    .../* @__PURE__ */ Ht(),
    // Export extra methods:
    .../* @__PURE__ */ $o(),
    .../* @__PURE__ */ kf(),
    .../* @__PURE__ */ Gf(),
    .../* @__PURE__ */ Xf(),
    .../* @__PURE__ */ at(),
    .../* @__PURE__ */ Qf(),
    .../* @__PURE__ */ ko(),
    .../* @__PURE__ */ It(),
    .../* @__PURE__ */ zr()
  }), Un;
}
var Xt = {}, Ct = {}, kn = {}, Ot = {}, Ha;
function qo() {
  if (Ha) return Ot;
  Ha = 1, Object.defineProperty(Ot, "__esModule", { value: !0 }), Ot.CancellationError = Ot.CancellationToken = void 0;
  const o = Wr;
  let h = class extends o.EventEmitter {
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
        return Promise.reject(new d());
      const t = () => {
        if (e != null)
          try {
            this.removeListener("cancel", e), e = null;
          } catch {
          }
      };
      let e = null;
      return new Promise((n, r) => {
        let i = null;
        if (e = () => {
          try {
            i != null && (i(), i = null);
          } finally {
            r(new d());
          }
        }, this.cancelled) {
          e();
          return;
        }
        this.onCancel(e), c(n, r, (a) => {
          i = a;
        });
      }).then((n) => (t(), n)).catch((n) => {
        throw t(), n;
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
  Ot.CancellationToken = h;
  class d extends Error {
    constructor() {
      super("cancelled");
    }
  }
  return Ot.CancellationError = d, Ot;
}
var Lr = {}, Ga;
function Yr() {
  if (Ga) return Lr;
  Ga = 1, Object.defineProperty(Lr, "__esModule", { value: !0 }), Lr.newError = o;
  function o(h, d) {
    const f = new Error(h);
    return f.code = d, f;
  }
  return Lr;
}
var Be = {}, $r = { exports: {} }, Ur = { exports: {} }, qn, Va;
function Zf() {
  if (Va) return qn;
  Va = 1;
  var o = 1e3, h = o * 60, d = h * 60, f = d * 24, c = f * 7, t = f * 365.25;
  qn = function(a, u) {
    u = u || {};
    var s = typeof a;
    if (s === "string" && a.length > 0)
      return e(a);
    if (s === "number" && isFinite(a))
      return u.long ? r(a) : n(a);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(a)
    );
  };
  function e(a) {
    if (a = String(a), !(a.length > 100)) {
      var u = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        a
      );
      if (u) {
        var s = parseFloat(u[1]), m = (u[2] || "ms").toLowerCase();
        switch (m) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return s * t;
          case "weeks":
          case "week":
          case "w":
            return s * c;
          case "days":
          case "day":
          case "d":
            return s * f;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return s * d;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return s * h;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return s * o;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return s;
          default:
            return;
        }
      }
    }
  }
  function n(a) {
    var u = Math.abs(a);
    return u >= f ? Math.round(a / f) + "d" : u >= d ? Math.round(a / d) + "h" : u >= h ? Math.round(a / h) + "m" : u >= o ? Math.round(a / o) + "s" : a + "ms";
  }
  function r(a) {
    var u = Math.abs(a);
    return u >= f ? i(a, u, f, "day") : u >= d ? i(a, u, d, "hour") : u >= h ? i(a, u, h, "minute") : u >= o ? i(a, u, o, "second") : a + " ms";
  }
  function i(a, u, s, m) {
    var v = u >= s * 1.5;
    return Math.round(a / s) + " " + m + (v ? "s" : "");
  }
  return qn;
}
var Mn, Wa;
function Vu() {
  if (Wa) return Mn;
  Wa = 1;
  function o(h) {
    f.debug = f, f.default = f, f.coerce = i, f.disable = n, f.enable = t, f.enabled = r, f.humanize = Zf(), f.destroy = a, Object.keys(h).forEach((u) => {
      f[u] = h[u];
    }), f.names = [], f.skips = [], f.formatters = {};
    function d(u) {
      let s = 0;
      for (let m = 0; m < u.length; m++)
        s = (s << 5) - s + u.charCodeAt(m), s |= 0;
      return f.colors[Math.abs(s) % f.colors.length];
    }
    f.selectColor = d;
    function f(u) {
      let s, m = null, v, g;
      function p(...A) {
        if (!p.enabled)
          return;
        const T = p, O = Number(/* @__PURE__ */ new Date()), D = O - (s || O);
        T.diff = D, T.prev = s, T.curr = O, s = O, A[0] = f.coerce(A[0]), typeof A[0] != "string" && A.unshift("%O");
        let P = 0;
        A[0] = A[0].replace(/%([a-zA-Z%])/g, (w, _) => {
          if (w === "%%")
            return "%";
          P++;
          const E = f.formatters[_];
          if (typeof E == "function") {
            const U = A[P];
            w = E.call(T, U), A.splice(P, 1), P--;
          }
          return w;
        }), f.formatArgs.call(T, A), (T.log || f.log).apply(T, A);
      }
      return p.namespace = u, p.useColors = f.useColors(), p.color = f.selectColor(u), p.extend = c, p.destroy = f.destroy, Object.defineProperty(p, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => m !== null ? m : (v !== f.namespaces && (v = f.namespaces, g = f.enabled(u)), g),
        set: (A) => {
          m = A;
        }
      }), typeof f.init == "function" && f.init(p), p;
    }
    function c(u, s) {
      const m = f(this.namespace + (typeof s > "u" ? ":" : s) + u);
      return m.log = this.log, m;
    }
    function t(u) {
      f.save(u), f.namespaces = u, f.names = [], f.skips = [];
      const s = (typeof u == "string" ? u : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const m of s)
        m[0] === "-" ? f.skips.push(m.slice(1)) : f.names.push(m);
    }
    function e(u, s) {
      let m = 0, v = 0, g = -1, p = 0;
      for (; m < u.length; )
        if (v < s.length && (s[v] === u[m] || s[v] === "*"))
          s[v] === "*" ? (g = v, p = m, v++) : (m++, v++);
        else if (g !== -1)
          v = g + 1, p++, m = p;
        else
          return !1;
      for (; v < s.length && s[v] === "*"; )
        v++;
      return v === s.length;
    }
    function n() {
      const u = [
        ...f.names,
        ...f.skips.map((s) => "-" + s)
      ].join(",");
      return f.enable(""), u;
    }
    function r(u) {
      for (const s of f.skips)
        if (e(u, s))
          return !1;
      for (const s of f.names)
        if (e(u, s))
          return !0;
      return !1;
    }
    function i(u) {
      return u instanceof Error ? u.stack || u.message : u;
    }
    function a() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return f.enable(f.load()), f;
  }
  return Mn = o, Mn;
}
var za;
function ed() {
  return za || (za = 1, function(o, h) {
    h.formatArgs = f, h.save = c, h.load = t, h.useColors = d, h.storage = e(), h.destroy = /* @__PURE__ */ (() => {
      let r = !1;
      return () => {
        r || (r = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), h.colors = [
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
    function d() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let r;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (r = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(r[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function f(r) {
      if (r[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + r[0] + (this.useColors ? "%c " : " ") + "+" + o.exports.humanize(this.diff), !this.useColors)
        return;
      const i = "color: " + this.color;
      r.splice(1, 0, i, "color: inherit");
      let a = 0, u = 0;
      r[0].replace(/%[a-zA-Z%]/g, (s) => {
        s !== "%%" && (a++, s === "%c" && (u = a));
      }), r.splice(u, 0, i);
    }
    h.log = console.debug || console.log || (() => {
    });
    function c(r) {
      try {
        r ? h.storage.setItem("debug", r) : h.storage.removeItem("debug");
      } catch {
      }
    }
    function t() {
      let r;
      try {
        r = h.storage.getItem("debug") || h.storage.getItem("DEBUG");
      } catch {
      }
      return !r && typeof process < "u" && "env" in process && (r = process.env.DEBUG), r;
    }
    function e() {
      try {
        return localStorage;
      } catch {
      }
    }
    o.exports = Vu()(h);
    const { formatters: n } = o.exports;
    n.j = function(r) {
      try {
        return JSON.stringify(r);
      } catch (i) {
        return "[UnexpectedJSONParseError]: " + i.message;
      }
    };
  }(Ur, Ur.exports)), Ur.exports;
}
var kr = { exports: {} }, Bn, Ya;
function td() {
  return Ya || (Ya = 1, Bn = (o, h = process.argv) => {
    const d = o.startsWith("-") ? "" : o.length === 1 ? "-" : "--", f = h.indexOf(d + o), c = h.indexOf("--");
    return f !== -1 && (c === -1 || f < c);
  }), Bn;
}
var jn, Xa;
function rd() {
  if (Xa) return jn;
  Xa = 1;
  const o = dt, h = Mu, d = td(), { env: f } = process;
  let c;
  d("no-color") || d("no-colors") || d("color=false") || d("color=never") ? c = 0 : (d("color") || d("colors") || d("color=true") || d("color=always")) && (c = 1), "FORCE_COLOR" in f && (f.FORCE_COLOR === "true" ? c = 1 : f.FORCE_COLOR === "false" ? c = 0 : c = f.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(f.FORCE_COLOR, 10), 3));
  function t(r) {
    return r === 0 ? !1 : {
      level: r,
      hasBasic: !0,
      has256: r >= 2,
      has16m: r >= 3
    };
  }
  function e(r, i) {
    if (c === 0)
      return 0;
    if (d("color=16m") || d("color=full") || d("color=truecolor"))
      return 3;
    if (d("color=256"))
      return 2;
    if (r && !i && c === void 0)
      return 0;
    const a = c || 0;
    if (f.TERM === "dumb")
      return a;
    if (process.platform === "win32") {
      const u = o.release().split(".");
      return Number(u[0]) >= 10 && Number(u[2]) >= 10586 ? Number(u[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in f)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((u) => u in f) || f.CI_NAME === "codeship" ? 1 : a;
    if ("TEAMCITY_VERSION" in f)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(f.TEAMCITY_VERSION) ? 1 : 0;
    if (f.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in f) {
      const u = parseInt((f.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (f.TERM_PROGRAM) {
        case "iTerm.app":
          return u >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(f.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(f.TERM) || "COLORTERM" in f ? 1 : a;
  }
  function n(r) {
    const i = e(r, r && r.isTTY);
    return t(i);
  }
  return jn = {
    supportsColor: n,
    stdout: t(e(!0, h.isatty(1))),
    stderr: t(e(!0, h.isatty(2)))
  }, jn;
}
var Ja;
function nd() {
  return Ja || (Ja = 1, function(o, h) {
    const d = Mu, f = Vr;
    h.init = a, h.log = n, h.formatArgs = t, h.save = r, h.load = i, h.useColors = c, h.destroy = f.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), h.colors = [6, 2, 3, 4, 5, 1];
    try {
      const s = rd();
      s && (s.stderr || s).level >= 2 && (h.colors = [
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
    h.inspectOpts = Object.keys(process.env).filter((s) => /^debug_/i.test(s)).reduce((s, m) => {
      const v = m.substring(6).toLowerCase().replace(/_([a-z])/g, (p, A) => A.toUpperCase());
      let g = process.env[m];
      return /^(yes|on|true|enabled)$/i.test(g) ? g = !0 : /^(no|off|false|disabled)$/i.test(g) ? g = !1 : g === "null" ? g = null : g = Number(g), s[v] = g, s;
    }, {});
    function c() {
      return "colors" in h.inspectOpts ? !!h.inspectOpts.colors : d.isatty(process.stderr.fd);
    }
    function t(s) {
      const { namespace: m, useColors: v } = this;
      if (v) {
        const g = this.color, p = "\x1B[3" + (g < 8 ? g : "8;5;" + g), A = `  ${p};1m${m} \x1B[0m`;
        s[0] = A + s[0].split(`
`).join(`
` + A), s.push(p + "m+" + o.exports.humanize(this.diff) + "\x1B[0m");
      } else
        s[0] = e() + m + " " + s[0];
    }
    function e() {
      return h.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function n(...s) {
      return process.stderr.write(f.formatWithOptions(h.inspectOpts, ...s) + `
`);
    }
    function r(s) {
      s ? process.env.DEBUG = s : delete process.env.DEBUG;
    }
    function i() {
      return process.env.DEBUG;
    }
    function a(s) {
      s.inspectOpts = {};
      const m = Object.keys(h.inspectOpts);
      for (let v = 0; v < m.length; v++)
        s.inspectOpts[m[v]] = h.inspectOpts[m[v]];
    }
    o.exports = Vu()(h);
    const { formatters: u } = o.exports;
    u.o = function(s) {
      return this.inspectOpts.colors = this.useColors, f.inspect(s, this.inspectOpts).split(`
`).map((m) => m.trim()).join(" ");
    }, u.O = function(s) {
      return this.inspectOpts.colors = this.useColors, f.inspect(s, this.inspectOpts);
    };
  }(kr, kr.exports)), kr.exports;
}
var Ka;
function id() {
  return Ka || (Ka = 1, typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? $r.exports = ed() : $r.exports = nd()), $r.exports;
}
var Jt = {}, Qa;
function Wu() {
  if (Qa) return Jt;
  Qa = 1, Object.defineProperty(Jt, "__esModule", { value: !0 }), Jt.ProgressCallbackTransform = void 0;
  const o = _r;
  let h = class extends o.Transform {
    constructor(f, c, t) {
      super(), this.total = f, this.cancellationToken = c, this.onProgress = t, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
    }
    _transform(f, c, t) {
      if (this.cancellationToken.cancelled) {
        t(new Error("cancelled"), null);
        return;
      }
      this.transferred += f.length, this.delta += f.length;
      const e = Date.now();
      e >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = e + 1e3, this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.total * 100,
        bytesPerSecond: Math.round(this.transferred / ((e - this.start) / 1e3))
      }), this.delta = 0), t(null, f);
    }
    _flush(f) {
      if (this.cancellationToken.cancelled) {
        f(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.total,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, f(null);
    }
  };
  return Jt.ProgressCallbackTransform = h, Jt;
}
var Za;
function od() {
  if (Za) return Be;
  Za = 1, Object.defineProperty(Be, "__esModule", { value: !0 }), Be.DigestTransform = Be.HttpExecutor = Be.HttpError = void 0, Be.createHttpError = i, Be.parseJson = s, Be.configureRequestOptionsFromUrl = v, Be.configureRequestUrl = g, Be.safeGetHeader = T, Be.configureRequestOptions = D, Be.safeStringifyJson = P;
  const o = Bt, h = id(), d = Ve, f = _r, c = jt, t = qo(), e = Yr(), n = Wu(), r = (0, h.default)("electron-builder");
  function i(b, w = null) {
    return new u(b.statusCode || -1, `${b.statusCode} ${b.statusMessage}` + (w == null ? "" : `
` + JSON.stringify(w, null, "  ")) + `
Headers: ` + P(b.headers), w);
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
  class u extends Error {
    constructor(w, _ = `HTTP error: ${a.get(w) || w}`, E = null) {
      super(_), this.statusCode = w, this.description = E, this.name = "HttpError", this.code = `HTTP_ERROR_${w}`;
    }
    isServerError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
  }
  Be.HttpError = u;
  function s(b) {
    return b.then((w) => w == null || w.length === 0 ? null : JSON.parse(w));
  }
  class m {
    constructor() {
      this.maxRedirects = 10;
    }
    request(w, _ = new t.CancellationToken(), E) {
      D(w);
      const U = E == null ? void 0 : JSON.stringify(E), F = U ? Buffer.from(U) : void 0;
      if (F != null) {
        r(U);
        const { headers: x, ...q } = w;
        w = {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": F.length,
            ...x
          },
          ...q
        };
      }
      return this.doApiRequest(w, _, (x) => x.end(F));
    }
    doApiRequest(w, _, E, U = 0) {
      return r.enabled && r(`Request: ${P(w)}`), _.createPromise((F, x, q) => {
        const N = this.createRequest(w, (I) => {
          try {
            this.handleResponse(I, w, _, F, x, U, E);
          } catch ($) {
            x($);
          }
        });
        this.addErrorAndTimeoutHandlers(N, x, w.timeout), this.addRedirectHandlers(N, w, x, U, (I) => {
          this.doApiRequest(I, _, E, U).then(F).catch(x);
        }), E(N, x), q(() => N.abort());
      });
    }
    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    addRedirectHandlers(w, _, E, U, F) {
    }
    addErrorAndTimeoutHandlers(w, _, E = 60 * 1e3) {
      this.addTimeOutHandler(w, _, E), w.on("error", _), w.on("aborted", () => {
        _(new Error("Request has been aborted by the server"));
      });
    }
    handleResponse(w, _, E, U, F, x, q) {
      var N;
      if (r.enabled && r(`Response: ${w.statusCode} ${w.statusMessage}, request options: ${P(_)}`), w.statusCode === 404) {
        F(i(w, `method: ${_.method || "GET"} url: ${_.protocol || "https:"}//${_.hostname}${_.port ? `:${_.port}` : ""}${_.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
        return;
      } else if (w.statusCode === 204) {
        U();
        return;
      }
      const I = (N = w.statusCode) !== null && N !== void 0 ? N : 0, $ = I >= 300 && I < 400, M = T(w, "location");
      if ($ && M != null) {
        if (x > this.maxRedirects) {
          F(this.createMaxRedirectError());
          return;
        }
        this.doApiRequest(m.prepareRedirectUrlOptions(M, _), E, q, x).then(U).catch(F);
        return;
      }
      w.setEncoding("utf8");
      let K = "";
      w.on("error", F), w.on("data", (V) => K += V), w.on("end", () => {
        try {
          if (w.statusCode != null && w.statusCode >= 400) {
            const V = T(w, "content-type"), ne = V != null && (Array.isArray(V) ? V.find((ce) => ce.includes("json")) != null : V.includes("json"));
            F(i(w, `method: ${_.method || "GET"} url: ${_.protocol || "https:"}//${_.hostname}${_.port ? `:${_.port}` : ""}${_.path}

          Data:
          ${ne ? JSON.stringify(JSON.parse(K)) : K}
          `));
          } else
            U(K.length === 0 ? null : K);
        } catch (V) {
          F(V);
        }
      });
    }
    async downloadToBuffer(w, _) {
      return await _.cancellationToken.createPromise((E, U, F) => {
        const x = [], q = {
          headers: _.headers || void 0,
          // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
          redirect: "manual"
        };
        g(w, q), D(q), this.doDownload(q, {
          destination: null,
          options: _,
          onCancel: F,
          callback: (N) => {
            N == null ? E(Buffer.concat(x)) : U(N);
          },
          responseHandler: (N, I) => {
            let $ = 0;
            N.on("data", (M) => {
              if ($ += M.length, $ > 524288e3) {
                I(new Error("Maximum allowed size is 500 MB"));
                return;
              }
              x.push(M);
            }), N.on("end", () => {
              I(null);
            });
          }
        }, 0);
      });
    }
    doDownload(w, _, E) {
      const U = this.createRequest(w, (F) => {
        if (F.statusCode >= 400) {
          _.callback(new Error(`Cannot download "${w.protocol || "https:"}//${w.hostname}${w.path}", status ${F.statusCode}: ${F.statusMessage}`));
          return;
        }
        F.on("error", _.callback);
        const x = T(F, "location");
        if (x != null) {
          E < this.maxRedirects ? this.doDownload(m.prepareRedirectUrlOptions(x, w), _, E++) : _.callback(this.createMaxRedirectError());
          return;
        }
        _.responseHandler == null ? O(_, F) : _.responseHandler(F, _.callback);
      });
      this.addErrorAndTimeoutHandlers(U, _.callback, w.timeout), this.addRedirectHandlers(U, w, _.callback, E, (F) => {
        this.doDownload(F, _, E++);
      }), U.end();
    }
    createMaxRedirectError() {
      return new Error(`Too many redirects (> ${this.maxRedirects})`);
    }
    addTimeOutHandler(w, _, E) {
      w.on("socket", (U) => {
        U.setTimeout(E, () => {
          w.abort(), _(new Error("Request timed out"));
        });
      });
    }
    static prepareRedirectUrlOptions(w, _) {
      const E = v(w, { ..._ }), U = E.headers;
      if (U != null && U.authorization) {
        const F = new c.URL(w);
        (F.hostname.endsWith(".amazonaws.com") || F.searchParams.has("X-Amz-Credential")) && delete U.authorization;
      }
      return E;
    }
    static retryOnServerError(w, _ = 3) {
      for (let E = 0; ; E++)
        try {
          return w();
        } catch (U) {
          if (E < _ && (U instanceof u && U.isServerError() || U.code === "EPIPE"))
            continue;
          throw U;
        }
    }
  }
  Be.HttpExecutor = m;
  function v(b, w) {
    const _ = D(w);
    return g(new c.URL(b), _), _;
  }
  function g(b, w) {
    w.protocol = b.protocol, w.hostname = b.hostname, b.port ? w.port = b.port : w.port && delete w.port, w.path = b.pathname + b.search;
  }
  class p extends f.Transform {
    // noinspection JSUnusedGlobalSymbols
    get actual() {
      return this._actual;
    }
    constructor(w, _ = "sha512", E = "base64") {
      super(), this.expected = w, this.algorithm = _, this.encoding = E, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, o.createHash)(_);
    }
    // noinspection JSUnusedGlobalSymbols
    _transform(w, _, E) {
      this.digester.update(w), E(null, w);
    }
    // noinspection JSUnusedGlobalSymbols
    _flush(w) {
      if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
        try {
          this.validate();
        } catch (_) {
          w(_);
          return;
        }
      w(null);
    }
    validate() {
      if (this._actual == null)
        throw (0, e.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
      if (this._actual !== this.expected)
        throw (0, e.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
      return null;
    }
  }
  Be.DigestTransform = p;
  function A(b, w, _) {
    return b != null && w != null && b !== w ? (_(new Error(`checksum mismatch: expected ${w} but got ${b} (X-Checksum-Sha2 header)`)), !1) : !0;
  }
  function T(b, w) {
    const _ = b.headers[w];
    return _ == null ? null : Array.isArray(_) ? _.length === 0 ? null : _[_.length - 1] : _;
  }
  function O(b, w) {
    if (!A(T(w, "X-Checksum-Sha2"), b.options.sha2, b.callback))
      return;
    const _ = [];
    if (b.options.onProgress != null) {
      const x = T(w, "content-length");
      x != null && _.push(new n.ProgressCallbackTransform(parseInt(x, 10), b.options.cancellationToken, b.options.onProgress));
    }
    const E = b.options.sha512;
    E != null ? _.push(new p(E, "sha512", E.length === 128 && !E.includes("+") && !E.includes("Z") && !E.includes("=") ? "hex" : "base64")) : b.options.sha2 != null && _.push(new p(b.options.sha2, "sha256", "hex"));
    const U = (0, d.createWriteStream)(b.destination);
    _.push(U);
    let F = w;
    for (const x of _)
      x.on("error", (q) => {
        U.close(), b.options.cancellationToken.cancelled || b.callback(q);
      }), F = F.pipe(x);
    U.on("finish", () => {
      U.close(b.callback);
    });
  }
  function D(b, w, _) {
    _ != null && (b.method = _), b.headers = { ...b.headers };
    const E = b.headers;
    return w != null && (E.authorization = w.startsWith("Basic") || w.startsWith("Bearer") ? w : `token ${w}`), E["User-Agent"] == null && (E["User-Agent"] = "electron-builder"), (_ == null || _ === "GET" || E["Cache-Control"] == null) && (E["Cache-Control"] = "no-cache"), b.protocol == null && process.versions.electron != null && (b.protocol = "https:"), b;
  }
  function P(b, w) {
    return JSON.stringify(b, (_, E) => _.endsWith("Authorization") || _.endsWith("authorization") || _.endsWith("Password") || _.endsWith("PASSWORD") || _.endsWith("Token") || _.includes("password") || _.includes("token") || w != null && w.has(_) ? "<stripped sensitive data>" : E, 2);
  }
  return Be;
}
var Kt = {}, es;
function ad() {
  if (es) return Kt;
  es = 1, Object.defineProperty(Kt, "__esModule", { value: !0 }), Kt.MemoLazy = void 0;
  let o = class {
    constructor(f, c) {
      this.selector = f, this.creator = c, this.selected = void 0, this._value = void 0;
    }
    get hasValue() {
      return this._value !== void 0;
    }
    get value() {
      const f = this.selector();
      if (this._value !== void 0 && h(this.selected, f))
        return this._value;
      this.selected = f;
      const c = this.creator(f);
      return this.value = c, c;
    }
    set value(f) {
      this._value = f;
    }
  };
  Kt.MemoLazy = o;
  function h(d, f) {
    if (typeof d == "object" && d !== null && (typeof f == "object" && f !== null)) {
      const e = Object.keys(d), n = Object.keys(f);
      return e.length === n.length && e.every((r) => h(d[r], f[r]));
    }
    return d === f;
  }
  return Kt;
}
var Qt = {}, ts;
function sd() {
  if (ts) return Qt;
  ts = 1, Object.defineProperty(Qt, "__esModule", { value: !0 }), Qt.githubUrl = o, Qt.getS3LikeProviderBaseUrl = h;
  function o(t, e = "github.com") {
    return `${t.protocol || "https"}://${t.host || e}`;
  }
  function h(t) {
    const e = t.provider;
    if (e === "s3")
      return d(t);
    if (e === "spaces")
      return c(t);
    throw new Error(`Not supported provider: ${e}`);
  }
  function d(t) {
    let e;
    if (t.accelerate == !0)
      e = `https://${t.bucket}.s3-accelerate.amazonaws.com`;
    else if (t.endpoint != null)
      e = `${t.endpoint}/${t.bucket}`;
    else if (t.bucket.includes(".")) {
      if (t.region == null)
        throw new Error(`Bucket name "${t.bucket}" includes a dot, but S3 region is missing`);
      t.region === "us-east-1" ? e = `https://s3.amazonaws.com/${t.bucket}` : e = `https://s3-${t.region}.amazonaws.com/${t.bucket}`;
    } else t.region === "cn-north-1" ? e = `https://${t.bucket}.s3.${t.region}.amazonaws.com.cn` : e = `https://${t.bucket}.s3.amazonaws.com`;
    return f(e, t.path);
  }
  function f(t, e) {
    return e != null && e.length > 0 && (e.startsWith("/") || (t += "/"), t += e), t;
  }
  function c(t) {
    if (t.name == null)
      throw new Error("name is missing");
    if (t.region == null)
      throw new Error("region is missing");
    return f(`https://${t.name}.${t.region}.digitaloceanspaces.com`, t.path);
  }
  return Qt;
}
var qr = {}, rs;
function ld() {
  if (rs) return qr;
  rs = 1, Object.defineProperty(qr, "__esModule", { value: !0 }), qr.retry = h;
  const o = qo();
  async function h(d, f, c, t = 0, e = 0, n) {
    var r;
    const i = new o.CancellationToken();
    try {
      return await d();
    } catch (a) {
      if ((!((r = n == null ? void 0 : n(a)) !== null && r !== void 0) || r) && f > 0 && !i.cancelled)
        return await new Promise((u) => setTimeout(u, c + t * e)), await h(d, f - 1, c, t, e + 1, n);
      throw a;
    }
  }
  return qr;
}
var Mr = {}, ns;
function ud() {
  if (ns) return Mr;
  ns = 1, Object.defineProperty(Mr, "__esModule", { value: !0 }), Mr.parseDn = o;
  function o(h) {
    let d = !1, f = null, c = "", t = 0;
    h = h.trim();
    const e = /* @__PURE__ */ new Map();
    for (let n = 0; n <= h.length; n++) {
      if (n === h.length) {
        f !== null && e.set(f, c);
        break;
      }
      const r = h[n];
      if (d) {
        if (r === '"') {
          d = !1;
          continue;
        }
      } else {
        if (r === '"') {
          d = !0;
          continue;
        }
        if (r === "\\") {
          n++;
          const i = parseInt(h.slice(n, n + 2), 16);
          Number.isNaN(i) ? c += h[n] : (n++, c += String.fromCharCode(i));
          continue;
        }
        if (f === null && r === "=") {
          f = c, c = "";
          continue;
        }
        if (r === "," || r === ";" || r === "+") {
          f !== null && e.set(f, c), f = null, c = "";
          continue;
        }
      }
      if (r === " " && !d) {
        if (c.length === 0)
          continue;
        if (n > t) {
          let i = n;
          for (; h[i] === " "; )
            i++;
          t = i;
        }
        if (t >= h.length || h[t] === "," || h[t] === ";" || f === null && h[t] === "=" || f !== null && h[t] === "+") {
          n = t - 1;
          continue;
        }
      }
      c += r;
    }
    return e;
  }
  return Mr;
}
var Dt = {}, is;
function cd() {
  if (is) return Dt;
  is = 1, Object.defineProperty(Dt, "__esModule", { value: !0 }), Dt.nil = Dt.UUID = void 0;
  const o = Bt, h = Yr(), d = "options.name must be either a string or a Buffer", f = (0, o.randomBytes)(16);
  f[0] = f[0] | 1;
  const c = {}, t = [];
  for (let u = 0; u < 256; u++) {
    const s = (u + 256).toString(16).substr(1);
    c[s] = u, t[u] = s;
  }
  class e {
    constructor(s) {
      this.ascii = null, this.binary = null;
      const m = e.check(s);
      if (!m)
        throw new Error("not a UUID");
      this.version = m.version, m.format === "ascii" ? this.ascii = s : this.binary = s;
    }
    static v5(s, m) {
      return i(s, "sha1", 80, m);
    }
    toString() {
      return this.ascii == null && (this.ascii = a(this.binary)), this.ascii;
    }
    inspect() {
      return `UUID v${this.version} ${this.toString()}`;
    }
    static check(s, m = 0) {
      if (typeof s == "string")
        return s = s.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(s) ? s === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
          version: (c[s[14] + s[15]] & 240) >> 4,
          variant: n((c[s[19] + s[20]] & 224) >> 5),
          format: "ascii"
        } : !1;
      if (Buffer.isBuffer(s)) {
        if (s.length < m + 16)
          return !1;
        let v = 0;
        for (; v < 16 && s[m + v] === 0; v++)
          ;
        return v === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
          version: (s[m + 6] & 240) >> 4,
          variant: n((s[m + 8] & 224) >> 5),
          format: "binary"
        };
      }
      throw (0, h.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
    }
    // read stringified uuid into a Buffer
    static parse(s) {
      const m = Buffer.allocUnsafe(16);
      let v = 0;
      for (let g = 0; g < 16; g++)
        m[g] = c[s[v++] + s[v++]], (g === 3 || g === 5 || g === 7 || g === 9) && (v += 1);
      return m;
    }
  }
  Dt.UUID = e, e.OID = e.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
  function n(u) {
    switch (u) {
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
  var r;
  (function(u) {
    u[u.ASCII = 0] = "ASCII", u[u.BINARY = 1] = "BINARY", u[u.OBJECT = 2] = "OBJECT";
  })(r || (r = {}));
  function i(u, s, m, v, g = r.ASCII) {
    const p = (0, o.createHash)(s);
    if (typeof u != "string" && !Buffer.isBuffer(u))
      throw (0, h.newError)(d, "ERR_INVALID_UUID_NAME");
    p.update(v), p.update(u);
    const T = p.digest();
    let O;
    switch (g) {
      case r.BINARY:
        T[6] = T[6] & 15 | m, T[8] = T[8] & 63 | 128, O = T;
        break;
      case r.OBJECT:
        T[6] = T[6] & 15 | m, T[8] = T[8] & 63 | 128, O = new e(T);
        break;
      default:
        O = t[T[0]] + t[T[1]] + t[T[2]] + t[T[3]] + "-" + t[T[4]] + t[T[5]] + "-" + t[T[6] & 15 | m] + t[T[7]] + "-" + t[T[8] & 63 | 128] + t[T[9]] + "-" + t[T[10]] + t[T[11]] + t[T[12]] + t[T[13]] + t[T[14]] + t[T[15]];
        break;
    }
    return O;
  }
  function a(u) {
    return t[u[0]] + t[u[1]] + t[u[2]] + t[u[3]] + "-" + t[u[4]] + t[u[5]] + "-" + t[u[6]] + t[u[7]] + "-" + t[u[8]] + t[u[9]] + "-" + t[u[10]] + t[u[11]] + t[u[12]] + t[u[13]] + t[u[14]] + t[u[15]];
  }
  return Dt.nil = new e("00000000-0000-0000-0000-000000000000"), Dt;
}
var Ut = {}, Hn = {}, os;
function fd() {
  return os || (os = 1, function(o) {
    (function(h) {
      h.parser = function(R, y) {
        return new f(R, y);
      }, h.SAXParser = f, h.SAXStream = a, h.createStream = i, h.MAX_BUFFER_LENGTH = 64 * 1024;
      var d = [
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
      h.EVENTS = [
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
      function f(R, y) {
        if (!(this instanceof f))
          return new f(R, y);
        var j = this;
        t(j), j.q = j.c = "", j.bufferCheckPosition = h.MAX_BUFFER_LENGTH, j.opt = y || {}, j.opt.lowercase = j.opt.lowercase || j.opt.lowercasetags, j.looseCase = j.opt.lowercase ? "toLowerCase" : "toUpperCase", j.tags = [], j.closed = j.closedRoot = j.sawRoot = !1, j.tag = j.error = null, j.strict = !!R, j.noscript = !!(R || j.opt.noscript), j.state = E.BEGIN, j.strictEntities = j.opt.strictEntities, j.ENTITIES = j.strictEntities ? Object.create(h.XML_ENTITIES) : Object.create(h.ENTITIES), j.attribList = [], j.opt.xmlns && (j.ns = Object.create(g)), j.opt.unquotedAttributeValues === void 0 && (j.opt.unquotedAttributeValues = !R), j.trackPosition = j.opt.position !== !1, j.trackPosition && (j.position = j.line = j.column = 0), F(j, "onready");
      }
      Object.create || (Object.create = function(R) {
        function y() {
        }
        y.prototype = R;
        var j = new y();
        return j;
      }), Object.keys || (Object.keys = function(R) {
        var y = [];
        for (var j in R) R.hasOwnProperty(j) && y.push(j);
        return y;
      });
      function c(R) {
        for (var y = Math.max(h.MAX_BUFFER_LENGTH, 10), j = 0, L = 0, le = d.length; L < le; L++) {
          var me = R[d[L]].length;
          if (me > y)
            switch (d[L]) {
              case "textNode":
                q(R);
                break;
              case "cdata":
                x(R, "oncdata", R.cdata), R.cdata = "";
                break;
              case "script":
                x(R, "onscript", R.script), R.script = "";
                break;
              default:
                I(R, "Max buffer length exceeded: " + d[L]);
            }
          j = Math.max(j, me);
        }
        var pe = h.MAX_BUFFER_LENGTH - j;
        R.bufferCheckPosition = pe + R.position;
      }
      function t(R) {
        for (var y = 0, j = d.length; y < j; y++)
          R[d[y]] = "";
      }
      function e(R) {
        q(R), R.cdata !== "" && (x(R, "oncdata", R.cdata), R.cdata = ""), R.script !== "" && (x(R, "onscript", R.script), R.script = "");
      }
      f.prototype = {
        end: function() {
          $(this);
        },
        write: ye,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          e(this);
        }
      };
      var n;
      try {
        n = require("stream").Stream;
      } catch {
        n = function() {
        };
      }
      n || (n = function() {
      });
      var r = h.EVENTS.filter(function(R) {
        return R !== "error" && R !== "end";
      });
      function i(R, y) {
        return new a(R, y);
      }
      function a(R, y) {
        if (!(this instanceof a))
          return new a(R, y);
        n.apply(this), this._parser = new f(R, y), this.writable = !0, this.readable = !0;
        var j = this;
        this._parser.onend = function() {
          j.emit("end");
        }, this._parser.onerror = function(L) {
          j.emit("error", L), j._parser.error = null;
        }, this._decoder = null, r.forEach(function(L) {
          Object.defineProperty(j, "on" + L, {
            get: function() {
              return j._parser["on" + L];
            },
            set: function(le) {
              if (!le)
                return j.removeAllListeners(L), j._parser["on" + L] = le, le;
              j.on(L, le);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      a.prototype = Object.create(n.prototype, {
        constructor: {
          value: a
        }
      }), a.prototype.write = function(R) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(R)) {
          if (!this._decoder) {
            var y = Cf.StringDecoder;
            this._decoder = new y("utf8");
          }
          R = this._decoder.write(R);
        }
        return this._parser.write(R.toString()), this.emit("data", R), !0;
      }, a.prototype.end = function(R) {
        return R && R.length && this.write(R), this._parser.end(), !0;
      }, a.prototype.on = function(R, y) {
        var j = this;
        return !j._parser["on" + R] && r.indexOf(R) !== -1 && (j._parser["on" + R] = function() {
          var L = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          L.splice(0, 0, R), j.emit.apply(j, L);
        }), n.prototype.on.call(j, R, y);
      };
      var u = "[CDATA[", s = "DOCTYPE", m = "http://www.w3.org/XML/1998/namespace", v = "http://www.w3.org/2000/xmlns/", g = { xml: m, xmlns: v }, p = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, A = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, T = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, O = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function D(R) {
        return R === " " || R === `
` || R === "\r" || R === "	";
      }
      function P(R) {
        return R === '"' || R === "'";
      }
      function b(R) {
        return R === ">" || D(R);
      }
      function w(R, y) {
        return R.test(y);
      }
      function _(R, y) {
        return !w(R, y);
      }
      var E = 0;
      h.STATE = {
        BEGIN: E++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: E++,
        // leading whitespace
        TEXT: E++,
        // general stuff
        TEXT_ENTITY: E++,
        // &amp and such.
        OPEN_WAKA: E++,
        // <
        SGML_DECL: E++,
        // <!BLARG
        SGML_DECL_QUOTED: E++,
        // <!BLARG foo "bar
        DOCTYPE: E++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: E++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: E++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: E++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: E++,
        // <!-
        COMMENT: E++,
        // <!--
        COMMENT_ENDING: E++,
        // <!-- blah -
        COMMENT_ENDED: E++,
        // <!-- blah --
        CDATA: E++,
        // <![CDATA[ something
        CDATA_ENDING: E++,
        // ]
        CDATA_ENDING_2: E++,
        // ]]
        PROC_INST: E++,
        // <?hi
        PROC_INST_BODY: E++,
        // <?hi there
        PROC_INST_ENDING: E++,
        // <?hi "there" ?
        OPEN_TAG: E++,
        // <strong
        OPEN_TAG_SLASH: E++,
        // <strong /
        ATTRIB: E++,
        // <a
        ATTRIB_NAME: E++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: E++,
        // <a foo _
        ATTRIB_VALUE: E++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: E++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: E++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: E++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: E++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: E++,
        // <foo bar=&quot
        CLOSE_TAG: E++,
        // </a
        CLOSE_TAG_SAW_WHITE: E++,
        // </a   >
        SCRIPT: E++,
        // <script> ...
        SCRIPT_ENDING: E++
        // <script> ... <
      }, h.XML_ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'"
      }, h.ENTITIES = {
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
      }, Object.keys(h.ENTITIES).forEach(function(R) {
        var y = h.ENTITIES[R], j = typeof y == "number" ? String.fromCharCode(y) : y;
        h.ENTITIES[R] = j;
      });
      for (var U in h.STATE)
        h.STATE[h.STATE[U]] = U;
      E = h.STATE;
      function F(R, y, j) {
        R[y] && R[y](j);
      }
      function x(R, y, j) {
        R.textNode && q(R), F(R, y, j);
      }
      function q(R) {
        R.textNode = N(R.opt, R.textNode), R.textNode && F(R, "ontext", R.textNode), R.textNode = "";
      }
      function N(R, y) {
        return R.trim && (y = y.trim()), R.normalize && (y = y.replace(/\s+/g, " ")), y;
      }
      function I(R, y) {
        return q(R), R.trackPosition && (y += `
Line: ` + R.line + `
Column: ` + R.column + `
Char: ` + R.c), y = new Error(y), R.error = y, F(R, "onerror", y), R;
      }
      function $(R) {
        return R.sawRoot && !R.closedRoot && M(R, "Unclosed root tag"), R.state !== E.BEGIN && R.state !== E.BEGIN_WHITESPACE && R.state !== E.TEXT && I(R, "Unexpected end"), q(R), R.c = "", R.closed = !0, F(R, "onend"), f.call(R, R.strict, R.opt), R;
      }
      function M(R, y) {
        if (typeof R != "object" || !(R instanceof f))
          throw new Error("bad call to strictFail");
        R.strict && I(R, y);
      }
      function K(R) {
        R.strict || (R.tagName = R.tagName[R.looseCase]());
        var y = R.tags[R.tags.length - 1] || R, j = R.tag = { name: R.tagName, attributes: {} };
        R.opt.xmlns && (j.ns = y.ns), R.attribList.length = 0, x(R, "onopentagstart", j);
      }
      function V(R, y) {
        var j = R.indexOf(":"), L = j < 0 ? ["", R] : R.split(":"), le = L[0], me = L[1];
        return y && R === "xmlns" && (le = "xmlns", me = ""), { prefix: le, local: me };
      }
      function ne(R) {
        if (R.strict || (R.attribName = R.attribName[R.looseCase]()), R.attribList.indexOf(R.attribName) !== -1 || R.tag.attributes.hasOwnProperty(R.attribName)) {
          R.attribName = R.attribValue = "";
          return;
        }
        if (R.opt.xmlns) {
          var y = V(R.attribName, !0), j = y.prefix, L = y.local;
          if (j === "xmlns")
            if (L === "xml" && R.attribValue !== m)
              M(
                R,
                "xml: prefix must be bound to " + m + `
Actual: ` + R.attribValue
              );
            else if (L === "xmlns" && R.attribValue !== v)
              M(
                R,
                "xmlns: prefix must be bound to " + v + `
Actual: ` + R.attribValue
              );
            else {
              var le = R.tag, me = R.tags[R.tags.length - 1] || R;
              le.ns === me.ns && (le.ns = Object.create(me.ns)), le.ns[L] = R.attribValue;
            }
          R.attribList.push([R.attribName, R.attribValue]);
        } else
          R.tag.attributes[R.attribName] = R.attribValue, x(R, "onattribute", {
            name: R.attribName,
            value: R.attribValue
          });
        R.attribName = R.attribValue = "";
      }
      function ce(R, y) {
        if (R.opt.xmlns) {
          var j = R.tag, L = V(R.tagName);
          j.prefix = L.prefix, j.local = L.local, j.uri = j.ns[L.prefix] || "", j.prefix && !j.uri && (M(R, "Unbound namespace prefix: " + JSON.stringify(R.tagName)), j.uri = L.prefix);
          var le = R.tags[R.tags.length - 1] || R;
          j.ns && le.ns !== j.ns && Object.keys(j.ns).forEach(function(B) {
            x(R, "onopennamespace", {
              prefix: B,
              uri: j.ns[B]
            });
          });
          for (var me = 0, pe = R.attribList.length; me < pe; me++) {
            var _e = R.attribList[me], Ee = _e[0], xe = _e[1], Oe = V(Ee, !0), qe = Oe.prefix, wt = Oe.local, st = qe === "" ? "" : j.ns[qe] || "", l = {
              name: Ee,
              value: xe,
              prefix: qe,
              local: wt,
              uri: st
            };
            qe && qe !== "xmlns" && !st && (M(R, "Unbound namespace prefix: " + JSON.stringify(qe)), l.uri = qe), R.tag.attributes[Ee] = l, x(R, "onattribute", l);
          }
          R.attribList.length = 0;
        }
        R.tag.isSelfClosing = !!y, R.sawRoot = !0, R.tags.push(R.tag), x(R, "onopentag", R.tag), y || (!R.noscript && R.tagName.toLowerCase() === "script" ? R.state = E.SCRIPT : R.state = E.TEXT, R.tag = null, R.tagName = ""), R.attribName = R.attribValue = "", R.attribList.length = 0;
      }
      function ue(R) {
        if (!R.tagName) {
          M(R, "Weird empty close tag."), R.textNode += "</>", R.state = E.TEXT;
          return;
        }
        if (R.script) {
          if (R.tagName !== "script") {
            R.script += "</" + R.tagName + ">", R.tagName = "", R.state = E.SCRIPT;
            return;
          }
          x(R, "onscript", R.script), R.script = "";
        }
        var y = R.tags.length, j = R.tagName;
        R.strict || (j = j[R.looseCase]());
        for (var L = j; y--; ) {
          var le = R.tags[y];
          if (le.name !== L)
            M(R, "Unexpected close tag");
          else
            break;
        }
        if (y < 0) {
          M(R, "Unmatched closing tag: " + R.tagName), R.textNode += "</" + R.tagName + ">", R.state = E.TEXT;
          return;
        }
        R.tagName = j;
        for (var me = R.tags.length; me-- > y; ) {
          var pe = R.tag = R.tags.pop();
          R.tagName = R.tag.name, x(R, "onclosetag", R.tagName);
          var _e = {};
          for (var Ee in pe.ns)
            _e[Ee] = pe.ns[Ee];
          var xe = R.tags[R.tags.length - 1] || R;
          R.opt.xmlns && pe.ns !== xe.ns && Object.keys(pe.ns).forEach(function(Oe) {
            var qe = pe.ns[Oe];
            x(R, "onclosenamespace", { prefix: Oe, uri: qe });
          });
        }
        y === 0 && (R.closedRoot = !0), R.tagName = R.attribValue = R.attribName = "", R.attribList.length = 0, R.state = E.TEXT;
      }
      function ie(R) {
        var y = R.entity, j = y.toLowerCase(), L, le = "";
        return R.ENTITIES[y] ? R.ENTITIES[y] : R.ENTITIES[j] ? R.ENTITIES[j] : (y = j, y.charAt(0) === "#" && (y.charAt(1) === "x" ? (y = y.slice(2), L = parseInt(y, 16), le = L.toString(16)) : (y = y.slice(1), L = parseInt(y, 10), le = L.toString(10))), y = y.replace(/^0+/, ""), isNaN(L) || le.toLowerCase() !== y ? (M(R, "Invalid character entity"), "&" + R.entity + ";") : String.fromCodePoint(L));
      }
      function be(R, y) {
        y === "<" ? (R.state = E.OPEN_WAKA, R.startTagPosition = R.position) : D(y) || (M(R, "Non-whitespace before first tag."), R.textNode = y, R.state = E.TEXT);
      }
      function J(R, y) {
        var j = "";
        return y < R.length && (j = R.charAt(y)), j;
      }
      function ye(R) {
        var y = this;
        if (this.error)
          throw this.error;
        if (y.closed)
          return I(
            y,
            "Cannot write after close. Assign an onready handler."
          );
        if (R === null)
          return $(y);
        typeof R == "object" && (R = R.toString());
        for (var j = 0, L = ""; L = J(R, j++), y.c = L, !!L; )
          switch (y.trackPosition && (y.position++, L === `
` ? (y.line++, y.column = 0) : y.column++), y.state) {
            case E.BEGIN:
              if (y.state = E.BEGIN_WHITESPACE, L === "\uFEFF")
                continue;
              be(y, L);
              continue;
            case E.BEGIN_WHITESPACE:
              be(y, L);
              continue;
            case E.TEXT:
              if (y.sawRoot && !y.closedRoot) {
                for (var le = j - 1; L && L !== "<" && L !== "&"; )
                  L = J(R, j++), L && y.trackPosition && (y.position++, L === `
` ? (y.line++, y.column = 0) : y.column++);
                y.textNode += R.substring(le, j - 1);
              }
              L === "<" && !(y.sawRoot && y.closedRoot && !y.strict) ? (y.state = E.OPEN_WAKA, y.startTagPosition = y.position) : (!D(L) && (!y.sawRoot || y.closedRoot) && M(y, "Text data outside of root node."), L === "&" ? y.state = E.TEXT_ENTITY : y.textNode += L);
              continue;
            case E.SCRIPT:
              L === "<" ? y.state = E.SCRIPT_ENDING : y.script += L;
              continue;
            case E.SCRIPT_ENDING:
              L === "/" ? y.state = E.CLOSE_TAG : (y.script += "<" + L, y.state = E.SCRIPT);
              continue;
            case E.OPEN_WAKA:
              if (L === "!")
                y.state = E.SGML_DECL, y.sgmlDecl = "";
              else if (!D(L)) if (w(p, L))
                y.state = E.OPEN_TAG, y.tagName = L;
              else if (L === "/")
                y.state = E.CLOSE_TAG, y.tagName = "";
              else if (L === "?")
                y.state = E.PROC_INST, y.procInstName = y.procInstBody = "";
              else {
                if (M(y, "Unencoded <"), y.startTagPosition + 1 < y.position) {
                  var me = y.position - y.startTagPosition;
                  L = new Array(me).join(" ") + L;
                }
                y.textNode += "<" + L, y.state = E.TEXT;
              }
              continue;
            case E.SGML_DECL:
              if (y.sgmlDecl + L === "--") {
                y.state = E.COMMENT, y.comment = "", y.sgmlDecl = "";
                continue;
              }
              y.doctype && y.doctype !== !0 && y.sgmlDecl ? (y.state = E.DOCTYPE_DTD, y.doctype += "<!" + y.sgmlDecl + L, y.sgmlDecl = "") : (y.sgmlDecl + L).toUpperCase() === u ? (x(y, "onopencdata"), y.state = E.CDATA, y.sgmlDecl = "", y.cdata = "") : (y.sgmlDecl + L).toUpperCase() === s ? (y.state = E.DOCTYPE, (y.doctype || y.sawRoot) && M(
                y,
                "Inappropriately located doctype declaration"
              ), y.doctype = "", y.sgmlDecl = "") : L === ">" ? (x(y, "onsgmldeclaration", y.sgmlDecl), y.sgmlDecl = "", y.state = E.TEXT) : (P(L) && (y.state = E.SGML_DECL_QUOTED), y.sgmlDecl += L);
              continue;
            case E.SGML_DECL_QUOTED:
              L === y.q && (y.state = E.SGML_DECL, y.q = ""), y.sgmlDecl += L;
              continue;
            case E.DOCTYPE:
              L === ">" ? (y.state = E.TEXT, x(y, "ondoctype", y.doctype), y.doctype = !0) : (y.doctype += L, L === "[" ? y.state = E.DOCTYPE_DTD : P(L) && (y.state = E.DOCTYPE_QUOTED, y.q = L));
              continue;
            case E.DOCTYPE_QUOTED:
              y.doctype += L, L === y.q && (y.q = "", y.state = E.DOCTYPE);
              continue;
            case E.DOCTYPE_DTD:
              L === "]" ? (y.doctype += L, y.state = E.DOCTYPE) : L === "<" ? (y.state = E.OPEN_WAKA, y.startTagPosition = y.position) : P(L) ? (y.doctype += L, y.state = E.DOCTYPE_DTD_QUOTED, y.q = L) : y.doctype += L;
              continue;
            case E.DOCTYPE_DTD_QUOTED:
              y.doctype += L, L === y.q && (y.state = E.DOCTYPE_DTD, y.q = "");
              continue;
            case E.COMMENT:
              L === "-" ? y.state = E.COMMENT_ENDING : y.comment += L;
              continue;
            case E.COMMENT_ENDING:
              L === "-" ? (y.state = E.COMMENT_ENDED, y.comment = N(y.opt, y.comment), y.comment && x(y, "oncomment", y.comment), y.comment = "") : (y.comment += "-" + L, y.state = E.COMMENT);
              continue;
            case E.COMMENT_ENDED:
              L !== ">" ? (M(y, "Malformed comment"), y.comment += "--" + L, y.state = E.COMMENT) : y.doctype && y.doctype !== !0 ? y.state = E.DOCTYPE_DTD : y.state = E.TEXT;
              continue;
            case E.CDATA:
              L === "]" ? y.state = E.CDATA_ENDING : y.cdata += L;
              continue;
            case E.CDATA_ENDING:
              L === "]" ? y.state = E.CDATA_ENDING_2 : (y.cdata += "]" + L, y.state = E.CDATA);
              continue;
            case E.CDATA_ENDING_2:
              L === ">" ? (y.cdata && x(y, "oncdata", y.cdata), x(y, "onclosecdata"), y.cdata = "", y.state = E.TEXT) : L === "]" ? y.cdata += "]" : (y.cdata += "]]" + L, y.state = E.CDATA);
              continue;
            case E.PROC_INST:
              L === "?" ? y.state = E.PROC_INST_ENDING : D(L) ? y.state = E.PROC_INST_BODY : y.procInstName += L;
              continue;
            case E.PROC_INST_BODY:
              if (!y.procInstBody && D(L))
                continue;
              L === "?" ? y.state = E.PROC_INST_ENDING : y.procInstBody += L;
              continue;
            case E.PROC_INST_ENDING:
              L === ">" ? (x(y, "onprocessinginstruction", {
                name: y.procInstName,
                body: y.procInstBody
              }), y.procInstName = y.procInstBody = "", y.state = E.TEXT) : (y.procInstBody += "?" + L, y.state = E.PROC_INST_BODY);
              continue;
            case E.OPEN_TAG:
              w(A, L) ? y.tagName += L : (K(y), L === ">" ? ce(y) : L === "/" ? y.state = E.OPEN_TAG_SLASH : (D(L) || M(y, "Invalid character in tag name"), y.state = E.ATTRIB));
              continue;
            case E.OPEN_TAG_SLASH:
              L === ">" ? (ce(y, !0), ue(y)) : (M(y, "Forward-slash in opening tag not followed by >"), y.state = E.ATTRIB);
              continue;
            case E.ATTRIB:
              if (D(L))
                continue;
              L === ">" ? ce(y) : L === "/" ? y.state = E.OPEN_TAG_SLASH : w(p, L) ? (y.attribName = L, y.attribValue = "", y.state = E.ATTRIB_NAME) : M(y, "Invalid attribute name");
              continue;
            case E.ATTRIB_NAME:
              L === "=" ? y.state = E.ATTRIB_VALUE : L === ">" ? (M(y, "Attribute without value"), y.attribValue = y.attribName, ne(y), ce(y)) : D(L) ? y.state = E.ATTRIB_NAME_SAW_WHITE : w(A, L) ? y.attribName += L : M(y, "Invalid attribute name");
              continue;
            case E.ATTRIB_NAME_SAW_WHITE:
              if (L === "=")
                y.state = E.ATTRIB_VALUE;
              else {
                if (D(L))
                  continue;
                M(y, "Attribute without value"), y.tag.attributes[y.attribName] = "", y.attribValue = "", x(y, "onattribute", {
                  name: y.attribName,
                  value: ""
                }), y.attribName = "", L === ">" ? ce(y) : w(p, L) ? (y.attribName = L, y.state = E.ATTRIB_NAME) : (M(y, "Invalid attribute name"), y.state = E.ATTRIB);
              }
              continue;
            case E.ATTRIB_VALUE:
              if (D(L))
                continue;
              P(L) ? (y.q = L, y.state = E.ATTRIB_VALUE_QUOTED) : (y.opt.unquotedAttributeValues || I(y, "Unquoted attribute value"), y.state = E.ATTRIB_VALUE_UNQUOTED, y.attribValue = L);
              continue;
            case E.ATTRIB_VALUE_QUOTED:
              if (L !== y.q) {
                L === "&" ? y.state = E.ATTRIB_VALUE_ENTITY_Q : y.attribValue += L;
                continue;
              }
              ne(y), y.q = "", y.state = E.ATTRIB_VALUE_CLOSED;
              continue;
            case E.ATTRIB_VALUE_CLOSED:
              D(L) ? y.state = E.ATTRIB : L === ">" ? ce(y) : L === "/" ? y.state = E.OPEN_TAG_SLASH : w(p, L) ? (M(y, "No whitespace between attributes"), y.attribName = L, y.attribValue = "", y.state = E.ATTRIB_NAME) : M(y, "Invalid attribute name");
              continue;
            case E.ATTRIB_VALUE_UNQUOTED:
              if (!b(L)) {
                L === "&" ? y.state = E.ATTRIB_VALUE_ENTITY_U : y.attribValue += L;
                continue;
              }
              ne(y), L === ">" ? ce(y) : y.state = E.ATTRIB;
              continue;
            case E.CLOSE_TAG:
              if (y.tagName)
                L === ">" ? ue(y) : w(A, L) ? y.tagName += L : y.script ? (y.script += "</" + y.tagName, y.tagName = "", y.state = E.SCRIPT) : (D(L) || M(y, "Invalid tagname in closing tag"), y.state = E.CLOSE_TAG_SAW_WHITE);
              else {
                if (D(L))
                  continue;
                _(p, L) ? y.script ? (y.script += "</" + L, y.state = E.SCRIPT) : M(y, "Invalid tagname in closing tag.") : y.tagName = L;
              }
              continue;
            case E.CLOSE_TAG_SAW_WHITE:
              if (D(L))
                continue;
              L === ">" ? ue(y) : M(y, "Invalid characters in closing tag");
              continue;
            case E.TEXT_ENTITY:
            case E.ATTRIB_VALUE_ENTITY_Q:
            case E.ATTRIB_VALUE_ENTITY_U:
              var pe, _e;
              switch (y.state) {
                case E.TEXT_ENTITY:
                  pe = E.TEXT, _e = "textNode";
                  break;
                case E.ATTRIB_VALUE_ENTITY_Q:
                  pe = E.ATTRIB_VALUE_QUOTED, _e = "attribValue";
                  break;
                case E.ATTRIB_VALUE_ENTITY_U:
                  pe = E.ATTRIB_VALUE_UNQUOTED, _e = "attribValue";
                  break;
              }
              if (L === ";") {
                var Ee = ie(y);
                y.opt.unparsedEntities && !Object.values(h.XML_ENTITIES).includes(Ee) ? (y.entity = "", y.state = pe, y.write(Ee)) : (y[_e] += Ee, y.entity = "", y.state = pe);
              } else w(y.entity.length ? O : T, L) ? y.entity += L : (M(y, "Invalid character in entity name"), y[_e] += "&" + y.entity + L, y.entity = "", y.state = pe);
              continue;
            default:
              throw new Error(y, "Unknown state: " + y.state);
          }
        return y.position >= y.bufferCheckPosition && c(y), y;
      }
      /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
      String.fromCodePoint || function() {
        var R = String.fromCharCode, y = Math.floor, j = function() {
          var L = 16384, le = [], me, pe, _e = -1, Ee = arguments.length;
          if (!Ee)
            return "";
          for (var xe = ""; ++_e < Ee; ) {
            var Oe = Number(arguments[_e]);
            if (!isFinite(Oe) || // `NaN`, `+Infinity`, or `-Infinity`
            Oe < 0 || // not a valid Unicode code point
            Oe > 1114111 || // not a valid Unicode code point
            y(Oe) !== Oe)
              throw RangeError("Invalid code point: " + Oe);
            Oe <= 65535 ? le.push(Oe) : (Oe -= 65536, me = (Oe >> 10) + 55296, pe = Oe % 1024 + 56320, le.push(me, pe)), (_e + 1 === Ee || le.length > L) && (xe += R.apply(null, le), le.length = 0);
          }
          return xe;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: j,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = j;
      }();
    })(o);
  }(Hn)), Hn;
}
var as;
function dd() {
  if (as) return Ut;
  as = 1, Object.defineProperty(Ut, "__esModule", { value: !0 }), Ut.XElement = void 0, Ut.parseXml = e;
  const o = fd(), h = Yr();
  class d {
    constructor(r) {
      if (this.name = r, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !r)
        throw (0, h.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
      if (!c(r))
        throw (0, h.newError)(`Invalid element name: ${r}`, "ERR_XML_ELEMENT_INVALID_NAME");
    }
    attribute(r) {
      const i = this.attributes === null ? null : this.attributes[r];
      if (i == null)
        throw (0, h.newError)(`No attribute "${r}"`, "ERR_XML_MISSED_ATTRIBUTE");
      return i;
    }
    removeAttribute(r) {
      this.attributes !== null && delete this.attributes[r];
    }
    element(r, i = !1, a = null) {
      const u = this.elementOrNull(r, i);
      if (u === null)
        throw (0, h.newError)(a || `No element "${r}"`, "ERR_XML_MISSED_ELEMENT");
      return u;
    }
    elementOrNull(r, i = !1) {
      if (this.elements === null)
        return null;
      for (const a of this.elements)
        if (t(a, r, i))
          return a;
      return null;
    }
    getElements(r, i = !1) {
      return this.elements === null ? [] : this.elements.filter((a) => t(a, r, i));
    }
    elementValueOrEmpty(r, i = !1) {
      const a = this.elementOrNull(r, i);
      return a === null ? "" : a.value;
    }
  }
  Ut.XElement = d;
  const f = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
  function c(n) {
    return f.test(n);
  }
  function t(n, r, i) {
    const a = n.name;
    return a === r || i === !0 && a.length === r.length && a.toLowerCase() === r.toLowerCase();
  }
  function e(n) {
    let r = null;
    const i = o.parser(!0, {}), a = [];
    return i.onopentag = (u) => {
      const s = new d(u.name);
      if (s.attributes = u.attributes, r === null)
        r = s;
      else {
        const m = a[a.length - 1];
        m.elements == null && (m.elements = []), m.elements.push(s);
      }
      a.push(s);
    }, i.onclosetag = () => {
      a.pop();
    }, i.ontext = (u) => {
      a.length > 0 && (a[a.length - 1].value = u);
    }, i.oncdata = (u) => {
      const s = a[a.length - 1];
      s.value = u, s.isCData = !0;
    }, i.onerror = (u) => {
      throw u;
    }, i.write(n), r;
  }
  return Ut;
}
var ss;
function ke() {
  return ss || (ss = 1, function(o) {
    Object.defineProperty(o, "__esModule", { value: !0 }), o.CURRENT_APP_PACKAGE_FILE_NAME = o.CURRENT_APP_INSTALLER_FILE_NAME = o.XElement = o.parseXml = o.UUID = o.parseDn = o.retry = o.githubUrl = o.getS3LikeProviderBaseUrl = o.ProgressCallbackTransform = o.MemoLazy = o.safeStringifyJson = o.safeGetHeader = o.parseJson = o.HttpExecutor = o.HttpError = o.DigestTransform = o.createHttpError = o.configureRequestUrl = o.configureRequestOptionsFromUrl = o.configureRequestOptions = o.newError = o.CancellationToken = o.CancellationError = void 0, o.asArray = u;
    var h = qo();
    Object.defineProperty(o, "CancellationError", { enumerable: !0, get: function() {
      return h.CancellationError;
    } }), Object.defineProperty(o, "CancellationToken", { enumerable: !0, get: function() {
      return h.CancellationToken;
    } });
    var d = Yr();
    Object.defineProperty(o, "newError", { enumerable: !0, get: function() {
      return d.newError;
    } });
    var f = od();
    Object.defineProperty(o, "configureRequestOptions", { enumerable: !0, get: function() {
      return f.configureRequestOptions;
    } }), Object.defineProperty(o, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
      return f.configureRequestOptionsFromUrl;
    } }), Object.defineProperty(o, "configureRequestUrl", { enumerable: !0, get: function() {
      return f.configureRequestUrl;
    } }), Object.defineProperty(o, "createHttpError", { enumerable: !0, get: function() {
      return f.createHttpError;
    } }), Object.defineProperty(o, "DigestTransform", { enumerable: !0, get: function() {
      return f.DigestTransform;
    } }), Object.defineProperty(o, "HttpError", { enumerable: !0, get: function() {
      return f.HttpError;
    } }), Object.defineProperty(o, "HttpExecutor", { enumerable: !0, get: function() {
      return f.HttpExecutor;
    } }), Object.defineProperty(o, "parseJson", { enumerable: !0, get: function() {
      return f.parseJson;
    } }), Object.defineProperty(o, "safeGetHeader", { enumerable: !0, get: function() {
      return f.safeGetHeader;
    } }), Object.defineProperty(o, "safeStringifyJson", { enumerable: !0, get: function() {
      return f.safeStringifyJson;
    } });
    var c = ad();
    Object.defineProperty(o, "MemoLazy", { enumerable: !0, get: function() {
      return c.MemoLazy;
    } });
    var t = Wu();
    Object.defineProperty(o, "ProgressCallbackTransform", { enumerable: !0, get: function() {
      return t.ProgressCallbackTransform;
    } });
    var e = sd();
    Object.defineProperty(o, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
      return e.getS3LikeProviderBaseUrl;
    } }), Object.defineProperty(o, "githubUrl", { enumerable: !0, get: function() {
      return e.githubUrl;
    } });
    var n = ld();
    Object.defineProperty(o, "retry", { enumerable: !0, get: function() {
      return n.retry;
    } });
    var r = ud();
    Object.defineProperty(o, "parseDn", { enumerable: !0, get: function() {
      return r.parseDn;
    } });
    var i = cd();
    Object.defineProperty(o, "UUID", { enumerable: !0, get: function() {
      return i.UUID;
    } });
    var a = dd();
    Object.defineProperty(o, "parseXml", { enumerable: !0, get: function() {
      return a.parseXml;
    } }), Object.defineProperty(o, "XElement", { enumerable: !0, get: function() {
      return a.XElement;
    } }), o.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", o.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
    function u(s) {
      return s == null ? [] : Array.isArray(s) ? s : [s];
    }
  }(kn)), kn;
}
var je = {}, Br = {}, gt = {}, ls;
function Ar() {
  if (ls) return gt;
  ls = 1;
  function o(e) {
    return typeof e > "u" || e === null;
  }
  function h(e) {
    return typeof e == "object" && e !== null;
  }
  function d(e) {
    return Array.isArray(e) ? e : o(e) ? [] : [e];
  }
  function f(e, n) {
    var r, i, a, u;
    if (n)
      for (u = Object.keys(n), r = 0, i = u.length; r < i; r += 1)
        a = u[r], e[a] = n[a];
    return e;
  }
  function c(e, n) {
    var r = "", i;
    for (i = 0; i < n; i += 1)
      r += e;
    return r;
  }
  function t(e) {
    return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
  }
  return gt.isNothing = o, gt.isObject = h, gt.toArray = d, gt.repeat = c, gt.isNegativeZero = t, gt.extend = f, gt;
}
var Gn, us;
function br() {
  if (us) return Gn;
  us = 1;
  function o(d, f) {
    var c = "", t = d.reason || "(unknown reason)";
    return d.mark ? (d.mark.name && (c += 'in "' + d.mark.name + '" '), c += "(" + (d.mark.line + 1) + ":" + (d.mark.column + 1) + ")", !f && d.mark.snippet && (c += `

` + d.mark.snippet), t + " " + c) : t;
  }
  function h(d, f) {
    Error.call(this), this.name = "YAMLException", this.reason = d, this.mark = f, this.message = o(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
  }
  return h.prototype = Object.create(Error.prototype), h.prototype.constructor = h, h.prototype.toString = function(f) {
    return this.name + ": " + o(this, f);
  }, Gn = h, Gn;
}
var Vn, cs;
function hd() {
  if (cs) return Vn;
  cs = 1;
  var o = Ar();
  function h(c, t, e, n, r) {
    var i = "", a = "", u = Math.floor(r / 2) - 1;
    return n - t > u && (i = " ... ", t = n - u + i.length), e - n > u && (a = " ...", e = n + u - a.length), {
      str: i + c.slice(t, e).replace(/\t/g, "→") + a,
      pos: n - t + i.length
      // relative position
    };
  }
  function d(c, t) {
    return o.repeat(" ", t - c.length) + c;
  }
  function f(c, t) {
    if (t = Object.create(t || null), !c.buffer) return null;
    t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
    for (var e = /\r?\n|\r|\0/g, n = [0], r = [], i, a = -1; i = e.exec(c.buffer); )
      r.push(i.index), n.push(i.index + i[0].length), c.position <= i.index && a < 0 && (a = n.length - 2);
    a < 0 && (a = n.length - 1);
    var u = "", s, m, v = Math.min(c.line + t.linesAfter, r.length).toString().length, g = t.maxLength - (t.indent + v + 3);
    for (s = 1; s <= t.linesBefore && !(a - s < 0); s++)
      m = h(
        c.buffer,
        n[a - s],
        r[a - s],
        c.position - (n[a] - n[a - s]),
        g
      ), u = o.repeat(" ", t.indent) + d((c.line - s + 1).toString(), v) + " | " + m.str + `
` + u;
    for (m = h(c.buffer, n[a], r[a], c.position, g), u += o.repeat(" ", t.indent) + d((c.line + 1).toString(), v) + " | " + m.str + `
`, u += o.repeat("-", t.indent + v + 3 + m.pos) + `^
`, s = 1; s <= t.linesAfter && !(a + s >= r.length); s++)
      m = h(
        c.buffer,
        n[a + s],
        r[a + s],
        c.position - (n[a] - n[a + s]),
        g
      ), u += o.repeat(" ", t.indent) + d((c.line + s + 1).toString(), v) + " | " + m.str + `
`;
    return u.replace(/\n$/, "");
  }
  return Vn = f, Vn;
}
var Wn, fs;
function He() {
  if (fs) return Wn;
  fs = 1;
  var o = br(), h = [
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
  ], d = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function f(t) {
    var e = {};
    return t !== null && Object.keys(t).forEach(function(n) {
      t[n].forEach(function(r) {
        e[String(r)] = n;
      });
    }), e;
  }
  function c(t, e) {
    if (e = e || {}, Object.keys(e).forEach(function(n) {
      if (h.indexOf(n) === -1)
        throw new o('Unknown option "' + n + '" is met in definition of "' + t + '" YAML type.');
    }), this.options = e, this.tag = t, this.kind = e.kind || null, this.resolve = e.resolve || function() {
      return !0;
    }, this.construct = e.construct || function(n) {
      return n;
    }, this.instanceOf = e.instanceOf || null, this.predicate = e.predicate || null, this.represent = e.represent || null, this.representName = e.representName || null, this.defaultStyle = e.defaultStyle || null, this.multi = e.multi || !1, this.styleAliases = f(e.styleAliases || null), d.indexOf(this.kind) === -1)
      throw new o('Unknown kind "' + this.kind + '" is specified for "' + t + '" YAML type.');
  }
  return Wn = c, Wn;
}
var zn, ds;
function zu() {
  if (ds) return zn;
  ds = 1;
  var o = br(), h = He();
  function d(t, e) {
    var n = [];
    return t[e].forEach(function(r) {
      var i = n.length;
      n.forEach(function(a, u) {
        a.tag === r.tag && a.kind === r.kind && a.multi === r.multi && (i = u);
      }), n[i] = r;
    }), n;
  }
  function f() {
    var t = {
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
    }, e, n;
    function r(i) {
      i.multi ? (t.multi[i.kind].push(i), t.multi.fallback.push(i)) : t[i.kind][i.tag] = t.fallback[i.tag] = i;
    }
    for (e = 0, n = arguments.length; e < n; e += 1)
      arguments[e].forEach(r);
    return t;
  }
  function c(t) {
    return this.extend(t);
  }
  return c.prototype.extend = function(e) {
    var n = [], r = [];
    if (e instanceof h)
      r.push(e);
    else if (Array.isArray(e))
      r = r.concat(e);
    else if (e && (Array.isArray(e.implicit) || Array.isArray(e.explicit)))
      e.implicit && (n = n.concat(e.implicit)), e.explicit && (r = r.concat(e.explicit));
    else
      throw new o("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    n.forEach(function(a) {
      if (!(a instanceof h))
        throw new o("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (a.loadKind && a.loadKind !== "scalar")
        throw new o("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (a.multi)
        throw new o("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }), r.forEach(function(a) {
      if (!(a instanceof h))
        throw new o("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    var i = Object.create(c.prototype);
    return i.implicit = (this.implicit || []).concat(n), i.explicit = (this.explicit || []).concat(r), i.compiledImplicit = d(i, "implicit"), i.compiledExplicit = d(i, "explicit"), i.compiledTypeMap = f(i.compiledImplicit, i.compiledExplicit), i;
  }, zn = c, zn;
}
var Yn, hs;
function Yu() {
  if (hs) return Yn;
  hs = 1;
  var o = He();
  return Yn = new o("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(h) {
      return h !== null ? h : "";
    }
  }), Yn;
}
var Xn, ps;
function Xu() {
  if (ps) return Xn;
  ps = 1;
  var o = He();
  return Xn = new o("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(h) {
      return h !== null ? h : [];
    }
  }), Xn;
}
var Jn, ms;
function Ju() {
  if (ms) return Jn;
  ms = 1;
  var o = He();
  return Jn = new o("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(h) {
      return h !== null ? h : {};
    }
  }), Jn;
}
var Kn, gs;
function Ku() {
  if (gs) return Kn;
  gs = 1;
  var o = zu();
  return Kn = new o({
    explicit: [
      Yu(),
      Xu(),
      Ju()
    ]
  }), Kn;
}
var Qn, vs;
function Qu() {
  if (vs) return Qn;
  vs = 1;
  var o = He();
  function h(c) {
    if (c === null) return !0;
    var t = c.length;
    return t === 1 && c === "~" || t === 4 && (c === "null" || c === "Null" || c === "NULL");
  }
  function d() {
    return null;
  }
  function f(c) {
    return c === null;
  }
  return Qn = new o("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: h,
    construct: d,
    predicate: f,
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
  }), Qn;
}
var Zn, ys;
function Zu() {
  if (ys) return Zn;
  ys = 1;
  var o = He();
  function h(c) {
    if (c === null) return !1;
    var t = c.length;
    return t === 4 && (c === "true" || c === "True" || c === "TRUE") || t === 5 && (c === "false" || c === "False" || c === "FALSE");
  }
  function d(c) {
    return c === "true" || c === "True" || c === "TRUE";
  }
  function f(c) {
    return Object.prototype.toString.call(c) === "[object Boolean]";
  }
  return Zn = new o("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: h,
    construct: d,
    predicate: f,
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
  }), Zn;
}
var ei, Es;
function ec() {
  if (Es) return ei;
  Es = 1;
  var o = Ar(), h = He();
  function d(r) {
    return 48 <= r && r <= 57 || 65 <= r && r <= 70 || 97 <= r && r <= 102;
  }
  function f(r) {
    return 48 <= r && r <= 55;
  }
  function c(r) {
    return 48 <= r && r <= 57;
  }
  function t(r) {
    if (r === null) return !1;
    var i = r.length, a = 0, u = !1, s;
    if (!i) return !1;
    if (s = r[a], (s === "-" || s === "+") && (s = r[++a]), s === "0") {
      if (a + 1 === i) return !0;
      if (s = r[++a], s === "b") {
        for (a++; a < i; a++)
          if (s = r[a], s !== "_") {
            if (s !== "0" && s !== "1") return !1;
            u = !0;
          }
        return u && s !== "_";
      }
      if (s === "x") {
        for (a++; a < i; a++)
          if (s = r[a], s !== "_") {
            if (!d(r.charCodeAt(a))) return !1;
            u = !0;
          }
        return u && s !== "_";
      }
      if (s === "o") {
        for (a++; a < i; a++)
          if (s = r[a], s !== "_") {
            if (!f(r.charCodeAt(a))) return !1;
            u = !0;
          }
        return u && s !== "_";
      }
    }
    if (s === "_") return !1;
    for (; a < i; a++)
      if (s = r[a], s !== "_") {
        if (!c(r.charCodeAt(a)))
          return !1;
        u = !0;
      }
    return !(!u || s === "_");
  }
  function e(r) {
    var i = r, a = 1, u;
    if (i.indexOf("_") !== -1 && (i = i.replace(/_/g, "")), u = i[0], (u === "-" || u === "+") && (u === "-" && (a = -1), i = i.slice(1), u = i[0]), i === "0") return 0;
    if (u === "0") {
      if (i[1] === "b") return a * parseInt(i.slice(2), 2);
      if (i[1] === "x") return a * parseInt(i.slice(2), 16);
      if (i[1] === "o") return a * parseInt(i.slice(2), 8);
    }
    return a * parseInt(i, 10);
  }
  function n(r) {
    return Object.prototype.toString.call(r) === "[object Number]" && r % 1 === 0 && !o.isNegativeZero(r);
  }
  return ei = new h("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: t,
    construct: e,
    predicate: n,
    represent: {
      binary: function(r) {
        return r >= 0 ? "0b" + r.toString(2) : "-0b" + r.toString(2).slice(1);
      },
      octal: function(r) {
        return r >= 0 ? "0o" + r.toString(8) : "-0o" + r.toString(8).slice(1);
      },
      decimal: function(r) {
        return r.toString(10);
      },
      /* eslint-disable max-len */
      hexadecimal: function(r) {
        return r >= 0 ? "0x" + r.toString(16).toUpperCase() : "-0x" + r.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  }), ei;
}
var ti, ws;
function tc() {
  if (ws) return ti;
  ws = 1;
  var o = Ar(), h = He(), d = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function f(r) {
    return !(r === null || !d.test(r) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    r[r.length - 1] === "_");
  }
  function c(r) {
    var i, a;
    return i = r.replace(/_/g, "").toLowerCase(), a = i[0] === "-" ? -1 : 1, "+-".indexOf(i[0]) >= 0 && (i = i.slice(1)), i === ".inf" ? a === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : i === ".nan" ? NaN : a * parseFloat(i, 10);
  }
  var t = /^[-+]?[0-9]+e/;
  function e(r, i) {
    var a;
    if (isNaN(r))
      switch (i) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    else if (Number.POSITIVE_INFINITY === r)
      switch (i) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    else if (Number.NEGATIVE_INFINITY === r)
      switch (i) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    else if (o.isNegativeZero(r))
      return "-0.0";
    return a = r.toString(10), t.test(a) ? a.replace("e", ".e") : a;
  }
  function n(r) {
    return Object.prototype.toString.call(r) === "[object Number]" && (r % 1 !== 0 || o.isNegativeZero(r));
  }
  return ti = new h("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: f,
    construct: c,
    predicate: n,
    represent: e,
    defaultStyle: "lowercase"
  }), ti;
}
var ri, _s;
function rc() {
  return _s || (_s = 1, ri = Ku().extend({
    implicit: [
      Qu(),
      Zu(),
      ec(),
      tc()
    ]
  })), ri;
}
var ni, Ss;
function nc() {
  return Ss || (Ss = 1, ni = rc()), ni;
}
var ii, As;
function ic() {
  if (As) return ii;
  As = 1;
  var o = He(), h = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  ), d = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function f(e) {
    return e === null ? !1 : h.exec(e) !== null || d.exec(e) !== null;
  }
  function c(e) {
    var n, r, i, a, u, s, m, v = 0, g = null, p, A, T;
    if (n = h.exec(e), n === null && (n = d.exec(e)), n === null) throw new Error("Date resolve error");
    if (r = +n[1], i = +n[2] - 1, a = +n[3], !n[4])
      return new Date(Date.UTC(r, i, a));
    if (u = +n[4], s = +n[5], m = +n[6], n[7]) {
      for (v = n[7].slice(0, 3); v.length < 3; )
        v += "0";
      v = +v;
    }
    return n[9] && (p = +n[10], A = +(n[11] || 0), g = (p * 60 + A) * 6e4, n[9] === "-" && (g = -g)), T = new Date(Date.UTC(r, i, a, u, s, m, v)), g && T.setTime(T.getTime() - g), T;
  }
  function t(e) {
    return e.toISOString();
  }
  return ii = new o("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: f,
    construct: c,
    instanceOf: Date,
    represent: t
  }), ii;
}
var oi, bs;
function oc() {
  if (bs) return oi;
  bs = 1;
  var o = He();
  function h(d) {
    return d === "<<" || d === null;
  }
  return oi = new o("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: h
  }), oi;
}
var ai, Rs;
function ac() {
  if (Rs) return ai;
  Rs = 1;
  var o = He(), h = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
  function d(e) {
    if (e === null) return !1;
    var n, r, i = 0, a = e.length, u = h;
    for (r = 0; r < a; r++)
      if (n = u.indexOf(e.charAt(r)), !(n > 64)) {
        if (n < 0) return !1;
        i += 6;
      }
    return i % 8 === 0;
  }
  function f(e) {
    var n, r, i = e.replace(/[\r\n=]/g, ""), a = i.length, u = h, s = 0, m = [];
    for (n = 0; n < a; n++)
      n % 4 === 0 && n && (m.push(s >> 16 & 255), m.push(s >> 8 & 255), m.push(s & 255)), s = s << 6 | u.indexOf(i.charAt(n));
    return r = a % 4 * 6, r === 0 ? (m.push(s >> 16 & 255), m.push(s >> 8 & 255), m.push(s & 255)) : r === 18 ? (m.push(s >> 10 & 255), m.push(s >> 2 & 255)) : r === 12 && m.push(s >> 4 & 255), new Uint8Array(m);
  }
  function c(e) {
    var n = "", r = 0, i, a, u = e.length, s = h;
    for (i = 0; i < u; i++)
      i % 3 === 0 && i && (n += s[r >> 18 & 63], n += s[r >> 12 & 63], n += s[r >> 6 & 63], n += s[r & 63]), r = (r << 8) + e[i];
    return a = u % 3, a === 0 ? (n += s[r >> 18 & 63], n += s[r >> 12 & 63], n += s[r >> 6 & 63], n += s[r & 63]) : a === 2 ? (n += s[r >> 10 & 63], n += s[r >> 4 & 63], n += s[r << 2 & 63], n += s[64]) : a === 1 && (n += s[r >> 2 & 63], n += s[r << 4 & 63], n += s[64], n += s[64]), n;
  }
  function t(e) {
    return Object.prototype.toString.call(e) === "[object Uint8Array]";
  }
  return ai = new o("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: d,
    construct: f,
    predicate: t,
    represent: c
  }), ai;
}
var si, Ts;
function sc() {
  if (Ts) return si;
  Ts = 1;
  var o = He(), h = Object.prototype.hasOwnProperty, d = Object.prototype.toString;
  function f(t) {
    if (t === null) return !0;
    var e = [], n, r, i, a, u, s = t;
    for (n = 0, r = s.length; n < r; n += 1) {
      if (i = s[n], u = !1, d.call(i) !== "[object Object]") return !1;
      for (a in i)
        if (h.call(i, a))
          if (!u) u = !0;
          else return !1;
      if (!u) return !1;
      if (e.indexOf(a) === -1) e.push(a);
      else return !1;
    }
    return !0;
  }
  function c(t) {
    return t !== null ? t : [];
  }
  return si = new o("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: f,
    construct: c
  }), si;
}
var li, Cs;
function lc() {
  if (Cs) return li;
  Cs = 1;
  var o = He(), h = Object.prototype.toString;
  function d(c) {
    if (c === null) return !0;
    var t, e, n, r, i, a = c;
    for (i = new Array(a.length), t = 0, e = a.length; t < e; t += 1) {
      if (n = a[t], h.call(n) !== "[object Object]" || (r = Object.keys(n), r.length !== 1)) return !1;
      i[t] = [r[0], n[r[0]]];
    }
    return !0;
  }
  function f(c) {
    if (c === null) return [];
    var t, e, n, r, i, a = c;
    for (i = new Array(a.length), t = 0, e = a.length; t < e; t += 1)
      n = a[t], r = Object.keys(n), i[t] = [r[0], n[r[0]]];
    return i;
  }
  return li = new o("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: d,
    construct: f
  }), li;
}
var ui, Os;
function uc() {
  if (Os) return ui;
  Os = 1;
  var o = He(), h = Object.prototype.hasOwnProperty;
  function d(c) {
    if (c === null) return !0;
    var t, e = c;
    for (t in e)
      if (h.call(e, t) && e[t] !== null)
        return !1;
    return !0;
  }
  function f(c) {
    return c !== null ? c : {};
  }
  return ui = new o("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: d,
    construct: f
  }), ui;
}
var ci, Ds;
function Mo() {
  return Ds || (Ds = 1, ci = nc().extend({
    implicit: [
      ic(),
      oc()
    ],
    explicit: [
      ac(),
      sc(),
      lc(),
      uc()
    ]
  })), ci;
}
var Ps;
function pd() {
  if (Ps) return Br;
  Ps = 1;
  var o = Ar(), h = br(), d = hd(), f = Mo(), c = Object.prototype.hasOwnProperty, t = 1, e = 2, n = 3, r = 4, i = 1, a = 2, u = 3, s = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, m = /[\x85\u2028\u2029]/, v = /[,\[\]\{\}]/, g = /^(?:!|!!|![a-z\-]+!)$/i, p = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function A(l) {
    return Object.prototype.toString.call(l);
  }
  function T(l) {
    return l === 10 || l === 13;
  }
  function O(l) {
    return l === 9 || l === 32;
  }
  function D(l) {
    return l === 9 || l === 32 || l === 10 || l === 13;
  }
  function P(l) {
    return l === 44 || l === 91 || l === 93 || l === 123 || l === 125;
  }
  function b(l) {
    var B;
    return 48 <= l && l <= 57 ? l - 48 : (B = l | 32, 97 <= B && B <= 102 ? B - 97 + 10 : -1);
  }
  function w(l) {
    return l === 120 ? 2 : l === 117 ? 4 : l === 85 ? 8 : 0;
  }
  function _(l) {
    return 48 <= l && l <= 57 ? l - 48 : -1;
  }
  function E(l) {
    return l === 48 ? "\0" : l === 97 ? "\x07" : l === 98 ? "\b" : l === 116 || l === 9 ? "	" : l === 110 ? `
` : l === 118 ? "\v" : l === 102 ? "\f" : l === 114 ? "\r" : l === 101 ? "\x1B" : l === 32 ? " " : l === 34 ? '"' : l === 47 ? "/" : l === 92 ? "\\" : l === 78 ? "" : l === 95 ? " " : l === 76 ? "\u2028" : l === 80 ? "\u2029" : "";
  }
  function U(l) {
    return l <= 65535 ? String.fromCharCode(l) : String.fromCharCode(
      (l - 65536 >> 10) + 55296,
      (l - 65536 & 1023) + 56320
    );
  }
  for (var F = new Array(256), x = new Array(256), q = 0; q < 256; q++)
    F[q] = E(q) ? 1 : 0, x[q] = E(q);
  function N(l, B) {
    this.input = l, this.filename = B.filename || null, this.schema = B.schema || f, this.onWarning = B.onWarning || null, this.legacy = B.legacy || !1, this.json = B.json || !1, this.listener = B.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = l.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
  }
  function I(l, B) {
    var G = {
      name: l.filename,
      buffer: l.input.slice(0, -1),
      // omit trailing \0
      position: l.position,
      line: l.line,
      column: l.position - l.lineStart
    };
    return G.snippet = d(G), new h(B, G);
  }
  function $(l, B) {
    throw I(l, B);
  }
  function M(l, B) {
    l.onWarning && l.onWarning.call(null, I(l, B));
  }
  var K = {
    YAML: function(B, G, re) {
      var W, te, Z;
      B.version !== null && $(B, "duplication of %YAML directive"), re.length !== 1 && $(B, "YAML directive accepts exactly one argument"), W = /^([0-9]+)\.([0-9]+)$/.exec(re[0]), W === null && $(B, "ill-formed argument of the YAML directive"), te = parseInt(W[1], 10), Z = parseInt(W[2], 10), te !== 1 && $(B, "unacceptable YAML version of the document"), B.version = re[0], B.checkLineBreaks = Z < 2, Z !== 1 && Z !== 2 && M(B, "unsupported YAML version of the document");
    },
    TAG: function(B, G, re) {
      var W, te;
      re.length !== 2 && $(B, "TAG directive accepts exactly two arguments"), W = re[0], te = re[1], g.test(W) || $(B, "ill-formed tag handle (first argument) of the TAG directive"), c.call(B.tagMap, W) && $(B, 'there is a previously declared suffix for "' + W + '" tag handle'), p.test(te) || $(B, "ill-formed tag prefix (second argument) of the TAG directive");
      try {
        te = decodeURIComponent(te);
      } catch {
        $(B, "tag prefix is malformed: " + te);
      }
      B.tagMap[W] = te;
    }
  };
  function V(l, B, G, re) {
    var W, te, Z, oe;
    if (B < G) {
      if (oe = l.input.slice(B, G), re)
        for (W = 0, te = oe.length; W < te; W += 1)
          Z = oe.charCodeAt(W), Z === 9 || 32 <= Z && Z <= 1114111 || $(l, "expected valid JSON character");
      else s.test(oe) && $(l, "the stream contains non-printable characters");
      l.result += oe;
    }
  }
  function ne(l, B, G, re) {
    var W, te, Z, oe;
    for (o.isObject(G) || $(l, "cannot merge mappings; the provided source object is unacceptable"), W = Object.keys(G), Z = 0, oe = W.length; Z < oe; Z += 1)
      te = W[Z], c.call(B, te) || (B[te] = G[te], re[te] = !0);
  }
  function ce(l, B, G, re, W, te, Z, oe, ge) {
    var ve, Re;
    if (Array.isArray(W))
      for (W = Array.prototype.slice.call(W), ve = 0, Re = W.length; ve < Re; ve += 1)
        Array.isArray(W[ve]) && $(l, "nested arrays are not supported inside keys"), typeof W == "object" && A(W[ve]) === "[object Object]" && (W[ve] = "[object Object]");
    if (typeof W == "object" && A(W) === "[object Object]" && (W = "[object Object]"), W = String(W), B === null && (B = {}), re === "tag:yaml.org,2002:merge")
      if (Array.isArray(te))
        for (ve = 0, Re = te.length; ve < Re; ve += 1)
          ne(l, B, te[ve], G);
      else
        ne(l, B, te, G);
    else
      !l.json && !c.call(G, W) && c.call(B, W) && (l.line = Z || l.line, l.lineStart = oe || l.lineStart, l.position = ge || l.position, $(l, "duplicated mapping key")), W === "__proto__" ? Object.defineProperty(B, W, {
        configurable: !0,
        enumerable: !0,
        writable: !0,
        value: te
      }) : B[W] = te, delete G[W];
    return B;
  }
  function ue(l) {
    var B;
    B = l.input.charCodeAt(l.position), B === 10 ? l.position++ : B === 13 ? (l.position++, l.input.charCodeAt(l.position) === 10 && l.position++) : $(l, "a line break is expected"), l.line += 1, l.lineStart = l.position, l.firstTabInLine = -1;
  }
  function ie(l, B, G) {
    for (var re = 0, W = l.input.charCodeAt(l.position); W !== 0; ) {
      for (; O(W); )
        W === 9 && l.firstTabInLine === -1 && (l.firstTabInLine = l.position), W = l.input.charCodeAt(++l.position);
      if (B && W === 35)
        do
          W = l.input.charCodeAt(++l.position);
        while (W !== 10 && W !== 13 && W !== 0);
      if (T(W))
        for (ue(l), W = l.input.charCodeAt(l.position), re++, l.lineIndent = 0; W === 32; )
          l.lineIndent++, W = l.input.charCodeAt(++l.position);
      else
        break;
    }
    return G !== -1 && re !== 0 && l.lineIndent < G && M(l, "deficient indentation"), re;
  }
  function be(l) {
    var B = l.position, G;
    return G = l.input.charCodeAt(B), !!((G === 45 || G === 46) && G === l.input.charCodeAt(B + 1) && G === l.input.charCodeAt(B + 2) && (B += 3, G = l.input.charCodeAt(B), G === 0 || D(G)));
  }
  function J(l, B) {
    B === 1 ? l.result += " " : B > 1 && (l.result += o.repeat(`
`, B - 1));
  }
  function ye(l, B, G) {
    var re, W, te, Z, oe, ge, ve, Re, de = l.kind, Le = l.result, S;
    if (S = l.input.charCodeAt(l.position), D(S) || P(S) || S === 35 || S === 38 || S === 42 || S === 33 || S === 124 || S === 62 || S === 39 || S === 34 || S === 37 || S === 64 || S === 96 || (S === 63 || S === 45) && (W = l.input.charCodeAt(l.position + 1), D(W) || G && P(W)))
      return !1;
    for (l.kind = "scalar", l.result = "", te = Z = l.position, oe = !1; S !== 0; ) {
      if (S === 58) {
        if (W = l.input.charCodeAt(l.position + 1), D(W) || G && P(W))
          break;
      } else if (S === 35) {
        if (re = l.input.charCodeAt(l.position - 1), D(re))
          break;
      } else {
        if (l.position === l.lineStart && be(l) || G && P(S))
          break;
        if (T(S))
          if (ge = l.line, ve = l.lineStart, Re = l.lineIndent, ie(l, !1, -1), l.lineIndent >= B) {
            oe = !0, S = l.input.charCodeAt(l.position);
            continue;
          } else {
            l.position = Z, l.line = ge, l.lineStart = ve, l.lineIndent = Re;
            break;
          }
      }
      oe && (V(l, te, Z, !1), J(l, l.line - ge), te = Z = l.position, oe = !1), O(S) || (Z = l.position + 1), S = l.input.charCodeAt(++l.position);
    }
    return V(l, te, Z, !1), l.result ? !0 : (l.kind = de, l.result = Le, !1);
  }
  function R(l, B) {
    var G, re, W;
    if (G = l.input.charCodeAt(l.position), G !== 39)
      return !1;
    for (l.kind = "scalar", l.result = "", l.position++, re = W = l.position; (G = l.input.charCodeAt(l.position)) !== 0; )
      if (G === 39)
        if (V(l, re, l.position, !0), G = l.input.charCodeAt(++l.position), G === 39)
          re = l.position, l.position++, W = l.position;
        else
          return !0;
      else T(G) ? (V(l, re, W, !0), J(l, ie(l, !1, B)), re = W = l.position) : l.position === l.lineStart && be(l) ? $(l, "unexpected end of the document within a single quoted scalar") : (l.position++, W = l.position);
    $(l, "unexpected end of the stream within a single quoted scalar");
  }
  function y(l, B) {
    var G, re, W, te, Z, oe;
    if (oe = l.input.charCodeAt(l.position), oe !== 34)
      return !1;
    for (l.kind = "scalar", l.result = "", l.position++, G = re = l.position; (oe = l.input.charCodeAt(l.position)) !== 0; ) {
      if (oe === 34)
        return V(l, G, l.position, !0), l.position++, !0;
      if (oe === 92) {
        if (V(l, G, l.position, !0), oe = l.input.charCodeAt(++l.position), T(oe))
          ie(l, !1, B);
        else if (oe < 256 && F[oe])
          l.result += x[oe], l.position++;
        else if ((Z = w(oe)) > 0) {
          for (W = Z, te = 0; W > 0; W--)
            oe = l.input.charCodeAt(++l.position), (Z = b(oe)) >= 0 ? te = (te << 4) + Z : $(l, "expected hexadecimal character");
          l.result += U(te), l.position++;
        } else
          $(l, "unknown escape sequence");
        G = re = l.position;
      } else T(oe) ? (V(l, G, re, !0), J(l, ie(l, !1, B)), G = re = l.position) : l.position === l.lineStart && be(l) ? $(l, "unexpected end of the document within a double quoted scalar") : (l.position++, re = l.position);
    }
    $(l, "unexpected end of the stream within a double quoted scalar");
  }
  function j(l, B) {
    var G = !0, re, W, te, Z = l.tag, oe, ge = l.anchor, ve, Re, de, Le, S, H = /* @__PURE__ */ Object.create(null), X, z, Q, ee;
    if (ee = l.input.charCodeAt(l.position), ee === 91)
      Re = 93, S = !1, oe = [];
    else if (ee === 123)
      Re = 125, S = !0, oe = {};
    else
      return !1;
    for (l.anchor !== null && (l.anchorMap[l.anchor] = oe), ee = l.input.charCodeAt(++l.position); ee !== 0; ) {
      if (ie(l, !0, B), ee = l.input.charCodeAt(l.position), ee === Re)
        return l.position++, l.tag = Z, l.anchor = ge, l.kind = S ? "mapping" : "sequence", l.result = oe, !0;
      G ? ee === 44 && $(l, "expected the node content, but found ','") : $(l, "missed comma between flow collection entries"), z = X = Q = null, de = Le = !1, ee === 63 && (ve = l.input.charCodeAt(l.position + 1), D(ve) && (de = Le = !0, l.position++, ie(l, !0, B))), re = l.line, W = l.lineStart, te = l.position, xe(l, B, t, !1, !0), z = l.tag, X = l.result, ie(l, !0, B), ee = l.input.charCodeAt(l.position), (Le || l.line === re) && ee === 58 && (de = !0, ee = l.input.charCodeAt(++l.position), ie(l, !0, B), xe(l, B, t, !1, !0), Q = l.result), S ? ce(l, oe, H, z, X, Q, re, W, te) : de ? oe.push(ce(l, null, H, z, X, Q, re, W, te)) : oe.push(X), ie(l, !0, B), ee = l.input.charCodeAt(l.position), ee === 44 ? (G = !0, ee = l.input.charCodeAt(++l.position)) : G = !1;
    }
    $(l, "unexpected end of the stream within a flow collection");
  }
  function L(l, B) {
    var G, re, W = i, te = !1, Z = !1, oe = B, ge = 0, ve = !1, Re, de;
    if (de = l.input.charCodeAt(l.position), de === 124)
      re = !1;
    else if (de === 62)
      re = !0;
    else
      return !1;
    for (l.kind = "scalar", l.result = ""; de !== 0; )
      if (de = l.input.charCodeAt(++l.position), de === 43 || de === 45)
        i === W ? W = de === 43 ? u : a : $(l, "repeat of a chomping mode identifier");
      else if ((Re = _(de)) >= 0)
        Re === 0 ? $(l, "bad explicit indentation width of a block scalar; it cannot be less than one") : Z ? $(l, "repeat of an indentation width identifier") : (oe = B + Re - 1, Z = !0);
      else
        break;
    if (O(de)) {
      do
        de = l.input.charCodeAt(++l.position);
      while (O(de));
      if (de === 35)
        do
          de = l.input.charCodeAt(++l.position);
        while (!T(de) && de !== 0);
    }
    for (; de !== 0; ) {
      for (ue(l), l.lineIndent = 0, de = l.input.charCodeAt(l.position); (!Z || l.lineIndent < oe) && de === 32; )
        l.lineIndent++, de = l.input.charCodeAt(++l.position);
      if (!Z && l.lineIndent > oe && (oe = l.lineIndent), T(de)) {
        ge++;
        continue;
      }
      if (l.lineIndent < oe) {
        W === u ? l.result += o.repeat(`
`, te ? 1 + ge : ge) : W === i && te && (l.result += `
`);
        break;
      }
      for (re ? O(de) ? (ve = !0, l.result += o.repeat(`
`, te ? 1 + ge : ge)) : ve ? (ve = !1, l.result += o.repeat(`
`, ge + 1)) : ge === 0 ? te && (l.result += " ") : l.result += o.repeat(`
`, ge) : l.result += o.repeat(`
`, te ? 1 + ge : ge), te = !0, Z = !0, ge = 0, G = l.position; !T(de) && de !== 0; )
        de = l.input.charCodeAt(++l.position);
      V(l, G, l.position, !1);
    }
    return !0;
  }
  function le(l, B) {
    var G, re = l.tag, W = l.anchor, te = [], Z, oe = !1, ge;
    if (l.firstTabInLine !== -1) return !1;
    for (l.anchor !== null && (l.anchorMap[l.anchor] = te), ge = l.input.charCodeAt(l.position); ge !== 0 && (l.firstTabInLine !== -1 && (l.position = l.firstTabInLine, $(l, "tab characters must not be used in indentation")), !(ge !== 45 || (Z = l.input.charCodeAt(l.position + 1), !D(Z)))); ) {
      if (oe = !0, l.position++, ie(l, !0, -1) && l.lineIndent <= B) {
        te.push(null), ge = l.input.charCodeAt(l.position);
        continue;
      }
      if (G = l.line, xe(l, B, n, !1, !0), te.push(l.result), ie(l, !0, -1), ge = l.input.charCodeAt(l.position), (l.line === G || l.lineIndent > B) && ge !== 0)
        $(l, "bad indentation of a sequence entry");
      else if (l.lineIndent < B)
        break;
    }
    return oe ? (l.tag = re, l.anchor = W, l.kind = "sequence", l.result = te, !0) : !1;
  }
  function me(l, B, G) {
    var re, W, te, Z, oe, ge, ve = l.tag, Re = l.anchor, de = {}, Le = /* @__PURE__ */ Object.create(null), S = null, H = null, X = null, z = !1, Q = !1, ee;
    if (l.firstTabInLine !== -1) return !1;
    for (l.anchor !== null && (l.anchorMap[l.anchor] = de), ee = l.input.charCodeAt(l.position); ee !== 0; ) {
      if (!z && l.firstTabInLine !== -1 && (l.position = l.firstTabInLine, $(l, "tab characters must not be used in indentation")), re = l.input.charCodeAt(l.position + 1), te = l.line, (ee === 63 || ee === 58) && D(re))
        ee === 63 ? (z && (ce(l, de, Le, S, H, null, Z, oe, ge), S = H = X = null), Q = !0, z = !0, W = !0) : z ? (z = !1, W = !0) : $(l, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), l.position += 1, ee = re;
      else {
        if (Z = l.line, oe = l.lineStart, ge = l.position, !xe(l, G, e, !1, !0))
          break;
        if (l.line === te) {
          for (ee = l.input.charCodeAt(l.position); O(ee); )
            ee = l.input.charCodeAt(++l.position);
          if (ee === 58)
            ee = l.input.charCodeAt(++l.position), D(ee) || $(l, "a whitespace character is expected after the key-value separator within a block mapping"), z && (ce(l, de, Le, S, H, null, Z, oe, ge), S = H = X = null), Q = !0, z = !1, W = !1, S = l.tag, H = l.result;
          else if (Q)
            $(l, "can not read an implicit mapping pair; a colon is missed");
          else
            return l.tag = ve, l.anchor = Re, !0;
        } else if (Q)
          $(l, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else
          return l.tag = ve, l.anchor = Re, !0;
      }
      if ((l.line === te || l.lineIndent > B) && (z && (Z = l.line, oe = l.lineStart, ge = l.position), xe(l, B, r, !0, W) && (z ? H = l.result : X = l.result), z || (ce(l, de, Le, S, H, X, Z, oe, ge), S = H = X = null), ie(l, !0, -1), ee = l.input.charCodeAt(l.position)), (l.line === te || l.lineIndent > B) && ee !== 0)
        $(l, "bad indentation of a mapping entry");
      else if (l.lineIndent < B)
        break;
    }
    return z && ce(l, de, Le, S, H, null, Z, oe, ge), Q && (l.tag = ve, l.anchor = Re, l.kind = "mapping", l.result = de), Q;
  }
  function pe(l) {
    var B, G = !1, re = !1, W, te, Z;
    if (Z = l.input.charCodeAt(l.position), Z !== 33) return !1;
    if (l.tag !== null && $(l, "duplication of a tag property"), Z = l.input.charCodeAt(++l.position), Z === 60 ? (G = !0, Z = l.input.charCodeAt(++l.position)) : Z === 33 ? (re = !0, W = "!!", Z = l.input.charCodeAt(++l.position)) : W = "!", B = l.position, G) {
      do
        Z = l.input.charCodeAt(++l.position);
      while (Z !== 0 && Z !== 62);
      l.position < l.length ? (te = l.input.slice(B, l.position), Z = l.input.charCodeAt(++l.position)) : $(l, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; Z !== 0 && !D(Z); )
        Z === 33 && (re ? $(l, "tag suffix cannot contain exclamation marks") : (W = l.input.slice(B - 1, l.position + 1), g.test(W) || $(l, "named tag handle cannot contain such characters"), re = !0, B = l.position + 1)), Z = l.input.charCodeAt(++l.position);
      te = l.input.slice(B, l.position), v.test(te) && $(l, "tag suffix cannot contain flow indicator characters");
    }
    te && !p.test(te) && $(l, "tag name cannot contain such characters: " + te);
    try {
      te = decodeURIComponent(te);
    } catch {
      $(l, "tag name is malformed: " + te);
    }
    return G ? l.tag = te : c.call(l.tagMap, W) ? l.tag = l.tagMap[W] + te : W === "!" ? l.tag = "!" + te : W === "!!" ? l.tag = "tag:yaml.org,2002:" + te : $(l, 'undeclared tag handle "' + W + '"'), !0;
  }
  function _e(l) {
    var B, G;
    if (G = l.input.charCodeAt(l.position), G !== 38) return !1;
    for (l.anchor !== null && $(l, "duplication of an anchor property"), G = l.input.charCodeAt(++l.position), B = l.position; G !== 0 && !D(G) && !P(G); )
      G = l.input.charCodeAt(++l.position);
    return l.position === B && $(l, "name of an anchor node must contain at least one character"), l.anchor = l.input.slice(B, l.position), !0;
  }
  function Ee(l) {
    var B, G, re;
    if (re = l.input.charCodeAt(l.position), re !== 42) return !1;
    for (re = l.input.charCodeAt(++l.position), B = l.position; re !== 0 && !D(re) && !P(re); )
      re = l.input.charCodeAt(++l.position);
    return l.position === B && $(l, "name of an alias node must contain at least one character"), G = l.input.slice(B, l.position), c.call(l.anchorMap, G) || $(l, 'unidentified alias "' + G + '"'), l.result = l.anchorMap[G], ie(l, !0, -1), !0;
  }
  function xe(l, B, G, re, W) {
    var te, Z, oe, ge = 1, ve = !1, Re = !1, de, Le, S, H, X, z;
    if (l.listener !== null && l.listener("open", l), l.tag = null, l.anchor = null, l.kind = null, l.result = null, te = Z = oe = r === G || n === G, re && ie(l, !0, -1) && (ve = !0, l.lineIndent > B ? ge = 1 : l.lineIndent === B ? ge = 0 : l.lineIndent < B && (ge = -1)), ge === 1)
      for (; pe(l) || _e(l); )
        ie(l, !0, -1) ? (ve = !0, oe = te, l.lineIndent > B ? ge = 1 : l.lineIndent === B ? ge = 0 : l.lineIndent < B && (ge = -1)) : oe = !1;
    if (oe && (oe = ve || W), (ge === 1 || r === G) && (t === G || e === G ? X = B : X = B + 1, z = l.position - l.lineStart, ge === 1 ? oe && (le(l, z) || me(l, z, X)) || j(l, X) ? Re = !0 : (Z && L(l, X) || R(l, X) || y(l, X) ? Re = !0 : Ee(l) ? (Re = !0, (l.tag !== null || l.anchor !== null) && $(l, "alias node should not have any properties")) : ye(l, X, t === G) && (Re = !0, l.tag === null && (l.tag = "?")), l.anchor !== null && (l.anchorMap[l.anchor] = l.result)) : ge === 0 && (Re = oe && le(l, z))), l.tag === null)
      l.anchor !== null && (l.anchorMap[l.anchor] = l.result);
    else if (l.tag === "?") {
      for (l.result !== null && l.kind !== "scalar" && $(l, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + l.kind + '"'), de = 0, Le = l.implicitTypes.length; de < Le; de += 1)
        if (H = l.implicitTypes[de], H.resolve(l.result)) {
          l.result = H.construct(l.result), l.tag = H.tag, l.anchor !== null && (l.anchorMap[l.anchor] = l.result);
          break;
        }
    } else if (l.tag !== "!") {
      if (c.call(l.typeMap[l.kind || "fallback"], l.tag))
        H = l.typeMap[l.kind || "fallback"][l.tag];
      else
        for (H = null, S = l.typeMap.multi[l.kind || "fallback"], de = 0, Le = S.length; de < Le; de += 1)
          if (l.tag.slice(0, S[de].tag.length) === S[de].tag) {
            H = S[de];
            break;
          }
      H || $(l, "unknown tag !<" + l.tag + ">"), l.result !== null && H.kind !== l.kind && $(l, "unacceptable node kind for !<" + l.tag + '> tag; it should be "' + H.kind + '", not "' + l.kind + '"'), H.resolve(l.result, l.tag) ? (l.result = H.construct(l.result, l.tag), l.anchor !== null && (l.anchorMap[l.anchor] = l.result)) : $(l, "cannot resolve a node with !<" + l.tag + "> explicit tag");
    }
    return l.listener !== null && l.listener("close", l), l.tag !== null || l.anchor !== null || Re;
  }
  function Oe(l) {
    var B = l.position, G, re, W, te = !1, Z;
    for (l.version = null, l.checkLineBreaks = l.legacy, l.tagMap = /* @__PURE__ */ Object.create(null), l.anchorMap = /* @__PURE__ */ Object.create(null); (Z = l.input.charCodeAt(l.position)) !== 0 && (ie(l, !0, -1), Z = l.input.charCodeAt(l.position), !(l.lineIndent > 0 || Z !== 37)); ) {
      for (te = !0, Z = l.input.charCodeAt(++l.position), G = l.position; Z !== 0 && !D(Z); )
        Z = l.input.charCodeAt(++l.position);
      for (re = l.input.slice(G, l.position), W = [], re.length < 1 && $(l, "directive name must not be less than one character in length"); Z !== 0; ) {
        for (; O(Z); )
          Z = l.input.charCodeAt(++l.position);
        if (Z === 35) {
          do
            Z = l.input.charCodeAt(++l.position);
          while (Z !== 0 && !T(Z));
          break;
        }
        if (T(Z)) break;
        for (G = l.position; Z !== 0 && !D(Z); )
          Z = l.input.charCodeAt(++l.position);
        W.push(l.input.slice(G, l.position));
      }
      Z !== 0 && ue(l), c.call(K, re) ? K[re](l, re, W) : M(l, 'unknown document directive "' + re + '"');
    }
    if (ie(l, !0, -1), l.lineIndent === 0 && l.input.charCodeAt(l.position) === 45 && l.input.charCodeAt(l.position + 1) === 45 && l.input.charCodeAt(l.position + 2) === 45 ? (l.position += 3, ie(l, !0, -1)) : te && $(l, "directives end mark is expected"), xe(l, l.lineIndent - 1, r, !1, !0), ie(l, !0, -1), l.checkLineBreaks && m.test(l.input.slice(B, l.position)) && M(l, "non-ASCII line breaks are interpreted as content"), l.documents.push(l.result), l.position === l.lineStart && be(l)) {
      l.input.charCodeAt(l.position) === 46 && (l.position += 3, ie(l, !0, -1));
      return;
    }
    if (l.position < l.length - 1)
      $(l, "end of the stream or a document separator is expected");
    else
      return;
  }
  function qe(l, B) {
    l = String(l), B = B || {}, l.length !== 0 && (l.charCodeAt(l.length - 1) !== 10 && l.charCodeAt(l.length - 1) !== 13 && (l += `
`), l.charCodeAt(0) === 65279 && (l = l.slice(1)));
    var G = new N(l, B), re = l.indexOf("\0");
    for (re !== -1 && (G.position = re, $(G, "null byte is not allowed in input")), G.input += "\0"; G.input.charCodeAt(G.position) === 32; )
      G.lineIndent += 1, G.position += 1;
    for (; G.position < G.length - 1; )
      Oe(G);
    return G.documents;
  }
  function wt(l, B, G) {
    B !== null && typeof B == "object" && typeof G > "u" && (G = B, B = null);
    var re = qe(l, G);
    if (typeof B != "function")
      return re;
    for (var W = 0, te = re.length; W < te; W += 1)
      B(re[W]);
  }
  function st(l, B) {
    var G = qe(l, B);
    if (G.length !== 0) {
      if (G.length === 1)
        return G[0];
      throw new h("expected a single document in the stream, but found more");
    }
  }
  return Br.loadAll = wt, Br.load = st, Br;
}
var fi = {}, Is;
function md() {
  if (Is) return fi;
  Is = 1;
  var o = Ar(), h = br(), d = Mo(), f = Object.prototype.toString, c = Object.prototype.hasOwnProperty, t = 65279, e = 9, n = 10, r = 13, i = 32, a = 33, u = 34, s = 35, m = 37, v = 38, g = 39, p = 42, A = 44, T = 45, O = 58, D = 61, P = 62, b = 63, w = 64, _ = 91, E = 93, U = 96, F = 123, x = 124, q = 125, N = {};
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
  ], $ = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function M(S, H) {
    var X, z, Q, ee, fe, ae, he;
    if (H === null) return {};
    for (X = {}, z = Object.keys(H), Q = 0, ee = z.length; Q < ee; Q += 1)
      fe = z[Q], ae = String(H[fe]), fe.slice(0, 2) === "!!" && (fe = "tag:yaml.org,2002:" + fe.slice(2)), he = S.compiledTypeMap.fallback[fe], he && c.call(he.styleAliases, ae) && (ae = he.styleAliases[ae]), X[fe] = ae;
    return X;
  }
  function K(S) {
    var H, X, z;
    if (H = S.toString(16).toUpperCase(), S <= 255)
      X = "x", z = 2;
    else if (S <= 65535)
      X = "u", z = 4;
    else if (S <= 4294967295)
      X = "U", z = 8;
    else
      throw new h("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + X + o.repeat("0", z - H.length) + H;
  }
  var V = 1, ne = 2;
  function ce(S) {
    this.schema = S.schema || d, this.indent = Math.max(1, S.indent || 2), this.noArrayIndent = S.noArrayIndent || !1, this.skipInvalid = S.skipInvalid || !1, this.flowLevel = o.isNothing(S.flowLevel) ? -1 : S.flowLevel, this.styleMap = M(this.schema, S.styles || null), this.sortKeys = S.sortKeys || !1, this.lineWidth = S.lineWidth || 80, this.noRefs = S.noRefs || !1, this.noCompatMode = S.noCompatMode || !1, this.condenseFlow = S.condenseFlow || !1, this.quotingType = S.quotingType === '"' ? ne : V, this.forceQuotes = S.forceQuotes || !1, this.replacer = typeof S.replacer == "function" ? S.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
  }
  function ue(S, H) {
    for (var X = o.repeat(" ", H), z = 0, Q = -1, ee = "", fe, ae = S.length; z < ae; )
      Q = S.indexOf(`
`, z), Q === -1 ? (fe = S.slice(z), z = ae) : (fe = S.slice(z, Q + 1), z = Q + 1), fe.length && fe !== `
` && (ee += X), ee += fe;
    return ee;
  }
  function ie(S, H) {
    return `
` + o.repeat(" ", S.indent * H);
  }
  function be(S, H) {
    var X, z, Q;
    for (X = 0, z = S.implicitTypes.length; X < z; X += 1)
      if (Q = S.implicitTypes[X], Q.resolve(H))
        return !0;
    return !1;
  }
  function J(S) {
    return S === i || S === e;
  }
  function ye(S) {
    return 32 <= S && S <= 126 || 161 <= S && S <= 55295 && S !== 8232 && S !== 8233 || 57344 <= S && S <= 65533 && S !== t || 65536 <= S && S <= 1114111;
  }
  function R(S) {
    return ye(S) && S !== t && S !== r && S !== n;
  }
  function y(S, H, X) {
    var z = R(S), Q = z && !J(S);
    return (
      // ns-plain-safe
      (X ? (
        // c = flow-in
        z
      ) : z && S !== A && S !== _ && S !== E && S !== F && S !== q) && S !== s && !(H === O && !Q) || R(H) && !J(H) && S === s || H === O && Q
    );
  }
  function j(S) {
    return ye(S) && S !== t && !J(S) && S !== T && S !== b && S !== O && S !== A && S !== _ && S !== E && S !== F && S !== q && S !== s && S !== v && S !== p && S !== a && S !== x && S !== D && S !== P && S !== g && S !== u && S !== m && S !== w && S !== U;
  }
  function L(S) {
    return !J(S) && S !== O;
  }
  function le(S, H) {
    var X = S.charCodeAt(H), z;
    return X >= 55296 && X <= 56319 && H + 1 < S.length && (z = S.charCodeAt(H + 1), z >= 56320 && z <= 57343) ? (X - 55296) * 1024 + z - 56320 + 65536 : X;
  }
  function me(S) {
    var H = /^\n* /;
    return H.test(S);
  }
  var pe = 1, _e = 2, Ee = 3, xe = 4, Oe = 5;
  function qe(S, H, X, z, Q, ee, fe, ae) {
    var he, we = 0, De = null, Ne = !1, Te = !1, Lt = z !== -1, Ze = -1, _t = j(le(S, 0)) && L(le(S, S.length - 1));
    if (H || fe)
      for (he = 0; he < S.length; we >= 65536 ? he += 2 : he++) {
        if (we = le(S, he), !ye(we))
          return Oe;
        _t = _t && y(we, De, ae), De = we;
      }
    else {
      for (he = 0; he < S.length; we >= 65536 ? he += 2 : he++) {
        if (we = le(S, he), we === n)
          Ne = !0, Lt && (Te = Te || // Foldable line = too long, and not more-indented.
          he - Ze - 1 > z && S[Ze + 1] !== " ", Ze = he);
        else if (!ye(we))
          return Oe;
        _t = _t && y(we, De, ae), De = we;
      }
      Te = Te || Lt && he - Ze - 1 > z && S[Ze + 1] !== " ";
    }
    return !Ne && !Te ? _t && !fe && !Q(S) ? pe : ee === ne ? Oe : _e : X > 9 && me(S) ? Oe : fe ? ee === ne ? Oe : _e : Te ? xe : Ee;
  }
  function wt(S, H, X, z, Q) {
    S.dump = function() {
      if (H.length === 0)
        return S.quotingType === ne ? '""' : "''";
      if (!S.noCompatMode && (I.indexOf(H) !== -1 || $.test(H)))
        return S.quotingType === ne ? '"' + H + '"' : "'" + H + "'";
      var ee = S.indent * Math.max(1, X), fe = S.lineWidth === -1 ? -1 : Math.max(Math.min(S.lineWidth, 40), S.lineWidth - ee), ae = z || S.flowLevel > -1 && X >= S.flowLevel;
      function he(we) {
        return be(S, we);
      }
      switch (qe(
        H,
        ae,
        S.indent,
        fe,
        he,
        S.quotingType,
        S.forceQuotes && !z,
        Q
      )) {
        case pe:
          return H;
        case _e:
          return "'" + H.replace(/'/g, "''") + "'";
        case Ee:
          return "|" + st(H, S.indent) + l(ue(H, ee));
        case xe:
          return ">" + st(H, S.indent) + l(ue(B(H, fe), ee));
        case Oe:
          return '"' + re(H) + '"';
        default:
          throw new h("impossible error: invalid scalar style");
      }
    }();
  }
  function st(S, H) {
    var X = me(S) ? String(H) : "", z = S[S.length - 1] === `
`, Q = z && (S[S.length - 2] === `
` || S === `
`), ee = Q ? "+" : z ? "" : "-";
    return X + ee + `
`;
  }
  function l(S) {
    return S[S.length - 1] === `
` ? S.slice(0, -1) : S;
  }
  function B(S, H) {
    for (var X = /(\n+)([^\n]*)/g, z = function() {
      var we = S.indexOf(`
`);
      return we = we !== -1 ? we : S.length, X.lastIndex = we, G(S.slice(0, we), H);
    }(), Q = S[0] === `
` || S[0] === " ", ee, fe; fe = X.exec(S); ) {
      var ae = fe[1], he = fe[2];
      ee = he[0] === " ", z += ae + (!Q && !ee && he !== "" ? `
` : "") + G(he, H), Q = ee;
    }
    return z;
  }
  function G(S, H) {
    if (S === "" || S[0] === " ") return S;
    for (var X = / [^ ]/g, z, Q = 0, ee, fe = 0, ae = 0, he = ""; z = X.exec(S); )
      ae = z.index, ae - Q > H && (ee = fe > Q ? fe : ae, he += `
` + S.slice(Q, ee), Q = ee + 1), fe = ae;
    return he += `
`, S.length - Q > H && fe > Q ? he += S.slice(Q, fe) + `
` + S.slice(fe + 1) : he += S.slice(Q), he.slice(1);
  }
  function re(S) {
    for (var H = "", X = 0, z, Q = 0; Q < S.length; X >= 65536 ? Q += 2 : Q++)
      X = le(S, Q), z = N[X], !z && ye(X) ? (H += S[Q], X >= 65536 && (H += S[Q + 1])) : H += z || K(X);
    return H;
  }
  function W(S, H, X) {
    var z = "", Q = S.tag, ee, fe, ae;
    for (ee = 0, fe = X.length; ee < fe; ee += 1)
      ae = X[ee], S.replacer && (ae = S.replacer.call(X, String(ee), ae)), (ve(S, H, ae, !1, !1) || typeof ae > "u" && ve(S, H, null, !1, !1)) && (z !== "" && (z += "," + (S.condenseFlow ? "" : " ")), z += S.dump);
    S.tag = Q, S.dump = "[" + z + "]";
  }
  function te(S, H, X, z) {
    var Q = "", ee = S.tag, fe, ae, he;
    for (fe = 0, ae = X.length; fe < ae; fe += 1)
      he = X[fe], S.replacer && (he = S.replacer.call(X, String(fe), he)), (ve(S, H + 1, he, !0, !0, !1, !0) || typeof he > "u" && ve(S, H + 1, null, !0, !0, !1, !0)) && ((!z || Q !== "") && (Q += ie(S, H)), S.dump && n === S.dump.charCodeAt(0) ? Q += "-" : Q += "- ", Q += S.dump);
    S.tag = ee, S.dump = Q || "[]";
  }
  function Z(S, H, X) {
    var z = "", Q = S.tag, ee = Object.keys(X), fe, ae, he, we, De;
    for (fe = 0, ae = ee.length; fe < ae; fe += 1)
      De = "", z !== "" && (De += ", "), S.condenseFlow && (De += '"'), he = ee[fe], we = X[he], S.replacer && (we = S.replacer.call(X, he, we)), ve(S, H, he, !1, !1) && (S.dump.length > 1024 && (De += "? "), De += S.dump + (S.condenseFlow ? '"' : "") + ":" + (S.condenseFlow ? "" : " "), ve(S, H, we, !1, !1) && (De += S.dump, z += De));
    S.tag = Q, S.dump = "{" + z + "}";
  }
  function oe(S, H, X, z) {
    var Q = "", ee = S.tag, fe = Object.keys(X), ae, he, we, De, Ne, Te;
    if (S.sortKeys === !0)
      fe.sort();
    else if (typeof S.sortKeys == "function")
      fe.sort(S.sortKeys);
    else if (S.sortKeys)
      throw new h("sortKeys must be a boolean or a function");
    for (ae = 0, he = fe.length; ae < he; ae += 1)
      Te = "", (!z || Q !== "") && (Te += ie(S, H)), we = fe[ae], De = X[we], S.replacer && (De = S.replacer.call(X, we, De)), ve(S, H + 1, we, !0, !0, !0) && (Ne = S.tag !== null && S.tag !== "?" || S.dump && S.dump.length > 1024, Ne && (S.dump && n === S.dump.charCodeAt(0) ? Te += "?" : Te += "? "), Te += S.dump, Ne && (Te += ie(S, H)), ve(S, H + 1, De, !0, Ne) && (S.dump && n === S.dump.charCodeAt(0) ? Te += ":" : Te += ": ", Te += S.dump, Q += Te));
    S.tag = ee, S.dump = Q || "{}";
  }
  function ge(S, H, X) {
    var z, Q, ee, fe, ae, he;
    for (Q = X ? S.explicitTypes : S.implicitTypes, ee = 0, fe = Q.length; ee < fe; ee += 1)
      if (ae = Q[ee], (ae.instanceOf || ae.predicate) && (!ae.instanceOf || typeof H == "object" && H instanceof ae.instanceOf) && (!ae.predicate || ae.predicate(H))) {
        if (X ? ae.multi && ae.representName ? S.tag = ae.representName(H) : S.tag = ae.tag : S.tag = "?", ae.represent) {
          if (he = S.styleMap[ae.tag] || ae.defaultStyle, f.call(ae.represent) === "[object Function]")
            z = ae.represent(H, he);
          else if (c.call(ae.represent, he))
            z = ae.represent[he](H, he);
          else
            throw new h("!<" + ae.tag + '> tag resolver accepts not "' + he + '" style');
          S.dump = z;
        }
        return !0;
      }
    return !1;
  }
  function ve(S, H, X, z, Q, ee, fe) {
    S.tag = null, S.dump = X, ge(S, X, !1) || ge(S, X, !0);
    var ae = f.call(S.dump), he = z, we;
    z && (z = S.flowLevel < 0 || S.flowLevel > H);
    var De = ae === "[object Object]" || ae === "[object Array]", Ne, Te;
    if (De && (Ne = S.duplicates.indexOf(X), Te = Ne !== -1), (S.tag !== null && S.tag !== "?" || Te || S.indent !== 2 && H > 0) && (Q = !1), Te && S.usedDuplicates[Ne])
      S.dump = "*ref_" + Ne;
    else {
      if (De && Te && !S.usedDuplicates[Ne] && (S.usedDuplicates[Ne] = !0), ae === "[object Object]")
        z && Object.keys(S.dump).length !== 0 ? (oe(S, H, S.dump, Q), Te && (S.dump = "&ref_" + Ne + S.dump)) : (Z(S, H, S.dump), Te && (S.dump = "&ref_" + Ne + " " + S.dump));
      else if (ae === "[object Array]")
        z && S.dump.length !== 0 ? (S.noArrayIndent && !fe && H > 0 ? te(S, H - 1, S.dump, Q) : te(S, H, S.dump, Q), Te && (S.dump = "&ref_" + Ne + S.dump)) : (W(S, H, S.dump), Te && (S.dump = "&ref_" + Ne + " " + S.dump));
      else if (ae === "[object String]")
        S.tag !== "?" && wt(S, S.dump, H, ee, he);
      else {
        if (ae === "[object Undefined]")
          return !1;
        if (S.skipInvalid) return !1;
        throw new h("unacceptable kind of an object to dump " + ae);
      }
      S.tag !== null && S.tag !== "?" && (we = encodeURI(
        S.tag[0] === "!" ? S.tag.slice(1) : S.tag
      ).replace(/!/g, "%21"), S.tag[0] === "!" ? we = "!" + we : we.slice(0, 18) === "tag:yaml.org,2002:" ? we = "!!" + we.slice(18) : we = "!<" + we + ">", S.dump = we + " " + S.dump);
    }
    return !0;
  }
  function Re(S, H) {
    var X = [], z = [], Q, ee;
    for (de(S, X, z), Q = 0, ee = z.length; Q < ee; Q += 1)
      H.duplicates.push(X[z[Q]]);
    H.usedDuplicates = new Array(ee);
  }
  function de(S, H, X) {
    var z, Q, ee;
    if (S !== null && typeof S == "object")
      if (Q = H.indexOf(S), Q !== -1)
        X.indexOf(Q) === -1 && X.push(Q);
      else if (H.push(S), Array.isArray(S))
        for (Q = 0, ee = S.length; Q < ee; Q += 1)
          de(S[Q], H, X);
      else
        for (z = Object.keys(S), Q = 0, ee = z.length; Q < ee; Q += 1)
          de(S[z[Q]], H, X);
  }
  function Le(S, H) {
    H = H || {};
    var X = new ce(H);
    X.noRefs || Re(S, X);
    var z = S;
    return X.replacer && (z = X.replacer.call({ "": z }, "", z)), ve(X, 0, z, !0, !0) ? X.dump + `
` : "";
  }
  return fi.dump = Le, fi;
}
var Ns;
function Bo() {
  if (Ns) return je;
  Ns = 1;
  var o = pd(), h = md();
  function d(f, c) {
    return function() {
      throw new Error("Function yaml." + f + " is removed in js-yaml 4. Use yaml." + c + " instead, which is now safe by default.");
    };
  }
  return je.Type = He(), je.Schema = zu(), je.FAILSAFE_SCHEMA = Ku(), je.JSON_SCHEMA = rc(), je.CORE_SCHEMA = nc(), je.DEFAULT_SCHEMA = Mo(), je.load = o.load, je.loadAll = o.loadAll, je.dump = h.dump, je.YAMLException = br(), je.types = {
    binary: ac(),
    float: tc(),
    map: Ju(),
    null: Qu(),
    pairs: lc(),
    set: uc(),
    timestamp: ic(),
    bool: Zu(),
    int: ec(),
    merge: oc(),
    omap: sc(),
    seq: Xu(),
    str: Yu()
  }, je.safeLoad = d("safeLoad", "load"), je.safeLoadAll = d("safeLoadAll", "loadAll"), je.safeDump = d("safeDump", "dump"), je;
}
var Zt = {}, Fs;
function gd() {
  if (Fs) return Zt;
  Fs = 1, Object.defineProperty(Zt, "__esModule", { value: !0 }), Zt.Lazy = void 0;
  class o {
    constructor(d) {
      this._value = null, this.creator = d;
    }
    get hasValue() {
      return this.creator == null;
    }
    get value() {
      if (this.creator == null)
        return this._value;
      const d = this.creator();
      return this.value = d, d;
    }
    set value(d) {
      this._value = d, this.creator = null;
    }
  }
  return Zt.Lazy = o, Zt;
}
var jr = { exports: {} }, di, xs;
function Xr() {
  if (xs) return di;
  xs = 1;
  const o = "2.0.0", h = 256, d = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, f = 16, c = h - 6;
  return di = {
    MAX_LENGTH: h,
    MAX_SAFE_COMPONENT_LENGTH: f,
    MAX_SAFE_BUILD_LENGTH: c,
    MAX_SAFE_INTEGER: d,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: o,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, di;
}
var hi, Ls;
function Jr() {
  return Ls || (Ls = 1, hi = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...h) => console.error("SEMVER", ...h) : () => {
  }), hi;
}
var $s;
function Rr() {
  return $s || ($s = 1, function(o, h) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: d,
      MAX_SAFE_BUILD_LENGTH: f,
      MAX_LENGTH: c
    } = Xr(), t = Jr();
    h = o.exports = {};
    const e = h.re = [], n = h.safeRe = [], r = h.src = [], i = h.safeSrc = [], a = h.t = {};
    let u = 0;
    const s = "[a-zA-Z0-9-]", m = [
      ["\\s", 1],
      ["\\d", c],
      [s, f]
    ], v = (p) => {
      for (const [A, T] of m)
        p = p.split(`${A}*`).join(`${A}{0,${T}}`).split(`${A}+`).join(`${A}{1,${T}}`);
      return p;
    }, g = (p, A, T) => {
      const O = v(A), D = u++;
      t(p, D, A), a[p] = D, r[D] = A, i[D] = O, e[D] = new RegExp(A, T ? "g" : void 0), n[D] = new RegExp(O, T ? "g" : void 0);
    };
    g("NUMERICIDENTIFIER", "0|[1-9]\\d*"), g("NUMERICIDENTIFIERLOOSE", "\\d+"), g("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${s}*`), g("MAINVERSION", `(${r[a.NUMERICIDENTIFIER]})\\.(${r[a.NUMERICIDENTIFIER]})\\.(${r[a.NUMERICIDENTIFIER]})`), g("MAINVERSIONLOOSE", `(${r[a.NUMERICIDENTIFIERLOOSE]})\\.(${r[a.NUMERICIDENTIFIERLOOSE]})\\.(${r[a.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASEIDENTIFIER", `(?:${r[a.NONNUMERICIDENTIFIER]}|${r[a.NUMERICIDENTIFIER]})`), g("PRERELEASEIDENTIFIERLOOSE", `(?:${r[a.NONNUMERICIDENTIFIER]}|${r[a.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASE", `(?:-(${r[a.PRERELEASEIDENTIFIER]}(?:\\.${r[a.PRERELEASEIDENTIFIER]})*))`), g("PRERELEASELOOSE", `(?:-?(${r[a.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${r[a.PRERELEASEIDENTIFIERLOOSE]})*))`), g("BUILDIDENTIFIER", `${s}+`), g("BUILD", `(?:\\+(${r[a.BUILDIDENTIFIER]}(?:\\.${r[a.BUILDIDENTIFIER]})*))`), g("FULLPLAIN", `v?${r[a.MAINVERSION]}${r[a.PRERELEASE]}?${r[a.BUILD]}?`), g("FULL", `^${r[a.FULLPLAIN]}$`), g("LOOSEPLAIN", `[v=\\s]*${r[a.MAINVERSIONLOOSE]}${r[a.PRERELEASELOOSE]}?${r[a.BUILD]}?`), g("LOOSE", `^${r[a.LOOSEPLAIN]}$`), g("GTLT", "((?:<|>)?=?)"), g("XRANGEIDENTIFIERLOOSE", `${r[a.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), g("XRANGEIDENTIFIER", `${r[a.NUMERICIDENTIFIER]}|x|X|\\*`), g("XRANGEPLAIN", `[v=\\s]*(${r[a.XRANGEIDENTIFIER]})(?:\\.(${r[a.XRANGEIDENTIFIER]})(?:\\.(${r[a.XRANGEIDENTIFIER]})(?:${r[a.PRERELEASE]})?${r[a.BUILD]}?)?)?`), g("XRANGEPLAINLOOSE", `[v=\\s]*(${r[a.XRANGEIDENTIFIERLOOSE]})(?:\\.(${r[a.XRANGEIDENTIFIERLOOSE]})(?:\\.(${r[a.XRANGEIDENTIFIERLOOSE]})(?:${r[a.PRERELEASELOOSE]})?${r[a.BUILD]}?)?)?`), g("XRANGE", `^${r[a.GTLT]}\\s*${r[a.XRANGEPLAIN]}$`), g("XRANGELOOSE", `^${r[a.GTLT]}\\s*${r[a.XRANGEPLAINLOOSE]}$`), g("COERCEPLAIN", `(^|[^\\d])(\\d{1,${d}})(?:\\.(\\d{1,${d}}))?(?:\\.(\\d{1,${d}}))?`), g("COERCE", `${r[a.COERCEPLAIN]}(?:$|[^\\d])`), g("COERCEFULL", r[a.COERCEPLAIN] + `(?:${r[a.PRERELEASE]})?(?:${r[a.BUILD]})?(?:$|[^\\d])`), g("COERCERTL", r[a.COERCE], !0), g("COERCERTLFULL", r[a.COERCEFULL], !0), g("LONETILDE", "(?:~>?)"), g("TILDETRIM", `(\\s*)${r[a.LONETILDE]}\\s+`, !0), h.tildeTrimReplace = "$1~", g("TILDE", `^${r[a.LONETILDE]}${r[a.XRANGEPLAIN]}$`), g("TILDELOOSE", `^${r[a.LONETILDE]}${r[a.XRANGEPLAINLOOSE]}$`), g("LONECARET", "(?:\\^)"), g("CARETTRIM", `(\\s*)${r[a.LONECARET]}\\s+`, !0), h.caretTrimReplace = "$1^", g("CARET", `^${r[a.LONECARET]}${r[a.XRANGEPLAIN]}$`), g("CARETLOOSE", `^${r[a.LONECARET]}${r[a.XRANGEPLAINLOOSE]}$`), g("COMPARATORLOOSE", `^${r[a.GTLT]}\\s*(${r[a.LOOSEPLAIN]})$|^$`), g("COMPARATOR", `^${r[a.GTLT]}\\s*(${r[a.FULLPLAIN]})$|^$`), g("COMPARATORTRIM", `(\\s*)${r[a.GTLT]}\\s*(${r[a.LOOSEPLAIN]}|${r[a.XRANGEPLAIN]})`, !0), h.comparatorTrimReplace = "$1$2$3", g("HYPHENRANGE", `^\\s*(${r[a.XRANGEPLAIN]})\\s+-\\s+(${r[a.XRANGEPLAIN]})\\s*$`), g("HYPHENRANGELOOSE", `^\\s*(${r[a.XRANGEPLAINLOOSE]})\\s+-\\s+(${r[a.XRANGEPLAINLOOSE]})\\s*$`), g("STAR", "(<|>)?=?\\s*\\*"), g("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), g("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }(jr, jr.exports)), jr.exports;
}
var pi, Us;
function jo() {
  if (Us) return pi;
  Us = 1;
  const o = Object.freeze({ loose: !0 }), h = Object.freeze({});
  return pi = (f) => f ? typeof f != "object" ? o : f : h, pi;
}
var mi, ks;
function cc() {
  if (ks) return mi;
  ks = 1;
  const o = /^[0-9]+$/, h = (f, c) => {
    const t = o.test(f), e = o.test(c);
    return t && e && (f = +f, c = +c), f === c ? 0 : t && !e ? -1 : e && !t ? 1 : f < c ? -1 : 1;
  };
  return mi = {
    compareIdentifiers: h,
    rcompareIdentifiers: (f, c) => h(c, f)
  }, mi;
}
var gi, qs;
function Ge() {
  if (qs) return gi;
  qs = 1;
  const o = Jr(), { MAX_LENGTH: h, MAX_SAFE_INTEGER: d } = Xr(), { safeRe: f, t: c } = Rr(), t = jo(), { compareIdentifiers: e } = cc();
  class n {
    constructor(i, a) {
      if (a = t(a), i instanceof n) {
        if (i.loose === !!a.loose && i.includePrerelease === !!a.includePrerelease)
          return i;
        i = i.version;
      } else if (typeof i != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof i}".`);
      if (i.length > h)
        throw new TypeError(
          `version is longer than ${h} characters`
        );
      o("SemVer", i, a), this.options = a, this.loose = !!a.loose, this.includePrerelease = !!a.includePrerelease;
      const u = i.trim().match(a.loose ? f[c.LOOSE] : f[c.FULL]);
      if (!u)
        throw new TypeError(`Invalid Version: ${i}`);
      if (this.raw = i, this.major = +u[1], this.minor = +u[2], this.patch = +u[3], this.major > d || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > d || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > d || this.patch < 0)
        throw new TypeError("Invalid patch version");
      u[4] ? this.prerelease = u[4].split(".").map((s) => {
        if (/^[0-9]+$/.test(s)) {
          const m = +s;
          if (m >= 0 && m < d)
            return m;
        }
        return s;
      }) : this.prerelease = [], this.build = u[5] ? u[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(i) {
      if (o("SemVer.compare", this.version, this.options, i), !(i instanceof n)) {
        if (typeof i == "string" && i === this.version)
          return 0;
        i = new n(i, this.options);
      }
      return i.version === this.version ? 0 : this.compareMain(i) || this.comparePre(i);
    }
    compareMain(i) {
      return i instanceof n || (i = new n(i, this.options)), e(this.major, i.major) || e(this.minor, i.minor) || e(this.patch, i.patch);
    }
    comparePre(i) {
      if (i instanceof n || (i = new n(i, this.options)), this.prerelease.length && !i.prerelease.length)
        return -1;
      if (!this.prerelease.length && i.prerelease.length)
        return 1;
      if (!this.prerelease.length && !i.prerelease.length)
        return 0;
      let a = 0;
      do {
        const u = this.prerelease[a], s = i.prerelease[a];
        if (o("prerelease compare", a, u, s), u === void 0 && s === void 0)
          return 0;
        if (s === void 0)
          return 1;
        if (u === void 0)
          return -1;
        if (u === s)
          continue;
        return e(u, s);
      } while (++a);
    }
    compareBuild(i) {
      i instanceof n || (i = new n(i, this.options));
      let a = 0;
      do {
        const u = this.build[a], s = i.build[a];
        if (o("build compare", a, u, s), u === void 0 && s === void 0)
          return 0;
        if (s === void 0)
          return 1;
        if (u === void 0)
          return -1;
        if (u === s)
          continue;
        return e(u, s);
      } while (++a);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(i, a, u) {
      if (i.startsWith("pre")) {
        if (!a && u === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (a) {
          const s = `-${a}`.match(this.options.loose ? f[c.PRERELEASELOOSE] : f[c.PRERELEASE]);
          if (!s || s[1] !== a)
            throw new Error(`invalid identifier: ${a}`);
        }
      }
      switch (i) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", a, u);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", a, u);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", a, u), this.inc("pre", a, u);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", a, u), this.inc("pre", a, u);
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
          const s = Number(u) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [s];
          else {
            let m = this.prerelease.length;
            for (; --m >= 0; )
              typeof this.prerelease[m] == "number" && (this.prerelease[m]++, m = -2);
            if (m === -1) {
              if (a === this.prerelease.join(".") && u === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(s);
            }
          }
          if (a) {
            let m = [a, s];
            u === !1 && (m = [a]), e(this.prerelease[0], a) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = m) : this.prerelease = m;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${i}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return gi = n, gi;
}
var vi, Ms;
function Vt() {
  if (Ms) return vi;
  Ms = 1;
  const o = Ge();
  return vi = (d, f, c = !1) => {
    if (d instanceof o)
      return d;
    try {
      return new o(d, f);
    } catch (t) {
      if (!c)
        return null;
      throw t;
    }
  }, vi;
}
var yi, Bs;
function vd() {
  if (Bs) return yi;
  Bs = 1;
  const o = Vt();
  return yi = (d, f) => {
    const c = o(d, f);
    return c ? c.version : null;
  }, yi;
}
var Ei, js;
function yd() {
  if (js) return Ei;
  js = 1;
  const o = Vt();
  return Ei = (d, f) => {
    const c = o(d.trim().replace(/^[=v]+/, ""), f);
    return c ? c.version : null;
  }, Ei;
}
var wi, Hs;
function Ed() {
  if (Hs) return wi;
  Hs = 1;
  const o = Ge();
  return wi = (d, f, c, t, e) => {
    typeof c == "string" && (e = t, t = c, c = void 0);
    try {
      return new o(
        d instanceof o ? d.version : d,
        c
      ).inc(f, t, e).version;
    } catch {
      return null;
    }
  }, wi;
}
var _i, Gs;
function wd() {
  if (Gs) return _i;
  Gs = 1;
  const o = Vt();
  return _i = (d, f) => {
    const c = o(d, null, !0), t = o(f, null, !0), e = c.compare(t);
    if (e === 0)
      return null;
    const n = e > 0, r = n ? c : t, i = n ? t : c, a = !!r.prerelease.length;
    if (!!i.prerelease.length && !a) {
      if (!i.patch && !i.minor)
        return "major";
      if (i.compareMain(r) === 0)
        return i.minor && !i.patch ? "minor" : "patch";
    }
    const s = a ? "pre" : "";
    return c.major !== t.major ? s + "major" : c.minor !== t.minor ? s + "minor" : c.patch !== t.patch ? s + "patch" : "prerelease";
  }, _i;
}
var Si, Vs;
function _d() {
  if (Vs) return Si;
  Vs = 1;
  const o = Ge();
  return Si = (d, f) => new o(d, f).major, Si;
}
var Ai, Ws;
function Sd() {
  if (Ws) return Ai;
  Ws = 1;
  const o = Ge();
  return Ai = (d, f) => new o(d, f).minor, Ai;
}
var bi, zs;
function Ad() {
  if (zs) return bi;
  zs = 1;
  const o = Ge();
  return bi = (d, f) => new o(d, f).patch, bi;
}
var Ri, Ys;
function bd() {
  if (Ys) return Ri;
  Ys = 1;
  const o = Vt();
  return Ri = (d, f) => {
    const c = o(d, f);
    return c && c.prerelease.length ? c.prerelease : null;
  }, Ri;
}
var Ti, Xs;
function nt() {
  if (Xs) return Ti;
  Xs = 1;
  const o = Ge();
  return Ti = (d, f, c) => new o(d, c).compare(new o(f, c)), Ti;
}
var Ci, Js;
function Rd() {
  if (Js) return Ci;
  Js = 1;
  const o = nt();
  return Ci = (d, f, c) => o(f, d, c), Ci;
}
var Oi, Ks;
function Td() {
  if (Ks) return Oi;
  Ks = 1;
  const o = nt();
  return Oi = (d, f) => o(d, f, !0), Oi;
}
var Di, Qs;
function Ho() {
  if (Qs) return Di;
  Qs = 1;
  const o = Ge();
  return Di = (d, f, c) => {
    const t = new o(d, c), e = new o(f, c);
    return t.compare(e) || t.compareBuild(e);
  }, Di;
}
var Pi, Zs;
function Cd() {
  if (Zs) return Pi;
  Zs = 1;
  const o = Ho();
  return Pi = (d, f) => d.sort((c, t) => o(c, t, f)), Pi;
}
var Ii, el;
function Od() {
  if (el) return Ii;
  el = 1;
  const o = Ho();
  return Ii = (d, f) => d.sort((c, t) => o(t, c, f)), Ii;
}
var Ni, tl;
function Kr() {
  if (tl) return Ni;
  tl = 1;
  const o = nt();
  return Ni = (d, f, c) => o(d, f, c) > 0, Ni;
}
var Fi, rl;
function Go() {
  if (rl) return Fi;
  rl = 1;
  const o = nt();
  return Fi = (d, f, c) => o(d, f, c) < 0, Fi;
}
var xi, nl;
function fc() {
  if (nl) return xi;
  nl = 1;
  const o = nt();
  return xi = (d, f, c) => o(d, f, c) === 0, xi;
}
var Li, il;
function dc() {
  if (il) return Li;
  il = 1;
  const o = nt();
  return Li = (d, f, c) => o(d, f, c) !== 0, Li;
}
var $i, ol;
function Vo() {
  if (ol) return $i;
  ol = 1;
  const o = nt();
  return $i = (d, f, c) => o(d, f, c) >= 0, $i;
}
var Ui, al;
function Wo() {
  if (al) return Ui;
  al = 1;
  const o = nt();
  return Ui = (d, f, c) => o(d, f, c) <= 0, Ui;
}
var ki, sl;
function hc() {
  if (sl) return ki;
  sl = 1;
  const o = fc(), h = dc(), d = Kr(), f = Vo(), c = Go(), t = Wo();
  return ki = (n, r, i, a) => {
    switch (r) {
      case "===":
        return typeof n == "object" && (n = n.version), typeof i == "object" && (i = i.version), n === i;
      case "!==":
        return typeof n == "object" && (n = n.version), typeof i == "object" && (i = i.version), n !== i;
      case "":
      case "=":
      case "==":
        return o(n, i, a);
      case "!=":
        return h(n, i, a);
      case ">":
        return d(n, i, a);
      case ">=":
        return f(n, i, a);
      case "<":
        return c(n, i, a);
      case "<=":
        return t(n, i, a);
      default:
        throw new TypeError(`Invalid operator: ${r}`);
    }
  }, ki;
}
var qi, ll;
function Dd() {
  if (ll) return qi;
  ll = 1;
  const o = Ge(), h = Vt(), { safeRe: d, t: f } = Rr();
  return qi = (t, e) => {
    if (t instanceof o)
      return t;
    if (typeof t == "number" && (t = String(t)), typeof t != "string")
      return null;
    e = e || {};
    let n = null;
    if (!e.rtl)
      n = t.match(e.includePrerelease ? d[f.COERCEFULL] : d[f.COERCE]);
    else {
      const m = e.includePrerelease ? d[f.COERCERTLFULL] : d[f.COERCERTL];
      let v;
      for (; (v = m.exec(t)) && (!n || n.index + n[0].length !== t.length); )
        (!n || v.index + v[0].length !== n.index + n[0].length) && (n = v), m.lastIndex = v.index + v[1].length + v[2].length;
      m.lastIndex = -1;
    }
    if (n === null)
      return null;
    const r = n[2], i = n[3] || "0", a = n[4] || "0", u = e.includePrerelease && n[5] ? `-${n[5]}` : "", s = e.includePrerelease && n[6] ? `+${n[6]}` : "";
    return h(`${r}.${i}.${a}${u}${s}`, e);
  }, qi;
}
var Mi, ul;
function Pd() {
  if (ul) return Mi;
  ul = 1;
  class o {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(d) {
      const f = this.map.get(d);
      if (f !== void 0)
        return this.map.delete(d), this.map.set(d, f), f;
    }
    delete(d) {
      return this.map.delete(d);
    }
    set(d, f) {
      if (!this.delete(d) && f !== void 0) {
        if (this.map.size >= this.max) {
          const t = this.map.keys().next().value;
          this.delete(t);
        }
        this.map.set(d, f);
      }
      return this;
    }
  }
  return Mi = o, Mi;
}
var Bi, cl;
function it() {
  if (cl) return Bi;
  cl = 1;
  const o = /\s+/g;
  class h {
    constructor(I, $) {
      if ($ = c($), I instanceof h)
        return I.loose === !!$.loose && I.includePrerelease === !!$.includePrerelease ? I : new h(I.raw, $);
      if (I instanceof t)
        return this.raw = I.value, this.set = [[I]], this.formatted = void 0, this;
      if (this.options = $, this.loose = !!$.loose, this.includePrerelease = !!$.includePrerelease, this.raw = I.trim().replace(o, " "), this.set = this.raw.split("||").map((M) => this.parseRange(M.trim())).filter((M) => M.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const M = this.set[0];
        if (this.set = this.set.filter((K) => !g(K[0])), this.set.length === 0)
          this.set = [M];
        else if (this.set.length > 1) {
          for (const K of this.set)
            if (K.length === 1 && p(K[0])) {
              this.set = [K];
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
          const $ = this.set[I];
          for (let M = 0; M < $.length; M++)
            M > 0 && (this.formatted += " "), this.formatted += $[M].toString().trim();
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
      const M = ((this.options.includePrerelease && m) | (this.options.loose && v)) + ":" + I, K = f.get(M);
      if (K)
        return K;
      const V = this.options.loose, ne = V ? r[i.HYPHENRANGELOOSE] : r[i.HYPHENRANGE];
      I = I.replace(ne, x(this.options.includePrerelease)), e("hyphen replace", I), I = I.replace(r[i.COMPARATORTRIM], a), e("comparator trim", I), I = I.replace(r[i.TILDETRIM], u), e("tilde trim", I), I = I.replace(r[i.CARETTRIM], s), e("caret trim", I);
      let ce = I.split(" ").map((J) => T(J, this.options)).join(" ").split(/\s+/).map((J) => F(J, this.options));
      V && (ce = ce.filter((J) => (e("loose invalid filter", J, this.options), !!J.match(r[i.COMPARATORLOOSE])))), e("range list", ce);
      const ue = /* @__PURE__ */ new Map(), ie = ce.map((J) => new t(J, this.options));
      for (const J of ie) {
        if (g(J))
          return [J];
        ue.set(J.value, J);
      }
      ue.size > 1 && ue.has("") && ue.delete("");
      const be = [...ue.values()];
      return f.set(M, be), be;
    }
    intersects(I, $) {
      if (!(I instanceof h))
        throw new TypeError("a Range is required");
      return this.set.some((M) => A(M, $) && I.set.some((K) => A(K, $) && M.every((V) => K.every((ne) => V.intersects(ne, $)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(I) {
      if (!I)
        return !1;
      if (typeof I == "string")
        try {
          I = new n(I, this.options);
        } catch {
          return !1;
        }
      for (let $ = 0; $ < this.set.length; $++)
        if (q(this.set[$], I, this.options))
          return !0;
      return !1;
    }
  }
  Bi = h;
  const d = Pd(), f = new d(), c = jo(), t = Qr(), e = Jr(), n = Ge(), {
    safeRe: r,
    t: i,
    comparatorTrimReplace: a,
    tildeTrimReplace: u,
    caretTrimReplace: s
  } = Rr(), { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: v } = Xr(), g = (N) => N.value === "<0.0.0-0", p = (N) => N.value === "", A = (N, I) => {
    let $ = !0;
    const M = N.slice();
    let K = M.pop();
    for (; $ && M.length; )
      $ = M.every((V) => K.intersects(V, I)), K = M.pop();
    return $;
  }, T = (N, I) => (e("comp", N, I), N = b(N, I), e("caret", N), N = D(N, I), e("tildes", N), N = _(N, I), e("xrange", N), N = U(N, I), e("stars", N), N), O = (N) => !N || N.toLowerCase() === "x" || N === "*", D = (N, I) => N.trim().split(/\s+/).map(($) => P($, I)).join(" "), P = (N, I) => {
    const $ = I.loose ? r[i.TILDELOOSE] : r[i.TILDE];
    return N.replace($, (M, K, V, ne, ce) => {
      e("tilde", N, M, K, V, ne, ce);
      let ue;
      return O(K) ? ue = "" : O(V) ? ue = `>=${K}.0.0 <${+K + 1}.0.0-0` : O(ne) ? ue = `>=${K}.${V}.0 <${K}.${+V + 1}.0-0` : ce ? (e("replaceTilde pr", ce), ue = `>=${K}.${V}.${ne}-${ce} <${K}.${+V + 1}.0-0`) : ue = `>=${K}.${V}.${ne} <${K}.${+V + 1}.0-0`, e("tilde return", ue), ue;
    });
  }, b = (N, I) => N.trim().split(/\s+/).map(($) => w($, I)).join(" "), w = (N, I) => {
    e("caret", N, I);
    const $ = I.loose ? r[i.CARETLOOSE] : r[i.CARET], M = I.includePrerelease ? "-0" : "";
    return N.replace($, (K, V, ne, ce, ue) => {
      e("caret", N, K, V, ne, ce, ue);
      let ie;
      return O(V) ? ie = "" : O(ne) ? ie = `>=${V}.0.0${M} <${+V + 1}.0.0-0` : O(ce) ? V === "0" ? ie = `>=${V}.${ne}.0${M} <${V}.${+ne + 1}.0-0` : ie = `>=${V}.${ne}.0${M} <${+V + 1}.0.0-0` : ue ? (e("replaceCaret pr", ue), V === "0" ? ne === "0" ? ie = `>=${V}.${ne}.${ce}-${ue} <${V}.${ne}.${+ce + 1}-0` : ie = `>=${V}.${ne}.${ce}-${ue} <${V}.${+ne + 1}.0-0` : ie = `>=${V}.${ne}.${ce}-${ue} <${+V + 1}.0.0-0`) : (e("no pr"), V === "0" ? ne === "0" ? ie = `>=${V}.${ne}.${ce}${M} <${V}.${ne}.${+ce + 1}-0` : ie = `>=${V}.${ne}.${ce}${M} <${V}.${+ne + 1}.0-0` : ie = `>=${V}.${ne}.${ce} <${+V + 1}.0.0-0`), e("caret return", ie), ie;
    });
  }, _ = (N, I) => (e("replaceXRanges", N, I), N.split(/\s+/).map(($) => E($, I)).join(" ")), E = (N, I) => {
    N = N.trim();
    const $ = I.loose ? r[i.XRANGELOOSE] : r[i.XRANGE];
    return N.replace($, (M, K, V, ne, ce, ue) => {
      e("xRange", N, M, K, V, ne, ce, ue);
      const ie = O(V), be = ie || O(ne), J = be || O(ce), ye = J;
      return K === "=" && ye && (K = ""), ue = I.includePrerelease ? "-0" : "", ie ? K === ">" || K === "<" ? M = "<0.0.0-0" : M = "*" : K && ye ? (be && (ne = 0), ce = 0, K === ">" ? (K = ">=", be ? (V = +V + 1, ne = 0, ce = 0) : (ne = +ne + 1, ce = 0)) : K === "<=" && (K = "<", be ? V = +V + 1 : ne = +ne + 1), K === "<" && (ue = "-0"), M = `${K + V}.${ne}.${ce}${ue}`) : be ? M = `>=${V}.0.0${ue} <${+V + 1}.0.0-0` : J && (M = `>=${V}.${ne}.0${ue} <${V}.${+ne + 1}.0-0`), e("xRange return", M), M;
    });
  }, U = (N, I) => (e("replaceStars", N, I), N.trim().replace(r[i.STAR], "")), F = (N, I) => (e("replaceGTE0", N, I), N.trim().replace(r[I.includePrerelease ? i.GTE0PRE : i.GTE0], "")), x = (N) => (I, $, M, K, V, ne, ce, ue, ie, be, J, ye) => (O(M) ? $ = "" : O(K) ? $ = `>=${M}.0.0${N ? "-0" : ""}` : O(V) ? $ = `>=${M}.${K}.0${N ? "-0" : ""}` : ne ? $ = `>=${$}` : $ = `>=${$}${N ? "-0" : ""}`, O(ie) ? ue = "" : O(be) ? ue = `<${+ie + 1}.0.0-0` : O(J) ? ue = `<${ie}.${+be + 1}.0-0` : ye ? ue = `<=${ie}.${be}.${J}-${ye}` : N ? ue = `<${ie}.${be}.${+J + 1}-0` : ue = `<=${ue}`, `${$} ${ue}`.trim()), q = (N, I, $) => {
    for (let M = 0; M < N.length; M++)
      if (!N[M].test(I))
        return !1;
    if (I.prerelease.length && !$.includePrerelease) {
      for (let M = 0; M < N.length; M++)
        if (e(N[M].semver), N[M].semver !== t.ANY && N[M].semver.prerelease.length > 0) {
          const K = N[M].semver;
          if (K.major === I.major && K.minor === I.minor && K.patch === I.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Bi;
}
var ji, fl;
function Qr() {
  if (fl) return ji;
  fl = 1;
  const o = Symbol("SemVer ANY");
  class h {
    static get ANY() {
      return o;
    }
    constructor(a, u) {
      if (u = d(u), a instanceof h) {
        if (a.loose === !!u.loose)
          return a;
        a = a.value;
      }
      a = a.trim().split(/\s+/).join(" "), e("comparator", a, u), this.options = u, this.loose = !!u.loose, this.parse(a), this.semver === o ? this.value = "" : this.value = this.operator + this.semver.version, e("comp", this);
    }
    parse(a) {
      const u = this.options.loose ? f[c.COMPARATORLOOSE] : f[c.COMPARATOR], s = a.match(u);
      if (!s)
        throw new TypeError(`Invalid comparator: ${a}`);
      this.operator = s[1] !== void 0 ? s[1] : "", this.operator === "=" && (this.operator = ""), s[2] ? this.semver = new n(s[2], this.options.loose) : this.semver = o;
    }
    toString() {
      return this.value;
    }
    test(a) {
      if (e("Comparator.test", a, this.options.loose), this.semver === o || a === o)
        return !0;
      if (typeof a == "string")
        try {
          a = new n(a, this.options);
        } catch {
          return !1;
        }
      return t(a, this.operator, this.semver, this.options);
    }
    intersects(a, u) {
      if (!(a instanceof h))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new r(a.value, u).test(this.value) : a.operator === "" ? a.value === "" ? !0 : new r(this.value, u).test(a.semver) : (u = d(u), u.includePrerelease && (this.value === "<0.0.0-0" || a.value === "<0.0.0-0") || !u.includePrerelease && (this.value.startsWith("<0.0.0") || a.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && a.operator.startsWith(">") || this.operator.startsWith("<") && a.operator.startsWith("<") || this.semver.version === a.semver.version && this.operator.includes("=") && a.operator.includes("=") || t(this.semver, "<", a.semver, u) && this.operator.startsWith(">") && a.operator.startsWith("<") || t(this.semver, ">", a.semver, u) && this.operator.startsWith("<") && a.operator.startsWith(">")));
    }
  }
  ji = h;
  const d = jo(), { safeRe: f, t: c } = Rr(), t = hc(), e = Jr(), n = Ge(), r = it();
  return ji;
}
var Hi, dl;
function Zr() {
  if (dl) return Hi;
  dl = 1;
  const o = it();
  return Hi = (d, f, c) => {
    try {
      f = new o(f, c);
    } catch {
      return !1;
    }
    return f.test(d);
  }, Hi;
}
var Gi, hl;
function Id() {
  if (hl) return Gi;
  hl = 1;
  const o = it();
  return Gi = (d, f) => new o(d, f).set.map((c) => c.map((t) => t.value).join(" ").trim().split(" ")), Gi;
}
var Vi, pl;
function Nd() {
  if (pl) return Vi;
  pl = 1;
  const o = Ge(), h = it();
  return Vi = (f, c, t) => {
    let e = null, n = null, r = null;
    try {
      r = new h(c, t);
    } catch {
      return null;
    }
    return f.forEach((i) => {
      r.test(i) && (!e || n.compare(i) === -1) && (e = i, n = new o(e, t));
    }), e;
  }, Vi;
}
var Wi, ml;
function Fd() {
  if (ml) return Wi;
  ml = 1;
  const o = Ge(), h = it();
  return Wi = (f, c, t) => {
    let e = null, n = null, r = null;
    try {
      r = new h(c, t);
    } catch {
      return null;
    }
    return f.forEach((i) => {
      r.test(i) && (!e || n.compare(i) === 1) && (e = i, n = new o(e, t));
    }), e;
  }, Wi;
}
var zi, gl;
function xd() {
  if (gl) return zi;
  gl = 1;
  const o = Ge(), h = it(), d = Kr();
  return zi = (c, t) => {
    c = new h(c, t);
    let e = new o("0.0.0");
    if (c.test(e) || (e = new o("0.0.0-0"), c.test(e)))
      return e;
    e = null;
    for (let n = 0; n < c.set.length; ++n) {
      const r = c.set[n];
      let i = null;
      r.forEach((a) => {
        const u = new o(a.semver.version);
        switch (a.operator) {
          case ">":
            u.prerelease.length === 0 ? u.patch++ : u.prerelease.push(0), u.raw = u.format();
          /* fallthrough */
          case "":
          case ">=":
            (!i || d(u, i)) && (i = u);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${a.operator}`);
        }
      }), i && (!e || d(e, i)) && (e = i);
    }
    return e && c.test(e) ? e : null;
  }, zi;
}
var Yi, vl;
function Ld() {
  if (vl) return Yi;
  vl = 1;
  const o = it();
  return Yi = (d, f) => {
    try {
      return new o(d, f).range || "*";
    } catch {
      return null;
    }
  }, Yi;
}
var Xi, yl;
function zo() {
  if (yl) return Xi;
  yl = 1;
  const o = Ge(), h = Qr(), { ANY: d } = h, f = it(), c = Zr(), t = Kr(), e = Go(), n = Wo(), r = Vo();
  return Xi = (a, u, s, m) => {
    a = new o(a, m), u = new f(u, m);
    let v, g, p, A, T;
    switch (s) {
      case ">":
        v = t, g = n, p = e, A = ">", T = ">=";
        break;
      case "<":
        v = e, g = r, p = t, A = "<", T = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (c(a, u, m))
      return !1;
    for (let O = 0; O < u.set.length; ++O) {
      const D = u.set[O];
      let P = null, b = null;
      if (D.forEach((w) => {
        w.semver === d && (w = new h(">=0.0.0")), P = P || w, b = b || w, v(w.semver, P.semver, m) ? P = w : p(w.semver, b.semver, m) && (b = w);
      }), P.operator === A || P.operator === T || (!b.operator || b.operator === A) && g(a, b.semver))
        return !1;
      if (b.operator === T && p(a, b.semver))
        return !1;
    }
    return !0;
  }, Xi;
}
var Ji, El;
function $d() {
  if (El) return Ji;
  El = 1;
  const o = zo();
  return Ji = (d, f, c) => o(d, f, ">", c), Ji;
}
var Ki, wl;
function Ud() {
  if (wl) return Ki;
  wl = 1;
  const o = zo();
  return Ki = (d, f, c) => o(d, f, "<", c), Ki;
}
var Qi, _l;
function kd() {
  if (_l) return Qi;
  _l = 1;
  const o = it();
  return Qi = (d, f, c) => (d = new o(d, c), f = new o(f, c), d.intersects(f, c)), Qi;
}
var Zi, Sl;
function qd() {
  if (Sl) return Zi;
  Sl = 1;
  const o = Zr(), h = nt();
  return Zi = (d, f, c) => {
    const t = [];
    let e = null, n = null;
    const r = d.sort((s, m) => h(s, m, c));
    for (const s of r)
      o(s, f, c) ? (n = s, e || (e = s)) : (n && t.push([e, n]), n = null, e = null);
    e && t.push([e, null]);
    const i = [];
    for (const [s, m] of t)
      s === m ? i.push(s) : !m && s === r[0] ? i.push("*") : m ? s === r[0] ? i.push(`<=${m}`) : i.push(`${s} - ${m}`) : i.push(`>=${s}`);
    const a = i.join(" || "), u = typeof f.raw == "string" ? f.raw : String(f);
    return a.length < u.length ? a : f;
  }, Zi;
}
var eo, Al;
function Md() {
  if (Al) return eo;
  Al = 1;
  const o = it(), h = Qr(), { ANY: d } = h, f = Zr(), c = nt(), t = (u, s, m = {}) => {
    if (u === s)
      return !0;
    u = new o(u, m), s = new o(s, m);
    let v = !1;
    e: for (const g of u.set) {
      for (const p of s.set) {
        const A = r(g, p, m);
        if (v = v || A !== null, A)
          continue e;
      }
      if (v)
        return !1;
    }
    return !0;
  }, e = [new h(">=0.0.0-0")], n = [new h(">=0.0.0")], r = (u, s, m) => {
    if (u === s)
      return !0;
    if (u.length === 1 && u[0].semver === d) {
      if (s.length === 1 && s[0].semver === d)
        return !0;
      m.includePrerelease ? u = e : u = n;
    }
    if (s.length === 1 && s[0].semver === d) {
      if (m.includePrerelease)
        return !0;
      s = n;
    }
    const v = /* @__PURE__ */ new Set();
    let g, p;
    for (const _ of u)
      _.operator === ">" || _.operator === ">=" ? g = i(g, _, m) : _.operator === "<" || _.operator === "<=" ? p = a(p, _, m) : v.add(_.semver);
    if (v.size > 1)
      return null;
    let A;
    if (g && p) {
      if (A = c(g.semver, p.semver, m), A > 0)
        return null;
      if (A === 0 && (g.operator !== ">=" || p.operator !== "<="))
        return null;
    }
    for (const _ of v) {
      if (g && !f(_, String(g), m) || p && !f(_, String(p), m))
        return null;
      for (const E of s)
        if (!f(_, String(E), m))
          return !1;
      return !0;
    }
    let T, O, D, P, b = p && !m.includePrerelease && p.semver.prerelease.length ? p.semver : !1, w = g && !m.includePrerelease && g.semver.prerelease.length ? g.semver : !1;
    b && b.prerelease.length === 1 && p.operator === "<" && b.prerelease[0] === 0 && (b = !1);
    for (const _ of s) {
      if (P = P || _.operator === ">" || _.operator === ">=", D = D || _.operator === "<" || _.operator === "<=", g) {
        if (w && _.semver.prerelease && _.semver.prerelease.length && _.semver.major === w.major && _.semver.minor === w.minor && _.semver.patch === w.patch && (w = !1), _.operator === ">" || _.operator === ">=") {
          if (T = i(g, _, m), T === _ && T !== g)
            return !1;
        } else if (g.operator === ">=" && !f(g.semver, String(_), m))
          return !1;
      }
      if (p) {
        if (b && _.semver.prerelease && _.semver.prerelease.length && _.semver.major === b.major && _.semver.minor === b.minor && _.semver.patch === b.patch && (b = !1), _.operator === "<" || _.operator === "<=") {
          if (O = a(p, _, m), O === _ && O !== p)
            return !1;
        } else if (p.operator === "<=" && !f(p.semver, String(_), m))
          return !1;
      }
      if (!_.operator && (p || g) && A !== 0)
        return !1;
    }
    return !(g && D && !p && A !== 0 || p && P && !g && A !== 0 || w || b);
  }, i = (u, s, m) => {
    if (!u)
      return s;
    const v = c(u.semver, s.semver, m);
    return v > 0 ? u : v < 0 || s.operator === ">" && u.operator === ">=" ? s : u;
  }, a = (u, s, m) => {
    if (!u)
      return s;
    const v = c(u.semver, s.semver, m);
    return v < 0 ? u : v > 0 || s.operator === "<" && u.operator === "<=" ? s : u;
  };
  return eo = t, eo;
}
var to, bl;
function pc() {
  if (bl) return to;
  bl = 1;
  const o = Rr(), h = Xr(), d = Ge(), f = cc(), c = Vt(), t = vd(), e = yd(), n = Ed(), r = wd(), i = _d(), a = Sd(), u = Ad(), s = bd(), m = nt(), v = Rd(), g = Td(), p = Ho(), A = Cd(), T = Od(), O = Kr(), D = Go(), P = fc(), b = dc(), w = Vo(), _ = Wo(), E = hc(), U = Dd(), F = Qr(), x = it(), q = Zr(), N = Id(), I = Nd(), $ = Fd(), M = xd(), K = Ld(), V = zo(), ne = $d(), ce = Ud(), ue = kd(), ie = qd(), be = Md();
  return to = {
    parse: c,
    valid: t,
    clean: e,
    inc: n,
    diff: r,
    major: i,
    minor: a,
    patch: u,
    prerelease: s,
    compare: m,
    rcompare: v,
    compareLoose: g,
    compareBuild: p,
    sort: A,
    rsort: T,
    gt: O,
    lt: D,
    eq: P,
    neq: b,
    gte: w,
    lte: _,
    cmp: E,
    coerce: U,
    Comparator: F,
    Range: x,
    satisfies: q,
    toComparators: N,
    maxSatisfying: I,
    minSatisfying: $,
    minVersion: M,
    validRange: K,
    outside: V,
    gtr: ne,
    ltr: ce,
    intersects: ue,
    simplifyRange: ie,
    subset: be,
    SemVer: d,
    re: o.re,
    src: o.src,
    tokens: o.t,
    SEMVER_SPEC_VERSION: h.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: h.RELEASE_TYPES,
    compareIdentifiers: f.compareIdentifiers,
    rcompareIdentifiers: f.rcompareIdentifiers
  }, to;
}
var kt = {}, Er = { exports: {} };
Er.exports;
var Rl;
function Bd() {
  return Rl || (Rl = 1, function(o, h) {
    var d = 200, f = "__lodash_hash_undefined__", c = 1, t = 2, e = 9007199254740991, n = "[object Arguments]", r = "[object Array]", i = "[object AsyncFunction]", a = "[object Boolean]", u = "[object Date]", s = "[object Error]", m = "[object Function]", v = "[object GeneratorFunction]", g = "[object Map]", p = "[object Number]", A = "[object Null]", T = "[object Object]", O = "[object Promise]", D = "[object Proxy]", P = "[object RegExp]", b = "[object Set]", w = "[object String]", _ = "[object Symbol]", E = "[object Undefined]", U = "[object WeakMap]", F = "[object ArrayBuffer]", x = "[object DataView]", q = "[object Float32Array]", N = "[object Float64Array]", I = "[object Int8Array]", $ = "[object Int16Array]", M = "[object Int32Array]", K = "[object Uint8Array]", V = "[object Uint8ClampedArray]", ne = "[object Uint16Array]", ce = "[object Uint32Array]", ue = /[\\^$.*+?()[\]{}|]/g, ie = /^\[object .+?Constructor\]$/, be = /^(?:0|[1-9]\d*)$/, J = {};
    J[q] = J[N] = J[I] = J[$] = J[M] = J[K] = J[V] = J[ne] = J[ce] = !0, J[n] = J[r] = J[F] = J[a] = J[x] = J[u] = J[s] = J[m] = J[g] = J[p] = J[T] = J[P] = J[b] = J[w] = J[U] = !1;
    var ye = typeof rt == "object" && rt && rt.Object === Object && rt, R = typeof self == "object" && self && self.Object === Object && self, y = ye || R || Function("return this")(), j = h && !h.nodeType && h, L = j && !0 && o && !o.nodeType && o, le = L && L.exports === j, me = le && ye.process, pe = function() {
      try {
        return me && me.binding && me.binding("util");
      } catch {
      }
    }(), _e = pe && pe.isTypedArray;
    function Ee(C, k) {
      for (var Y = -1, se = C == null ? 0 : C.length, Pe = 0, Se = []; ++Y < se; ) {
        var Fe = C[Y];
        k(Fe, Y, C) && (Se[Pe++] = Fe);
      }
      return Se;
    }
    function xe(C, k) {
      for (var Y = -1, se = k.length, Pe = C.length; ++Y < se; )
        C[Pe + Y] = k[Y];
      return C;
    }
    function Oe(C, k) {
      for (var Y = -1, se = C == null ? 0 : C.length; ++Y < se; )
        if (k(C[Y], Y, C))
          return !0;
      return !1;
    }
    function qe(C, k) {
      for (var Y = -1, se = Array(C); ++Y < C; )
        se[Y] = k(Y);
      return se;
    }
    function wt(C) {
      return function(k) {
        return C(k);
      };
    }
    function st(C, k) {
      return C.has(k);
    }
    function l(C, k) {
      return C == null ? void 0 : C[k];
    }
    function B(C) {
      var k = -1, Y = Array(C.size);
      return C.forEach(function(se, Pe) {
        Y[++k] = [Pe, se];
      }), Y;
    }
    function G(C, k) {
      return function(Y) {
        return C(k(Y));
      };
    }
    function re(C) {
      var k = -1, Y = Array(C.size);
      return C.forEach(function(se) {
        Y[++k] = se;
      }), Y;
    }
    var W = Array.prototype, te = Function.prototype, Z = Object.prototype, oe = y["__core-js_shared__"], ge = te.toString, ve = Z.hasOwnProperty, Re = function() {
      var C = /[^.]+$/.exec(oe && oe.keys && oe.keys.IE_PROTO || "");
      return C ? "Symbol(src)_1." + C : "";
    }(), de = Z.toString, Le = RegExp(
      "^" + ge.call(ve).replace(ue, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), S = le ? y.Buffer : void 0, H = y.Symbol, X = y.Uint8Array, z = Z.propertyIsEnumerable, Q = W.splice, ee = H ? H.toStringTag : void 0, fe = Object.getOwnPropertySymbols, ae = S ? S.isBuffer : void 0, he = G(Object.keys, Object), we = $t(y, "DataView"), De = $t(y, "Map"), Ne = $t(y, "Promise"), Te = $t(y, "Set"), Lt = $t(y, "WeakMap"), Ze = $t(Object, "create"), _t = bt(we), Pc = bt(De), Ic = bt(Ne), Nc = bt(Te), Fc = bt(Lt), Ko = H ? H.prototype : void 0, rn = Ko ? Ko.valueOf : void 0;
    function St(C) {
      var k = -1, Y = C == null ? 0 : C.length;
      for (this.clear(); ++k < Y; ) {
        var se = C[k];
        this.set(se[0], se[1]);
      }
    }
    function xc() {
      this.__data__ = Ze ? Ze(null) : {}, this.size = 0;
    }
    function Lc(C) {
      var k = this.has(C) && delete this.__data__[C];
      return this.size -= k ? 1 : 0, k;
    }
    function $c(C) {
      var k = this.__data__;
      if (Ze) {
        var Y = k[C];
        return Y === f ? void 0 : Y;
      }
      return ve.call(k, C) ? k[C] : void 0;
    }
    function Uc(C) {
      var k = this.__data__;
      return Ze ? k[C] !== void 0 : ve.call(k, C);
    }
    function kc(C, k) {
      var Y = this.__data__;
      return this.size += this.has(C) ? 0 : 1, Y[C] = Ze && k === void 0 ? f : k, this;
    }
    St.prototype.clear = xc, St.prototype.delete = Lc, St.prototype.get = $c, St.prototype.has = Uc, St.prototype.set = kc;
    function lt(C) {
      var k = -1, Y = C == null ? 0 : C.length;
      for (this.clear(); ++k < Y; ) {
        var se = C[k];
        this.set(se[0], se[1]);
      }
    }
    function qc() {
      this.__data__ = [], this.size = 0;
    }
    function Mc(C) {
      var k = this.__data__, Y = Cr(k, C);
      if (Y < 0)
        return !1;
      var se = k.length - 1;
      return Y == se ? k.pop() : Q.call(k, Y, 1), --this.size, !0;
    }
    function Bc(C) {
      var k = this.__data__, Y = Cr(k, C);
      return Y < 0 ? void 0 : k[Y][1];
    }
    function jc(C) {
      return Cr(this.__data__, C) > -1;
    }
    function Hc(C, k) {
      var Y = this.__data__, se = Cr(Y, C);
      return se < 0 ? (++this.size, Y.push([C, k])) : Y[se][1] = k, this;
    }
    lt.prototype.clear = qc, lt.prototype.delete = Mc, lt.prototype.get = Bc, lt.prototype.has = jc, lt.prototype.set = Hc;
    function At(C) {
      var k = -1, Y = C == null ? 0 : C.length;
      for (this.clear(); ++k < Y; ) {
        var se = C[k];
        this.set(se[0], se[1]);
      }
    }
    function Gc() {
      this.size = 0, this.__data__ = {
        hash: new St(),
        map: new (De || lt)(),
        string: new St()
      };
    }
    function Vc(C) {
      var k = Or(this, C).delete(C);
      return this.size -= k ? 1 : 0, k;
    }
    function Wc(C) {
      return Or(this, C).get(C);
    }
    function zc(C) {
      return Or(this, C).has(C);
    }
    function Yc(C, k) {
      var Y = Or(this, C), se = Y.size;
      return Y.set(C, k), this.size += Y.size == se ? 0 : 1, this;
    }
    At.prototype.clear = Gc, At.prototype.delete = Vc, At.prototype.get = Wc, At.prototype.has = zc, At.prototype.set = Yc;
    function Tr(C) {
      var k = -1, Y = C == null ? 0 : C.length;
      for (this.__data__ = new At(); ++k < Y; )
        this.add(C[k]);
    }
    function Xc(C) {
      return this.__data__.set(C, f), this;
    }
    function Jc(C) {
      return this.__data__.has(C);
    }
    Tr.prototype.add = Tr.prototype.push = Xc, Tr.prototype.has = Jc;
    function ht(C) {
      var k = this.__data__ = new lt(C);
      this.size = k.size;
    }
    function Kc() {
      this.__data__ = new lt(), this.size = 0;
    }
    function Qc(C) {
      var k = this.__data__, Y = k.delete(C);
      return this.size = k.size, Y;
    }
    function Zc(C) {
      return this.__data__.get(C);
    }
    function ef(C) {
      return this.__data__.has(C);
    }
    function tf(C, k) {
      var Y = this.__data__;
      if (Y instanceof lt) {
        var se = Y.__data__;
        if (!De || se.length < d - 1)
          return se.push([C, k]), this.size = ++Y.size, this;
        Y = this.__data__ = new At(se);
      }
      return Y.set(C, k), this.size = Y.size, this;
    }
    ht.prototype.clear = Kc, ht.prototype.delete = Qc, ht.prototype.get = Zc, ht.prototype.has = ef, ht.prototype.set = tf;
    function rf(C, k) {
      var Y = Dr(C), se = !Y && yf(C), Pe = !Y && !se && nn(C), Se = !Y && !se && !Pe && aa(C), Fe = Y || se || Pe || Se, $e = Fe ? qe(C.length, String) : [], Ue = $e.length;
      for (var Ie in C)
        ve.call(C, Ie) && !(Fe && // Safari 9 has enumerable `arguments.length` in strict mode.
        (Ie == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        Pe && (Ie == "offset" || Ie == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        Se && (Ie == "buffer" || Ie == "byteLength" || Ie == "byteOffset") || // Skip index properties.
        hf(Ie, Ue))) && $e.push(Ie);
      return $e;
    }
    function Cr(C, k) {
      for (var Y = C.length; Y--; )
        if (ra(C[Y][0], k))
          return Y;
      return -1;
    }
    function nf(C, k, Y) {
      var se = k(C);
      return Dr(C) ? se : xe(se, Y(C));
    }
    function zt(C) {
      return C == null ? C === void 0 ? E : A : ee && ee in Object(C) ? ff(C) : vf(C);
    }
    function Qo(C) {
      return Yt(C) && zt(C) == n;
    }
    function Zo(C, k, Y, se, Pe) {
      return C === k ? !0 : C == null || k == null || !Yt(C) && !Yt(k) ? C !== C && k !== k : of(C, k, Y, se, Zo, Pe);
    }
    function of(C, k, Y, se, Pe, Se) {
      var Fe = Dr(C), $e = Dr(k), Ue = Fe ? r : pt(C), Ie = $e ? r : pt(k);
      Ue = Ue == n ? T : Ue, Ie = Ie == n ? T : Ie;
      var ze = Ue == T, et = Ie == T, Me = Ue == Ie;
      if (Me && nn(C)) {
        if (!nn(k))
          return !1;
        Fe = !0, ze = !1;
      }
      if (Me && !ze)
        return Se || (Se = new ht()), Fe || aa(C) ? ea(C, k, Y, se, Pe, Se) : uf(C, k, Ue, Y, se, Pe, Se);
      if (!(Y & c)) {
        var Xe = ze && ve.call(C, "__wrapped__"), Je = et && ve.call(k, "__wrapped__");
        if (Xe || Je) {
          var mt = Xe ? C.value() : C, ut = Je ? k.value() : k;
          return Se || (Se = new ht()), Pe(mt, ut, Y, se, Se);
        }
      }
      return Me ? (Se || (Se = new ht()), cf(C, k, Y, se, Pe, Se)) : !1;
    }
    function af(C) {
      if (!oa(C) || mf(C))
        return !1;
      var k = na(C) ? Le : ie;
      return k.test(bt(C));
    }
    function sf(C) {
      return Yt(C) && ia(C.length) && !!J[zt(C)];
    }
    function lf(C) {
      if (!gf(C))
        return he(C);
      var k = [];
      for (var Y in Object(C))
        ve.call(C, Y) && Y != "constructor" && k.push(Y);
      return k;
    }
    function ea(C, k, Y, se, Pe, Se) {
      var Fe = Y & c, $e = C.length, Ue = k.length;
      if ($e != Ue && !(Fe && Ue > $e))
        return !1;
      var Ie = Se.get(C);
      if (Ie && Se.get(k))
        return Ie == k;
      var ze = -1, et = !0, Me = Y & t ? new Tr() : void 0;
      for (Se.set(C, k), Se.set(k, C); ++ze < $e; ) {
        var Xe = C[ze], Je = k[ze];
        if (se)
          var mt = Fe ? se(Je, Xe, ze, k, C, Se) : se(Xe, Je, ze, C, k, Se);
        if (mt !== void 0) {
          if (mt)
            continue;
          et = !1;
          break;
        }
        if (Me) {
          if (!Oe(k, function(ut, Rt) {
            if (!st(Me, Rt) && (Xe === ut || Pe(Xe, ut, Y, se, Se)))
              return Me.push(Rt);
          })) {
            et = !1;
            break;
          }
        } else if (!(Xe === Je || Pe(Xe, Je, Y, se, Se))) {
          et = !1;
          break;
        }
      }
      return Se.delete(C), Se.delete(k), et;
    }
    function uf(C, k, Y, se, Pe, Se, Fe) {
      switch (Y) {
        case x:
          if (C.byteLength != k.byteLength || C.byteOffset != k.byteOffset)
            return !1;
          C = C.buffer, k = k.buffer;
        case F:
          return !(C.byteLength != k.byteLength || !Se(new X(C), new X(k)));
        case a:
        case u:
        case p:
          return ra(+C, +k);
        case s:
          return C.name == k.name && C.message == k.message;
        case P:
        case w:
          return C == k + "";
        case g:
          var $e = B;
        case b:
          var Ue = se & c;
          if ($e || ($e = re), C.size != k.size && !Ue)
            return !1;
          var Ie = Fe.get(C);
          if (Ie)
            return Ie == k;
          se |= t, Fe.set(C, k);
          var ze = ea($e(C), $e(k), se, Pe, Se, Fe);
          return Fe.delete(C), ze;
        case _:
          if (rn)
            return rn.call(C) == rn.call(k);
      }
      return !1;
    }
    function cf(C, k, Y, se, Pe, Se) {
      var Fe = Y & c, $e = ta(C), Ue = $e.length, Ie = ta(k), ze = Ie.length;
      if (Ue != ze && !Fe)
        return !1;
      for (var et = Ue; et--; ) {
        var Me = $e[et];
        if (!(Fe ? Me in k : ve.call(k, Me)))
          return !1;
      }
      var Xe = Se.get(C);
      if (Xe && Se.get(k))
        return Xe == k;
      var Je = !0;
      Se.set(C, k), Se.set(k, C);
      for (var mt = Fe; ++et < Ue; ) {
        Me = $e[et];
        var ut = C[Me], Rt = k[Me];
        if (se)
          var sa = Fe ? se(Rt, ut, Me, k, C, Se) : se(ut, Rt, Me, C, k, Se);
        if (!(sa === void 0 ? ut === Rt || Pe(ut, Rt, Y, se, Se) : sa)) {
          Je = !1;
          break;
        }
        mt || (mt = Me == "constructor");
      }
      if (Je && !mt) {
        var Pr = C.constructor, Ir = k.constructor;
        Pr != Ir && "constructor" in C && "constructor" in k && !(typeof Pr == "function" && Pr instanceof Pr && typeof Ir == "function" && Ir instanceof Ir) && (Je = !1);
      }
      return Se.delete(C), Se.delete(k), Je;
    }
    function ta(C) {
      return nf(C, _f, df);
    }
    function Or(C, k) {
      var Y = C.__data__;
      return pf(k) ? Y[typeof k == "string" ? "string" : "hash"] : Y.map;
    }
    function $t(C, k) {
      var Y = l(C, k);
      return af(Y) ? Y : void 0;
    }
    function ff(C) {
      var k = ve.call(C, ee), Y = C[ee];
      try {
        C[ee] = void 0;
        var se = !0;
      } catch {
      }
      var Pe = de.call(C);
      return se && (k ? C[ee] = Y : delete C[ee]), Pe;
    }
    var df = fe ? function(C) {
      return C == null ? [] : (C = Object(C), Ee(fe(C), function(k) {
        return z.call(C, k);
      }));
    } : Sf, pt = zt;
    (we && pt(new we(new ArrayBuffer(1))) != x || De && pt(new De()) != g || Ne && pt(Ne.resolve()) != O || Te && pt(new Te()) != b || Lt && pt(new Lt()) != U) && (pt = function(C) {
      var k = zt(C), Y = k == T ? C.constructor : void 0, se = Y ? bt(Y) : "";
      if (se)
        switch (se) {
          case _t:
            return x;
          case Pc:
            return g;
          case Ic:
            return O;
          case Nc:
            return b;
          case Fc:
            return U;
        }
      return k;
    });
    function hf(C, k) {
      return k = k ?? e, !!k && (typeof C == "number" || be.test(C)) && C > -1 && C % 1 == 0 && C < k;
    }
    function pf(C) {
      var k = typeof C;
      return k == "string" || k == "number" || k == "symbol" || k == "boolean" ? C !== "__proto__" : C === null;
    }
    function mf(C) {
      return !!Re && Re in C;
    }
    function gf(C) {
      var k = C && C.constructor, Y = typeof k == "function" && k.prototype || Z;
      return C === Y;
    }
    function vf(C) {
      return de.call(C);
    }
    function bt(C) {
      if (C != null) {
        try {
          return ge.call(C);
        } catch {
        }
        try {
          return C + "";
        } catch {
        }
      }
      return "";
    }
    function ra(C, k) {
      return C === k || C !== C && k !== k;
    }
    var yf = Qo(/* @__PURE__ */ function() {
      return arguments;
    }()) ? Qo : function(C) {
      return Yt(C) && ve.call(C, "callee") && !z.call(C, "callee");
    }, Dr = Array.isArray;
    function Ef(C) {
      return C != null && ia(C.length) && !na(C);
    }
    var nn = ae || Af;
    function wf(C, k) {
      return Zo(C, k);
    }
    function na(C) {
      if (!oa(C))
        return !1;
      var k = zt(C);
      return k == m || k == v || k == i || k == D;
    }
    function ia(C) {
      return typeof C == "number" && C > -1 && C % 1 == 0 && C <= e;
    }
    function oa(C) {
      var k = typeof C;
      return C != null && (k == "object" || k == "function");
    }
    function Yt(C) {
      return C != null && typeof C == "object";
    }
    var aa = _e ? wt(_e) : sf;
    function _f(C) {
      return Ef(C) ? rf(C) : lf(C);
    }
    function Sf() {
      return [];
    }
    function Af() {
      return !1;
    }
    o.exports = wf;
  }(Er, Er.exports)), Er.exports;
}
var Tl;
function jd() {
  if (Tl) return kt;
  Tl = 1, Object.defineProperty(kt, "__esModule", { value: !0 }), kt.DownloadedUpdateHelper = void 0, kt.createTempUpdateFile = n;
  const o = Bt, h = Ve, d = Bd(), f = /* @__PURE__ */ Et(), c = Ce;
  let t = class {
    constructor(i) {
      this.cacheDir = i, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
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
    async validateDownloadedPath(i, a, u, s) {
      if (this.versionInfo != null && this.file === i && this.fileInfo != null)
        return d(this.versionInfo, a) && d(this.fileInfo.info, u.info) && await (0, f.pathExists)(i) ? i : null;
      const m = await this.getValidCachedUpdateFile(u, s);
      return m === null ? null : (s.info(`Update has already been downloaded to ${i}).`), this._file = m, m);
    }
    async setDownloadedFile(i, a, u, s, m, v) {
      this._file = i, this._packageFile = a, this.versionInfo = u, this.fileInfo = s, this._downloadedFileInfo = {
        fileName: m,
        sha512: s.info.sha512,
        isAdminRightsRequired: s.info.isAdminRightsRequired === !0
      }, v && await (0, f.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
    }
    async clear() {
      this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
    }
    async cleanCacheDirForPendingUpdate() {
      try {
        await (0, f.emptyDir)(this.cacheDirForPendingUpdate);
      } catch {
      }
    }
    /**
     * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
     * @param fileInfo
     * @param logger
     */
    async getValidCachedUpdateFile(i, a) {
      const u = this.getUpdateInfoFile();
      if (!await (0, f.pathExists)(u))
        return null;
      let m;
      try {
        m = await (0, f.readJson)(u);
      } catch (A) {
        let T = "No cached update info available";
        return A.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), T += ` (error on read: ${A.message})`), a.info(T), null;
      }
      if (!((m == null ? void 0 : m.fileName) !== null))
        return a.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
      if (i.info.sha512 !== m.sha512)
        return a.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${m.sha512}, expected: ${i.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
      const g = c.join(this.cacheDirForPendingUpdate, m.fileName);
      if (!await (0, f.pathExists)(g))
        return a.info("Cached update file doesn't exist"), null;
      const p = await e(g);
      return i.info.sha512 !== p ? (a.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${p}, expected: ${i.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = m, g);
    }
    getUpdateInfoFile() {
      return c.join(this.cacheDirForPendingUpdate, "update-info.json");
    }
  };
  kt.DownloadedUpdateHelper = t;
  function e(r, i = "sha512", a = "base64", u) {
    return new Promise((s, m) => {
      const v = (0, o.createHash)(i);
      v.on("error", m).setEncoding(a), (0, h.createReadStream)(r, {
        ...u,
        highWaterMark: 1024 * 1024
        /* better to use more memory but hash faster */
      }).on("error", m).on("end", () => {
        v.end(), s(v.read());
      }).pipe(v, { end: !1 });
    });
  }
  async function n(r, i, a) {
    let u = 0, s = c.join(i, r);
    for (let m = 0; m < 3; m++)
      try {
        return await (0, f.unlink)(s), s;
      } catch (v) {
        if (v.code === "ENOENT")
          return s;
        a.warn(`Error on remove temp update file: ${v}`), s = c.join(i, `${u++}-${r}`);
      }
    return s;
  }
  return kt;
}
var er = {}, Hr = {}, Cl;
function Hd() {
  if (Cl) return Hr;
  Cl = 1, Object.defineProperty(Hr, "__esModule", { value: !0 }), Hr.getAppCacheDir = d;
  const o = Ce, h = dt;
  function d() {
    const f = (0, h.homedir)();
    let c;
    return process.platform === "win32" ? c = process.env.LOCALAPPDATA || o.join(f, "AppData", "Local") : process.platform === "darwin" ? c = o.join(f, "Library", "Caches") : c = process.env.XDG_CACHE_HOME || o.join(f, ".cache"), c;
  }
  return Hr;
}
var Ol;
function Gd() {
  if (Ol) return er;
  Ol = 1, Object.defineProperty(er, "__esModule", { value: !0 }), er.ElectronAppAdapter = void 0;
  const o = Ce, h = Hd();
  let d = class {
    constructor(c = yt.app) {
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
      return this.isPackaged ? o.join(process.resourcesPath, "app-update.yml") : o.join(this.app.getAppPath(), "dev-app-update.yml");
    }
    get userDataPath() {
      return this.app.getPath("userData");
    }
    get baseCachePath() {
      return (0, h.getAppCacheDir)();
    }
    quit() {
      this.app.quit();
    }
    relaunch() {
      this.app.relaunch();
    }
    onQuit(c) {
      this.app.once("quit", (t, e) => c(e));
    }
  };
  return er.ElectronAppAdapter = d, er;
}
var ro = {}, Dl;
function Vd() {
  return Dl || (Dl = 1, function(o) {
    Object.defineProperty(o, "__esModule", { value: !0 }), o.ElectronHttpExecutor = o.NET_SESSION_NAME = void 0, o.getNetSession = d;
    const h = ke();
    o.NET_SESSION_NAME = "electron-updater";
    function d() {
      return yt.session.fromPartition(o.NET_SESSION_NAME, {
        cache: !1
      });
    }
    class f extends h.HttpExecutor {
      constructor(t) {
        super(), this.proxyLoginCallback = t, this.cachedSession = null;
      }
      async download(t, e, n) {
        return await n.cancellationToken.createPromise((r, i, a) => {
          const u = {
            headers: n.headers || void 0,
            redirect: "manual"
          };
          (0, h.configureRequestUrl)(t, u), (0, h.configureRequestOptions)(u), this.doDownload(u, {
            destination: e,
            options: n,
            onCancel: a,
            callback: (s) => {
              s == null ? r(e) : i(s);
            },
            responseHandler: null
          }, 0);
        });
      }
      createRequest(t, e) {
        t.headers && t.headers.Host && (t.host = t.headers.Host, delete t.headers.Host), this.cachedSession == null && (this.cachedSession = d());
        const n = yt.net.request({
          ...t,
          session: this.cachedSession
        });
        return n.on("response", e), this.proxyLoginCallback != null && n.on("login", this.proxyLoginCallback), n;
      }
      addRedirectHandlers(t, e, n, r, i) {
        t.on("redirect", (a, u, s) => {
          t.abort(), r > this.maxRedirects ? n(this.createMaxRedirectError()) : i(h.HttpExecutor.prepareRedirectUrlOptions(s, e));
        });
      }
    }
    o.ElectronHttpExecutor = f;
  }(ro)), ro;
}
var tr = {}, Pt = {}, no, Pl;
function Wd() {
  if (Pl) return no;
  Pl = 1;
  var o = "[object Symbol]", h = /[\\^$.*+?()[\]{}|]/g, d = RegExp(h.source), f = typeof rt == "object" && rt && rt.Object === Object && rt, c = typeof self == "object" && self && self.Object === Object && self, t = f || c || Function("return this")(), e = Object.prototype, n = e.toString, r = t.Symbol, i = r ? r.prototype : void 0, a = i ? i.toString : void 0;
  function u(p) {
    if (typeof p == "string")
      return p;
    if (m(p))
      return a ? a.call(p) : "";
    var A = p + "";
    return A == "0" && 1 / p == -1 / 0 ? "-0" : A;
  }
  function s(p) {
    return !!p && typeof p == "object";
  }
  function m(p) {
    return typeof p == "symbol" || s(p) && n.call(p) == o;
  }
  function v(p) {
    return p == null ? "" : u(p);
  }
  function g(p) {
    return p = v(p), p && d.test(p) ? p.replace(h, "\\$&") : p;
  }
  return no = g, no;
}
var Il;
function Nt() {
  if (Il) return Pt;
  Il = 1, Object.defineProperty(Pt, "__esModule", { value: !0 }), Pt.newBaseUrl = d, Pt.newUrlFromBase = f, Pt.getChannelFilename = c, Pt.blockmapFiles = t;
  const o = jt, h = Wd();
  function d(e) {
    const n = new o.URL(e);
    return n.pathname.endsWith("/") || (n.pathname += "/"), n;
  }
  function f(e, n, r = !1) {
    const i = new o.URL(e, n), a = n.search;
    return a != null && a.length !== 0 ? i.search = a : r && (i.search = `noCache=${Date.now().toString(32)}`), i;
  }
  function c(e) {
    return `${e}.yml`;
  }
  function t(e, n, r) {
    const i = f(`${e.pathname}.blockmap`, e);
    return [f(`${e.pathname.replace(new RegExp(h(r), "g"), n)}.blockmap`, e), i];
  }
  return Pt;
}
var ct = {}, Nl;
function Qe() {
  if (Nl) return ct;
  Nl = 1, Object.defineProperty(ct, "__esModule", { value: !0 }), ct.Provider = void 0, ct.findFile = c, ct.parseUpdateInfo = t, ct.getFileList = e, ct.resolveFiles = n;
  const o = ke(), h = Bo(), d = Nt();
  let f = class {
    constructor(i) {
      this.runtimeOptions = i, this.requestHeaders = null, this.executor = i.executor;
    }
    get isUseMultipleRangeRequest() {
      return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
    }
    getChannelFilePrefix() {
      if (this.runtimeOptions.platform === "linux") {
        const i = process.env.TEST_UPDATER_ARCH || process.arch;
        return "-linux" + (i === "x64" ? "" : `-${i}`);
      } else
        return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
    }
    // due to historical reasons for windows we use channel name without platform specifier
    getDefaultChannelName() {
      return this.getCustomChannelName("latest");
    }
    getCustomChannelName(i) {
      return `${i}${this.getChannelFilePrefix()}`;
    }
    get fileExtraDownloadHeaders() {
      return null;
    }
    setRequestHeaders(i) {
      this.requestHeaders = i;
    }
    /**
     * Method to perform API request only to resolve update info, but not to download update.
     */
    httpRequest(i, a, u) {
      return this.executor.request(this.createRequestOptions(i, a), u);
    }
    createRequestOptions(i, a) {
      const u = {};
      return this.requestHeaders == null ? a != null && (u.headers = a) : u.headers = a == null ? this.requestHeaders : { ...this.requestHeaders, ...a }, (0, o.configureRequestUrl)(i, u), u;
    }
  };
  ct.Provider = f;
  function c(r, i, a) {
    if (r.length === 0)
      throw (0, o.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
    const u = r.find((s) => s.url.pathname.toLowerCase().endsWith(`.${i}`));
    return u ?? (a == null ? r[0] : r.find((s) => !a.some((m) => s.url.pathname.toLowerCase().endsWith(`.${m}`))));
  }
  function t(r, i, a) {
    if (r == null)
      throw (0, o.newError)(`Cannot parse update info from ${i} in the latest release artifacts (${a}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    let u;
    try {
      u = (0, h.load)(r);
    } catch (s) {
      throw (0, o.newError)(`Cannot parse update info from ${i} in the latest release artifacts (${a}): ${s.stack || s.message}, rawData: ${r}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    }
    return u;
  }
  function e(r) {
    const i = r.files;
    if (i != null && i.length > 0)
      return i;
    if (r.path != null)
      return [
        {
          url: r.path,
          sha2: r.sha2,
          sha512: r.sha512
        }
      ];
    throw (0, o.newError)(`No files provided: ${(0, o.safeStringifyJson)(r)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
  }
  function n(r, i, a = (u) => u) {
    const s = e(r).map((g) => {
      if (g.sha2 == null && g.sha512 == null)
        throw (0, o.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, o.safeStringifyJson)(g)}`, "ERR_UPDATER_NO_CHECKSUM");
      return {
        url: (0, d.newUrlFromBase)(a(g.url), i),
        info: g
      };
    }), m = r.packages, v = m == null ? null : m[process.arch] || m.ia32;
    return v != null && (s[0].packageInfo = {
      ...v,
      path: (0, d.newUrlFromBase)(a(v.path), i).href
    }), s;
  }
  return ct;
}
var Fl;
function mc() {
  if (Fl) return tr;
  Fl = 1, Object.defineProperty(tr, "__esModule", { value: !0 }), tr.GenericProvider = void 0;
  const o = ke(), h = Nt(), d = Qe();
  let f = class extends d.Provider {
    constructor(t, e, n) {
      super(n), this.configuration = t, this.updater = e, this.baseUrl = (0, h.newBaseUrl)(this.configuration.url);
    }
    get channel() {
      const t = this.updater.channel || this.configuration.channel;
      return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
    }
    async getLatestVersion() {
      const t = (0, h.getChannelFilename)(this.channel), e = (0, h.newUrlFromBase)(t, this.baseUrl, this.updater.isAddNoCacheQuery);
      for (let n = 0; ; n++)
        try {
          return (0, d.parseUpdateInfo)(await this.httpRequest(e), t, e);
        } catch (r) {
          if (r instanceof o.HttpError && r.statusCode === 404)
            throw (0, o.newError)(`Cannot find channel "${t}" update info: ${r.stack || r.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          if (r.code === "ECONNREFUSED" && n < 3) {
            await new Promise((i, a) => {
              try {
                setTimeout(i, 1e3 * n);
              } catch (u) {
                a(u);
              }
            });
            continue;
          }
          throw r;
        }
    }
    resolveFiles(t) {
      return (0, d.resolveFiles)(t, this.baseUrl);
    }
  };
  return tr.GenericProvider = f, tr;
}
var rr = {}, nr = {}, xl;
function zd() {
  if (xl) return nr;
  xl = 1, Object.defineProperty(nr, "__esModule", { value: !0 }), nr.BitbucketProvider = void 0;
  const o = ke(), h = Nt(), d = Qe();
  let f = class extends d.Provider {
    constructor(t, e, n) {
      super({
        ...n,
        isUseMultipleRangeRequest: !1
      }), this.configuration = t, this.updater = e;
      const { owner: r, slug: i } = t;
      this.baseUrl = (0, h.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${r}/${i}/downloads`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "latest";
    }
    async getLatestVersion() {
      const t = new o.CancellationToken(), e = (0, h.getChannelFilename)(this.getCustomChannelName(this.channel)), n = (0, h.newUrlFromBase)(e, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const r = await this.httpRequest(n, void 0, t);
        return (0, d.parseUpdateInfo)(r, e, n);
      } catch (r) {
        throw (0, o.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${r.stack || r.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(t) {
      return (0, d.resolveFiles)(t, this.baseUrl);
    }
    toString() {
      const { owner: t, slug: e } = this.configuration;
      return `Bitbucket (owner: ${t}, slug: ${e}, channel: ${this.channel})`;
    }
  };
  return nr.BitbucketProvider = f, nr;
}
var vt = {}, Ll;
function gc() {
  if (Ll) return vt;
  Ll = 1, Object.defineProperty(vt, "__esModule", { value: !0 }), vt.GitHubProvider = vt.BaseGitHubProvider = void 0, vt.computeReleaseNotes = i;
  const o = ke(), h = pc(), d = jt, f = Nt(), c = Qe(), t = /\/tag\/([^/]+)$/;
  class e extends c.Provider {
    constructor(u, s, m) {
      super({
        ...m,
        /* because GitHib uses S3 */
        isUseMultipleRangeRequest: !1
      }), this.options = u, this.baseUrl = (0, f.newBaseUrl)((0, o.githubUrl)(u, s));
      const v = s === "github.com" ? "api.github.com" : s;
      this.baseApiUrl = (0, f.newBaseUrl)((0, o.githubUrl)(u, v));
    }
    computeGithubBasePath(u) {
      const s = this.options.host;
      return s && !["github.com", "api.github.com"].includes(s) ? `/api/v3${u}` : u;
    }
  }
  vt.BaseGitHubProvider = e;
  let n = class extends e {
    constructor(u, s, m) {
      super(u, "github.com", m), this.options = u, this.updater = s;
    }
    get channel() {
      const u = this.updater.channel || this.options.channel;
      return u == null ? this.getDefaultChannelName() : this.getCustomChannelName(u);
    }
    async getLatestVersion() {
      var u, s, m, v, g;
      const p = new o.CancellationToken(), A = await this.httpRequest((0, f.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
        accept: "application/xml, application/atom+xml, text/xml, */*"
      }, p), T = (0, o.parseXml)(A);
      let O = T.element("entry", !1, "No published versions on GitHub"), D = null;
      try {
        if (this.updater.allowPrerelease) {
          const U = ((u = this.updater) === null || u === void 0 ? void 0 : u.channel) || ((s = h.prerelease(this.updater.currentVersion)) === null || s === void 0 ? void 0 : s[0]) || null;
          if (U === null)
            D = t.exec(O.element("link").attribute("href"))[1];
          else
            for (const F of T.getElements("entry")) {
              const x = t.exec(F.element("link").attribute("href"));
              if (x === null)
                continue;
              const q = x[1], N = ((m = h.prerelease(q)) === null || m === void 0 ? void 0 : m[0]) || null, I = !U || ["alpha", "beta"].includes(U), $ = N !== null && !["alpha", "beta"].includes(String(N));
              if (I && !$ && !(U === "beta" && N === "alpha")) {
                D = q;
                break;
              }
              if (N && N === U) {
                D = q;
                break;
              }
            }
        } else {
          D = await this.getLatestTagName(p);
          for (const U of T.getElements("entry"))
            if (t.exec(U.element("link").attribute("href"))[1] === D) {
              O = U;
              break;
            }
        }
      } catch (U) {
        throw (0, o.newError)(`Cannot parse releases feed: ${U.stack || U.message},
XML:
${A}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
      }
      if (D == null)
        throw (0, o.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      let P, b = "", w = "";
      const _ = async (U) => {
        b = (0, f.getChannelFilename)(U), w = (0, f.newUrlFromBase)(this.getBaseDownloadPath(String(D), b), this.baseUrl);
        const F = this.createRequestOptions(w);
        try {
          return await this.executor.request(F, p);
        } catch (x) {
          throw x instanceof o.HttpError && x.statusCode === 404 ? (0, o.newError)(`Cannot find ${b} in the latest release artifacts (${w}): ${x.stack || x.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : x;
        }
      };
      try {
        let U = this.channel;
        this.updater.allowPrerelease && (!((v = h.prerelease(D)) === null || v === void 0) && v[0]) && (U = this.getCustomChannelName(String((g = h.prerelease(D)) === null || g === void 0 ? void 0 : g[0]))), P = await _(U);
      } catch (U) {
        if (this.updater.allowPrerelease)
          P = await _(this.getDefaultChannelName());
        else
          throw U;
      }
      const E = (0, c.parseUpdateInfo)(P, b, w);
      return E.releaseName == null && (E.releaseName = O.elementValueOrEmpty("title")), E.releaseNotes == null && (E.releaseNotes = i(this.updater.currentVersion, this.updater.fullChangelog, T, O)), {
        tag: D,
        ...E
      };
    }
    async getLatestTagName(u) {
      const s = this.options, m = s.host == null || s.host === "github.com" ? (0, f.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new d.URL(`${this.computeGithubBasePath(`/repos/${s.owner}/${s.repo}/releases`)}/latest`, this.baseApiUrl);
      try {
        const v = await this.httpRequest(m, { Accept: "application/json" }, u);
        return v == null ? null : JSON.parse(v).tag_name;
      } catch (v) {
        throw (0, o.newError)(`Unable to find latest version on GitHub (${m}), please ensure a production release exists: ${v.stack || v.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    resolveFiles(u) {
      return (0, c.resolveFiles)(u, this.baseUrl, (s) => this.getBaseDownloadPath(u.tag, s.replace(/ /g, "-")));
    }
    getBaseDownloadPath(u, s) {
      return `${this.basePath}/download/${u}/${s}`;
    }
  };
  vt.GitHubProvider = n;
  function r(a) {
    const u = a.elementValueOrEmpty("content");
    return u === "No content." ? "" : u;
  }
  function i(a, u, s, m) {
    if (!u)
      return r(m);
    const v = [];
    for (const g of s.getElements("entry")) {
      const p = /\/tag\/v?([^/]+)$/.exec(g.element("link").attribute("href"))[1];
      h.lt(a, p) && v.push({
        version: p,
        note: r(g)
      });
    }
    return v.sort((g, p) => h.rcompare(g.version, p.version));
  }
  return vt;
}
var ir = {}, $l;
function Yd() {
  if ($l) return ir;
  $l = 1, Object.defineProperty(ir, "__esModule", { value: !0 }), ir.KeygenProvider = void 0;
  const o = ke(), h = Nt(), d = Qe();
  let f = class extends d.Provider {
    constructor(t, e, n) {
      super({
        ...n,
        isUseMultipleRangeRequest: !1
      }), this.configuration = t, this.updater = e, this.defaultHostname = "api.keygen.sh";
      const r = this.configuration.host || this.defaultHostname;
      this.baseUrl = (0, h.newBaseUrl)(`https://${r}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "stable";
    }
    async getLatestVersion() {
      const t = new o.CancellationToken(), e = (0, h.getChannelFilename)(this.getCustomChannelName(this.channel)), n = (0, h.newUrlFromBase)(e, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const r = await this.httpRequest(n, {
          Accept: "application/vnd.api+json",
          "Keygen-Version": "1.1"
        }, t);
        return (0, d.parseUpdateInfo)(r, e, n);
      } catch (r) {
        throw (0, o.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${r.stack || r.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(t) {
      return (0, d.resolveFiles)(t, this.baseUrl);
    }
    toString() {
      const { account: t, product: e, platform: n } = this.configuration;
      return `Keygen (account: ${t}, product: ${e}, platform: ${n}, channel: ${this.channel})`;
    }
  };
  return ir.KeygenProvider = f, ir;
}
var or = {}, Ul;
function Xd() {
  if (Ul) return or;
  Ul = 1, Object.defineProperty(or, "__esModule", { value: !0 }), or.PrivateGitHubProvider = void 0;
  const o = ke(), h = Bo(), d = Ce, f = jt, c = Nt(), t = gc(), e = Qe();
  let n = class extends t.BaseGitHubProvider {
    constructor(i, a, u, s) {
      super(i, "api.github.com", s), this.updater = a, this.token = u;
    }
    createRequestOptions(i, a) {
      const u = super.createRequestOptions(i, a);
      return u.redirect = "manual", u;
    }
    async getLatestVersion() {
      const i = new o.CancellationToken(), a = (0, c.getChannelFilename)(this.getDefaultChannelName()), u = await this.getLatestVersionInfo(i), s = u.assets.find((g) => g.name === a);
      if (s == null)
        throw (0, o.newError)(`Cannot find ${a} in the release ${u.html_url || u.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      const m = new f.URL(s.url);
      let v;
      try {
        v = (0, h.load)(await this.httpRequest(m, this.configureHeaders("application/octet-stream"), i));
      } catch (g) {
        throw g instanceof o.HttpError && g.statusCode === 404 ? (0, o.newError)(`Cannot find ${a} in the latest release artifacts (${m}): ${g.stack || g.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : g;
      }
      return v.assets = u.assets, v;
    }
    get fileExtraDownloadHeaders() {
      return this.configureHeaders("application/octet-stream");
    }
    configureHeaders(i) {
      return {
        accept: i,
        authorization: `token ${this.token}`
      };
    }
    async getLatestVersionInfo(i) {
      const a = this.updater.allowPrerelease;
      let u = this.basePath;
      a || (u = `${u}/latest`);
      const s = (0, c.newUrlFromBase)(u, this.baseUrl);
      try {
        const m = JSON.parse(await this.httpRequest(s, this.configureHeaders("application/vnd.github.v3+json"), i));
        return a ? m.find((v) => v.prerelease) || m[0] : m;
      } catch (m) {
        throw (0, o.newError)(`Unable to find latest version on GitHub (${s}), please ensure a production release exists: ${m.stack || m.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
    }
    resolveFiles(i) {
      return (0, e.getFileList)(i).map((a) => {
        const u = d.posix.basename(a.url).replace(/ /g, "-"), s = i.assets.find((m) => m != null && m.name === u);
        if (s == null)
          throw (0, o.newError)(`Cannot find asset "${u}" in: ${JSON.stringify(i.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new f.URL(s.url),
          info: a
        };
      });
    }
  };
  return or.PrivateGitHubProvider = n, or;
}
var kl;
function Jd() {
  if (kl) return rr;
  kl = 1, Object.defineProperty(rr, "__esModule", { value: !0 }), rr.isUrlProbablySupportMultiRangeRequests = e, rr.createClient = n;
  const o = ke(), h = zd(), d = mc(), f = gc(), c = Yd(), t = Xd();
  function e(r) {
    return !r.includes("s3.amazonaws.com");
  }
  function n(r, i, a) {
    if (typeof r == "string")
      throw (0, o.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
    const u = r.provider;
    switch (u) {
      case "github": {
        const s = r, m = (s.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || s.token;
        return m == null ? new f.GitHubProvider(s, i, a) : new t.PrivateGitHubProvider(s, i, m, a);
      }
      case "bitbucket":
        return new h.BitbucketProvider(r, i, a);
      case "keygen":
        return new c.KeygenProvider(r, i, a);
      case "s3":
      case "spaces":
        return new d.GenericProvider({
          provider: "generic",
          url: (0, o.getS3LikeProviderBaseUrl)(r),
          channel: r.channel || null
        }, i, {
          ...a,
          // https://github.com/minio/minio/issues/5285#issuecomment-350428955
          isUseMultipleRangeRequest: !1
        });
      case "generic": {
        const s = r;
        return new d.GenericProvider(s, i, {
          ...a,
          isUseMultipleRangeRequest: s.useMultipleRangeRequest !== !1 && e(s.url)
        });
      }
      case "custom": {
        const s = r, m = s.updateProvider;
        if (!m)
          throw (0, o.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
        return new m(s, i, a);
      }
      default:
        throw (0, o.newError)(`Unsupported provider: ${u}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
    }
  }
  return rr;
}
var ar = {}, sr = {}, qt = {}, Mt = {}, ql;
function Yo() {
  if (ql) return Mt;
  ql = 1, Object.defineProperty(Mt, "__esModule", { value: !0 }), Mt.OperationKind = void 0, Mt.computeOperations = h;
  var o;
  (function(e) {
    e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
  })(o || (Mt.OperationKind = o = {}));
  function h(e, n, r) {
    const i = t(e.files), a = t(n.files);
    let u = null;
    const s = n.files[0], m = [], v = s.name, g = i.get(v);
    if (g == null)
      throw new Error(`no file ${v} in old blockmap`);
    const p = a.get(v);
    let A = 0;
    const { checksumToOffset: T, checksumToOldSize: O } = c(i.get(v), g.offset, r);
    let D = s.offset;
    for (let P = 0; P < p.checksums.length; D += p.sizes[P], P++) {
      const b = p.sizes[P], w = p.checksums[P];
      let _ = T.get(w);
      _ != null && O.get(w) !== b && (r.warn(`Checksum ("${w}") matches, but size differs (old: ${O.get(w)}, new: ${b})`), _ = void 0), _ === void 0 ? (A++, u != null && u.kind === o.DOWNLOAD && u.end === D ? u.end += b : (u = {
        kind: o.DOWNLOAD,
        start: D,
        end: D + b
        // oldBlocks: null,
      }, f(u, m, w, P))) : u != null && u.kind === o.COPY && u.end === _ ? u.end += b : (u = {
        kind: o.COPY,
        start: _,
        end: _ + b
        // oldBlocks: [checksum]
      }, f(u, m, w, P));
    }
    return A > 0 && r.info(`File${s.name === "file" ? "" : " " + s.name} has ${A} changed blocks`), m;
  }
  const d = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
  function f(e, n, r, i) {
    if (d && n.length !== 0) {
      const a = n[n.length - 1];
      if (a.kind === e.kind && e.start < a.end && e.start > a.start) {
        const u = [a.start, a.end, e.start, e.end].reduce((s, m) => s < m ? s : m);
        throw new Error(`operation (block index: ${i}, checksum: ${r}, kind: ${o[e.kind]}) overlaps previous operation (checksum: ${r}):
abs: ${a.start} until ${a.end} and ${e.start} until ${e.end}
rel: ${a.start - u} until ${a.end - u} and ${e.start - u} until ${e.end - u}`);
      }
    }
    n.push(e);
  }
  function c(e, n, r) {
    const i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
    let u = n;
    for (let s = 0; s < e.checksums.length; s++) {
      const m = e.checksums[s], v = e.sizes[s], g = a.get(m);
      if (g === void 0)
        i.set(m, u), a.set(m, v);
      else if (r.debug != null) {
        const p = g === v ? "(same size)" : `(size: ${g}, this size: ${v})`;
        r.debug(`${m} duplicated in blockmap ${p}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
      }
      u += v;
    }
    return { checksumToOffset: i, checksumToOldSize: a };
  }
  function t(e) {
    const n = /* @__PURE__ */ new Map();
    for (const r of e)
      n.set(r.name, r);
    return n;
  }
  return Mt;
}
var Ml;
function vc() {
  if (Ml) return qt;
  Ml = 1, Object.defineProperty(qt, "__esModule", { value: !0 }), qt.DataSplitter = void 0, qt.copyData = e;
  const o = ke(), h = Ve, d = _r, f = Yo(), c = Buffer.from(`\r
\r
`);
  var t;
  (function(r) {
    r[r.INIT = 0] = "INIT", r[r.HEADER = 1] = "HEADER", r[r.BODY = 2] = "BODY";
  })(t || (t = {}));
  function e(r, i, a, u, s) {
    const m = (0, h.createReadStream)("", {
      fd: a,
      autoClose: !1,
      start: r.start,
      // end is inclusive
      end: r.end - 1
    });
    m.on("error", u), m.once("end", s), m.pipe(i, {
      end: !1
    });
  }
  let n = class extends d.Writable {
    constructor(i, a, u, s, m, v) {
      super(), this.out = i, this.options = a, this.partIndexToTaskIndex = u, this.partIndexToLength = m, this.finishHandler = v, this.partIndex = -1, this.headerListBuffer = null, this.readState = t.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = s.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
    }
    get isFinished() {
      return this.partIndex === this.partIndexToLength.length;
    }
    // noinspection JSUnusedGlobalSymbols
    _write(i, a, u) {
      if (this.isFinished) {
        console.error(`Trailing ignored data: ${i.length} bytes`);
        return;
      }
      this.handleData(i).then(u).catch(u);
    }
    async handleData(i) {
      let a = 0;
      if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
        throw (0, o.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
      if (this.ignoreByteCount > 0) {
        const u = Math.min(this.ignoreByteCount, i.length);
        this.ignoreByteCount -= u, a = u;
      } else if (this.remainingPartDataCount > 0) {
        const u = Math.min(this.remainingPartDataCount, i.length);
        this.remainingPartDataCount -= u, await this.processPartData(i, 0, u), a = u;
      }
      if (a !== i.length) {
        if (this.readState === t.HEADER) {
          const u = this.searchHeaderListEnd(i, a);
          if (u === -1)
            return;
          a = u, this.readState = t.BODY, this.headerListBuffer = null;
        }
        for (; ; ) {
          if (this.readState === t.BODY)
            this.readState = t.INIT;
          else {
            this.partIndex++;
            let v = this.partIndexToTaskIndex.get(this.partIndex);
            if (v == null)
              if (this.isFinished)
                v = this.options.end;
              else
                throw (0, o.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
            const g = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
            if (g < v)
              await this.copyExistingData(g, v);
            else if (g > v)
              throw (0, o.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
            if (this.isFinished) {
              this.onPartEnd(), this.finishHandler();
              return;
            }
            if (a = this.searchHeaderListEnd(i, a), a === -1) {
              this.readState = t.HEADER;
              return;
            }
          }
          const u = this.partIndexToLength[this.partIndex], s = a + u, m = Math.min(s, i.length);
          if (await this.processPartStarted(i, a, m), this.remainingPartDataCount = u - (m - a), this.remainingPartDataCount > 0)
            return;
          if (a = s + this.boundaryLength, a >= i.length) {
            this.ignoreByteCount = this.boundaryLength - (i.length - s);
            return;
          }
        }
      }
    }
    copyExistingData(i, a) {
      return new Promise((u, s) => {
        const m = () => {
          if (i === a) {
            u();
            return;
          }
          const v = this.options.tasks[i];
          if (v.kind !== f.OperationKind.COPY) {
            s(new Error("Task kind must be COPY"));
            return;
          }
          e(v, this.out, this.options.oldFileFd, s, () => {
            i++, m();
          });
        };
        m();
      });
    }
    searchHeaderListEnd(i, a) {
      const u = i.indexOf(c, a);
      if (u !== -1)
        return u + c.length;
      const s = a === 0 ? i : i.slice(a);
      return this.headerListBuffer == null ? this.headerListBuffer = s : this.headerListBuffer = Buffer.concat([this.headerListBuffer, s]), -1;
    }
    onPartEnd() {
      const i = this.partIndexToLength[this.partIndex - 1];
      if (this.actualPartLength !== i)
        throw (0, o.newError)(`Expected length: ${i} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
      this.actualPartLength = 0;
    }
    processPartStarted(i, a, u) {
      return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(i, a, u);
    }
    processPartData(i, a, u) {
      this.actualPartLength += u - a;
      const s = this.out;
      return s.write(a === 0 && i.length === u ? i : i.slice(a, u)) ? Promise.resolve() : new Promise((m, v) => {
        s.on("error", v), s.once("drain", () => {
          s.removeListener("error", v), m();
        });
      });
    }
  };
  return qt.DataSplitter = n, qt;
}
var lr = {}, Bl;
function Kd() {
  if (Bl) return lr;
  Bl = 1, Object.defineProperty(lr, "__esModule", { value: !0 }), lr.executeTasksUsingMultipleRangeRequests = f, lr.checkIsRangesSupported = t;
  const o = ke(), h = vc(), d = Yo();
  function f(e, n, r, i, a) {
    const u = (s) => {
      if (s >= n.length) {
        e.fileMetadataBuffer != null && r.write(e.fileMetadataBuffer), r.end();
        return;
      }
      const m = s + 1e3;
      c(e, {
        tasks: n,
        start: s,
        end: Math.min(n.length, m),
        oldFileFd: i
      }, r, () => u(m), a);
    };
    return u;
  }
  function c(e, n, r, i, a) {
    let u = "bytes=", s = 0;
    const m = /* @__PURE__ */ new Map(), v = [];
    for (let A = n.start; A < n.end; A++) {
      const T = n.tasks[A];
      T.kind === d.OperationKind.DOWNLOAD && (u += `${T.start}-${T.end - 1}, `, m.set(s, A), s++, v.push(T.end - T.start));
    }
    if (s <= 1) {
      const A = (T) => {
        if (T >= n.end) {
          i();
          return;
        }
        const O = n.tasks[T++];
        if (O.kind === d.OperationKind.COPY)
          (0, h.copyData)(O, r, n.oldFileFd, a, () => A(T));
        else {
          const D = e.createRequestOptions();
          D.headers.Range = `bytes=${O.start}-${O.end - 1}`;
          const P = e.httpExecutor.createRequest(D, (b) => {
            t(b, a) && (b.pipe(r, {
              end: !1
            }), b.once("end", () => A(T)));
          });
          e.httpExecutor.addErrorAndTimeoutHandlers(P, a), P.end();
        }
      };
      A(n.start);
      return;
    }
    const g = e.createRequestOptions();
    g.headers.Range = u.substring(0, u.length - 2);
    const p = e.httpExecutor.createRequest(g, (A) => {
      if (!t(A, a))
        return;
      const T = (0, o.safeGetHeader)(A, "content-type"), O = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i.exec(T);
      if (O == null) {
        a(new Error(`Content-Type "multipart/byteranges" is expected, but got "${T}"`));
        return;
      }
      const D = new h.DataSplitter(r, n, m, O[1] || O[2], v, i);
      D.on("error", a), A.pipe(D), A.on("end", () => {
        setTimeout(() => {
          p.abort(), a(new Error("Response ends without calling any handlers"));
        }, 1e4);
      });
    });
    e.httpExecutor.addErrorAndTimeoutHandlers(p, a), p.end();
  }
  function t(e, n) {
    if (e.statusCode >= 400)
      return n((0, o.createHttpError)(e)), !1;
    if (e.statusCode !== 206) {
      const r = (0, o.safeGetHeader)(e, "accept-ranges");
      if (r == null || r === "none")
        return n(new Error(`Server doesn't support Accept-Ranges (response code ${e.statusCode})`)), !1;
    }
    return !0;
  }
  return lr;
}
var ur = {}, jl;
function Qd() {
  if (jl) return ur;
  jl = 1, Object.defineProperty(ur, "__esModule", { value: !0 }), ur.ProgressDifferentialDownloadCallbackTransform = void 0;
  const o = _r;
  var h;
  (function(f) {
    f[f.COPY = 0] = "COPY", f[f.DOWNLOAD = 1] = "DOWNLOAD";
  })(h || (h = {}));
  let d = class extends o.Transform {
    constructor(c, t, e) {
      super(), this.progressDifferentialDownloadInfo = c, this.cancellationToken = t, this.onProgress = e, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = h.COPY, this.nextUpdate = this.start + 1e3;
    }
    _transform(c, t, e) {
      if (this.cancellationToken.cancelled) {
        e(new Error("cancelled"), null);
        return;
      }
      if (this.operationType == h.COPY) {
        e(null, c);
        return;
      }
      this.transferred += c.length, this.delta += c.length;
      const n = Date.now();
      n >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = n + 1e3, this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((n - this.start) / 1e3))
      }), this.delta = 0), e(null, c);
    }
    beginFileCopy() {
      this.operationType = h.COPY;
    }
    beginRangeDownload() {
      this.operationType = h.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
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
  return ur.ProgressDifferentialDownloadCallbackTransform = d, ur;
}
var Hl;
function yc() {
  if (Hl) return sr;
  Hl = 1, Object.defineProperty(sr, "__esModule", { value: !0 }), sr.DifferentialDownloader = void 0;
  const o = ke(), h = /* @__PURE__ */ Et(), d = Ve, f = vc(), c = jt, t = Yo(), e = Kd(), n = Qd();
  let r = class {
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(s, m, v) {
      this.blockAwareFileInfo = s, this.httpExecutor = m, this.options = v, this.fileMetadataBuffer = null, this.logger = v.logger;
    }
    createRequestOptions() {
      const s = {
        headers: {
          ...this.options.requestHeaders,
          accept: "*/*"
        }
      };
      return (0, o.configureRequestUrl)(this.options.newUrl, s), (0, o.configureRequestOptions)(s), s;
    }
    doDownload(s, m) {
      if (s.version !== m.version)
        throw new Error(`version is different (${s.version} - ${m.version}), full download is required`);
      const v = this.logger, g = (0, t.computeOperations)(s, m, v);
      v.debug != null && v.debug(JSON.stringify(g, null, 2));
      let p = 0, A = 0;
      for (const O of g) {
        const D = O.end - O.start;
        O.kind === t.OperationKind.DOWNLOAD ? p += D : A += D;
      }
      const T = this.blockAwareFileInfo.size;
      if (p + A + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== T)
        throw new Error(`Internal error, size mismatch: downloadSize: ${p}, copySize: ${A}, newSize: ${T}`);
      return v.info(`Full: ${i(T)}, To download: ${i(p)} (${Math.round(p / (T / 100))}%)`), this.downloadFile(g);
    }
    downloadFile(s) {
      const m = [], v = () => Promise.all(m.map((g) => (0, h.close)(g.descriptor).catch((p) => {
        this.logger.error(`cannot close file "${g.path}": ${p}`);
      })));
      return this.doDownloadFile(s, m).then(v).catch((g) => v().catch((p) => {
        try {
          this.logger.error(`cannot close files: ${p}`);
        } catch (A) {
          try {
            console.error(A);
          } catch {
          }
        }
        throw g;
      }).then(() => {
        throw g;
      }));
    }
    async doDownloadFile(s, m) {
      const v = await (0, h.open)(this.options.oldFile, "r");
      m.push({ descriptor: v, path: this.options.oldFile });
      const g = await (0, h.open)(this.options.newFile, "w");
      m.push({ descriptor: g, path: this.options.newFile });
      const p = (0, d.createWriteStream)(this.options.newFile, { fd: g });
      await new Promise((A, T) => {
        const O = [];
        let D;
        if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
          const x = [];
          let q = 0;
          for (const I of s)
            I.kind === t.OperationKind.DOWNLOAD && (x.push(I.end - I.start), q += I.end - I.start);
          const N = {
            expectedByteCounts: x,
            grandTotal: q
          };
          D = new n.ProgressDifferentialDownloadCallbackTransform(N, this.options.cancellationToken, this.options.onProgress), O.push(D);
        }
        const P = new o.DigestTransform(this.blockAwareFileInfo.sha512);
        P.isValidateOnEnd = !1, O.push(P), p.on("finish", () => {
          p.close(() => {
            m.splice(1, 1);
            try {
              P.validate();
            } catch (x) {
              T(x);
              return;
            }
            A(void 0);
          });
        }), O.push(p);
        let b = null;
        for (const x of O)
          x.on("error", T), b == null ? b = x : b = b.pipe(x);
        const w = O[0];
        let _;
        if (this.options.isUseMultipleRangeRequest) {
          _ = (0, e.executeTasksUsingMultipleRangeRequests)(this, s, w, v, T), _(0);
          return;
        }
        let E = 0, U = null;
        this.logger.info(`Differential download: ${this.options.newUrl}`);
        const F = this.createRequestOptions();
        F.redirect = "manual", _ = (x) => {
          var q, N;
          if (x >= s.length) {
            this.fileMetadataBuffer != null && w.write(this.fileMetadataBuffer), w.end();
            return;
          }
          const I = s[x++];
          if (I.kind === t.OperationKind.COPY) {
            D && D.beginFileCopy(), (0, f.copyData)(I, w, v, T, () => _(x));
            return;
          }
          const $ = `bytes=${I.start}-${I.end - 1}`;
          F.headers.range = $, (N = (q = this.logger) === null || q === void 0 ? void 0 : q.debug) === null || N === void 0 || N.call(q, `download range: ${$}`), D && D.beginRangeDownload();
          const M = this.httpExecutor.createRequest(F, (K) => {
            K.on("error", T), K.on("aborted", () => {
              T(new Error("response has been aborted by the server"));
            }), K.statusCode >= 400 && T((0, o.createHttpError)(K)), K.pipe(w, {
              end: !1
            }), K.once("end", () => {
              D && D.endRangeDownload(), ++E === 100 ? (E = 0, setTimeout(() => _(x), 1e3)) : _(x);
            });
          });
          M.on("redirect", (K, V, ne) => {
            this.logger.info(`Redirect to ${a(ne)}`), U = ne, (0, o.configureRequestUrl)(new c.URL(U), F), M.followRedirect();
          }), this.httpExecutor.addErrorAndTimeoutHandlers(M, T), M.end();
        }, _(0);
      });
    }
    async readRemoteBytes(s, m) {
      const v = Buffer.allocUnsafe(m + 1 - s), g = this.createRequestOptions();
      g.headers.range = `bytes=${s}-${m}`;
      let p = 0;
      if (await this.request(g, (A) => {
        A.copy(v, p), p += A.length;
      }), p !== v.length)
        throw new Error(`Received data length ${p} is not equal to expected ${v.length}`);
      return v;
    }
    request(s, m) {
      return new Promise((v, g) => {
        const p = this.httpExecutor.createRequest(s, (A) => {
          (0, e.checkIsRangesSupported)(A, g) && (A.on("error", g), A.on("aborted", () => {
            g(new Error("response has been aborted by the server"));
          }), A.on("data", m), A.on("end", () => v()));
        });
        this.httpExecutor.addErrorAndTimeoutHandlers(p, g), p.end();
      });
    }
  };
  sr.DifferentialDownloader = r;
  function i(u, s = " KB") {
    return new Intl.NumberFormat("en").format((u / 1024).toFixed(2)) + s;
  }
  function a(u) {
    const s = u.indexOf("?");
    return s < 0 ? u : u.substring(0, s);
  }
  return sr;
}
var Gl;
function Zd() {
  if (Gl) return ar;
  Gl = 1, Object.defineProperty(ar, "__esModule", { value: !0 }), ar.GenericDifferentialDownloader = void 0;
  const o = yc();
  let h = class extends o.DifferentialDownloader {
    download(f, c) {
      return this.doDownload(f, c);
    }
  };
  return ar.GenericDifferentialDownloader = h, ar;
}
var io = {}, Vl;
function Ft() {
  return Vl || (Vl = 1, function(o) {
    Object.defineProperty(o, "__esModule", { value: !0 }), o.UpdaterSignal = o.UPDATE_DOWNLOADED = o.DOWNLOAD_PROGRESS = o.CancellationToken = void 0, o.addHandler = f;
    const h = ke();
    Object.defineProperty(o, "CancellationToken", { enumerable: !0, get: function() {
      return h.CancellationToken;
    } }), o.DOWNLOAD_PROGRESS = "download-progress", o.UPDATE_DOWNLOADED = "update-downloaded";
    class d {
      constructor(t) {
        this.emitter = t;
      }
      /**
       * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
       */
      login(t) {
        f(this.emitter, "login", t);
      }
      progress(t) {
        f(this.emitter, o.DOWNLOAD_PROGRESS, t);
      }
      updateDownloaded(t) {
        f(this.emitter, o.UPDATE_DOWNLOADED, t);
      }
      updateCancelled(t) {
        f(this.emitter, "update-cancelled", t);
      }
    }
    o.UpdaterSignal = d;
    function f(c, t, e) {
      c.on(t, e);
    }
  }(io)), io;
}
var Wl;
function Xo() {
  if (Wl) return Ct;
  Wl = 1, Object.defineProperty(Ct, "__esModule", { value: !0 }), Ct.NoOpLogger = Ct.AppUpdater = void 0;
  const o = ke(), h = Bt, d = dt, f = Wr, c = /* @__PURE__ */ Et(), t = Bo(), e = gd(), n = Ce, r = pc(), i = jd(), a = Gd(), u = Vd(), s = mc(), m = Jd(), v = Bu, g = Nt(), p = Zd(), A = Ft();
  let T = class Ec extends f.EventEmitter {
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
    set channel(b) {
      if (this._channel != null) {
        if (typeof b != "string")
          throw (0, o.newError)(`Channel must be a string, but got: ${b}`, "ERR_UPDATER_INVALID_CHANNEL");
        if (b.length === 0)
          throw (0, o.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
      }
      this._channel = b, this.allowDowngrade = !0;
    }
    /**
     *  Shortcut for explicitly adding auth tokens to request headers
     */
    addAuthHeader(b) {
      this.requestHeaders = Object.assign({}, this.requestHeaders, {
        authorization: b
      });
    }
    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    get netSession() {
      return (0, u.getNetSession)();
    }
    /**
     * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
     * Set it to `null` if you would like to disable a logging feature.
     */
    get logger() {
      return this._logger;
    }
    set logger(b) {
      this._logger = b ?? new D();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * test only
     * @private
     */
    set updateConfigPath(b) {
      this.clientPromise = null, this._appUpdateConfigPath = b, this.configOnDisk = new e.Lazy(() => this.loadUpdateConfig());
    }
    /**
     * Allows developer to override default logic for determining if an update is supported.
     * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
     */
    get isUpdateSupported() {
      return this._isUpdateSupported;
    }
    set isUpdateSupported(b) {
      b && (this._isUpdateSupported = b);
    }
    constructor(b, w) {
      super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new A.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (U) => this.checkIfUpdateSupported(U), this.clientPromise = null, this.stagingUserIdPromise = new e.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new e.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (U) => {
        this._logger.error(`Error: ${U.stack || U.message}`);
      }), w == null ? (this.app = new a.ElectronAppAdapter(), this.httpExecutor = new u.ElectronHttpExecutor((U, F) => this.emit("login", U, F))) : (this.app = w, this.httpExecutor = null);
      const _ = this.app.version, E = (0, r.parse)(_);
      if (E == null)
        throw (0, o.newError)(`App version is not a valid semver version: "${_}"`, "ERR_UPDATER_INVALID_VERSION");
      this.currentVersion = E, this.allowPrerelease = O(E), b != null && (this.setFeedURL(b), typeof b != "string" && b.requestHeaders && (this.requestHeaders = b.requestHeaders));
    }
    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getFeedURL() {
      return "Deprecated. Do not use it.";
    }
    /**
     * Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(b) {
      const w = this.createProviderRuntimeOptions();
      let _;
      typeof b == "string" ? _ = new s.GenericProvider({ provider: "generic", url: b }, this, {
        ...w,
        isUseMultipleRangeRequest: (0, m.isUrlProbablySupportMultiRangeRequests)(b)
      }) : _ = (0, m.createClient)(b, this, w), this.clientPromise = Promise.resolve(_);
    }
    /**
     * Asks the server whether there is an update.
     * @returns null if the updater is disabled, otherwise info about the latest version
     */
    checkForUpdates() {
      if (!this.isUpdaterActive())
        return Promise.resolve(null);
      let b = this.checkForUpdatesPromise;
      if (b != null)
        return this._logger.info("Checking for update (already in progress)"), b;
      const w = () => this.checkForUpdatesPromise = null;
      return this._logger.info("Checking for update"), b = this.doCheckForUpdates().then((_) => (w(), _)).catch((_) => {
        throw w(), this.emit("error", _, `Cannot check for updates: ${(_.stack || _).toString()}`), _;
      }), this.checkForUpdatesPromise = b, b;
    }
    isUpdaterActive() {
      return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
    }
    // noinspection JSUnusedGlobalSymbols
    checkForUpdatesAndNotify(b) {
      return this.checkForUpdates().then((w) => w != null && w.downloadPromise ? (w.downloadPromise.then(() => {
        const _ = Ec.formatDownloadNotification(w.updateInfo.version, this.app.name, b);
        new yt.Notification(_).show();
      }), w) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), w));
    }
    static formatDownloadNotification(b, w, _) {
      return _ == null && (_ = {
        title: "A new update is ready to install",
        body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
      }), _ = {
        title: _.title.replace("{appName}", w).replace("{version}", b),
        body: _.body.replace("{appName}", w).replace("{version}", b)
      }, _;
    }
    async isStagingMatch(b) {
      const w = b.stagingPercentage;
      let _ = w;
      if (_ == null)
        return !0;
      if (_ = parseInt(_, 10), isNaN(_))
        return this._logger.warn(`Staging percentage is NaN: ${w}`), !0;
      _ = _ / 100;
      const E = await this.stagingUserIdPromise.value, F = o.UUID.parse(E).readUInt32BE(12) / 4294967295;
      return this._logger.info(`Staging percentage: ${_}, percentage: ${F}, user id: ${E}`), F < _;
    }
    computeFinalHeaders(b) {
      return this.requestHeaders != null && Object.assign(b, this.requestHeaders), b;
    }
    async isUpdateAvailable(b) {
      const w = (0, r.parse)(b.version);
      if (w == null)
        throw (0, o.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${b.version}"`, "ERR_UPDATER_INVALID_VERSION");
      const _ = this.currentVersion;
      if ((0, r.eq)(w, _) || !await Promise.resolve(this.isUpdateSupported(b)) || !await this.isStagingMatch(b))
        return !1;
      const U = (0, r.gt)(w, _), F = (0, r.lt)(w, _);
      return U ? !0 : this.allowDowngrade && F;
    }
    checkIfUpdateSupported(b) {
      const w = b == null ? void 0 : b.minimumSystemVersion, _ = (0, d.release)();
      if (w)
        try {
          if ((0, r.lt)(_, w))
            return this._logger.info(`Current OS version ${_} is less than the minimum OS version required ${w} for version ${_}`), !1;
        } catch (E) {
          this._logger.warn(`Failed to compare current OS version(${_}) with minimum OS version(${w}): ${(E.message || E).toString()}`);
        }
      return !0;
    }
    async getUpdateInfoAndProvider() {
      await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((_) => (0, m.createClient)(_, this, this.createProviderRuntimeOptions())));
      const b = await this.clientPromise, w = await this.stagingUserIdPromise.value;
      return b.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": w })), {
        info: await b.getLatestVersion(),
        provider: b
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
      const b = await this.getUpdateInfoAndProvider(), w = b.info;
      if (!await this.isUpdateAvailable(w))
        return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${w.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", w), {
          isUpdateAvailable: !1,
          versionInfo: w,
          updateInfo: w
        };
      this.updateInfoAndProvider = b, this.onUpdateAvailable(w);
      const _ = new o.CancellationToken();
      return {
        isUpdateAvailable: !0,
        versionInfo: w,
        updateInfo: w,
        cancellationToken: _,
        downloadPromise: this.autoDownload ? this.downloadUpdate(_) : null
      };
    }
    onUpdateAvailable(b) {
      this._logger.info(`Found version ${b.version} (url: ${(0, o.asArray)(b.files).map((w) => w.url).join(", ")})`), this.emit("update-available", b);
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<Array<string>>} Paths to downloaded files.
     */
    downloadUpdate(b = new o.CancellationToken()) {
      const w = this.updateInfoAndProvider;
      if (w == null) {
        const E = new Error("Please check update first");
        return this.dispatchError(E), Promise.reject(E);
      }
      if (this.downloadPromise != null)
        return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
      this._logger.info(`Downloading update from ${(0, o.asArray)(w.info.files).map((E) => E.url).join(", ")}`);
      const _ = (E) => {
        if (!(E instanceof o.CancellationError))
          try {
            this.dispatchError(E);
          } catch (U) {
            this._logger.warn(`Cannot dispatch error event: ${U.stack || U}`);
          }
        return E;
      };
      return this.downloadPromise = this.doDownloadUpdate({
        updateInfoAndProvider: w,
        requestHeaders: this.computeRequestHeaders(w.provider),
        cancellationToken: b,
        disableWebInstaller: this.disableWebInstaller,
        disableDifferentialDownload: this.disableDifferentialDownload
      }).catch((E) => {
        throw _(E);
      }).finally(() => {
        this.downloadPromise = null;
      }), this.downloadPromise;
    }
    dispatchError(b) {
      this.emit("error", b, (b.stack || b).toString());
    }
    dispatchUpdateDownloaded(b) {
      this.emit(A.UPDATE_DOWNLOADED, b);
    }
    async loadUpdateConfig() {
      return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, t.load)(await (0, c.readFile)(this._appUpdateConfigPath, "utf-8"));
    }
    computeRequestHeaders(b) {
      const w = b.fileExtraDownloadHeaders;
      if (w != null) {
        const _ = this.requestHeaders;
        return _ == null ? w : {
          ...w,
          ..._
        };
      }
      return this.computeFinalHeaders({ accept: "*/*" });
    }
    async getOrCreateStagingUserId() {
      const b = n.join(this.app.userDataPath, ".updaterId");
      try {
        const _ = await (0, c.readFile)(b, "utf-8");
        if (o.UUID.check(_))
          return _;
        this._logger.warn(`Staging user id file exists, but content was invalid: ${_}`);
      } catch (_) {
        _.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${_}`);
      }
      const w = o.UUID.v5((0, h.randomBytes)(4096), o.UUID.OID);
      this._logger.info(`Generated new staging user ID: ${w}`);
      try {
        await (0, c.outputFile)(b, w);
      } catch (_) {
        this._logger.warn(`Couldn't write out staging user ID: ${_}`);
      }
      return w;
    }
    /** @internal */
    get isAddNoCacheQuery() {
      const b = this.requestHeaders;
      if (b == null)
        return !0;
      for (const w of Object.keys(b)) {
        const _ = w.toLowerCase();
        if (_ === "authorization" || _ === "private-token")
          return !1;
      }
      return !0;
    }
    async getOrCreateDownloadHelper() {
      let b = this.downloadedUpdateHelper;
      if (b == null) {
        const w = (await this.configOnDisk.value).updaterCacheDirName, _ = this._logger;
        w == null && _.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
        const E = n.join(this.app.baseCachePath, w || this.app.name);
        _.debug != null && _.debug(`updater cache dir: ${E}`), b = new i.DownloadedUpdateHelper(E), this.downloadedUpdateHelper = b;
      }
      return b;
    }
    async executeDownload(b) {
      const w = b.fileInfo, _ = {
        headers: b.downloadUpdateOptions.requestHeaders,
        cancellationToken: b.downloadUpdateOptions.cancellationToken,
        sha2: w.info.sha2,
        sha512: w.info.sha512
      };
      this.listenerCount(A.DOWNLOAD_PROGRESS) > 0 && (_.onProgress = (ie) => this.emit(A.DOWNLOAD_PROGRESS, ie));
      const E = b.downloadUpdateOptions.updateInfoAndProvider.info, U = E.version, F = w.packageInfo;
      function x() {
        const ie = decodeURIComponent(b.fileInfo.url.pathname);
        return ie.endsWith(`.${b.fileExtension}`) ? n.basename(ie) : b.fileInfo.info.url;
      }
      const q = await this.getOrCreateDownloadHelper(), N = q.cacheDirForPendingUpdate;
      await (0, c.mkdir)(N, { recursive: !0 });
      const I = x();
      let $ = n.join(N, I);
      const M = F == null ? null : n.join(N, `package-${U}${n.extname(F.path) || ".7z"}`), K = async (ie) => (await q.setDownloadedFile($, M, E, w, I, ie), await b.done({
        ...E,
        downloadedFile: $
      }), M == null ? [$] : [$, M]), V = this._logger, ne = await q.validateDownloadedPath($, E, w, V);
      if (ne != null)
        return $ = ne, await K(!1);
      const ce = async () => (await q.clear().catch(() => {
      }), await (0, c.unlink)($).catch(() => {
      })), ue = await (0, i.createTempUpdateFile)(`temp-${I}`, N, V);
      try {
        await b.task(ue, _, M, ce), await (0, o.retry)(() => (0, c.rename)(ue, $), 60, 500, 0, 0, (ie) => ie instanceof Error && /^EBUSY:/.test(ie.message));
      } catch (ie) {
        throw await ce(), ie instanceof o.CancellationError && (V.info("cancelled"), this.emit("update-cancelled", E)), ie;
      }
      return V.info(`New version ${U} has been downloaded to ${$}`), await K(!0);
    }
    async differentialDownloadInstaller(b, w, _, E, U) {
      try {
        if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
          return !0;
        const F = (0, g.blockmapFiles)(b.url, this.app.version, w.updateInfoAndProvider.info.version);
        this._logger.info(`Download block maps (old: "${F[0]}", new: ${F[1]})`);
        const x = async (I) => {
          const $ = await this.httpExecutor.downloadToBuffer(I, {
            headers: w.requestHeaders,
            cancellationToken: w.cancellationToken
          });
          if ($ == null || $.length === 0)
            throw new Error(`Blockmap "${I.href}" is empty`);
          try {
            return JSON.parse((0, v.gunzipSync)($).toString());
          } catch (M) {
            throw new Error(`Cannot parse blockmap "${I.href}", error: ${M}`);
          }
        }, q = {
          newUrl: b.url,
          oldFile: n.join(this.downloadedUpdateHelper.cacheDir, U),
          logger: this._logger,
          newFile: _,
          isUseMultipleRangeRequest: E.isUseMultipleRangeRequest,
          requestHeaders: w.requestHeaders,
          cancellationToken: w.cancellationToken
        };
        this.listenerCount(A.DOWNLOAD_PROGRESS) > 0 && (q.onProgress = (I) => this.emit(A.DOWNLOAD_PROGRESS, I));
        const N = await Promise.all(F.map((I) => x(I)));
        return await new p.GenericDifferentialDownloader(b.info, this.httpExecutor, q).download(N[0], N[1]), !1;
      } catch (F) {
        if (this._logger.error(`Cannot download differentially, fallback to full download: ${F.stack || F}`), this._testOnlyOptions != null)
          throw F;
        return !0;
      }
    }
  };
  Ct.AppUpdater = T;
  function O(P) {
    const b = (0, r.prerelease)(P);
    return b != null && b.length > 0;
  }
  class D {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info(b) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    warn(b) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error(b) {
    }
  }
  return Ct.NoOpLogger = D, Ct;
}
var zl;
function Wt() {
  if (zl) return Xt;
  zl = 1, Object.defineProperty(Xt, "__esModule", { value: !0 }), Xt.BaseUpdater = void 0;
  const o = Sr, h = Xo();
  let d = class extends h.AppUpdater {
    constructor(c, t) {
      super(c, t), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
    }
    quitAndInstall(c = !1, t = !1) {
      this._logger.info("Install on explicit quitAndInstall"), this.install(c, c ? t : this.autoRunAppAfterInstall) ? setImmediate(() => {
        yt.autoUpdater.emit("before-quit-for-update"), this.app.quit();
      }) : this.quitAndInstallCalled = !1;
    }
    executeDownload(c) {
      return super.executeDownload({
        ...c,
        done: (t) => (this.dispatchUpdateDownloaded(t), this.addQuitHandler(), Promise.resolve())
      });
    }
    get installerPath() {
      return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
    }
    // must be sync (because quit even handler is not async)
    install(c = !1, t = !1) {
      if (this.quitAndInstallCalled)
        return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
      const e = this.downloadedUpdateHelper, n = this.installerPath, r = e == null ? null : e.downloadedFileInfo;
      if (n == null || r == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      this.quitAndInstallCalled = !0;
      try {
        return this._logger.info(`Install: isSilent: ${c}, isForceRunAfter: ${t}`), this.doInstall({
          isSilent: c,
          isForceRunAfter: t,
          isAdminRightsRequired: r.isAdminRightsRequired
        });
      } catch (i) {
        return this.dispatchError(i), !1;
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
      const { name: c } = this.app, t = `"${c} would like to update"`, e = this.spawnSyncLog("which gksudo || which kdesudo || which pkexec || which beesu"), n = [e];
      return /kdesudo/i.test(e) ? (n.push("--comment", t), n.push("-c")) : /gksudo/i.test(e) ? n.push("--message", t) : /pkexec/i.test(e) && n.push("--disable-internal-agent"), n.join(" ");
    }
    spawnSyncLog(c, t = [], e = {}) {
      this._logger.info(`Executing: ${c} with args: ${t}`);
      const n = (0, o.spawnSync)(c, t, {
        env: { ...process.env, ...e },
        encoding: "utf-8",
        shell: !0
      }), { error: r, status: i, stdout: a, stderr: u } = n;
      if (r != null)
        throw this._logger.error(u), r;
      if (i != null && i !== 0)
        throw this._logger.error(u), new Error(`Command ${c} exited with code ${i}`);
      return a.trim();
    }
    /**
     * This handles both node 8 and node 10 way of emitting error when spawning a process
     *   - node 8: Throws the error
     *   - node 10: Emit the error(Need to listen with on)
     */
    // https://github.com/electron-userland/electron-builder/issues/1129
    // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
    async spawnLog(c, t = [], e = void 0, n = "ignore") {
      return this._logger.info(`Executing: ${c} with args: ${t}`), new Promise((r, i) => {
        try {
          const a = { stdio: n, env: e, detached: !0 }, u = (0, o.spawn)(c, t, a);
          u.on("error", (s) => {
            i(s);
          }), u.unref(), u.pid !== void 0 && r(!0);
        } catch (a) {
          i(a);
        }
      });
    }
  };
  return Xt.BaseUpdater = d, Xt;
}
var cr = {}, fr = {}, Yl;
function wc() {
  if (Yl) return fr;
  Yl = 1, Object.defineProperty(fr, "__esModule", { value: !0 }), fr.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
  const o = /* @__PURE__ */ Et(), h = yc(), d = Bu;
  let f = class extends h.DifferentialDownloader {
    async download() {
      const n = this.blockAwareFileInfo, r = n.size, i = r - (n.blockMapSize + 4);
      this.fileMetadataBuffer = await this.readRemoteBytes(i, r - 1);
      const a = c(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
      await this.doDownload(await t(this.options.oldFile), a);
    }
  };
  fr.FileWithEmbeddedBlockMapDifferentialDownloader = f;
  function c(e) {
    return JSON.parse((0, d.inflateRawSync)(e).toString());
  }
  async function t(e) {
    const n = await (0, o.open)(e, "r");
    try {
      const r = (await (0, o.fstat)(n)).size, i = Buffer.allocUnsafe(4);
      await (0, o.read)(n, i, 0, i.length, r - i.length);
      const a = Buffer.allocUnsafe(i.readUInt32BE(0));
      return await (0, o.read)(n, a, 0, a.length, r - i.length - a.length), await (0, o.close)(n), c(a);
    } catch (r) {
      throw await (0, o.close)(n), r;
    }
  }
  return fr;
}
var Xl;
function Jl() {
  if (Xl) return cr;
  Xl = 1, Object.defineProperty(cr, "__esModule", { value: !0 }), cr.AppImageUpdater = void 0;
  const o = ke(), h = Sr, d = /* @__PURE__ */ Et(), f = Ve, c = Ce, t = Wt(), e = wc(), n = Qe(), r = Ft();
  let i = class extends t.BaseUpdater {
    constructor(u, s) {
      super(u, s);
    }
    isUpdaterActive() {
      return process.env.APPIMAGE == null ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
    }
    /*** @private */
    doDownloadUpdate(u) {
      const s = u.updateInfoAndProvider.provider, m = (0, n.findFile)(s.resolveFiles(u.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "AppImage",
        fileInfo: m,
        downloadUpdateOptions: u,
        task: async (v, g) => {
          const p = process.env.APPIMAGE;
          if (p == null)
            throw (0, o.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
          (u.disableDifferentialDownload || await this.downloadDifferential(m, p, v, s, u)) && await this.httpExecutor.download(m.url, v, g), await (0, d.chmod)(v, 493);
        }
      });
    }
    async downloadDifferential(u, s, m, v, g) {
      try {
        const p = {
          newUrl: u.url,
          oldFile: s,
          logger: this._logger,
          newFile: m,
          isUseMultipleRangeRequest: v.isUseMultipleRangeRequest,
          requestHeaders: g.requestHeaders,
          cancellationToken: g.cancellationToken
        };
        return this.listenerCount(r.DOWNLOAD_PROGRESS) > 0 && (p.onProgress = (A) => this.emit(r.DOWNLOAD_PROGRESS, A)), await new e.FileWithEmbeddedBlockMapDifferentialDownloader(u.info, this.httpExecutor, p).download(), !1;
      } catch (p) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${p.stack || p}`), process.platform === "linux";
      }
    }
    doInstall(u) {
      const s = process.env.APPIMAGE;
      if (s == null)
        throw (0, o.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      (0, f.unlinkSync)(s);
      let m;
      const v = c.basename(s), g = this.installerPath;
      if (g == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      c.basename(g) === v || !/\d+\.\d+\.\d+/.test(v) ? m = s : m = c.join(c.dirname(s), c.basename(g)), (0, h.execFileSync)("mv", ["-f", g, m]), m !== s && this.emit("appimage-filename-updated", m);
      const p = {
        ...process.env,
        APPIMAGE_SILENT_INSTALL: "true"
      };
      return u.isForceRunAfter ? this.spawnLog(m, [], p) : (p.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, h.execFileSync)(m, [], { env: p })), !0;
    }
  };
  return cr.AppImageUpdater = i, cr;
}
var dr = {}, Kl;
function Ql() {
  if (Kl) return dr;
  Kl = 1, Object.defineProperty(dr, "__esModule", { value: !0 }), dr.DebUpdater = void 0;
  const o = Wt(), h = Qe(), d = Ft();
  let f = class extends o.BaseUpdater {
    constructor(t, e) {
      super(t, e);
    }
    /*** @private */
    doDownloadUpdate(t) {
      const e = t.updateInfoAndProvider.provider, n = (0, h.findFile)(e.resolveFiles(t.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
      return this.executeDownload({
        fileExtension: "deb",
        fileInfo: n,
        downloadUpdateOptions: t,
        task: async (r, i) => {
          this.listenerCount(d.DOWNLOAD_PROGRESS) > 0 && (i.onProgress = (a) => this.emit(d.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, r, i);
        }
      });
    }
    get installerPath() {
      var t, e;
      return (e = (t = super.installerPath) === null || t === void 0 ? void 0 : t.replace(/ /g, "\\ ")) !== null && e !== void 0 ? e : null;
    }
    doInstall(t) {
      const e = this.wrapSudo(), n = /pkexec/i.test(e) ? "" : '"', r = this.installerPath;
      if (r == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const i = ["dpkg", "-i", r, "||", "apt-get", "install", "-f", "-y"];
      return this.spawnSyncLog(e, [`${n}/bin/bash`, "-c", `'${i.join(" ")}'${n}`]), t.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return dr.DebUpdater = f, dr;
}
var hr = {}, Zl;
function eu() {
  if (Zl) return hr;
  Zl = 1, Object.defineProperty(hr, "__esModule", { value: !0 }), hr.PacmanUpdater = void 0;
  const o = Wt(), h = Ft(), d = Qe();
  let f = class extends o.BaseUpdater {
    constructor(t, e) {
      super(t, e);
    }
    /*** @private */
    doDownloadUpdate(t) {
      const e = t.updateInfoAndProvider.provider, n = (0, d.findFile)(e.resolveFiles(t.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
      return this.executeDownload({
        fileExtension: "pacman",
        fileInfo: n,
        downloadUpdateOptions: t,
        task: async (r, i) => {
          this.listenerCount(h.DOWNLOAD_PROGRESS) > 0 && (i.onProgress = (a) => this.emit(h.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, r, i);
        }
      });
    }
    get installerPath() {
      var t, e;
      return (e = (t = super.installerPath) === null || t === void 0 ? void 0 : t.replace(/ /g, "\\ ")) !== null && e !== void 0 ? e : null;
    }
    doInstall(t) {
      const e = this.wrapSudo(), n = /pkexec/i.test(e) ? "" : '"', r = this.installerPath;
      if (r == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const i = ["pacman", "-U", "--noconfirm", r];
      return this.spawnSyncLog(e, [`${n}/bin/bash`, "-c", `'${i.join(" ")}'${n}`]), t.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return hr.PacmanUpdater = f, hr;
}
var pr = {}, tu;
function ru() {
  if (tu) return pr;
  tu = 1, Object.defineProperty(pr, "__esModule", { value: !0 }), pr.RpmUpdater = void 0;
  const o = Wt(), h = Ft(), d = Qe();
  let f = class extends o.BaseUpdater {
    constructor(t, e) {
      super(t, e);
    }
    /*** @private */
    doDownloadUpdate(t) {
      const e = t.updateInfoAndProvider.provider, n = (0, d.findFile)(e.resolveFiles(t.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "rpm",
        fileInfo: n,
        downloadUpdateOptions: t,
        task: async (r, i) => {
          this.listenerCount(h.DOWNLOAD_PROGRESS) > 0 && (i.onProgress = (a) => this.emit(h.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, r, i);
        }
      });
    }
    get installerPath() {
      var t, e;
      return (e = (t = super.installerPath) === null || t === void 0 ? void 0 : t.replace(/ /g, "\\ ")) !== null && e !== void 0 ? e : null;
    }
    doInstall(t) {
      const e = this.wrapSudo(), n = /pkexec/i.test(e) ? "" : '"', r = this.spawnSyncLog("which zypper"), i = this.installerPath;
      if (i == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      let a;
      return r ? a = [r, "--no-refresh", "install", "--allow-unsigned-rpm", "-y", "-f", i] : a = [this.spawnSyncLog("which dnf || which yum"), "-y", "install", i], this.spawnSyncLog(e, [`${n}/bin/bash`, "-c", `'${a.join(" ")}'${n}`]), t.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return pr.RpmUpdater = f, pr;
}
var mr = {}, nu;
function iu() {
  if (nu) return mr;
  nu = 1, Object.defineProperty(mr, "__esModule", { value: !0 }), mr.MacUpdater = void 0;
  const o = ke(), h = /* @__PURE__ */ Et(), d = Ve, f = Ce, c = ju, t = Xo(), e = Qe(), n = Sr, r = Bt;
  let i = class extends t.AppUpdater {
    constructor(u, s) {
      super(u, s), this.nativeUpdater = yt.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (m) => {
        this._logger.warn(m), this.emit("error", m);
      }), this.nativeUpdater.on("update-downloaded", () => {
        this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
      });
    }
    debug(u) {
      this._logger.debug != null && this._logger.debug(u);
    }
    closeServerIfExists() {
      this.server && (this.debug("Closing proxy server"), this.server.close((u) => {
        u && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
      }));
    }
    async doDownloadUpdate(u) {
      let s = u.updateInfoAndProvider.provider.resolveFiles(u.updateInfoAndProvider.info);
      const m = this._logger, v = "sysctl.proc_translated";
      let g = !1;
      try {
        this.debug("Checking for macOS Rosetta environment"), g = (0, n.execFileSync)("sysctl", [v], { encoding: "utf8" }).includes(`${v}: 1`), m.info(`Checked for macOS Rosetta environment (isRosetta=${g})`);
      } catch (P) {
        m.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${P}`);
      }
      let p = !1;
      try {
        this.debug("Checking for arm64 in uname");
        const b = (0, n.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
        m.info(`Checked 'uname -a': arm64=${b}`), p = p || b;
      } catch (P) {
        m.warn(`uname shell command to check for arm64 failed: ${P}`);
      }
      p = p || process.arch === "arm64" || g;
      const A = (P) => {
        var b;
        return P.url.pathname.includes("arm64") || ((b = P.info.url) === null || b === void 0 ? void 0 : b.includes("arm64"));
      };
      p && s.some(A) ? s = s.filter((P) => p === A(P)) : s = s.filter((P) => !A(P));
      const T = (0, e.findFile)(s, "zip", ["pkg", "dmg"]);
      if (T == null)
        throw (0, o.newError)(`ZIP file not provided: ${(0, o.safeStringifyJson)(s)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
      const O = u.updateInfoAndProvider.provider, D = "update.zip";
      return this.executeDownload({
        fileExtension: "zip",
        fileInfo: T,
        downloadUpdateOptions: u,
        task: async (P, b) => {
          const w = f.join(this.downloadedUpdateHelper.cacheDir, D), _ = () => (0, h.pathExistsSync)(w) ? !u.disableDifferentialDownload : (m.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
          let E = !0;
          _() && (E = await this.differentialDownloadInstaller(T, u, P, O, D)), E && await this.httpExecutor.download(T.url, P, b);
        },
        done: async (P) => {
          if (!u.disableDifferentialDownload)
            try {
              const b = f.join(this.downloadedUpdateHelper.cacheDir, D);
              await (0, h.copyFile)(P.downloadedFile, b);
            } catch (b) {
              this._logger.warn(`Unable to copy file for caching for future differential downloads: ${b.message}`);
            }
          return this.updateDownloaded(T, P);
        }
      });
    }
    async updateDownloaded(u, s) {
      var m;
      const v = s.downloadedFile, g = (m = u.info.size) !== null && m !== void 0 ? m : (await (0, h.stat)(v)).size, p = this._logger, A = `fileToProxy=${u.url.href}`;
      this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${A})`), this.server = (0, c.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${A})`), this.server.on("close", () => {
        p.info(`Proxy server for native Squirrel.Mac is closed (${A})`);
      });
      const T = (O) => {
        const D = O.address();
        return typeof D == "string" ? D : `http://127.0.0.1:${D == null ? void 0 : D.port}`;
      };
      return await new Promise((O, D) => {
        const P = (0, r.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), b = Buffer.from(`autoupdater:${P}`, "ascii"), w = `/${(0, r.randomBytes)(64).toString("hex")}.zip`;
        this.server.on("request", (_, E) => {
          const U = _.url;
          if (p.info(`${U} requested`), U === "/") {
            if (!_.headers.authorization || _.headers.authorization.indexOf("Basic ") === -1) {
              E.statusCode = 401, E.statusMessage = "Invalid Authentication Credentials", E.end(), p.warn("No authenthication info");
              return;
            }
            const q = _.headers.authorization.split(" ")[1], N = Buffer.from(q, "base64").toString("ascii"), [I, $] = N.split(":");
            if (I !== "autoupdater" || $ !== P) {
              E.statusCode = 401, E.statusMessage = "Invalid Authentication Credentials", E.end(), p.warn("Invalid authenthication credentials");
              return;
            }
            const M = Buffer.from(`{ "url": "${T(this.server)}${w}" }`);
            E.writeHead(200, { "Content-Type": "application/json", "Content-Length": M.length }), E.end(M);
            return;
          }
          if (!U.startsWith(w)) {
            p.warn(`${U} requested, but not supported`), E.writeHead(404), E.end();
            return;
          }
          p.info(`${w} requested by Squirrel.Mac, pipe ${v}`);
          let F = !1;
          E.on("finish", () => {
            F || (this.nativeUpdater.removeListener("error", D), O([]));
          });
          const x = (0, d.createReadStream)(v);
          x.on("error", (q) => {
            try {
              E.end();
            } catch (N) {
              p.warn(`cannot end response: ${N}`);
            }
            F = !0, this.nativeUpdater.removeListener("error", D), D(new Error(`Cannot pipe "${v}": ${q}`));
          }), E.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-Length": g
          }), x.pipe(E);
        }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${A})`), this.server.listen(0, "127.0.0.1", () => {
          this.debug(`Proxy server for native Squirrel.Mac is listening (address=${T(this.server)}, ${A})`), this.nativeUpdater.setFeedURL({
            url: T(this.server),
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Basic ${b.toString("base64")}`
            }
          }), this.dispatchUpdateDownloaded(s), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", D), this.nativeUpdater.checkForUpdates()) : O([]);
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
  return mr.MacUpdater = i, mr;
}
var gr = {}, Gr = {}, ou;
function eh() {
  if (ou) return Gr;
  ou = 1, Object.defineProperty(Gr, "__esModule", { value: !0 }), Gr.verifySignature = c;
  const o = ke(), h = Sr, d = dt, f = Ce;
  function c(r, i, a) {
    return new Promise((u, s) => {
      const m = i.replace(/'/g, "''");
      a.info(`Verifying signature ${m}`), (0, h.execFile)('set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", `"Get-AuthenticodeSignature -LiteralPath '${m}' | ConvertTo-Json -Compress"`], {
        shell: !0,
        timeout: 20 * 1e3
      }, (v, g, p) => {
        var A;
        try {
          if (v != null || p) {
            e(a, v, p, s), u(null);
            return;
          }
          const T = t(g);
          if (T.Status === 0) {
            try {
              const b = f.normalize(T.Path), w = f.normalize(i);
              if (a.info(`LiteralPath: ${b}. Update Path: ${w}`), b !== w) {
                e(a, new Error(`LiteralPath of ${b} is different than ${w}`), p, s), u(null);
                return;
              }
            } catch (b) {
              a.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(A = b.message) !== null && A !== void 0 ? A : b.stack}`);
            }
            const D = (0, o.parseDn)(T.SignerCertificate.Subject);
            let P = !1;
            for (const b of r) {
              const w = (0, o.parseDn)(b);
              if (w.size ? P = Array.from(w.keys()).every((E) => w.get(E) === D.get(E)) : b === D.get("CN") && (a.warn(`Signature validated using only CN ${b}. Please add your full Distinguished Name (DN) to publisherNames configuration`), P = !0), P) {
                u(null);
                return;
              }
            }
          }
          const O = `publisherNames: ${r.join(" | ")}, raw info: ` + JSON.stringify(T, (D, P) => D === "RawData" ? void 0 : P, 2);
          a.warn(`Sign verification failed, installer signed with incorrect certificate: ${O}`), u(O);
        } catch (T) {
          e(a, T, null, s), u(null);
          return;
        }
      });
    });
  }
  function t(r) {
    const i = JSON.parse(r);
    delete i.PrivateKey, delete i.IsOSBinary, delete i.SignatureType;
    const a = i.SignerCertificate;
    return a != null && (delete a.Archived, delete a.Extensions, delete a.Handle, delete a.HasPrivateKey, delete a.SubjectName), i;
  }
  function e(r, i, a, u) {
    if (n()) {
      r.warn(`Cannot execute Get-AuthenticodeSignature: ${i || a}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    try {
      (0, h.execFileSync)("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "ConvertTo-Json test"], { timeout: 10 * 1e3 });
    } catch (s) {
      r.warn(`Cannot execute ConvertTo-Json: ${s.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    i != null && u(i), a && u(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${a}. Failing signature validation due to unknown stderr.`));
  }
  function n() {
    const r = d.release();
    return r.startsWith("6.") && !r.startsWith("6.3");
  }
  return Gr;
}
var au;
function su() {
  if (au) return gr;
  au = 1, Object.defineProperty(gr, "__esModule", { value: !0 }), gr.NsisUpdater = void 0;
  const o = ke(), h = Ce, d = Wt(), f = wc(), c = Ft(), t = Qe(), e = /* @__PURE__ */ Et(), n = eh(), r = jt;
  let i = class extends d.BaseUpdater {
    constructor(u, s) {
      super(u, s), this._verifyUpdateCodeSignature = (m, v) => (0, n.verifySignature)(m, v, this._logger);
    }
    /**
     * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
     * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
     */
    get verifyUpdateCodeSignature() {
      return this._verifyUpdateCodeSignature;
    }
    set verifyUpdateCodeSignature(u) {
      u && (this._verifyUpdateCodeSignature = u);
    }
    /*** @private */
    doDownloadUpdate(u) {
      const s = u.updateInfoAndProvider.provider, m = (0, t.findFile)(s.resolveFiles(u.updateInfoAndProvider.info), "exe");
      return this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions: u,
        fileInfo: m,
        task: async (v, g, p, A) => {
          const T = m.packageInfo, O = T != null && p != null;
          if (O && u.disableWebInstaller)
            throw (0, o.newError)(`Unable to download new version ${u.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
          !O && !u.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (O || u.disableDifferentialDownload || await this.differentialDownloadInstaller(m, u, v, s, o.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(m.url, v, g);
          const D = await this.verifySignature(v);
          if (D != null)
            throw await A(), (0, o.newError)(`New version ${u.updateInfoAndProvider.info.version} is not signed by the application owner: ${D}`, "ERR_UPDATER_INVALID_SIGNATURE");
          if (O && await this.differentialDownloadWebPackage(u, T, p, s))
            try {
              await this.httpExecutor.download(new r.URL(T.path), p, {
                headers: u.requestHeaders,
                cancellationToken: u.cancellationToken,
                sha512: T.sha512
              });
            } catch (P) {
              try {
                await (0, e.unlink)(p);
              } catch {
              }
              throw P;
            }
        }
      });
    }
    // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
    // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
    // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
    async verifySignature(u) {
      let s;
      try {
        if (s = (await this.configOnDisk.value).publisherName, s == null)
          return null;
      } catch (m) {
        if (m.code === "ENOENT")
          return null;
        throw m;
      }
      return await this._verifyUpdateCodeSignature(Array.isArray(s) ? s : [s], u);
    }
    doInstall(u) {
      const s = this.installerPath;
      if (s == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const m = ["--updated"];
      u.isSilent && m.push("/S"), u.isForceRunAfter && m.push("--force-run"), this.installDirectory && m.push(`/D=${this.installDirectory}`);
      const v = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
      v != null && m.push(`--package-file=${v}`);
      const g = () => {
        this.spawnLog(h.join(process.resourcesPath, "elevate.exe"), [s].concat(m)).catch((p) => this.dispatchError(p));
      };
      return u.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), g(), !0) : (this.spawnLog(s, m).catch((p) => {
        const A = p.code;
        this._logger.info(`Cannot run installer: error code: ${A}, error message: "${p.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), A === "UNKNOWN" || A === "EACCES" ? g() : A === "ENOENT" ? yt.shell.openPath(s).catch((T) => this.dispatchError(T)) : this.dispatchError(p);
      }), !0);
    }
    async differentialDownloadWebPackage(u, s, m, v) {
      if (s.blockMapSize == null)
        return !0;
      try {
        const g = {
          newUrl: new r.URL(s.path),
          oldFile: h.join(this.downloadedUpdateHelper.cacheDir, o.CURRENT_APP_PACKAGE_FILE_NAME),
          logger: this._logger,
          newFile: m,
          requestHeaders: this.requestHeaders,
          isUseMultipleRangeRequest: v.isUseMultipleRangeRequest,
          cancellationToken: u.cancellationToken
        };
        this.listenerCount(c.DOWNLOAD_PROGRESS) > 0 && (g.onProgress = (p) => this.emit(c.DOWNLOAD_PROGRESS, p)), await new f.FileWithEmbeddedBlockMapDifferentialDownloader(s, this.httpExecutor, g).download();
      } catch (g) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${g.stack || g}`), process.platform === "win32";
      }
      return !1;
    }
  };
  return gr.NsisUpdater = i, gr;
}
var lu;
function th() {
  return lu || (lu = 1, function(o) {
    var h = Tt && Tt.__createBinding || (Object.create ? function(p, A, T, O) {
      O === void 0 && (O = T);
      var D = Object.getOwnPropertyDescriptor(A, T);
      (!D || ("get" in D ? !A.__esModule : D.writable || D.configurable)) && (D = { enumerable: !0, get: function() {
        return A[T];
      } }), Object.defineProperty(p, O, D);
    } : function(p, A, T, O) {
      O === void 0 && (O = T), p[O] = A[T];
    }), d = Tt && Tt.__exportStar || function(p, A) {
      for (var T in p) T !== "default" && !Object.prototype.hasOwnProperty.call(A, T) && h(A, p, T);
    };
    Object.defineProperty(o, "__esModule", { value: !0 }), o.NsisUpdater = o.MacUpdater = o.RpmUpdater = o.PacmanUpdater = o.DebUpdater = o.AppImageUpdater = o.Provider = o.NoOpLogger = o.AppUpdater = o.BaseUpdater = void 0;
    const f = /* @__PURE__ */ Et(), c = Ce;
    var t = Wt();
    Object.defineProperty(o, "BaseUpdater", { enumerable: !0, get: function() {
      return t.BaseUpdater;
    } });
    var e = Xo();
    Object.defineProperty(o, "AppUpdater", { enumerable: !0, get: function() {
      return e.AppUpdater;
    } }), Object.defineProperty(o, "NoOpLogger", { enumerable: !0, get: function() {
      return e.NoOpLogger;
    } });
    var n = Qe();
    Object.defineProperty(o, "Provider", { enumerable: !0, get: function() {
      return n.Provider;
    } });
    var r = Jl();
    Object.defineProperty(o, "AppImageUpdater", { enumerable: !0, get: function() {
      return r.AppImageUpdater;
    } });
    var i = Ql();
    Object.defineProperty(o, "DebUpdater", { enumerable: !0, get: function() {
      return i.DebUpdater;
    } });
    var a = eu();
    Object.defineProperty(o, "PacmanUpdater", { enumerable: !0, get: function() {
      return a.PacmanUpdater;
    } });
    var u = ru();
    Object.defineProperty(o, "RpmUpdater", { enumerable: !0, get: function() {
      return u.RpmUpdater;
    } });
    var s = iu();
    Object.defineProperty(o, "MacUpdater", { enumerable: !0, get: function() {
      return s.MacUpdater;
    } });
    var m = su();
    Object.defineProperty(o, "NsisUpdater", { enumerable: !0, get: function() {
      return m.NsisUpdater;
    } }), d(Ft(), o);
    let v;
    function g() {
      if (process.platform === "win32")
        v = new (su()).NsisUpdater();
      else if (process.platform === "darwin")
        v = new (iu()).MacUpdater();
      else {
        v = new (Jl()).AppImageUpdater();
        try {
          const p = c.join(process.resourcesPath, "package-type");
          if (!(0, f.existsSync)(p))
            return v;
          console.info("Checking for beta autoupdate feature for deb/rpm distributions");
          const A = (0, f.readFileSync)(p).toString().trim();
          switch (console.info("Found package-type:", A), A) {
            case "deb":
              v = new (Ql()).DebUpdater();
              break;
            case "rpm":
              v = new (ru()).RpmUpdater();
              break;
            case "pacman":
              v = new (eu()).PacmanUpdater();
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
    Object.defineProperty(o, "autoUpdater", {
      enumerable: !0,
      get: () => v || g()
    });
  }(Tt)), Tt;
}
var tt = th(), ot = { exports: {} };
const rh = "16.5.0", nh = {
  version: rh
};
var uu;
function ih() {
  if (uu) return ot.exports;
  uu = 1;
  const o = Ve, h = Ce, d = dt, f = Bt, t = nh.version, e = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
  function n(P) {
    const b = {};
    let w = P.toString();
    w = w.replace(/\r\n?/mg, `
`);
    let _;
    for (; (_ = e.exec(w)) != null; ) {
      const E = _[1];
      let U = _[2] || "";
      U = U.trim();
      const F = U[0];
      U = U.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), F === '"' && (U = U.replace(/\\n/g, `
`), U = U.replace(/\\r/g, "\r")), b[E] = U;
    }
    return b;
  }
  function r(P) {
    const b = m(P), w = D.configDotenv({ path: b });
    if (!w.parsed) {
      const F = new Error(`MISSING_DATA: Cannot parse ${b} for an unknown reason`);
      throw F.code = "MISSING_DATA", F;
    }
    const _ = u(P).split(","), E = _.length;
    let U;
    for (let F = 0; F < E; F++)
      try {
        const x = _[F].trim(), q = s(w, x);
        U = D.decrypt(q.ciphertext, q.key);
        break;
      } catch (x) {
        if (F + 1 >= E)
          throw x;
      }
    return D.parse(U);
  }
  function i(P) {
    console.log(`[dotenv@${t}][WARN] ${P}`);
  }
  function a(P) {
    console.log(`[dotenv@${t}][DEBUG] ${P}`);
  }
  function u(P) {
    return P && P.DOTENV_KEY && P.DOTENV_KEY.length > 0 ? P.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
  }
  function s(P, b) {
    let w;
    try {
      w = new URL(b);
    } catch (x) {
      if (x.code === "ERR_INVALID_URL") {
        const q = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
        throw q.code = "INVALID_DOTENV_KEY", q;
      }
      throw x;
    }
    const _ = w.password;
    if (!_) {
      const x = new Error("INVALID_DOTENV_KEY: Missing key part");
      throw x.code = "INVALID_DOTENV_KEY", x;
    }
    const E = w.searchParams.get("environment");
    if (!E) {
      const x = new Error("INVALID_DOTENV_KEY: Missing environment part");
      throw x.code = "INVALID_DOTENV_KEY", x;
    }
    const U = `DOTENV_VAULT_${E.toUpperCase()}`, F = P.parsed[U];
    if (!F) {
      const x = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${U} in your .env.vault file.`);
      throw x.code = "NOT_FOUND_DOTENV_ENVIRONMENT", x;
    }
    return { ciphertext: F, key: _ };
  }
  function m(P) {
    let b = null;
    if (P && P.path && P.path.length > 0)
      if (Array.isArray(P.path))
        for (const w of P.path)
          o.existsSync(w) && (b = w.endsWith(".vault") ? w : `${w}.vault`);
      else
        b = P.path.endsWith(".vault") ? P.path : `${P.path}.vault`;
    else
      b = h.resolve(process.cwd(), ".env.vault");
    return o.existsSync(b) ? b : null;
  }
  function v(P) {
    return P[0] === "~" ? h.join(d.homedir(), P.slice(1)) : P;
  }
  function g(P) {
    !!(P && P.debug) && a("Loading env from encrypted .env.vault");
    const w = D._parseVault(P);
    let _ = process.env;
    return P && P.processEnv != null && (_ = P.processEnv), D.populate(_, w, P), { parsed: w };
  }
  function p(P) {
    const b = h.resolve(process.cwd(), ".env");
    let w = "utf8";
    const _ = !!(P && P.debug);
    P && P.encoding ? w = P.encoding : _ && a("No encoding is specified. UTF-8 is used by default");
    let E = [b];
    if (P && P.path)
      if (!Array.isArray(P.path))
        E = [v(P.path)];
      else {
        E = [];
        for (const q of P.path)
          E.push(v(q));
      }
    let U;
    const F = {};
    for (const q of E)
      try {
        const N = D.parse(o.readFileSync(q, { encoding: w }));
        D.populate(F, N, P);
      } catch (N) {
        _ && a(`Failed to load ${q} ${N.message}`), U = N;
      }
    let x = process.env;
    return P && P.processEnv != null && (x = P.processEnv), D.populate(x, F, P), U ? { parsed: F, error: U } : { parsed: F };
  }
  function A(P) {
    if (u(P).length === 0)
      return D.configDotenv(P);
    const b = m(P);
    return b ? D._configVault(P) : (i(`You set DOTENV_KEY but you are missing a .env.vault file at ${b}. Did you forget to build it?`), D.configDotenv(P));
  }
  function T(P, b) {
    const w = Buffer.from(b.slice(-64), "hex");
    let _ = Buffer.from(P, "base64");
    const E = _.subarray(0, 12), U = _.subarray(-16);
    _ = _.subarray(12, -16);
    try {
      const F = f.createDecipheriv("aes-256-gcm", w, E);
      return F.setAuthTag(U), `${F.update(_)}${F.final()}`;
    } catch (F) {
      const x = F instanceof RangeError, q = F.message === "Invalid key length", N = F.message === "Unsupported state or unable to authenticate data";
      if (x || q) {
        const I = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
        throw I.code = "INVALID_DOTENV_KEY", I;
      } else if (N) {
        const I = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
        throw I.code = "DECRYPTION_FAILED", I;
      } else
        throw F;
    }
  }
  function O(P, b, w = {}) {
    const _ = !!(w && w.debug), E = !!(w && w.override);
    if (typeof b != "object") {
      const U = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
      throw U.code = "OBJECT_REQUIRED", U;
    }
    for (const U of Object.keys(b))
      Object.prototype.hasOwnProperty.call(P, U) ? (E === !0 && (P[U] = b[U]), _ && a(E === !0 ? `"${U}" is already defined and WAS overwritten` : `"${U}" is already defined and was NOT overwritten`)) : P[U] = b[U];
  }
  const D = {
    configDotenv: p,
    _configVault: g,
    _parseVault: r,
    config: A,
    decrypt: T,
    parse: n,
    populate: O
  };
  return ot.exports.configDotenv = D.configDotenv, ot.exports._configVault = D._configVault, ot.exports._parseVault = D._parseVault, ot.exports.config = D.config, ot.exports.decrypt = D.decrypt, ot.exports.parse = D.parse, ot.exports.populate = D.populate, ot.exports = D, ot.exports;
}
var oh = ih();
const ah = /* @__PURE__ */ Hu(oh);
var vr = { exports: {} }, oo = { exports: {} }, cu;
function _c() {
  return cu || (cu = 1, function(o) {
    let h = {};
    try {
      h = require("electron");
    } catch {
    }
    h.ipcRenderer && d(h), o.exports = d;
    function d({ contextBridge: f, ipcRenderer: c }) {
      if (!c)
        return;
      c.on("__ELECTRON_LOG_IPC__", (e, n) => {
        window.postMessage({ cmd: "message", ...n });
      }), c.invoke("__ELECTRON_LOG__", { cmd: "getOptions" }).catch((e) => console.error(new Error(
        `electron-log isn't initialized in the main process. Please call log.initialize() before. ${e.message}`
      )));
      const t = {
        sendToMain(e) {
          try {
            c.send("__ELECTRON_LOG__", e);
          } catch (n) {
            console.error("electronLog.sendToMain ", n, "data:", e), c.send("__ELECTRON_LOG__", {
              cmd: "errorHandler",
              error: { message: n == null ? void 0 : n.message, stack: n == null ? void 0 : n.stack },
              errorName: "sendToMain"
            });
          }
        },
        log(...e) {
          t.sendToMain({ data: e, level: "info" });
        }
      };
      for (const e of ["error", "warn", "info", "verbose", "debug", "silly"])
        t[e] = (...n) => t.sendToMain({
          data: n,
          level: e
        });
      if (f && process.contextIsolated)
        try {
          f.exposeInMainWorld("__electronLog", t);
        } catch {
        }
      typeof window == "object" ? window.__electronLog = t : __electronLog = t;
    }
  }(oo)), oo.exports;
}
var ao = { exports: {} }, so, fu;
function sh() {
  if (fu) return so;
  fu = 1, so = o;
  function o(h) {
    return Object.defineProperties(d, {
      defaultLabel: { value: "", writable: !0 },
      labelPadding: { value: !0, writable: !0 },
      maxLabelLength: { value: 0, writable: !0 },
      labelLength: {
        get() {
          switch (typeof d.labelPadding) {
            case "boolean":
              return d.labelPadding ? d.maxLabelLength : 0;
            case "number":
              return d.labelPadding;
            default:
              return 0;
          }
        }
      }
    });
    function d(f) {
      d.maxLabelLength = Math.max(d.maxLabelLength, f.length);
      const c = {};
      for (const t of h.levels)
        c[t] = (...e) => h.logData(e, { level: t, scope: f });
      return c.log = c.info, c;
    }
  }
  return so;
}
var lo, du;
function lh() {
  if (du) return lo;
  du = 1;
  class o {
    constructor({ processMessage: d }) {
      this.processMessage = d, this.buffer = [], this.enabled = !1, this.begin = this.begin.bind(this), this.commit = this.commit.bind(this), this.reject = this.reject.bind(this);
    }
    addMessage(d) {
      this.buffer.push(d);
    }
    begin() {
      this.enabled = [];
    }
    commit() {
      this.enabled = !1, this.buffer.forEach((d) => this.processMessage(d)), this.buffer = [];
    }
    reject() {
      this.enabled = !1, this.buffer = [];
    }
  }
  return lo = o, lo;
}
var uo, hu;
function Sc() {
  if (hu) return uo;
  hu = 1;
  const o = sh(), h = lh(), f = class f {
    constructor({
      allowUnknownLevel: t = !1,
      dependencies: e = {},
      errorHandler: n,
      eventLogger: r,
      initializeFn: i,
      isDev: a = !1,
      levels: u = ["error", "warn", "info", "verbose", "debug", "silly"],
      logId: s,
      transportFactories: m = {},
      variables: v
    } = {}) {
      Ae(this, "dependencies", {});
      Ae(this, "errorHandler", null);
      Ae(this, "eventLogger", null);
      Ae(this, "functions", {});
      Ae(this, "hooks", []);
      Ae(this, "isDev", !1);
      Ae(this, "levels", null);
      Ae(this, "logId", null);
      Ae(this, "scope", null);
      Ae(this, "transports", {});
      Ae(this, "variables", {});
      this.addLevel = this.addLevel.bind(this), this.create = this.create.bind(this), this.initialize = this.initialize.bind(this), this.logData = this.logData.bind(this), this.processMessage = this.processMessage.bind(this), this.allowUnknownLevel = t, this.buffering = new h(this), this.dependencies = e, this.initializeFn = i, this.isDev = a, this.levels = u, this.logId = s, this.scope = o(this), this.transportFactories = m, this.variables = v || {};
      for (const g of this.levels)
        this.addLevel(g, !1);
      this.log = this.info, this.functions.log = this.log, this.errorHandler = n, n == null || n.setOptions({ ...e, logFn: this.error }), this.eventLogger = r, r == null || r.setOptions({ ...e, logger: this });
      for (const [g, p] of Object.entries(m))
        this.transports[g] = p(this, e);
      f.instances[s] = this;
    }
    static getInstance({ logId: t }) {
      return this.instances[t] || this.instances.default;
    }
    addLevel(t, e = this.levels.length) {
      e !== !1 && this.levels.splice(e, 0, t), this[t] = (...n) => this.logData(n, { level: t }), this.functions[t] = this[t];
    }
    catchErrors(t) {
      return this.processMessage(
        {
          data: ["log.catchErrors is deprecated. Use log.errorHandler instead"],
          level: "warn"
        },
        { transports: ["console"] }
      ), this.errorHandler.startCatching(t);
    }
    create(t) {
      return typeof t == "string" && (t = { logId: t }), new f({
        dependencies: this.dependencies,
        errorHandler: this.errorHandler,
        initializeFn: this.initializeFn,
        isDev: this.isDev,
        transportFactories: this.transportFactories,
        variables: { ...this.variables },
        ...t
      });
    }
    compareLevels(t, e, n = this.levels) {
      const r = n.indexOf(t), i = n.indexOf(e);
      return i === -1 || r === -1 ? !0 : i <= r;
    }
    initialize(t = {}) {
      this.initializeFn({ logger: this, ...this.dependencies, ...t });
    }
    logData(t, e = {}) {
      this.buffering.enabled ? this.buffering.addMessage({ data: t, date: /* @__PURE__ */ new Date(), ...e }) : this.processMessage({ data: t, ...e });
    }
    processMessage(t, { transports: e = this.transports } = {}) {
      if (t.cmd === "errorHandler") {
        this.errorHandler.handle(t.error, {
          errorName: t.errorName,
          processType: "renderer",
          showDialog: !!t.showDialog
        });
        return;
      }
      let n = t.level;
      this.allowUnknownLevel || (n = this.levels.includes(t.level) ? t.level : "info");
      const r = {
        date: /* @__PURE__ */ new Date(),
        logId: this.logId,
        ...t,
        level: n,
        variables: {
          ...this.variables,
          ...t.variables
        }
      };
      for (const [i, a] of this.transportEntries(e))
        if (!(typeof a != "function" || a.level === !1) && this.compareLevels(a.level, t.level))
          try {
            const u = this.hooks.reduce((s, m) => s && m(s, a, i), r);
            u && a({ ...u, data: [...u.data] });
          } catch (u) {
            this.processInternalErrorFn(u);
          }
    }
    processInternalErrorFn(t) {
    }
    transportEntries(t = this.transports) {
      return (Array.isArray(t) ? t : Object.entries(t)).map((n) => {
        switch (typeof n) {
          case "string":
            return this.transports[n] ? [n, this.transports[n]] : null;
          case "function":
            return [n.name, n];
          default:
            return Array.isArray(n) ? n : null;
        }
      }).filter(Boolean);
    }
  };
  Ae(f, "instances", {});
  let d = f;
  return uo = d, uo;
}
var co, pu;
function uh() {
  if (pu) return co;
  pu = 1;
  const o = console.error;
  class h {
    constructor({ logFn: f = null } = {}) {
      Ae(this, "logFn", null);
      Ae(this, "onError", null);
      Ae(this, "showDialog", !1);
      Ae(this, "preventDefault", !0);
      this.handleError = this.handleError.bind(this), this.handleRejection = this.handleRejection.bind(this), this.startCatching = this.startCatching.bind(this), this.logFn = f;
    }
    handle(f, {
      logFn: c = this.logFn,
      errorName: t = "",
      onError: e = this.onError,
      showDialog: n = this.showDialog
    } = {}) {
      try {
        (e == null ? void 0 : e({ error: f, errorName: t, processType: "renderer" })) !== !1 && c({ error: f, errorName: t, showDialog: n });
      } catch {
        o(f);
      }
    }
    setOptions({ logFn: f, onError: c, preventDefault: t, showDialog: e }) {
      typeof f == "function" && (this.logFn = f), typeof c == "function" && (this.onError = c), typeof t == "boolean" && (this.preventDefault = t), typeof e == "boolean" && (this.showDialog = e);
    }
    startCatching({ onError: f, showDialog: c } = {}) {
      this.isActive || (this.isActive = !0, this.setOptions({ onError: f, showDialog: c }), window.addEventListener("error", (t) => {
        var e;
        this.preventDefault && ((e = t.preventDefault) == null || e.call(t)), this.handleError(t.error || t);
      }), window.addEventListener("unhandledrejection", (t) => {
        var e;
        this.preventDefault && ((e = t.preventDefault) == null || e.call(t)), this.handleRejection(t.reason || t);
      }));
    }
    handleError(f) {
      this.handle(f, { errorName: "Unhandled" });
    }
    handleRejection(f) {
      const c = f instanceof Error ? f : new Error(JSON.stringify(f));
      this.handle(c, { errorName: "Unhandled rejection" });
    }
  }
  return co = h, co;
}
var fo, mu;
function xt() {
  if (mu) return fo;
  mu = 1, fo = { transform: o };
  function o({
    logger: h,
    message: d,
    transport: f,
    initialData: c = (d == null ? void 0 : d.data) || [],
    transforms: t = f == null ? void 0 : f.transforms
  }) {
    return t.reduce((e, n) => typeof n == "function" ? n({ data: e, logger: h, message: d, transport: f }) : e, c);
  }
  return fo;
}
var ho, gu;
function ch() {
  if (gu) return ho;
  gu = 1;
  const { transform: o } = xt();
  ho = d;
  const h = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    verbose: console.info,
    debug: console.debug,
    silly: console.debug,
    log: console.log
  };
  function d(c) {
    return Object.assign(t, {
      format: "{h}:{i}:{s}.{ms}{scope} › {text}",
      transforms: [f],
      writeFn({ message: { level: e, data: n } }) {
        const r = h[e] || h.info;
        setTimeout(() => r(...n));
      }
    });
    function t(e) {
      t.writeFn({
        message: { ...e, data: o({ logger: c, message: e, transport: t }) }
      });
    }
  }
  function f({
    data: c = [],
    logger: t = {},
    message: e = {},
    transport: n = {}
  }) {
    if (typeof n.format == "function")
      return n.format({
        data: c,
        level: (e == null ? void 0 : e.level) || "info",
        logger: t,
        message: e,
        transport: n
      });
    if (typeof n.format != "string")
      return c;
    c.unshift(n.format), typeof c[1] == "string" && c[1].match(/%[1cdfiOos]/) && (c = [`${c[0]}${c[1]}`, ...c.slice(2)]);
    const r = e.date || /* @__PURE__ */ new Date();
    return c[0] = c[0].replace(/\{(\w+)}/g, (i, a) => {
      var u, s;
      switch (a) {
        case "level":
          return e.level;
        case "logId":
          return e.logId;
        case "scope": {
          const m = e.scope || ((u = t.scope) == null ? void 0 : u.defaultLabel);
          return m ? ` (${m})` : "";
        }
        case "text":
          return "";
        case "y":
          return r.getFullYear().toString(10);
        case "m":
          return (r.getMonth() + 1).toString(10).padStart(2, "0");
        case "d":
          return r.getDate().toString(10).padStart(2, "0");
        case "h":
          return r.getHours().toString(10).padStart(2, "0");
        case "i":
          return r.getMinutes().toString(10).padStart(2, "0");
        case "s":
          return r.getSeconds().toString(10).padStart(2, "0");
        case "ms":
          return r.getMilliseconds().toString(10).padStart(3, "0");
        case "iso":
          return r.toISOString();
        default:
          return ((s = e.variables) == null ? void 0 : s[a]) || i;
      }
    }).trim(), c;
  }
  return ho;
}
var po, vu;
function fh() {
  if (vu) return po;
  vu = 1;
  const { transform: o } = xt();
  po = d;
  const h = /* @__PURE__ */ new Set([Promise, WeakMap, WeakSet]);
  function d(t) {
    return Object.assign(e, {
      depth: 5,
      transforms: [c]
    });
    function e(n) {
      if (!window.__electronLog) {
        t.processMessage(
          {
            data: ["electron-log: logger isn't initialized in the main process"],
            level: "error"
          },
          { transports: ["console"] }
        );
        return;
      }
      try {
        const r = o({
          initialData: n,
          logger: t,
          message: n,
          transport: e
        });
        __electronLog.sendToMain(r);
      } catch (r) {
        t.transports.console({
          data: ["electronLog.transports.ipc", r, "data:", n.data],
          level: "error"
        });
      }
    }
  }
  function f(t) {
    return Object(t) !== t;
  }
  function c({
    data: t,
    depth: e,
    seen: n = /* @__PURE__ */ new WeakSet(),
    transport: r = {}
  } = {}) {
    const i = e || r.depth || 5;
    return n.has(t) ? "[Circular]" : i < 1 ? f(t) ? t : Array.isArray(t) ? "[Array]" : `[${typeof t}]` : ["function", "symbol"].includes(typeof t) ? t.toString() : f(t) ? t : h.has(t.constructor) ? `[${t.constructor.name}]` : Array.isArray(t) ? t.map((a) => c({
      data: a,
      depth: i - 1,
      seen: n
    })) : t instanceof Date ? t.toISOString() : t instanceof Error ? t.stack : t instanceof Map ? new Map(
      Array.from(t).map(([a, u]) => [
        c({ data: a, depth: i - 1, seen: n }),
        c({ data: u, depth: i - 1, seen: n })
      ])
    ) : t instanceof Set ? new Set(
      Array.from(t).map(
        (a) => c({ data: a, depth: i - 1, seen: n })
      )
    ) : (n.add(t), Object.fromEntries(
      Object.entries(t).map(
        ([a, u]) => [
          a,
          c({ data: u, depth: i - 1, seen: n })
        ]
      )
    ));
  }
  return po;
}
var yu;
function dh() {
  return yu || (yu = 1, function(o) {
    const h = Sc(), d = uh(), f = ch(), c = fh();
    typeof process == "object" && process.type === "browser" && console.warn(
      "electron-log/renderer is loaded in the main process. It could cause unexpected behaviour."
    ), o.exports = t(), o.exports.Logger = h, o.exports.default = o.exports;
    function t() {
      const e = new h({
        allowUnknownLevel: !0,
        errorHandler: new d(),
        initializeFn: () => {
        },
        logId: "default",
        transportFactories: {
          console: f,
          ipc: c
        },
        variables: {
          processType: "renderer"
        }
      });
      return e.errorHandler.setOptions({
        logFn({ error: n, errorName: r, showDialog: i }) {
          e.transports.console({
            data: [r, n].filter(Boolean),
            level: "error"
          }), e.transports.ipc({
            cmd: "errorHandler",
            error: {
              cause: n == null ? void 0 : n.cause,
              code: n == null ? void 0 : n.code,
              name: n == null ? void 0 : n.name,
              message: n == null ? void 0 : n.message,
              stack: n == null ? void 0 : n.stack
            },
            errorName: r,
            logId: e.logId,
            showDialog: i
          });
        }
      }), typeof window == "object" && window.addEventListener("message", (n) => {
        const { cmd: r, logId: i, ...a } = n.data || {}, u = h.getInstance({ logId: i });
        r === "message" && u.processMessage(a, { transports: ["console"] });
      }), new Proxy(e, {
        get(n, r) {
          return typeof n[r] < "u" ? n[r] : (...i) => e.logData(i, { level: r });
        }
      });
    }
  }(ao)), ao.exports;
}
var mo, Eu;
function hh() {
  if (Eu) return mo;
  Eu = 1;
  const o = Ve, h = Ce;
  mo = {
    findAndReadPackageJson: d,
    tryReadJsonAt: f
  };
  function d() {
    return f(e()) || f(t()) || f(process.resourcesPath, "app.asar") || f(process.resourcesPath, "app") || f(process.cwd()) || { name: void 0, version: void 0 };
  }
  function f(...n) {
    if (n[0])
      try {
        const r = h.join(...n), i = c("package.json", r);
        if (!i)
          return;
        const a = JSON.parse(o.readFileSync(i, "utf8")), u = (a == null ? void 0 : a.productName) || (a == null ? void 0 : a.name);
        return !u || u.toLowerCase() === "electron" ? void 0 : u ? { name: u, version: a == null ? void 0 : a.version } : void 0;
      } catch {
        return;
      }
  }
  function c(n, r) {
    let i = r;
    for (; ; ) {
      const a = h.parse(i), u = a.root, s = a.dir;
      if (o.existsSync(h.join(i, n)))
        return h.resolve(h.join(i, n));
      if (i === u)
        return null;
      i = s;
    }
  }
  function t() {
    const n = process.argv.filter((i) => i.indexOf("--user-data-dir=") === 0);
    return n.length === 0 || typeof n[0] != "string" ? null : n[0].replace("--user-data-dir=", "");
  }
  function e() {
    var n;
    try {
      return (n = require.main) == null ? void 0 : n.filename;
    } catch {
      return;
    }
  }
  return mo;
}
var go, wu;
function Ac() {
  if (wu) return go;
  wu = 1;
  const o = Sr, h = dt, d = Ce, f = hh();
  class c {
    constructor() {
      Ae(this, "appName");
      Ae(this, "appPackageJson");
      Ae(this, "platform", process.platform);
    }
    getAppLogPath(e = this.getAppName()) {
      return this.platform === "darwin" ? d.join(this.getSystemPathHome(), "Library/Logs", e) : d.join(this.getAppUserDataPath(e), "logs");
    }
    getAppName() {
      var n;
      const e = this.appName || ((n = this.getAppPackageJson()) == null ? void 0 : n.name);
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
      return typeof this.appPackageJson != "object" && (this.appPackageJson = f.findAndReadPackageJson()), this.appPackageJson;
    }
    getAppUserDataPath(e = this.getAppName()) {
      return e ? d.join(this.getSystemPathAppData(), e) : void 0;
    }
    getAppVersion() {
      var e;
      return (e = this.getAppPackageJson()) == null ? void 0 : e.version;
    }
    getElectronLogPath() {
      return this.getAppLogPath();
    }
    getMacOsVersion() {
      const e = Number(h.release().split(".")[0]);
      return e <= 19 ? `10.${e - 4}` : e - 9;
    }
    /**
     * @protected
     * @returns {string}
     */
    getOsVersion() {
      let e = h.type().replace("_", " "), n = h.release();
      return e === "Darwin" && (e = "macOS", n = this.getMacOsVersion()), `${e} ${n}`;
    }
    /**
     * @return {PathVariables}
     */
    getPathVariables() {
      const e = this.getAppName(), n = this.getAppVersion(), r = this;
      return {
        appData: this.getSystemPathAppData(),
        appName: e,
        appVersion: n,
        get electronDefaultDir() {
          return r.getElectronLogPath();
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
          return d.join(e, "Library/Application Support");
        case "win32":
          return process.env.APPDATA || d.join(e, "AppData/Roaming");
        default:
          return process.env.XDG_CONFIG_HOME || d.join(e, ".config");
      }
    }
    getSystemPathHome() {
      var e;
      return ((e = h.homedir) == null ? void 0 : e.call(h)) || process.env.HOME;
    }
    getSystemPathTemp() {
      return h.tmpdir();
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
    onAppEvent(e, n) {
    }
    onAppReady(e) {
      e();
    }
    onEveryWebContentsEvent(e, n) {
    }
    /**
     * Listen to async messages sent from opposite process
     * @param {string} channel
     * @param {function} listener
     */
    onIpc(e, n) {
    }
    onIpcInvoke(e, n) {
    }
    /**
     * @param {string} url
     * @param {Function} [logFunction]
     */
    openUrl(e, n = console.error) {
      const i = { darwin: "open", win32: "start", linux: "xdg-open" }[process.platform] || "xdg-open";
      o.exec(`${i} ${e}`, {}, (a) => {
        a && n(a);
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
      includeFutureSession: n = !0,
      // eslint-disable-line no-unused-vars
      getSessions: r = () => []
      // eslint-disable-line no-unused-vars
    }) {
    }
    /**
     * Sent a message to opposite process
     * @param {string} channel
     * @param {any} message
     */
    sendIpc(e, n) {
    }
    showErrorBox(e, n) {
    }
  }
  return go = c, go;
}
var vo, _u;
function ph() {
  if (_u) return vo;
  _u = 1;
  const o = Ce, h = Ac();
  class d extends h {
    /**
     * @param {object} options
     * @param {typeof Electron} [options.electron]
     */
    constructor({ electron: t } = {}) {
      super();
      /**
       * @type {typeof Electron}
       */
      Ae(this, "electron");
      this.electron = t;
    }
    getAppName() {
      var e, n;
      let t;
      try {
        t = this.appName || ((e = this.electron.app) == null ? void 0 : e.name) || ((n = this.electron.app) == null ? void 0 : n.getName());
      } catch {
      }
      return t || super.getAppName();
    }
    getAppUserDataPath(t) {
      return this.getPath("userData") || super.getAppUserDataPath(t);
    }
    getAppVersion() {
      var e;
      let t;
      try {
        t = (e = this.electron.app) == null ? void 0 : e.getVersion();
      } catch {
      }
      return t || super.getAppVersion();
    }
    getElectronLogPath() {
      return this.getPath("logs") || super.getElectronLogPath();
    }
    /**
     * @private
     * @param {any} name
     * @returns {string|undefined}
     */
    getPath(t) {
      var e;
      try {
        return (e = this.electron.app) == null ? void 0 : e.getPath(t);
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
      var t;
      return ((t = this.electron.app) == null ? void 0 : t.isPackaged) !== void 0 ? !this.electron.app.isPackaged : typeof process.execPath == "string" ? o.basename(process.execPath).toLowerCase().startsWith("electron") : super.isDev();
    }
    onAppEvent(t, e) {
      var n;
      return (n = this.electron.app) == null || n.on(t, e), () => {
        var r;
        (r = this.electron.app) == null || r.off(t, e);
      };
    }
    onAppReady(t) {
      var e, n, r;
      (e = this.electron.app) != null && e.isReady() ? t() : (n = this.electron.app) != null && n.once ? (r = this.electron.app) == null || r.once("ready", t) : t();
    }
    onEveryWebContentsEvent(t, e) {
      var r, i, a;
      return (i = (r = this.electron.webContents) == null ? void 0 : r.getAllWebContents()) == null || i.forEach((u) => {
        u.on(t, e);
      }), (a = this.electron.app) == null || a.on("web-contents-created", n), () => {
        var u, s;
        (u = this.electron.webContents) == null || u.getAllWebContents().forEach((m) => {
          m.off(t, e);
        }), (s = this.electron.app) == null || s.off("web-contents-created", n);
      };
      function n(u, s) {
        s.on(t, e);
      }
    }
    /**
     * Listen to async messages sent from opposite process
     * @param {string} channel
     * @param {function} listener
     */
    onIpc(t, e) {
      var n;
      (n = this.electron.ipcMain) == null || n.on(t, e);
    }
    onIpcInvoke(t, e) {
      var n, r;
      (r = (n = this.electron.ipcMain) == null ? void 0 : n.handle) == null || r.call(n, t, e);
    }
    /**
     * @param {string} url
     * @param {Function} [logFunction]
     */
    openUrl(t, e = console.error) {
      var n;
      (n = this.electron.shell) == null || n.openExternal(t).catch(e);
    }
    setPreloadFileForSessions({
      filePath: t,
      includeFutureSession: e = !0,
      getSessions: n = () => {
        var r;
        return [(r = this.electron.session) == null ? void 0 : r.defaultSession];
      }
    }) {
      for (const i of n().filter(Boolean))
        r(i);
      e && this.onAppEvent("session-created", (i) => {
        r(i);
      });
      function r(i) {
        typeof i.registerPreloadScript == "function" ? i.registerPreloadScript({
          filePath: t,
          id: "electron-log-preload",
          type: "frame"
        }) : i.setPreloads([...i.getPreloads(), t]);
      }
    }
    /**
     * Sent a message to opposite process
     * @param {string} channel
     * @param {any} message
     */
    sendIpc(t, e) {
      var n, r;
      (r = (n = this.electron.BrowserWindow) == null ? void 0 : n.getAllWindows()) == null || r.forEach((i) => {
        var a, u;
        ((a = i.webContents) == null ? void 0 : a.isDestroyed()) === !1 && ((u = i.webContents) == null ? void 0 : u.isCrashed()) === !1 && i.webContents.send(t, e);
      });
    }
    showErrorBox(t, e) {
      var n;
      (n = this.electron.dialog) == null || n.showErrorBox(t, e);
    }
  }
  return vo = d, vo;
}
var yo, Su;
function mh() {
  if (Su) return yo;
  Su = 1;
  const o = Ve, h = dt, d = Ce, f = _c();
  yo = {
    initialize({
      externalApi: e,
      getSessions: n,
      includeFutureSession: r,
      logger: i,
      preload: a = !0,
      spyRendererConsole: u = !1
    }) {
      e.onAppReady(() => {
        try {
          a && c({
            externalApi: e,
            getSessions: n,
            includeFutureSession: r,
            preloadOption: a
          }), u && t({ externalApi: e, logger: i });
        } catch (s) {
          i.warn(s);
        }
      });
    }
  };
  function c({
    externalApi: e,
    getSessions: n,
    includeFutureSession: r,
    preloadOption: i
  }) {
    let a = typeof i == "string" ? i : void 0;
    try {
      a = d.resolve(
        __dirname,
        "../renderer/electron-log-preload.js"
      );
    } catch {
    }
    if (!a || !o.existsSync(a)) {
      a = d.join(
        e.getAppUserDataPath() || h.tmpdir(),
        "electron-log-preload.js"
      );
      const u = `
      try {
        (${f.toString()})(require('electron'));
      } catch(e) {
        console.error(e);
      }
    `;
      o.writeFileSync(a, u, "utf8");
    }
    e.setPreloadFileForSessions({
      filePath: a,
      includeFutureSession: r,
      getSessions: n
    });
  }
  function t({ externalApi: e, logger: n }) {
    const r = ["debug", "info", "warn", "error"];
    e.onEveryWebContentsEvent(
      "console-message",
      (i, a, u) => {
        n.processMessage({
          data: [u],
          level: r[a],
          variables: { processType: "renderer" }
        });
      }
    );
  }
  return yo;
}
var Eo, Au;
function gh() {
  if (Au) return Eo;
  Au = 1;
  class o {
    constructor({
      externalApi: f,
      logFn: c = void 0,
      onError: t = void 0,
      showDialog: e = void 0
    } = {}) {
      Ae(this, "externalApi");
      Ae(this, "isActive", !1);
      Ae(this, "logFn");
      Ae(this, "onError");
      Ae(this, "showDialog", !0);
      this.createIssue = this.createIssue.bind(this), this.handleError = this.handleError.bind(this), this.handleRejection = this.handleRejection.bind(this), this.setOptions({ externalApi: f, logFn: c, onError: t, showDialog: e }), this.startCatching = this.startCatching.bind(this), this.stopCatching = this.stopCatching.bind(this);
    }
    handle(f, {
      logFn: c = this.logFn,
      onError: t = this.onError,
      processType: e = "browser",
      showDialog: n = this.showDialog,
      errorName: r = ""
    } = {}) {
      var i;
      f = h(f);
      try {
        if (typeof t == "function") {
          const a = ((i = this.externalApi) == null ? void 0 : i.getVersions()) || {}, u = this.createIssue;
          if (t({
            createIssue: u,
            error: f,
            errorName: r,
            processType: e,
            versions: a
          }) === !1)
            return;
        }
        r ? c(r, f) : c(f), n && !r.includes("rejection") && this.externalApi && this.externalApi.showErrorBox(
          `A JavaScript error occurred in the ${e} process`,
          f.stack
        );
      } catch {
        console.error(f);
      }
    }
    setOptions({ externalApi: f, logFn: c, onError: t, showDialog: e }) {
      typeof f == "object" && (this.externalApi = f), typeof c == "function" && (this.logFn = c), typeof t == "function" && (this.onError = t), typeof e == "boolean" && (this.showDialog = e);
    }
    startCatching({ onError: f, showDialog: c } = {}) {
      this.isActive || (this.isActive = !0, this.setOptions({ onError: f, showDialog: c }), process.on("uncaughtException", this.handleError), process.on("unhandledRejection", this.handleRejection));
    }
    stopCatching() {
      this.isActive = !1, process.removeListener("uncaughtException", this.handleError), process.removeListener("unhandledRejection", this.handleRejection);
    }
    createIssue(f, c) {
      var t;
      (t = this.externalApi) == null || t.openUrl(
        `${f}?${new URLSearchParams(c).toString()}`
      );
    }
    handleError(f) {
      this.handle(f, { errorName: "Unhandled" });
    }
    handleRejection(f) {
      const c = f instanceof Error ? f : new Error(JSON.stringify(f));
      this.handle(c, { errorName: "Unhandled rejection" });
    }
  }
  function h(d) {
    if (d instanceof Error)
      return d;
    if (d && typeof d == "object") {
      if (d.message)
        return Object.assign(new Error(d.message), d);
      try {
        return new Error(JSON.stringify(d));
      } catch (f) {
        return new Error(`Couldn't normalize error ${String(d)}: ${f}`);
      }
    }
    return new Error(`Can't normalize error ${String(d)}`);
  }
  return Eo = o, Eo;
}
var wo, bu;
function vh() {
  if (bu) return wo;
  bu = 1;
  class o {
    constructor(d = {}) {
      Ae(this, "disposers", []);
      Ae(this, "format", "{eventSource}#{eventName}:");
      Ae(this, "formatters", {
        app: {
          "certificate-error": ({ args: d }) => this.arrayToObject(d.slice(1, 4), [
            "url",
            "error",
            "certificate"
          ]),
          "child-process-gone": ({ args: d }) => d.length === 1 ? d[0] : d,
          "render-process-gone": ({ args: [d, f] }) => f && typeof f == "object" ? { ...f, ...this.getWebContentsDetails(d) } : []
        },
        webContents: {
          "console-message": ({ args: [d, f, c, t] }) => {
            if (!(d < 3))
              return { message: f, source: `${t}:${c}` };
          },
          "did-fail-load": ({ args: d }) => this.arrayToObject(d, [
            "errorCode",
            "errorDescription",
            "validatedURL",
            "isMainFrame",
            "frameProcessId",
            "frameRoutingId"
          ]),
          "did-fail-provisional-load": ({ args: d }) => this.arrayToObject(d, [
            "errorCode",
            "errorDescription",
            "validatedURL",
            "isMainFrame",
            "frameProcessId",
            "frameRoutingId"
          ]),
          "plugin-crashed": ({ args: d }) => this.arrayToObject(d, ["name", "version"]),
          "preload-error": ({ args: d }) => this.arrayToObject(d, ["preloadPath", "error"])
        }
      });
      Ae(this, "events", {
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
      Ae(this, "externalApi");
      Ae(this, "level", "error");
      Ae(this, "scope", "");
      this.setOptions(d);
    }
    setOptions({
      events: d,
      externalApi: f,
      level: c,
      logger: t,
      format: e,
      formatters: n,
      scope: r
    }) {
      typeof d == "object" && (this.events = d), typeof f == "object" && (this.externalApi = f), typeof c == "string" && (this.level = c), typeof t == "object" && (this.logger = t), (typeof e == "string" || typeof e == "function") && (this.format = e), typeof n == "object" && (this.formatters = n), typeof r == "string" && (this.scope = r);
    }
    startLogging(d = {}) {
      this.setOptions(d), this.disposeListeners();
      for (const f of this.getEventNames(this.events.app))
        this.disposers.push(
          this.externalApi.onAppEvent(f, (...c) => {
            this.handleEvent({ eventSource: "app", eventName: f, handlerArgs: c });
          })
        );
      for (const f of this.getEventNames(this.events.webContents))
        this.disposers.push(
          this.externalApi.onEveryWebContentsEvent(
            f,
            (...c) => {
              this.handleEvent(
                { eventSource: "webContents", eventName: f, handlerArgs: c }
              );
            }
          )
        );
    }
    stopLogging() {
      this.disposeListeners();
    }
    arrayToObject(d, f) {
      const c = {};
      return f.forEach((t, e) => {
        c[t] = d[e];
      }), d.length > f.length && (c.unknownArgs = d.slice(f.length)), c;
    }
    disposeListeners() {
      this.disposers.forEach((d) => d()), this.disposers = [];
    }
    formatEventLog({ eventName: d, eventSource: f, handlerArgs: c }) {
      var u;
      const [t, ...e] = c;
      if (typeof this.format == "function")
        return this.format({ args: e, event: t, eventName: d, eventSource: f });
      const n = (u = this.formatters[f]) == null ? void 0 : u[d];
      let r = e;
      if (typeof n == "function" && (r = n({ args: e, event: t, eventName: d, eventSource: f })), !r)
        return;
      const i = {};
      return Array.isArray(r) ? i.args = r : typeof r == "object" && Object.assign(i, r), f === "webContents" && Object.assign(i, this.getWebContentsDetails(t == null ? void 0 : t.sender)), [this.format.replace("{eventSource}", f === "app" ? "App" : "WebContents").replace("{eventName}", d), i];
    }
    getEventNames(d) {
      return !d || typeof d != "object" ? [] : Object.entries(d).filter(([f, c]) => c).map(([f]) => f);
    }
    getWebContentsDetails(d) {
      if (!(d != null && d.loadURL))
        return {};
      try {
        return {
          webContents: {
            id: d.id,
            url: d.getURL()
          }
        };
      } catch {
        return {};
      }
    }
    handleEvent({ eventName: d, eventSource: f, handlerArgs: c }) {
      var e;
      const t = this.formatEventLog({ eventName: d, eventSource: f, handlerArgs: c });
      if (t) {
        const n = this.scope ? this.logger.scope(this.scope) : this.logger;
        (e = n == null ? void 0 : n[this.level]) == null || e.call(n, ...t);
      }
    }
  }
  return wo = o, wo;
}
var _o, Ru;
function bc() {
  if (Ru) return _o;
  Ru = 1;
  const { transform: o } = xt();
  _o = {
    concatFirstStringElements: h,
    formatScope: f,
    formatText: t,
    formatVariables: c,
    timeZoneFromOffset: d,
    format({ message: e, logger: n, transport: r, data: i = e == null ? void 0 : e.data }) {
      switch (typeof r.format) {
        case "string":
          return o({
            message: e,
            logger: n,
            transforms: [c, f, t],
            transport: r,
            initialData: [r.format, ...i]
          });
        case "function":
          return r.format({
            data: i,
            level: (e == null ? void 0 : e.level) || "info",
            logger: n,
            message: e,
            transport: r
          });
        default:
          return i;
      }
    }
  };
  function h({ data: e }) {
    return typeof e[0] != "string" || typeof e[1] != "string" || e[0].match(/%[1cdfiOos]/) ? e : [`${e[0]} ${e[1]}`, ...e.slice(2)];
  }
  function d(e) {
    const n = Math.abs(e), r = e > 0 ? "-" : "+", i = Math.floor(n / 60).toString().padStart(2, "0"), a = (n % 60).toString().padStart(2, "0");
    return `${r}${i}:${a}`;
  }
  function f({ data: e, logger: n, message: r }) {
    const { defaultLabel: i, labelLength: a } = (n == null ? void 0 : n.scope) || {}, u = e[0];
    let s = r.scope;
    s || (s = i);
    let m;
    return s === "" ? m = a > 0 ? "".padEnd(a + 3) : "" : typeof s == "string" ? m = ` (${s})`.padEnd(a + 3) : m = "", e[0] = u.replace("{scope}", m), e;
  }
  function c({ data: e, message: n }) {
    let r = e[0];
    if (typeof r != "string")
      return e;
    r = r.replace("{level}]", `${n.level}]`.padEnd(6, " "));
    const i = n.date || /* @__PURE__ */ new Date();
    return e[0] = r.replace(/\{(\w+)}/g, (a, u) => {
      var s;
      switch (u) {
        case "level":
          return n.level || "info";
        case "logId":
          return n.logId;
        case "y":
          return i.getFullYear().toString(10);
        case "m":
          return (i.getMonth() + 1).toString(10).padStart(2, "0");
        case "d":
          return i.getDate().toString(10).padStart(2, "0");
        case "h":
          return i.getHours().toString(10).padStart(2, "0");
        case "i":
          return i.getMinutes().toString(10).padStart(2, "0");
        case "s":
          return i.getSeconds().toString(10).padStart(2, "0");
        case "ms":
          return i.getMilliseconds().toString(10).padStart(3, "0");
        case "z":
          return d(i.getTimezoneOffset());
        case "iso":
          return i.toISOString();
        default:
          return ((s = n.variables) == null ? void 0 : s[u]) || a;
      }
    }).trim(), e;
  }
  function t({ data: e }) {
    const n = e[0];
    if (typeof n != "string")
      return e;
    if (n.lastIndexOf("{text}") === n.length - 6)
      return e[0] = n.replace(/\s?{text}/, ""), e[0] === "" && e.shift(), e;
    const i = n.split("{text}");
    let a = [];
    return i[0] !== "" && a.push(i[0]), a = a.concat(e.slice(1)), i[1] !== "" && a.push(i[1]), a;
  }
  return _o;
}
var So = { exports: {} }, Tu;
function en() {
  return Tu || (Tu = 1, function(o) {
    const h = Vr;
    o.exports = {
      serialize: f,
      maxDepth({ data: c, transport: t, depth: e = (t == null ? void 0 : t.depth) ?? 6 }) {
        if (!c)
          return c;
        if (e < 1)
          return Array.isArray(c) ? "[array]" : typeof c == "object" && c ? "[object]" : c;
        if (Array.isArray(c))
          return c.map((r) => o.exports.maxDepth({
            data: r,
            depth: e - 1
          }));
        if (typeof c != "object" || c && typeof c.toISOString == "function")
          return c;
        if (c === null)
          return null;
        if (c instanceof Error)
          return c;
        const n = {};
        for (const r in c)
          Object.prototype.hasOwnProperty.call(c, r) && (n[r] = o.exports.maxDepth({
            data: c[r],
            depth: e - 1
          }));
        return n;
      },
      toJSON({ data: c }) {
        return JSON.parse(JSON.stringify(c, d()));
      },
      toString({ data: c, transport: t }) {
        const e = (t == null ? void 0 : t.inspectOptions) || {}, n = c.map((r) => {
          if (r !== void 0)
            try {
              const i = JSON.stringify(r, d(), "  ");
              return i === void 0 ? void 0 : JSON.parse(i);
            } catch {
              return r;
            }
        });
        return h.formatWithOptions(e, ...n);
      }
    };
    function d(c = {}) {
      const t = /* @__PURE__ */ new WeakSet();
      return function(e, n) {
        if (typeof n == "object" && n !== null) {
          if (t.has(n))
            return;
          t.add(n);
        }
        return f(e, n, c);
      };
    }
    function f(c, t, e = {}) {
      const n = (e == null ? void 0 : e.serializeMapAndSet) !== !1;
      return t instanceof Error ? t.stack : t && (typeof t == "function" ? `[function] ${t.toString()}` : t instanceof Date ? t.toISOString() : n && t instanceof Map && Object.fromEntries ? Object.fromEntries(t) : n && t instanceof Set && Array.from ? Array.from(t) : t);
    }
  }(So)), So.exports;
}
var Ao, Cu;
function Jo() {
  if (Cu) return Ao;
  Cu = 1, Ao = {
    transformStyles: f,
    applyAnsiStyles({ data: c }) {
      return f(c, h, d);
    },
    removeStyles({ data: c }) {
      return f(c, () => "");
    }
  };
  const o = {
    unset: "\x1B[0m",
    black: "\x1B[30m",
    red: "\x1B[31m",
    green: "\x1B[32m",
    yellow: "\x1B[33m",
    blue: "\x1B[34m",
    magenta: "\x1B[35m",
    cyan: "\x1B[36m",
    white: "\x1B[37m"
  };
  function h(c) {
    const t = c.replace(/color:\s*(\w+).*/, "$1").toLowerCase();
    return o[t] || "";
  }
  function d(c) {
    return c + o.unset;
  }
  function f(c, t, e) {
    const n = {};
    return c.reduce((r, i, a, u) => {
      if (n[a])
        return r;
      if (typeof i == "string") {
        let s = a, m = !1;
        i = i.replace(/%[1cdfiOos]/g, (v) => {
          if (s += 1, v !== "%c")
            return v;
          const g = u[s];
          return typeof g == "string" ? (n[s] = !0, m = !0, t(g, i)) : v;
        }), m && e && (i = e(i));
      }
      return r.push(i), r;
    }, []);
  }
  return Ao;
}
var bo, Ou;
function yh() {
  if (Ou) return bo;
  Ou = 1;
  const {
    concatFirstStringElements: o,
    format: h
  } = bc(), { maxDepth: d, toJSON: f } = en(), {
    applyAnsiStyles: c,
    removeStyles: t
  } = Jo(), { transform: e } = xt(), n = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    verbose: console.info,
    debug: console.debug,
    silly: console.debug,
    log: console.log
  };
  bo = a;
  const i = `%c{h}:{i}:{s}.{ms}{scope}%c ${process.platform === "win32" ? ">" : "›"} {text}`;
  Object.assign(a, {
    DEFAULT_FORMAT: i
  });
  function a(g) {
    return Object.assign(p, {
      format: i,
      level: "silly",
      transforms: [
        u,
        h,
        m,
        o,
        d,
        f
      ],
      useStyles: process.env.FORCE_STYLES,
      writeFn({ message: A }) {
        (n[A.level] || n.info)(...A.data);
      }
    });
    function p(A) {
      const T = e({ logger: g, message: A, transport: p });
      p.writeFn({
        message: { ...A, data: T }
      });
    }
  }
  function u({ data: g, message: p, transport: A }) {
    return typeof A.format != "string" || !A.format.includes("%c") ? g : [`color:${v(p.level)}`, "color:unset", ...g];
  }
  function s(g, p) {
    if (typeof g == "boolean")
      return g;
    const T = p === "error" || p === "warn" ? process.stderr : process.stdout;
    return T && T.isTTY;
  }
  function m(g) {
    const { message: p, transport: A } = g;
    return (s(A.useStyles, p.level) ? c : t)(g);
  }
  function v(g) {
    const p = { error: "red", warn: "yellow", info: "cyan", default: "unset" };
    return p[g] || p.default;
  }
  return bo;
}
var Ro, Du;
function Rc() {
  if (Du) return Ro;
  Du = 1;
  const o = Wr, h = Ve, d = dt;
  class f extends o {
    constructor({
      path: n,
      writeOptions: r = { encoding: "utf8", flag: "a", mode: 438 },
      writeAsync: i = !1
    }) {
      super();
      Ae(this, "asyncWriteQueue", []);
      Ae(this, "bytesWritten", 0);
      Ae(this, "hasActiveAsyncWriting", !1);
      Ae(this, "path", null);
      Ae(this, "initialSize");
      Ae(this, "writeOptions", null);
      Ae(this, "writeAsync", !1);
      this.path = n, this.writeOptions = r, this.writeAsync = i;
    }
    get size() {
      return this.getSize();
    }
    clear() {
      try {
        return h.writeFileSync(this.path, "", {
          mode: this.writeOptions.mode,
          flag: "w"
        }), this.reset(), !0;
      } catch (n) {
        return n.code === "ENOENT" ? !0 : (this.emit("error", n, this), !1);
      }
    }
    crop(n) {
      try {
        const r = c(this.path, n || 4096);
        this.clear(), this.writeLine(`[log cropped]${d.EOL}${r}`);
      } catch (r) {
        this.emit(
          "error",
          new Error(`Couldn't crop file ${this.path}. ${r.message}`),
          this
        );
      }
    }
    getSize() {
      if (this.initialSize === void 0)
        try {
          const n = h.statSync(this.path);
          this.initialSize = n.size;
        } catch {
          this.initialSize = 0;
        }
      return this.initialSize + this.bytesWritten;
    }
    increaseBytesWrittenCounter(n) {
      this.bytesWritten += Buffer.byteLength(n, this.writeOptions.encoding);
    }
    isNull() {
      return !1;
    }
    nextAsyncWrite() {
      const n = this;
      if (this.hasActiveAsyncWriting || this.asyncWriteQueue.length === 0)
        return;
      const r = this.asyncWriteQueue.join("");
      this.asyncWriteQueue = [], this.hasActiveAsyncWriting = !0, h.writeFile(this.path, r, this.writeOptions, (i) => {
        n.hasActiveAsyncWriting = !1, i ? n.emit(
          "error",
          new Error(`Couldn't write to ${n.path}. ${i.message}`),
          this
        ) : n.increaseBytesWrittenCounter(r), n.nextAsyncWrite();
      });
    }
    reset() {
      this.initialSize = void 0, this.bytesWritten = 0;
    }
    toString() {
      return this.path;
    }
    writeLine(n) {
      if (n += d.EOL, this.writeAsync) {
        this.asyncWriteQueue.push(n), this.nextAsyncWrite();
        return;
      }
      try {
        h.writeFileSync(this.path, n, this.writeOptions), this.increaseBytesWrittenCounter(n);
      } catch (r) {
        this.emit(
          "error",
          new Error(`Couldn't write to ${this.path}. ${r.message}`),
          this
        );
      }
    }
  }
  Ro = f;
  function c(t, e) {
    const n = Buffer.alloc(e), r = h.statSync(t), i = Math.min(r.size, e), a = Math.max(0, r.size - e), u = h.openSync(t, "r"), s = h.readSync(u, n, 0, i, a);
    return h.closeSync(u), n.toString("utf8", 0, s);
  }
  return Ro;
}
var To, Pu;
function Eh() {
  if (Pu) return To;
  Pu = 1;
  const o = Rc();
  class h extends o {
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
  return To = h, To;
}
var Co, Iu;
function wh() {
  if (Iu) return Co;
  Iu = 1;
  const o = Wr, h = Ve, d = Ce, f = Rc(), c = Eh();
  class t extends o {
    constructor() {
      super();
      Ae(this, "store", {});
      this.emitError = this.emitError.bind(this);
    }
    /**
     * Provide a File object corresponding to the filePath
     * @param {string} filePath
     * @param {WriteOptions} [writeOptions]
     * @param {boolean} [writeAsync]
     * @return {File}
     */
    provide({ filePath: r, writeOptions: i = {}, writeAsync: a = !1 }) {
      let u;
      try {
        if (r = d.resolve(r), this.store[r])
          return this.store[r];
        u = this.createFile({ filePath: r, writeOptions: i, writeAsync: a });
      } catch (s) {
        u = new c({ path: r }), this.emitError(s, u);
      }
      return u.on("error", this.emitError), this.store[r] = u, u;
    }
    /**
     * @param {string} filePath
     * @param {WriteOptions} writeOptions
     * @param {boolean} async
     * @return {File}
     * @private
     */
    createFile({ filePath: r, writeOptions: i, writeAsync: a }) {
      return this.testFileWriting({ filePath: r, writeOptions: i }), new f({ path: r, writeOptions: i, writeAsync: a });
    }
    /**
     * @param {Error} error
     * @param {File} file
     * @private
     */
    emitError(r, i) {
      this.emit("error", r, i);
    }
    /**
     * @param {string} filePath
     * @param {WriteOptions} writeOptions
     * @private
     */
    testFileWriting({ filePath: r, writeOptions: i }) {
      h.mkdirSync(d.dirname(r), { recursive: !0 }), h.writeFileSync(r, "", { flag: "a", mode: i.mode });
    }
  }
  return Co = t, Co;
}
var Oo, Nu;
function _h() {
  if (Nu) return Oo;
  Nu = 1;
  const o = Ve, h = dt, d = Ce, f = wh(), { transform: c } = xt(), { removeStyles: t } = Jo(), {
    format: e,
    concatFirstStringElements: n
  } = bc(), { toString: r } = en();
  Oo = a;
  const i = new f();
  function a(s, { registry: m = i, externalApi: v } = {}) {
    let g;
    return m.listenerCount("error") < 1 && m.on("error", (P, b) => {
      T(`Can't write to ${b}`, P);
    }), Object.assign(p, {
      fileName: u(s.variables.processType),
      format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}",
      getFile: O,
      inspectOptions: { depth: 5 },
      level: "silly",
      maxSize: 1024 ** 2,
      readAllLogs: D,
      sync: !0,
      transforms: [t, e, n, r],
      writeOptions: { flag: "a", mode: 438, encoding: "utf8" },
      archiveLogFn(P) {
        const b = P.toString(), w = d.parse(b);
        try {
          o.renameSync(b, d.join(w.dir, `${w.name}.old${w.ext}`));
        } catch (_) {
          T("Could not rotate log", _);
          const E = Math.round(p.maxSize / 4);
          P.crop(Math.min(E, 256 * 1024));
        }
      },
      resolvePathFn(P) {
        return d.join(P.libraryDefaultDir, P.fileName);
      },
      setAppName(P) {
        s.dependencies.externalApi.setAppName(P);
      }
    });
    function p(P) {
      const b = O(P);
      p.maxSize > 0 && b.size > p.maxSize && (p.archiveLogFn(b), b.reset());
      const _ = c({ logger: s, message: P, transport: p });
      b.writeLine(_);
    }
    function A() {
      g || (g = Object.create(
        Object.prototype,
        {
          ...Object.getOwnPropertyDescriptors(
            v.getPathVariables()
          ),
          fileName: {
            get() {
              return p.fileName;
            },
            enumerable: !0
          }
        }
      ), typeof p.archiveLog == "function" && (p.archiveLogFn = p.archiveLog, T("archiveLog is deprecated. Use archiveLogFn instead")), typeof p.resolvePath == "function" && (p.resolvePathFn = p.resolvePath, T("resolvePath is deprecated. Use resolvePathFn instead")));
    }
    function T(P, b = null, w = "error") {
      const _ = [`electron-log.transports.file: ${P}`];
      b && _.push(b), s.transports.console({ data: _, date: /* @__PURE__ */ new Date(), level: w });
    }
    function O(P) {
      A();
      const b = p.resolvePathFn(g, P);
      return m.provide({
        filePath: b,
        writeAsync: !p.sync,
        writeOptions: p.writeOptions
      });
    }
    function D({ fileFilter: P = (b) => b.endsWith(".log") } = {}) {
      A();
      const b = d.dirname(p.resolvePathFn(g));
      return o.existsSync(b) ? o.readdirSync(b).map((w) => d.join(b, w)).filter(P).map((w) => {
        try {
          return {
            path: w,
            lines: o.readFileSync(w, "utf8").split(h.EOL)
          };
        } catch {
          return null;
        }
      }).filter(Boolean) : [];
    }
  }
  function u(s = process.type) {
    switch (s) {
      case "renderer":
        return "renderer.log";
      case "worker":
        return "worker.log";
      default:
        return "main.log";
    }
  }
  return Oo;
}
var Do, Fu;
function Sh() {
  if (Fu) return Do;
  Fu = 1;
  const { maxDepth: o, toJSON: h } = en(), { transform: d } = xt();
  Do = f;
  function f(c, { externalApi: t }) {
    return Object.assign(e, {
      depth: 3,
      eventId: "__ELECTRON_LOG_IPC__",
      level: c.isDev ? "silly" : !1,
      transforms: [h, o]
    }), t != null && t.isElectron() ? e : void 0;
    function e(n) {
      var r;
      ((r = n == null ? void 0 : n.variables) == null ? void 0 : r.processType) !== "renderer" && (t == null || t.sendIpc(e.eventId, {
        ...n,
        data: d({ logger: c, message: n, transport: e })
      }));
    }
  }
  return Do;
}
var Po, xu;
function Ah() {
  if (xu) return Po;
  xu = 1;
  const o = ju, h = Df, { transform: d } = xt(), { removeStyles: f } = Jo(), { toJSON: c, maxDepth: t } = en();
  Po = e;
  function e(n) {
    return Object.assign(r, {
      client: { name: "electron-application" },
      depth: 6,
      level: !1,
      requestOptions: {},
      transforms: [f, c, t],
      makeBodyFn({ message: i }) {
        return JSON.stringify({
          client: r.client,
          data: i.data,
          date: i.date.getTime(),
          level: i.level,
          scope: i.scope,
          variables: i.variables
        });
      },
      processErrorFn({ error: i }) {
        n.processMessage(
          {
            data: [`electron-log: can't POST ${r.url}`, i],
            level: "warn"
          },
          { transports: ["console", "file"] }
        );
      },
      sendRequestFn({ serverUrl: i, requestOptions: a, body: u }) {
        const m = (i.startsWith("https:") ? h : o).request(i, {
          method: "POST",
          ...a,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": u.length,
            ...a.headers
          }
        });
        return m.write(u), m.end(), m;
      }
    });
    function r(i) {
      if (!r.url)
        return;
      const a = r.makeBodyFn({
        logger: n,
        message: { ...i, data: d({ logger: n, message: i, transport: r }) },
        transport: r
      }), u = r.sendRequestFn({
        serverUrl: r.url,
        requestOptions: r.requestOptions,
        body: Buffer.from(a, "utf8")
      });
      u.on("error", (s) => r.processErrorFn({
        error: s,
        logger: n,
        message: i,
        request: u,
        transport: r
      }));
    }
  }
  return Po;
}
var Io, Lu;
function Tc() {
  if (Lu) return Io;
  Lu = 1;
  const o = Sc(), h = gh(), d = vh(), f = yh(), c = _h(), t = Sh(), e = Ah();
  Io = n;
  function n({ dependencies: r, initializeFn: i }) {
    var u;
    const a = new o({
      dependencies: r,
      errorHandler: new h(),
      eventLogger: new d(),
      initializeFn: i,
      isDev: (u = r.externalApi) == null ? void 0 : u.isDev(),
      logId: "default",
      transportFactories: {
        console: f,
        file: c,
        ipc: t,
        remote: e
      },
      variables: {
        processType: "main"
      }
    });
    return a.default = a, a.Logger = o, a.processInternalErrorFn = (s) => {
      a.transports.console.writeFn({
        message: {
          data: ["Unhandled electron-log error", s],
          level: "error"
        }
      });
    }, a;
  }
  return Io;
}
var No, $u;
function bh() {
  if ($u) return No;
  $u = 1;
  const o = yt, h = ph(), { initialize: d } = mh(), f = Tc(), c = new h({ electron: o }), t = f({
    dependencies: { externalApi: c },
    initializeFn: d
  });
  No = t, c.onIpc("__ELECTRON_LOG__", (n, r) => {
    r.scope && t.Logger.getInstance(r).scope(r.scope);
    const i = new Date(r.date);
    e({
      ...r,
      date: i.getTime() ? i : /* @__PURE__ */ new Date()
    });
  }), c.onIpcInvoke("__ELECTRON_LOG__", (n, { cmd: r = "", logId: i }) => {
    switch (r) {
      case "getOptions":
        return {
          levels: t.Logger.getInstance({ logId: i }).levels,
          logId: i
        };
      default:
        return e({ data: [`Unknown cmd '${r}'`], level: "error" }), {};
    }
  });
  function e(n) {
    var r;
    (r = t.Logger.getInstance(n)) == null || r.processMessage(n);
  }
  return No;
}
var Fo, Uu;
function Rh() {
  if (Uu) return Fo;
  Uu = 1;
  const o = Ac(), h = Tc(), d = new o();
  return Fo = h({
    dependencies: { externalApi: d }
  }), Fo;
}
var ku;
function Th() {
  if (ku) return vr.exports;
  ku = 1;
  const o = typeof process > "u" || process.type === "renderer" || process.type === "worker", h = typeof process == "object" && process.type === "browser";
  return o ? (_c(), vr.exports = dh()) : h ? vr.exports = bh() : vr.exports = Rh(), vr.exports;
}
var Ch = Th();
const tn = /* @__PURE__ */ Hu(Ch);
ah.config();
tn.transports.file.level = "info";
tn.info("Logger initialized");
tt.autoUpdater.logger = tn;
tn.log("AutoUpdater initialized", wr.getVersion());
const Cc = ft.dirname(Of(import.meta.url));
process.env.APP_ROOT = ft.join(Cc, "..");
const Lo = process.env.VITE_DEV_SERVER_URL, vp = ft.join(process.env.APP_ROOT, "dist-electron"), Oc = ft.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Lo ? ft.join(process.env.APP_ROOT, "public") : Oc;
let Ke = null, yr = null;
function Dc() {
  return yr = new xo({
    width: 400,
    height: 300,
    frame: !1,
    transparent: !0,
    alwaysOnTop: !0,
    resizable: !1
  }), yr.loadFile(ft.join(process.env.VITE_PUBLIC, "splash.html")), Ke = new xo({
    show: !1,
    width: 1200,
    height: 800,
    icon: ft.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: ft.join(Cc, "preload.mjs")
    }
  }), Ke.webContents.on("did-finish-load", () => {
    yr == null || yr.close(), Ke == null || Ke.show(), Ke == null || Ke.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), Lo ? Ke.loadURL(Lo) : Ke.loadFile(ft.join(Oc, "index.html")), Ke;
}
wr.whenReady().then(() => {
  const o = Dc();
  tt.autoUpdater.autoDownload = !0, tt.autoUpdater.autoInstallOnAppQuit = !0, tt.autoUpdater.checkForUpdatesAndNotify(), on.handle("check-update", async () => {
    try {
      const h = await tt.autoUpdater.checkForUpdates();
      return (h == null ? void 0 : h.updateInfo) || {};
    } catch (h) {
      return { error: { message: h.message || "Check failed" } };
    }
  }), on.handle("start-download", () => {
    tt.autoUpdater.downloadUpdate();
  }), on.handle("quit-and-install", () => {
    tt.autoUpdater.quitAndInstall();
  }), tt.autoUpdater.on("update-available", (h) => {
    o == null || o.webContents.send("update-can-available", h);
  }), tt.autoUpdater.on("download-progress", (h) => {
    o == null || o.webContents.send("download-progress", h);
  }), tt.autoUpdater.on("update-downloaded", () => {
    o == null || o.webContents.send("update-downloaded");
  }), tt.autoUpdater.on("error", (h) => {
    o == null || o.webContents.send("update-error", { message: h.message });
  });
});
wr.on("window-all-closed", () => {
  process.platform !== "darwin" && (wr.quit(), Ke = null);
});
wr.on("activate", () => {
  xo.getAllWindows().length === 0 && Dc();
});
console.log(`App root: ${process.env.APP_ROOT}`);
export {
  vp as MAIN_DIST,
  Oc as RENDERER_DIST,
  Lo as VITE_DEV_SERVER_URL
};
