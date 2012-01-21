var vows = require('vows'),
  assert = require('assert'),
  Sandbox = require('../');
vows.describe('comm-test').addBatch({
    'When using a Sandbox without error': {
        topic: function () {
            this.sandbox = new Sandbox();
            var events = this.events = {};
            this.sandbox.onAny(function() {
                var queue = events[this.event] || (events[this.event] = []);
                queue.push({this:this, arguments: arguments});
            })
            this.sandbox.run('print(1,"x");console.log(1,"x");console.error(2);_={x:3,y:[]}', this.callback.bind(this));
        },
        'the callback should contain results and console data': function (result) {
            assert.equal(result['typeof'], 'object')
            assert.deepEqual(result.result, {x:3,y:[]})
            assert.deepEqual(result.console, [1,'x',1,'x'])
        },
        'print() and console.log() should fire a "stdout" event': function () {
            var events = this.events['child-message'].filter(function(event) {
                var msg = event.arguments[0];
                if (msg.type === 'stdout') {
                    assert.deepEqual(msg, {
                        type: 'stdout',
                        value: [ 1, 'x' ]
                    });
                    return true;
                }
                return false;
            });
            assert.equal(2, events.length);
        },
        'console.error() should fire a "stderr" event': function () {
            this.events['child-message'].filter(function(event) {
                var msg = event.arguments[0];
                if (msg.type === 'stderr') {
                    assert.deepEqual(msg, {
                        type: 'stderr',
                        value: [ 2 ]
                    });
                }
            });
        },
        'return values should be honored': function () {
            this.events['child-message'].filter(function(event) {
                var msg = event.arguments[0];
                if (msg.type === 'result') {
                    assert.deepEqual({
                        x: 3,
                        y: []
                    }, msg.result);
                }
            });
        }
    }
}).addBatch({
    'When using a sandbox plugin function': {
        topic: function () {
            this.sandbox = new Sandbox();
            var events = this.events = {};
            this.sandbox.use(require('./fixtures/sandbox-plugin-fixture.js'));
            this.sandbox.onAny(function() {
                var queue = events[this.event] || (events[this.event] = []);
                queue.push({this:this, arguments: arguments});
            })
            var cb = this.callback;
            this.sandbox.run('x=arr();x instanceof Array && x[0] instanceof Date && x[1] instanceof RegExp && x[2] instanceof Error', this.callback);
        },
        'results should be wrapped': function (result) {
            assert.equal(result.result, true)
        }
    }
}).export(module);