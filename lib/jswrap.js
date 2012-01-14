//
// Wrap an object for another context...
// Will not wrap functions given to parent from sandbox
// Will not crawl prototypes, be explicit
// Result is not a "live" representation, if you need to sync objects you should rewrap
// DO NOT ADD/UPDATE PROPERTIES ON RESULT ONLY READ AND INVOKE
//
var harmony = require('harmony-collections')
function wrapper(harmony) {
  "use strict";
  var stringify = JSON.stringify,
    parse = JSON.parse,
    isArray = Array.isArray,
    indexOf = function (arr, item) {
      "use strict";
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === item) return i;
      }
      return -1;
    }
  var Function = harmony.WeakMap.constructor;
  var apply = Function.prototype.call.bind(Function.prototype.apply);
  var comm, cache = new harmony.WeakMap();
  comm = {
    unwrap: function ( ) { },
    wrap: function wrap(o, visited) {
      "use strict";
      if (cache.has(o)) {
        return cache.get(o);
      }
      var finalResult;
      visited = visited || {};
      visited.source = visited.source || [];
      visited.callbacks = visited.callbacks || [];
      visited.result = visited.result || {};
      if (typeof o === 'function') {
        var result = function fn() {
        "use strict";
          var args = [];
          for (var i = 0; i < arguments.length; i++) {
            args[i] = comm.unwrap(arguments[i]);
          }
          return comm.unwrap(apply(o, null, args));
        }
        cache.set(o, result);
        return result;
      }
      else if (typeof o === 'object') {
        if (!o) {
          return null;
        }
        else {
          var result = isArray(o) ? [] : {};
          for(var key in o) {
            ;(function (key) {
              var item = o[key],
                index = indexOf(visited.source, item);
              if (index !== -1) {
                if (index in visited.result) {
                  result[key] = visited.result[index];
                }
                else {
                  var cbs = visited.callbacks[index] || (visited.callbacks[index] = []);
                  cbs[cbs.length] = (function () {
                  if(typeof console != 'undefined') console.log(index)
                    result[key] = visited.result[index];
                  });
                }
              }
              else {
                var index = visited.source.length;
                visited.source[index] = o[key];
                result[key] = wrap(o[key], visited);
                visited.result[index] = result[key];
                var callbacks = visited.callbacks[index];
                if (callbacks) {
                  for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i]();
                  }
                }
              }
            })(key);
          };
          return result;
        }
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
  var outer_wrap = wrapper(harmony);
  var runner_wrap = runnerFn(harmony);
  outer_wrap.unwrap = runner_wrap.wrap;
  runner_wrap.unwrap = outer_wrap.wrap;
  return runner_wrap;
}
module.exports = getWrapper;