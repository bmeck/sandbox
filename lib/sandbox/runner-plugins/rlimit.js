var rlimit = require( '../../rlimit.node' )

exports.name = 'rlimit';
exports.attach = function attach ( ) {
  this.on( 'parent-message', function (msg) {
    if (msg.type !== 'rlimit') return
    options = msg.options;
    if ( options.timeout ) {
      console.error(options.timeout);
      rlimit.setrlimit( rlimit.RLIMIT_CPU, { rlim_cur: options.timeout / 1000, rlim_max: rlimit.RLIM_INFINITY } )
    }
    if ( options.memory ) {
      rlimit.setrlimit( rlimit.RLIMIT_AS, { rlim_cur: options.memory, rlim_max: options.memory } )
      rlimit.setrlimit( rlimit.RLIMIT_DATA, { rlim_cur: options.memory, rlim_max: options.memory } )
    }
  } );
}

exports.init = function init ( done ) {
  done();
}