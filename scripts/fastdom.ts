import { Promise } from "./promise";

/**
 * FastDom
 *
 * Eliminates layout thrashing
 * by batching DOM read/write
 * interactions.
 *
 * @author Wilson Page <wilsonpage@me.com>
 * @author Kornel Lesinski <kornel.lesinski@ft.com>
 */

/**
 * Mini logger
 *
 * @return {Function}
 */
const debug = 0 ? console.log.bind(console, "[fastdom]") : function() {};

/**
 * Normalized rAF
 *
 * @type {Function}
 */
const raf = (window.requestAnimationFrame
  || function(cb) { return setTimeout(cb, 16); }).bind( window );

/**
 * Initialize a `FastDom`.
 *
 * @constructor
 */
function FastDom() {
  const self = this;
  self.reads = [];
  self.writes = [];
  self.raf = raf;
  debug("initialized", self);
}

FastDom.prototype = {
  constructor: FastDom,

  /**
   * Adds a job to the read batch and
   * schedules a new frame if need be.
   *
   * @param  {Function} fn
   * @public
   */
  measure: function(fn, ctx) {
    debug("measure");
    const task = { fn: fn, ctx: ctx };
    this.reads.push(task);
    scheduleFlush(this);
    return task;
  },

  /**
   * Adds a job to the
   * write batch and schedules
   * a new frame if need be.
   *
   * @param  {Function} fn
   * @public
   */
  mutate: function(fn, ctx) {
    debug("mutate");
    const task = { fn: fn, ctx: ctx };
    this.writes.push(task);
    scheduleFlush(this);
    return task;
  },

  /**
   * Clears a scheduled "read" or "write" task.
   *
   * @param {Object} task
   * @return {Boolean} success
   * @public
   */
  clear: function(task) {
    debug("clear", task);
    return remove(this.reads, task) || remove(this.writes, task);
  },

  /**
   * Extend this FastDom with some
   * custom functionality.
   *
   * Because fastdom must *always* be a
   * singleton, we"re actually extending
   * the fastdom instance. This means tasks
   * scheduled by an extension still enter
   * fastdom"s global task queue.
   *
   * The "super" instance can be accessed
   * from `this.fastdom`.
   *
   * @example
   *
   * const myFastdom = fastdom.extend({
   *   initialize: function() {
   *     // runs on creation
   *   },
   *
   *   // override a method
   *   measure: function(fn) {
   *     // do extra stuff ...
   *
   *     // then call the original
   *     return this.fastdom.measure(fn);
   *   },
   *
   *   ...
   * });
   *
   * @param  {Object} props  properties to mixin
   * @return {FastDom}
   */
  extend: function(props) {
    debug("extend", props);
    if (typeof props !== "object") throw new Error("expected object");

    const child = Object.create(this);
    mixin(child, props);
    child.fastdom = this;

    // run optional creation hook
    if (child.initialize) child.initialize();

    return child;
  },

  // override this with a function
  // to prevent Errors in console
  // when tasks throw
  catch: null
};

/**
 * Schedules a new read/write
 * batch if one isn"t pending.
 *
 * @private
 */
function scheduleFlush(fastdom) {
  if (!fastdom.scheduled) {
    fastdom.scheduled = true;
    fastdom.raf(flush.bind(null, fastdom));
    debug("flush scheduled");
  }
}

/**
 * Runs queued `read` and `write` tasks.
 *
 * Errors are caught and thrown by default.
 * If a `.catch` function has been defined
 * it is called instead.
 *
 * @private
 */
function flush(fastdom) {
  debug("flush");

  const writes = fastdom.writes;
  const reads = fastdom.reads;
  let error;

  try {
    debug("flushing reads", reads.length);
    runTasks(reads);
    debug("flushing writes", writes.length);
    runTasks(writes);
  } catch (e) { error = e; }

  fastdom.scheduled = false;

  // If the batch errored we may still have tasks queued
  if (reads.length || writes.length) scheduleFlush(fastdom);

  if (error) {
    debug("task errored", error.message);
    if (fastdom.catch) fastdom.catch(error);
    else throw error;
  }
}

/**
 * We run this inside a try catch
 * so that if any jobs error, we
 * are able to recover and continue
 * to flush the batch until it"s empty.
 *
 * @private
 */
function runTasks(tasks) {
  debug("run tasks");
  let task; while (task = tasks.shift()) task.fn.call(task.ctx);
}

/**
 * Remove an item from an Array.
 *
 * @param  {Array} array
 * @param  {*} item
 * @return {Boolean}
 */
function remove(array, item) {
  const index = array.indexOf(item);
  return !!~index && !!array.splice(index, 1);
}

/**
 * Mixin own properties of source
 * object into the target.
 *
 * @param  {Object} target
 * @param  {Object} source
 */
function mixin(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) target[key] = source[key];
  }
}


/**
 * Wraps fastdom in a Promise API
 * for improved control-flow.
 *
 * @example
 *
 * // returning a result
 * fastdom.measure(() => el.clientWidth)
 *   .then(result => ...);
 *
 * // returning promises from tasks
 * fastdom.measure(() => {
 *   const w = el1.clientWidth;
 *   return fastdom.mutate(() => el2.style.width = w + 'px');
 * }).then(() => console.log('all done'));
 *
 * // clearing pending tasks
 * const promise = fastdom.measure(...)
 * fastdom.clear(promise);
 *
 * @type {Object}
 */
const fastDomPromised = {
  initialize: function() {
    this._tasks = new Map();
  },

  mutate: function(fn, ctx) {
    return create(this, "mutate", fn, ctx);
  },

  measure: function(fn, ctx) {
    return create(this, "measure", fn, ctx);
  },

  // clear: function(promise) {
  //   const tasks = this._tasks;
  //   const task = tasks.get(promise);
  //   this.fastdom.clear(task);
  //   tasks.delete(task);
  // }
};

/**
 * Create a fastdom task wrapped in
 * a 'cancellable' Promise.
 *
 * @param  {FastDom}  fastdom
 * @param  {String}   type - 'measure'|'muatate'
 * @param  {Function} fn
 * @return {Promise}
 */
function create(promised, type, fn, ctx) {
  const tasks = promised._tasks;
  const fastdom = promised.fastdom;
  let task;

  const promise = new Promise(function(resolve, reject) {
    task = fastdom[type](function() {
      tasks.delete(promise);
      try { resolve(ctx ? fn.call(ctx) : fn()); }
      catch (e) { reject(e); }
    }, ctx);
  });

  tasks.set(promise, task);
  return promise;
}












// There should never be more than
// one instance of `FastDom` in an app
export const fastdom = (new FastDom()); // .extend(fastDomPromised);
