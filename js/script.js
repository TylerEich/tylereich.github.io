System.register("promise", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var setTimeoutFunc, asap, isArray, Promise;
    function noop() { }
    function bind(fn, thisArg) {
        return function () {
            fn.apply(thisArg, arguments);
        };
    }
    function handle(self, deferred) {
        while (self._state === 3) {
            self = self._value;
        }
        if (self._state === 0) {
            self._deferreds.push(deferred);
            return;
        }
        asap(function () {
            var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
            if (cb === null) {
                (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
                return;
            }
            var ret;
            try {
                ret = cb(self._value);
            }
            catch (e) {
                reject(deferred.promise, e);
                return;
            }
            resolve(deferred.promise, ret);
        });
    }
    function resolve(self, newValue) {
        try {
            if (newValue === self)
                throw new TypeError("A promise cannot be resolved with itself.");
            if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
                var then = newValue.then;
                if (newValue instanceof Promise) {
                    self._state = 3;
                    self._value = newValue;
                    finale(self);
                    return;
                }
                else if (typeof then === "function") {
                    doResolve(bind(then, newValue), self);
                    return;
                }
            }
            self._state = 1;
            self._value = newValue;
            finale(self);
        }
        catch (e) {
            reject(self, e);
        }
    }
    function reject(self, newValue) {
        self._state = 2;
        self._value = newValue;
        finale(self);
    }
    function finale(self) {
        for (var _i = 0, _a = self._deferreds; _i < _a.length; _i++) {
            var deferred = _a[_i];
            handle(self, deferred);
        }
        self._deferreds = null;
    }
    function Handler(onFulfilled, onRejected, promise) {
        this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
        this.onRejected = typeof onRejected === "function" ? onRejected : null;
        this.promise = promise;
    }
    function doResolve(fn, self) {
        var done = false;
        try {
            fn(function (value) {
                if (done)
                    return;
                done = true;
                resolve(self, value);
            }, function (reason) {
                if (done)
                    return;
                done = true;
                reject(self, reason);
            });
        }
        catch (ex) {
            if (done)
                return;
            done = true;
            reject(self, ex);
        }
    }
    return {
        setters:[],
        execute: function() {
            setTimeoutFunc = setTimeout;
            asap = (typeof setImmediate === "function" && setImmediate) ||
                function (fn) { setTimeoutFunc(fn, 1); };
            isArray = Array.isArray || (function (value) { return Object.prototype.toString.call(value) === "[object Array]"; });
            Promise = (function () {
                function Promise(fn) {
                    if (typeof this !== "object")
                        throw new TypeError("Promises must be constructed via new");
                    if (typeof fn !== "function")
                        throw new TypeError("not a function");
                    this._state = 0;
                    this._value = undefined;
                    this._deferreds = [];
                    doResolve(fn, this);
                }
                Promise.prototype.catch = function (onRejected) {
                    return this.then(null, onRejected);
                };
                Promise.prototype.then = function (onFulfilled, onRejected) {
                    if (onRejected === void 0) { onRejected = undefined; }
                    var prom = new Promise(noop);
                    handle(this, new Handler(onFulfilled, onRejected, prom));
                    return prom;
                };
                Promise.all = function () {
                    var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);
                    return new Promise(function (resolve, reject) {
                        if (args.length === 0)
                            return resolve([]);
                        var remaining = args.length;
                        function res(i, val) {
                            try {
                                if (val && (typeof val === "object" || typeof val === "function")) {
                                    var then = val.then;
                                    if (typeof then === "function") {
                                        then.call(val, function (val) { res(i, val); }, reject);
                                        return;
                                    }
                                }
                                args[i] = val;
                                if (--remaining === 0) {
                                    resolve(args);
                                }
                            }
                            catch (ex) {
                                reject(ex);
                            }
                        }
                        for (var i = 0; i < args.length; i++) {
                            res(i, args[i]);
                        }
                    });
                };
                Promise.resolve = function (value) {
                    if (value && typeof value === "object" && value.constructor === Promise) {
                        return value;
                    }
                    return new Promise(function (resolve) {
                        resolve(value);
                    });
                };
                Promise.reject = function (value) {
                    return new Promise(function (resolve, reject) {
                        reject(value);
                    });
                };
                Promise.race = function (values) {
                    return new Promise(function (resolve, reject) {
                        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                            var value = values_1[_i];
                            value.then(resolve, reject);
                        }
                    });
                };
                Promise._setImmediateFn = function (fn) {
                    asap = fn;
                };
                return Promise;
            }());
            exports_1("Promise", Promise);
        }
    }
});
System.register("fastdom", ["promise"], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var promise_1;
    var debug, raf, fastDomPromised, fastdom;
    function FastDom() {
        var self = this;
        self.reads = [];
        self.writes = [];
        self.raf = raf;
        debug("initialized", self);
    }
    function scheduleFlush(fastdom) {
        if (!fastdom.scheduled) {
            fastdom.scheduled = true;
            fastdom.raf(flush.bind(null, fastdom));
            debug("flush scheduled");
        }
    }
    function flush(fastdom) {
        debug("flush");
        var writes = fastdom.writes;
        var reads = fastdom.reads;
        var error;
        try {
            debug("flushing reads", reads.length);
            runTasks(reads);
            debug("flushing writes", writes.length);
            runTasks(writes);
        }
        catch (e) {
            error = e;
        }
        fastdom.scheduled = false;
        if (reads.length || writes.length)
            scheduleFlush(fastdom);
        if (error) {
            debug("task errored", error.message);
            if (fastdom.catch)
                fastdom.catch(error);
            else
                throw error;
        }
    }
    function runTasks(tasks) {
        debug("run tasks");
        var task;
        while (task = tasks.shift())
            task.fn.call(task.ctx);
    }
    function remove(array, item) {
        var index = array.indexOf(item);
        return !!~index && !!array.splice(index, 1);
    }
    function mixin(target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key))
                target[key] = source[key];
        }
    }
    function create(promised, type, fn, ctx) {
        var tasks = promised._tasks;
        var fastdom = promised.fastdom;
        var task;
        var promise = new promise_1.Promise(function (resolve, reject) {
            task = fastdom[type](function () {
                tasks.delete(promise);
                try {
                    resolve(ctx ? fn.call(ctx) : fn());
                }
                catch (e) {
                    reject(e);
                }
            }, ctx);
        });
        tasks.set(promise, task);
        return promise;
    }
    return {
        setters:[
            function (promise_1_1) {
                promise_1 = promise_1_1;
            }],
        execute: function() {
            debug = 0 ? console.log.bind(console, "[fastdom]") : function () { };
            raf = (window.requestAnimationFrame
                || function (cb) { return setTimeout(cb, 16); }).bind(window);
            FastDom.prototype = {
                constructor: FastDom,
                measure: function (fn, ctx) {
                    debug("measure");
                    var task = { fn: fn, ctx: ctx };
                    this.reads.push(task);
                    scheduleFlush(this);
                    return task;
                },
                mutate: function (fn, ctx) {
                    debug("mutate");
                    var task = { fn: fn, ctx: ctx };
                    this.writes.push(task);
                    scheduleFlush(this);
                    return task;
                },
                clear: function (task) {
                    debug("clear", task);
                    return remove(this.reads, task) || remove(this.writes, task);
                },
                extend: function (props) {
                    debug("extend", props);
                    if (typeof props !== "object")
                        throw new Error("expected object");
                    var child = Object.create(this);
                    mixin(child, props);
                    child.fastdom = this;
                    if (child.initialize)
                        child.initialize();
                    return child;
                },
                catch: null
            };
            fastDomPromised = {
                initialize: function () {
                    this._tasks = new Map();
                },
                mutate: function (fn, ctx) {
                    return create(this, "mutate", fn, ctx);
                },
                measure: function (fn, ctx) {
                    return create(this, "measure", fn, ctx);
                }
            };
            exports_2("fastdom", fastdom = (new FastDom()));
        }
    }
});
System.register("utils", ["promise"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var promise_2;
    function bind(fn) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return fn.bind.apply(fn, [null].concat(args));
    }
    exports_3("bind", bind);
    function wait(ms) {
        return new promise_2.Promise(function (resolve, reject) { return void setTimeout(resolve, ms); });
    }
    exports_3("wait", wait);
    function raf() {
        return new promise_2.Promise(function (resolve, reject) { return void requestAnimationFrame(resolve); });
    }
    exports_3("raf", raf);
    function makeArray(list) {
        if (list.length === undefined)
            return [list];
        return [].slice.call(list);
    }
    exports_3("makeArray", makeArray);
    function listenOnce(node, type, callback) {
        node.addEventListener(type, function (e) {
            e.target.removeEventListener(e.type, arguments.callee);
            return callback(e);
        });
    }
    exports_3("listenOnce", listenOnce);
    return {
        setters:[
            function (promise_2_1) {
                promise_2 = promise_2_1;
            }],
        execute: function() {
        }
    }
});
System.register("elements", ["fastdom", "utils"], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var fastdom_1, utils_1;
    function isVisible(element) {
        var rect = element.getBoundingClientRect();
        return rect.top <= window.innerHeight &&
            rect.bottom >= 0;
    }
    exports_4("isVisible", isVisible);
    function isActive(element) {
        var rect = element.getBoundingClientRect();
        var height = document.body.scrollHeight;
        var pos = document.body.scrollTop;
        var midway = pos / height * window.innerHeight;
        return rect.top <= midway && rect.bottom >= midway;
    }
    exports_4("isActive", isActive);
    function setClassOnNodes(className, include, nodes, delay) {
        if (delay === void 0) { delay = 0; }
        nodes = utils_1.makeArray(nodes);
        var promise = nodes.reduce(function (promise, node) {
            var nextPromise = promise.then(function () { return utils_1.wait(delay); })
                .then(function () { return fastdom_1.fastdom.mutate(function () {
                if (include) {
                    node.classList.add(className);
                }
                else {
                    node.classList.remove(className);
                }
            }); });
            return nextPromise;
        }, utils_1.wait(0));
        return promise;
    }
    exports_4("setClassOnNodes", setClassOnNodes);
    function addClassToNodes(className, nodes, delay) {
        if (delay === void 0) { delay = 0; }
        return setClassOnNodes(className, true, nodes, delay);
    }
    exports_4("addClassToNodes", addClassToNodes);
    function removeClassFromNodes(className, nodes, delay) {
        if (delay === void 0) { delay = 0; }
        return setClassOnNodes(className, false, nodes, delay);
    }
    exports_4("removeClassFromNodes", removeClassFromNodes);
    return {
        setters:[
            function (fastdom_1_1) {
                fastdom_1 = fastdom_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
        }
    }
});
System.register("animation", ["fastdom", "utils", "elements"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var fastdom_2, utils_2, elements_1;
    var KEYSTROKE_DELAY;
    function enterItems(items) {
        return fastdom_2.fastdom.measure(function () {
            var visible = items.filter(elements_1.isVisible);
            var invisible = items.filter(function (item) {
                return !elements_1.isVisible(item);
            });
            items.splice(0, Number.MAX_VALUE);
            items.splice.apply(items, [0, 0].concat(invisible));
            return visible.reduce(function (promise, item) {
                return promise.then(function () { return elements_1.addClassToNodes("enter", item, 100); });
            }, utils_2.wait(0));
        });
    }
    exports_5("enterItems", enterItems);
    function animatePageLanding() {
        function typeChar(char, element) {
            element.textContent += char;
        }
        function typeString(textString, element) {
            var chars = textString.split("");
            var promise = chars.reduce(function (promise, char) {
                var delay = KEYSTROKE_DELAY + Math.random() * KEYSTROKE_DELAY / 3;
                var nextPromise = promise.then(function () { return utils_2.wait(delay); })
                    .then(function () { return fastdom_2.fastdom.mutate(function () { return typeChar(char, element); }); });
                return nextPromise;
            }, utils_2.wait(0));
            return promise;
        }
        var hello = document.querySelector("#hello-world");
        var promise = utils_2.wait(500)
            .then(function () { return typeString("Hello world", hello); })
            .then(function () { return utils_2.wait(750); })
            .then(function () {
            var tyler = document.querySelector("#tyler-eich");
            fastdom_2.fastdom.mutate(function () { return tyler.classList.remove("hide"); });
        })
            .then(function () { return utils_2.wait(750); })
            .then(function () {
            var header = document.querySelector("header");
            fastdom_2.fastdom.mutate(function () { return header.classList.remove("hide"); });
        });
        return promise;
    }
    exports_5("animatePageLanding", animatePageLanding);
    function leanToward(node, coords) {
        var translate = node.style.transform;
        var matches = translate.match(/(-?\d+\.?\d*)px, (-?\d+\.?\d*)px/);
        var translatedX = 0;
        var translatedY = 0;
        if (matches) {
            translatedX = Number(matches[1]);
            translatedY = Number(matches[2]);
        }
        var bounds = node.getBoundingClientRect();
        var top = bounds.top - translatedY;
        var bottom = bounds.bottom - translatedY;
        var left = bounds.left - translatedX;
        var right = bounds.right - translatedX;
        var dx = coords.x - (left + right) / 2;
        var dy = coords.y - (top + bottom) / 2;
        if (dx > 0) {
            dx = Math.pow(dx, 0.5) / 10;
        }
        else {
            dx = -Math.pow(-dx, 0.5) / 10;
        }
        if (dy > 0) {
            dy = Math.pow(dy, 0.5) / 10;
        }
        else {
            dy = -Math.pow(-dy, 0.5) / 10;
        }
        var pos = {
            x: dx * Math.log(bounds.width),
            y: dy * Math.log(bounds.height)
        };
        fastdom_2.fastdom.mutate(function () { return node.style.transform = "translate(" + pos.x + "px," + pos.y + "px)"; });
    }
    function parallax(coords) {
        var nodes = utils_2.makeArray(document.querySelectorAll(".parallax"));
        var _loop_1 = function(node) {
            fastdom_2.fastdom.measure(function () {
                if (elements_1.isVisible(node)) {
                    leanToward(node, coords);
                }
            });
        };
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            _loop_1(node);
        }
    }
    exports_5("parallax", parallax);
    function followNav(items) {
        fastdom_2.fastdom.measure(function () {
            var active = items.filter(function (item) {
                return elements_1.isActive(item.section);
            });
            var inactive = items.filter(function (item) {
                return active.indexOf(item) === -1;
            });
            elements_1.removeClassFromNodes("active", inactive.map(function (item) { return item.link; }));
            elements_1.addClassToNodes("active", active.map(function (item) { return item.link; }));
        });
    }
    exports_5("followNav", followNav);
    function slide(start, end, duration, elapsed) {
        var progress = elapsed / duration;
        var multiplier = 0;
        if (progress < 0.5) {
            multiplier = 16 * (Math.pow(progress, 5));
        }
        else {
            multiplier = 1 + 16 * (Math.pow((progress - 1), 5));
        }
        var scrollPos = multiplier * (end - start) + start;
        window.scrollTo(0, scrollPos);
    }
    function slideToItem(item) {
        var start = window.scrollY;
        var docHeight = document.body.scrollHeight;
        var winHeight = window.innerHeight;
        var _a = item.getBoundingClientRect(), top = _a.top, bottom = _a.bottom;
        var maxScroll = docHeight - winHeight;
        var elTop = top + start;
        var end = Math.min(maxScroll, elTop);
        var timestamp = performance.now();
        var stop = false;
        var rafCallback = function (now) {
            if (stop) {
                return;
            }
            slide(start, end, 750, now - timestamp);
            if (now - timestamp <= 750) {
                requestAnimationFrame(rafCallback);
            }
        };
        requestAnimationFrame(rafCallback);
        window.addEventListener("scroll", function () {
            void 0;
        });
    }
    exports_5("slideToItem", slideToItem);
    return {
        setters:[
            function (fastdom_2_1) {
                fastdom_2 = fastdom_2_1;
            },
            function (utils_2_1) {
                utils_2 = utils_2_1;
            },
            function (elements_1_1) {
                elements_1 = elements_1_1;
            }],
        execute: function() {
            KEYSTROKE_DELAY = 100;
        }
    }
});
System.register("script", ["utils", "elements", "animation"], function(exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var utils_3, elements_2, animation_1;
    function setTouchClass() {
        var noTouch = !("ontouchstart" in window);
        var noTouchNodes = document.querySelectorAll(".no-touch");
        elements_2.setClassOnNodes("no-touch", noTouch, noTouchNodes, 0);
    }
    function init() {
        animation_1.animatePageLanding();
        setTouchClass();
        var animateItems = utils_3.makeArray(document.querySelectorAll(".animate"));
        var navItems = utils_3.makeArray(document.querySelectorAll(".link"))
            .map(function (node) {
            var selector = node.getAttribute("href");
            var section = document.querySelector(selector);
            return {
                link: node,
                href: selector,
                section: section
            };
        });
        navItems.forEach(function (item) {
            item.link.addEventListener("click", function (e) {
                if (window.location.hash === item.href) {
                    window.location.hash = "";
                    window.location.href = item.href;
                }
                animation_1.slideToItem(item.section);
            });
        });
        var animationIsTicking = false;
        var coords = {};
        var boundEnterItems = utils_3.bind(animation_1.enterItems, animateItems);
        var boundFollowNav = utils_3.bind(animation_1.followNav, navItems);
        function update() {
            boundEnterItems();
            boundFollowNav();
            animation_1.parallax(coords);
            animationIsTicking = false;
        }
        function requestTick() {
            if (!animationIsTicking) {
                requestAnimationFrame(update);
                animationIsTicking = true;
            }
        }
        requestTick();
        window.addEventListener("load", requestTick);
        window.addEventListener("scroll", requestTick);
        window.addEventListener("resize", requestTick);
        var desktop = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i);
        if (!desktop) {
            coords = {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            };
            window.addEventListener("resize", function () {
                coords = {
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2
                };
                requestTick();
            });
        }
        else {
            window.addEventListener("mousemove", function (e) {
                var x = e.screenX;
                var y = e.screenY;
                coords = { x: x, y: y };
                requestTick();
            });
        }
        window.addEventListener("resize", requestTick);
    }
    return {
        setters:[
            function (utils_3_1) {
                utils_3 = utils_3_1;
            },
            function (elements_2_1) {
                elements_2 = elements_2_1;
            },
            function (animation_1_1) {
                animation_1 = animation_1_1;
            }],
        execute: function() {
            if (document.readyState !== "loading") {
                init();
            }
            else {
                window.addEventListener("DOMContentLoaded", init);
            }
        }
    }
});
//# sourceMappingURL=script.js.map