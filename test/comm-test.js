var vows = require('vows'),
  assert = require('assert'),
  helpers = require('./helpers'),
  Sandbox = require('../');
vows.describe('comm-test').addBatch({
    'When using a Sandbox without error': {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.use(Sandbox.timers);
            this.sandbox.config.set('rlimit:timeout', 0);
            this.sandbox.config.set('options:persistent', true);
            var code = 'print(1,"x");console.log(1,"x");console.error(2);_={x:3,y:[]}';
            var cb = this.callback.bind(this);
            this.child = helpers.queueEventsAndRun(this.sandbox, ['result', 'stdout', 'stderr'], code, cb)
        },
        'the callback should contain results and console data': function (err, result) {
            assert.equal(result['typeof'], 'object')
            assert.deepEqual(result.result, {x:3,y:[]})
            assert.deepEqual(result.console, [1,'x',1,'x'])
        },
        'print() and console.log() should fire a "stdout" event': function () {
            var events = this.child.events['stdout']
            events.forEach(function(msg) {
                assert.deepEqual(msg[0], {
                    type: 'stdout',
                    value: [ 1, 'x' ]
                });
            });
            assert.equal(2, events.length);
        },
        'console.error() should fire a "stderr" event': function () {
            var events = this.child.events['stderr']
            events.forEach(function(msg) {
                assert.deepEqual(msg[0], {
                    type: 'stderr',
                    value: [ 2 ]
                });
            });
            assert.equal(1, events.length);
        },
        'return values should be honored': function () {
            var events = this.child.events['result']
            events.forEach(function(msg) {
                assert.deepEqual({
                    x: 3,
                    y: []
                }, msg[0].result);
            });
            assert.equal(1, events.length);
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