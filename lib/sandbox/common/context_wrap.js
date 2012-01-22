//
// Wrap an object for another context...
// Result is not a "live" representation, if you need to sync objects you should rewrap
// DO NOT ADD/UPDATE PROPERTIES ON RESULT ONLY READ AND INVOKE
//
var harmony = require('harmony-collections');

function wrapper(harmony, console) {
  "use strict";
  var Function = harmony.WeakMap.constructor;
  var apply = Function.prototype.call.bind(Function.prototype.apply);
  var cachedError = Error;
  var stringify = JSON.stringify,
    Array = [].constructor,
    parse = JSON.parse,
    indexOf = function (arr, item) {
      
      "use strict";
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === item) return i;
      }
      return -1;
    },
    getOwnPropertyNames = Object.getOwnPropertyNames,
    forEach = function (arr, fn) {
      for (var i = 0; i < arr.length; i++) {
        fn(arr[i], i, arr);
      }
    }
  var comm, cache = new harmony.WeakMap();
  var contextNatives = {
      Array: Array,
      Object: Object,
      Error: Error,
      Date: Date,
      RegExp: RegExp
    }
  comm = {
    natives: contextNatives,
    unwrap: function ( ) { },
    wrap: function wrap(o, visited) {
      "use strict";
      if (o && cache.has(o)) {
        return cache.get(o);
      }
      var finalResult;
      visited = visited || {};
      visited.source = visited.source || [];
      visited.callbacks = visited.callbacks || [];
      visited.result = visited.result || {};
      if (typeof o === 'function' || typeof o === 'object') {
        if (!o) {
          return null;
        }
        if (o === comm.natives.Array) {
          return contextNatives.Array
        }
        if (o === comm.natives.Date) {
          return contextNatives.Date
        }
        if (o === comm.natives.Error) {
          return contextNatives.Error
        }
        if (o === comm.natives.Object) {
          return contextNatives.Object
        }
        if (o === comm.natives.RegExp) {
          return contextNatives.RegExp
        }
        var cacheIndex = visited.source.indexOf(o)
        if (cacheIndex !== -1) {
          if (visited.result[cacheIndex]) {
            return visited.result[cacheIndex]
          }
          else {
            //
            // MISSING, SHOULD ONLY HAPPEN IN CIRCULAR STRUCTURES
            //
            return undefined
          }
        }
        else {
          cacheIndex = visited.source.length
          visited.source[cacheIndex] = o
        }
        var skip = [];
        skip.push('__lookupGetter__','__lookupSetter__','__defineGetter__','__defineSetter__','__proto__', 'toString');
        if (o instanceof comm.natives.RegExp) {
          skip.push('length', 'constructor')
          result = new RegExp(o.source, (o.multiline ? 'm' : '') + (o.global ? 'g' : '') + (o.ignoreCase ? 'i' : ''))
          skip.push('source', 'global', 'multiline', 'ignoreCase')
        }
        else if (typeof o === 'function') {
          skip.push('constructor', 'name', 'arguments', 'caller', 'callee', 'length');
          var result = function fn() {
          "use strict";
            var args = [];
            var visited = {};

            for (var i = 0; i < arguments.length; i++) {
              args[i] = comm.unwrap(arguments[i], visited);
            }
            try {
              var result = apply(o, comm.unwrap(this, visited), args);
              var end = comm.wrap(result)
              return end
            }
            catch (e) {
              var ex = comm.wrap(e)
              throw ex;
            }
          }
          result.prototype = comm.wrap(o.prototype, visited);
          cache.set(result, o);
        }
        else {
          if (o instanceof comm.natives.Array) {
            var result = new Array(o.length)
            skip.push('length', 'constructor')
          }
          else if (o instanceof comm.natives.Date) {
            skip.push('length', 'constructor')
            result = new Date(+o)
          }
          else if (o instanceof comm.natives.Error) { 
            skip.push('length', 'constructor')
            var result = new Error(o.message);
            result.stack = comm.wrap(o.stack, visited)
            result.name = comm.wrap(o.name, visited)
            skip.push('stack', 'name')
          }
          else {
            result = {};
            if (o.__proto__ !== comm.natives.Object.prototype) {
              result.__proto__ = wrap(o.__proto__, visited);
            }
            else {
              skip.push('constructor')
            }
          }
        }
        forEach(getOwnPropertyNames(o), function (key) {
          if (skip.indexOf(key) !== -1) return;

          var item = o[key],
            index = indexOf(visited.source, item)
          
          
          if (index !== -1) {
            if (visited.result[index]) {
              result[key] = visited.result[index];
            }
            else {
              var cbs = visited.callbacks[index] || (visited.callbacks[index] = []);
              cbs[cbs.length] = (function () {
                result[key] = visited.result[index];
              });
            }
          }
          else {
            result[key] = wrap(o[key], visited);
          }
        })
        if (cacheIndex !== -1) {
          visited.result[cacheIndex] = result
          var callbacks = visited.callbacks[cacheIndex];
          if (callbacks) {
            for (var i = 0; i < callbacks.length; i++) {
              callbacks[i]();
            }
          }
        }
        return result;
      }
      else if (typeof o === 'number') {
        return parse(stringify(o));
      }
      else if (typeof o === 'boolean') {
        return parse(stringify(o));
      }
      else if (typeof o === 'string') {
        return parse(stringify(o));
      }
      return undefined;
    }
  }
  return comm;
};

//
// Utility to combine a duplex wrapper
//
function getWrapper(runner) {
  var runnerFn = runner('('+wrapper.toString()+')');
  var outer_wrap = wrapper(harmony, console);
  var runner_wrap = runnerFn(harmony, console);
  var tmp = outer_wrap.natives;
  outer_wrap.natives = runner_wrap.natives;
  runner_wrap.natives = tmp;
  runner_wrap.wrap.x = 1;
  outer_wrap.wrap.x = 2;
  outer_wrap.unwrap = runner_wrap.wrap;
  runner_wrap.unwrap = outer_wrap.wrap;
  return runner_wrap;
}
module.exports = getWrapper;