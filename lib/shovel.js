// shovel.js - Do the heavy lifting in this sandbox
// Gianni Chiappetta - gf3.ca - 2010

/* ------------------------------ INIT ------------------------------ */
var util = require( 'util' )
  , code
  , result
  , sandbox
  , Script
  , getWrapper = require( './jswrap' )
  , rlimit = require('./rlimit')
  , stdin
console.error(process.argv)
if ( ! ( Script = process.binding( 'evals' ).NodeScript ) )
  if ( ! ( Script = process.binding( 'evals' ).Script ) )
    Script = require( 'vm' );

/* ------------------------------ Sandbox ------------------------------ */

process.on( 'message', function listen( msg ) {
  if (msg.id) {
    process.send( { type: 'receipt', id: msg.id } )
  }
  switch ( msg.type ) {
    case "options":
      var options = msg.options;
      if ( options.timeout ) {
        rlimit.setrlimit( rlimit.RLIMIT_CPU, { rlim_cur: options.timeout, rlim_max: rlimit.RLIM_INFINITY } )
      }
      if ( options.memory ) {
        rlimit.setrlimit( rlimit.RLIMIT_AS, { rlim_cur: options.memory, rlim_max: options.memory } )
        rlimit.setrlimit( rlimit.RLIMIT_DATA, { rlim_cur: options.memory, rlim_max: options.memory } )
        console.log( rlimit.getrlimit( rlimit.RLIMIT_AS ) )
        console.log( rlimit.getrlimit( rlimit.RLIMIT_DATA ) )
      }
      return
    case "code":
      return code = msg.code
    case "run":
      process.removeListener('message', listen)
      return run()
  }
})

// Get code
code = ''

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

var userGlobals = {
  console: {
    log: function () {
      process.send({type: 'stdout', value: [].slice.call(arguments)});
    },
    error: function () {
      process.send({type: 'stderr', value: [].slice.call(arguments)});
    }
  },
  setTimeout: setTimeout,
  setInterval: setInterval
};

// Run code
function run() {
  var context = Script.createContext()
  var safeRunner = Script.runInContext('('+getSafeRunner.toString()+')(this)', context)
  var result
  try {
    result = safeRunner(code, userGlobals, getWrapper(safeRunner))
  }
  catch (e) {
    process.send( { type: 'error', error: e.name + ': ' + e.message } )
    return
  }
  process.send( { type: 'result', result: result } )
  //
  // Prevent node's .fork channel from keeping this open
  //
  rlimit.unref()
  rlimit.unref()
}
