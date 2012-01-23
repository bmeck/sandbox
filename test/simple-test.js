/* ------------------------------ INIT ------------------------------ */
var Sandbox = require( '../' )
  , assert = require('assert')
  , vows = require('vows')

/* ------------------------------ Tests ------------------------------ */
vows.describe('simplt-test').addBatch({
    "Using a Sandbox": {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.run( '1 + 1', this.callback.bind(this))
        },
        'should execute basic javascript': function (err, result) {
            assert.equal( result.result, 2 )
        }
    }
}).addBatch({
    "Using a Sandbox": {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.run( 'hi )there', this.callback.bind(this))
        },
        'it should gracefully handle syntax errors': function (err, result) {
            assert.equal( result.error.name, 'SyntaxError' )
            assert.equal( result.error.message, 'Unexpected token )' )
        }
    }
}).addBatch({
    "Using a Sandbox": {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.run( 'process.platform', this.callback.bind(this))
        },
        'it should effectively prevent code from accessing node': function (err, result) { 
            assert.equal( result.error.name, 'ReferenceError' )
            assert.equal( result.error.message, 'process is not defined' )
        }
    }
}).addBatch({
    "Using a Sandbox": {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.run( 'var sys=require("sys"); sys.puts("Up in your fridge")', this.callback.bind(this))
        },
        'it should effectively prevent code from circumventing the sandbox': function (err, result) { 
            assert.equal( result.error.name, 'ReferenceError' )
            assert.equal( result.error.message, 'require is not defined' )
        }
    }
}).addBatch({
    "Using a Sandbox": {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.run( 'while ( true ) {}', this.callback.bind(this))
        },
        'it should timeout on infinite loops': function (err, result) {
            assert.equal( result.error.message, 'SIGXCPU' )
        }
    }
}).addBatch({
    "Using a Sandbox": {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.run( 'console.log(7); 42', this.callback.bind(this))
        },
        'it should allow console output via `console.log`': function (err, result) { 
            assert.equal( result.result, 42 )
            assert.equal( result.console[0], 7 )
        }
    }
}).addBatch({
    "Using a Sandbox": {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.run( 'print(7); 42', this.callback.bind(this))
        },
        'it should allow console output via `print`': function (err, result) { 
            assert.equal( result.result, 42 )
            assert.equal( result.console[0], 7 )
        }
    }
}).addBatch({
    "Using a Sandbox": {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.run( 'console.log("first"); console.log("second"); 42', this.callback.bind(this))
        },
        'it should maintain the order of sync. console output`': function (err, result) { 
            assert.equal( result.result, 42 )
            assert.equal( result.console[0], 'first' )
            assert.equal( result.console[1], 'second' )
        }
    }
}).export(module);
