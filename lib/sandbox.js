// sandbox.js - Rudimentary JS sandbox
// Gianni Chiappetta - gf3.ca - 2010

/*------------------------- INIT -------------------------*/
var fs = require( 'fs' )
  , path = require( 'path' )
  , fork = require( 'node-fork' ).fork
  , util = require( 'util' )
  , broadway = require( 'broadway' );
  
/*------------------------- Sandbox -------------------------*/

function errorAsObject (e) {
  return {
    code: e.code,
    data: e.data,
    message: e.message,
    name: e.name,
    stack: e.stack
  }
}
// Options
var defaults =
  { rlimit: {timeout: 500}
  , node: 'node'
  , shovel: path.join( __dirname, 'sandbox/core/runner.js' )
  , options: {
    exitOnError: true
    }
  }

function Sandbox( options ) {
  broadway.App.call( this, options );
  var self = this;
  this.config.defaults(defaults);
  var uid = 0;
  this.run = function( code, callback ) {
    // Any vars in da house?
    var timer
      , stdout = ''
      , child = fork( this.config.get('shovel'), [], {arguments: [1]} );
    
    child.run = function (code, cb) {
      if (cb) callback = cb;
      child.send( { type: 'code', code: code, id: wait() } );
    };
    this.emit( 'child', child );

    var log = [];
    function appendLog(msg) {
      if (msg.type === 'stdout') {
        log.push.apply(log, msg.value);
      }
    }
    child.on('message', appendLog)
    var hadResult = false;
    function route( msg ) {
      child.emit( msg.type, msg )
      switch ( msg.type ) {
        case 'receipt':
          if (unwait(msg.id)) {
            hadResult = false;
            child.send( { type: 'run' } )
          }
          return undefined;
        case 'result':
          hadResult = true;
          child.removeListener( 'message', appendLog )
          msg.console = log;
          log = null;
          self.emit ( 'result', msg.error, msg )
          if (msg.error) {
            child.kill();
            return callback && callback.call( child, msg.error, msg );
          }
          else {
            return callback && callback.call( child, false, msg );
          }
      }
      return undefined;
    }
    
    function onExit( code, msg ) {
      child.kill();
      if ( !hadResult && code !== 0 ) {
        var error = new Error( msg );
        error.code = code;
        self.emit ( 'result', error, msg )
        callback && callback.call( child, error , errorAsObject(error) )
      }
    }

    // Listen
    child.on( 'message', route )
    child.on( 'exit', onExit)
    
    // Go
    var waitCount = 0;
    var waiting = {};
    function wait() {
      waitCount++;
      return ++uid;
    }
    function unwait(id) {
      return --waitCount === 0;
    }
    child.send( { type: 'options', options: this.config.get('options'), id: wait() } )
    child.send( { type: 'rlimit'
      , options: this.config.get('rlimit')
      , id: wait()
    } );
    child.run(code)
    return child
  }
}
util.inherits(Sandbox, broadway.App);

/*------------------------- Plugins ------------------------*/

var plugins = fs.readdirSync(path.join(__dirname, 'sandbox', 'sandbox-plugins'));
plugins.forEach(function (file) {
  var key = file.replace(/\..*$/, '')
  var module = path.join(__dirname, 'sandbox', 'sandbox-plugins', file)
  Object.defineProperty(Sandbox, key, {
    get: function () {
      return require(module);
    }
  })
});

/*------------------------- Export -------------------------*/
module.exports = Sandbox
