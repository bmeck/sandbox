//
// Generates a script runner that can take a wrapper and
//
function getSafeRunner(global) {
  // Keep it outside of strict mode
  function UserScript(str) {
    // We want a global scoped function that has implicit returns.
    return Function('return eval('+JSON.stringify(str+'')+')')
  }
  // place with a closure that is not exposed thanks to strict mode
  return function run(src, globals, wrapper) {
    // stop argument / caller attacks
    "use strict"
    if (globals) {
      for (var key in globals) {
        global[key] = wrapper.wrap(globals[key])
      }
    }
    var result = UserScript(src)()
    //
    // We need to check if wrapper is not set for when the wrapper is created
    // and allowing it generate a bidirectional wrapper
    //
    // Perhaps making a separate runner would make this cleaner?
    //
    return wrapper && wrapper.unwrap(result) || result;
  }
}

module.exports = getSafeRunner;