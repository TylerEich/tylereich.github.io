// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
const setTimeoutFunc = setTimeout;

function noop() {}

// Use polyfill for setImmediate for performance gains
let asap = (typeof setImmediate === "function" && setImmediate) ||
  function(fn) { setTimeoutFunc(fn, 1); };

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}

const isArray = Array.isArray || ( (value) => Object.prototype.toString.call(value) === "[object Array]" );

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  asap(function() {
    const cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    let ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try { // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self) throw new TypeError("A promise cannot be resolved with itself.");
    if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
      const then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === "function") {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) { reject(self, e); }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  for ( const deferred of self._deferreds ) {
    handle(self, deferred);
  }
  self._deferreds = null;
}

function Handler( onFulfilled, onRejected, promise ) {
  this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
  this.onRejected = typeof onRejected === "function" ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  let done = false;
  try {
    fn(function (value) {
      if (done) return;
      done = true;
      resolve(self, value);
    }, function (reason) {
      if (done) return;
      done = true;
      reject(self, reason);
    });
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}


export class Promise {
  private _state: Number;
  private _value: any;
  private _deferreds: any[];

  constructor(fn) {
    if (typeof this !== "object") throw new TypeError("Promises must be constructed via new");
    if (typeof fn !== "function") throw new TypeError("not a function");
    this._state = 0;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  then(onFulfilled, onRejected = undefined) {
    const prom = new Promise(noop);
    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  }

  static all() {
    const args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      let remaining = args.length;
      function res(i, val) {
        try {
          if (val && (typeof val === "object" || typeof val === "function")) {
            const then = val.then;
            if (typeof then === "function") {
              then.call(val, function (val) { res(i, val); }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }
      for ( let i = 0; i < args.length; i++ ) {
        res(i, args[i]);
      }
    });
  }

  static resolve(value) {
    if (value && typeof value === "object" && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  }

  static reject(value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  }

  static race(values) {
    return new Promise(function (resolve, reject) {
      for (const value of values) {
        value.then(resolve, reject);
      }
    });
  }

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @private
   */
  static _setImmediateFn(fn) {
    asap = fn;
  }
}
