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

function errorAsObject (e) {
  return {
    code: e.code,
    data: e.data,
    message: e.message,
    name: e.name,
    stack: e.stack
  }
}
var status = 'init';
var persistent = false;
var exitOnError = true;
process.on( 'message', function listen( msg ) {
  if (msg.id) {
    process.send( { type: 'receipt', id: msg.id } )
  }
  switch ( msg.type ) {
    case "options":
      var options = msg.options || {}
      if (options) {
        if ('persistent' in options) {
          persistent = options.persistent
          runner.use(require('../runner-plugins/persistent'))
        }
        if ('exitOnError' in options) {
          exitOnError = options.exitOnError
        }
      }
      break;
    case "status":
      process.send( { type: 'status', status: status } )
      break;
    case "plugin":
      if (status !== 'init') {
        var e = new Error('LoadError: not initializing');
        runner.emit( 'error', e )
        return process.send( { type: 'error', error: errorAsObject( e ) } )
      }
      else {
        runner.use( require( msg.file ), msg )
      }
      break
    case "code":
      if (status !== 'init' && status !== 'loading') {
        var e = new Error('LoadError: not initializing');
        runner.emit( 'error', e )
        return process.send( { type: 'error', error: errorAsObject( e ) } )
      }
      else {
        code = msg.code
        status = 'loaded'
      }
      break
    case "run":
      if (status !== 'loaded') {
        var e = new Error('LoadError: LoadError: not in runnable state');
        runner.emit( 'error', e )
        return process.send( { type: 'error', error: errorAsObject( e ) } )
      }
      else {
        status = 'running'
        run()
        //
        // Prevent node's .fork channel from keeping this open
        //
        if (persistent) {
          status = 'loading';
        }
      }
      break
  }
  return runner.emit( 'message', msg );
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

process.on('uncaughtException', function(e) {
  process.send({
    type: 'uncaughtException',
    error: errorAsObject(e)
  })
  if (exitOnError) {
    process.exit(2);
  }
})

// Run code
function run() {
  var context = Script.createContext()
  var safeRunner = Script.runInContext('('+getSafeRunner.toString()+')(this)', context)
  var result
  try {
    result = safeRunner(code, runner.globals, getWrapper(safeRunner))
  }
  catch (e) {
    runner.emit( 'err', e )
    process.send( { type: 'result', error: errorAsObject( e ) } )
    if (exitOnError) {
      process.exit( 1 )
    }
    return
  }
  process.send( { type: 'result', typeof: typeof result, result: result } )
}
