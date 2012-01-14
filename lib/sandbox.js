// sandbox.js - Rudimentary JS sandbox
// Gianni Chiappetta - gf3.ca - 2010

/*------------------------- INIT -------------------------*/
var fs = require( 'fs' )
  , path = require( 'path' )
  , fork = require( 'node-fork' ).fork
/*------------------------- Sandbox -------------------------*/
function Sandbox( options ) {
  options = options || {};
  options.command = options.command || defaults.command;
  options.shovel = options.shovel || defaults.shovel;
  options.timeout = options.timeout || defaults.timeout;
  options.memory = options.memory || defaults.memory;
  var uid = 0;
  this.run = function( code, hollaback ) {
    // Any vars in da house?
    var timer
      , stdout = ''
      , child = fork( options.shovel, [], {arguments: [1]} );

    function route( msg ) {
      switch ( msg.type ) {
        case 'receipt':
          if (unwait(msg.id)) {
             child.send( { type: 'run' } )
          }
          return;
        case 'error':
          return hollaback( new Error( msg.error ), null );
        case 'result':
          return hollaback( false, msg );
      }
    }

    // Listen
    child.on( 'message', route )
    child.on( 'exit', function( code, msg ) {
      child.kill();
      if ( code !== 0 ) {
        hollaback( new Error( 'Process exited due to bad state, code: ' + msg ) )
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
    child.send( { type: 'options', options:
      { timeout: options.timeout / 1000
        , memory: options.memory
      }
      , id: wait()
    } );
    child.send( { type: 'code', code: code, id: wait() } );
  }
}

// Options
var defaults =
  { timeout: 500
  , node: 'node'
  , shovel: path.join( __dirname, 'shovel.js' )
  }

// Info
fs.readFile( path.join( __dirname, '..', 'package.json' ), function( err, data ) {
  if ( err )
    throw err
  else
    Sandbox.info = JSON.parse( data )
})

/*------------------------- Export -------------------------*/
module.exports = Sandbox
