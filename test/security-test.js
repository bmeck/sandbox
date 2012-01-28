var vows = require('vows'),
  assert = require('assert'),
  Sandbox = require('../');
  
I_AM_A_GLOBAL = 'LEAKING';

vows.describe('security-test').addBatch({
    'When using a Sandbox': {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.config.set('options:exitOnError', false)
            var events = this.events = {};
            this.sandbox.onAny(function() {
                var queue = events[this.event] || (events[this.event] = []);
                queue.push({this:this, arguments: arguments});
            })
            return this
        },
        'the function constructor in the runner': {
            topic: function () {            
                this.sandbox.run('console.log.constructor("return function() {}")() instanceof Function', this.callback);    
            },
            'should be the same as the runner\'s global': function(result) {
                assert.equal(result.result, true)
            }
        },
        'the global': {
            topic: function () {            
                this.sandbox.run('[(function(){return this})().Array === [].constructor, typeof I_AM_A_GLOBAL]', this.callback);    
            },
            'should be the same as the runner\'s native literal\'s': function(result) {
                assert.equal(result.result[0], true)
            },
            'should not be leaking the parent globals': function(result) {
                assert.equal(result.result[1], 'undefined')
            }
        },
        'the caller': {
            topic: function () {            
                this.sandbox.run('(function f(){return f.caller.caller})()', this.callback.bind(this));    
            },
            'should be unavailable': function(err, result) {
                assert.isTrue(!!err)
                assert.isTrue(!!result.error)
            }
        }
    }
}).addBatch({
    'When using a Sandbox': {
        topic: function () {
            this.sandbox = new Sandbox();
            var events = this.events = {};
            this.sandbox.onAny(function() {
                var queue = events[this.event] || (events[this.event] = []);
                queue.push({this:this, arguments: arguments});
            })
            this.sandbox.run('for(;;);', this.callback.bind(this, null))
        },
        "infinite loops should timeout": function (err) {
            assert.equal(err.message, 'SIGXCPU')
        }
    }
}).export(module);