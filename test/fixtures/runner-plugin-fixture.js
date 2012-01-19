exports.attach = function attach ( ) {
  this.globals.test = function () {
    process.send( {type: 'test'} )
  }
}

exports.init = function init ( done ) {
  done();
}