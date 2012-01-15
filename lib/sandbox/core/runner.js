// shovel.js - Do the heavy lifting in this sandbox
// Gianni Chiappetta - gf3.ca - 2010

/* ------------------------------ INIT ------------------------------ */
var code
  , result
  , Script
  , getWrapper = require( '../common/context_wrap.js' )
  , rlimit = require('../../rlimit.node' )
  , getSafeRunner = require( '../common/safe_runner.js' )
  , Script = require( 'vm' )
  , runner = new (require('broadway')).App()

runner.use(require('../runner-plugins/rlimit.js'))

/* ------------------------------ Sandbox ------------------------------ */

var status = 'init';
process.on( 'message', function listen( msg ) {
  if (msg.id) {
    process.send( { type: 'receipt', id: msg.id } )
  }
  switch ( msg.type ) {
    case "status":
      process.send( { type: 'status', status: status } )
      break;
    case "plugin":
      if (status !== 'init') {
        return process.send( { type: 'error', error: 'LoadError: not initializing' } )
      }
      else {
        runner.use( require( msg.file ), msg )
      }
      break
    case "code":
      if (status !== 'init') {
        return process.send( { type: 'error', error: 'LoadError: not initializing' } )
      }
      else {
        code = msg.code
        status = 'loaded'
      }
      break
    case "run":
      if (status !== 'loaded') {
        return process.send( { type: 'error', error: 'LoadError: not in runnable state' } )
      }
      else {
        status = 'running'
        run()
      }
      break
  }
  return runner.emit( msg.type, msg );
})

runner.globals = {
  console: {
    log: function () {
      process.send({type: 'stdout', value: [].slice.call(arguments)})
    },
    error: function () {
      process.send({type: 'stderr', value: [].slice.call(arguments)})
    }
  }
};

runner.globals.print = runner.globals.console.log;

// Run code
function run() {
  var context = Script.createContext()
  var safeRunner = Script.runInContext('('+getSafeRunner.toString()+')(this)', context)
  var result
  try {
    result = safeRunner(code, runner.globals, getWrapper(safeRunner))
  }
  catch (e) {
    process.send( { type: 'result', error: e.name + ': ' + e.message } )
    return
  }
  process.send( { type: 'result', result: result } )
  //
  // Prevent node's .fork channel from keeping this open
  //
  rlimit.unref()
  rlimit.unref()
}
