// sandbox.js - Rudimentary JS sandbox
// Gianni Chiappetta - gf3.ca - 2010

/*------------------------- INIT -------------------------*/
var fs = require( 'fs' )
  , path = require( 'path' )
  , fork = require( 'node-fork' ).fork
  , util = require( 'util' )
  , broadway = require( 'broadway' );
  
/*------------------------- Sandbox -------------------------*/

// Options
var defaults =
  { rlimit: {timeout: 500}
  , node: 'node'
  , shovel: path.join( __dirname, 'sandbox/core/runner.js' )
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
      
    this.emit( 'child', child );

    function route( msg ) {
      self.emit( 'child-message', msg, child )
      switch ( msg.type ) {
        case 'receipt':
          if (unwait(msg.id)) {
             child.send( { type: 'run' } )
          }
          return undefined;
        case 'result':
          if (msg.error) {
            return callback( msg.error, null );
          }
          else {
            return callback( false, msg );
          }
      }
      return undefined;
    }

    // Listen
    child.on( 'message', route )
    child.on( 'exit', function( code, msg ) {
      child.kill();
      if ( code !== 0 ) {
        callback( new Error( 'Process exited due to bad state, code: ' + msg ) )
      }
    })
    
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
    child.send( { type: 'rlimit'
      , options: this.config.get('rlimit')
      , id: wait()
    } );
    child.send( { type: 'code', code: code, id: wait() } );
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
