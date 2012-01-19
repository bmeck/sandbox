var vows = require('vows'),
  assert = require('assert'),
  Sandbox = require('../');
vows.describe('console-test').addBatch({
    'When using a Sandbox without error': {
        topic: function () {
            this.sandbox = new Sandbox();
            var events = this.events = {};
            this.sandbox.onAny(function() {
                var queue = events[this.event] || (events[this.event] = []);
                queue.push({this:this, arguments: arguments});
            })
            this.sandbox.run('print(1,"x");console.log(1,"x");console.error(2);_={x:3,y:[]}', this.callback);
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
}).export(module);