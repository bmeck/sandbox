exports.name = 'persistent';
exports.attach = function attach ( ) {
  this.globals.exit = function (code) { process.exit(code) }
}

exports.init = function init ( done ) {
  done();
}