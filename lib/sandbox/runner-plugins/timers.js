exports.name = 'timers';
exports.attach = function attach ( ) {
  this.globals.setTimeout = setTimeout;
  this.globals.clearTimeout = clearTimeout;
  this.globals.setInterval = setInterval;
  this.globals.clearInterval = clearInterval;
}

exports.init = function init ( done ) {
  done();
}