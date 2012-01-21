var rlimit = require('../../rlimit.node');
exports.name = 'persistent';
exports.attach = function attach ( ) {
  rlimit.ref();
  this.globals.exit = function (code) { process.exit(code) }
}

exports.init = function init ( done ) {
  done();
}