exports.attach = function attach ( ) {
  this.globals.test = function () {
    process.send( {type: 'test'} )
  }
  this.globals.err = function () {
    throw new Error('herp')
  }
  this.globals.arr = function () {
    return [new Date(0), /x/, new Error()]
  }
  this.globals.beforeSameAsAfter = function (o, fn) {
    return fn(o) === o;
  }
}

exports.init = function init ( done ) {
  done();
}