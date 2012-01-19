var path = require('path');

exports.attach = function attach ( ) {
  this.on('child', function (child) {
    child.send( { type: 'plugin', file: path.join(__dirname, './runner-plugin-fixture.js') } )
  });
}

exports.init = function init ( done ) {
  done();
}