var vows = require('vows'),
  assert = require('assert'),
  Sandbox = require('../');
vows.describe('plugin-test').addBatch({
    'When using a Sandbox plugin': {
        topic: function () {
            this.sandbox = new Sandbox();
            var events = this.events = {};
            this.sandbox.onAny(function() {
                var queue = events[this.event] || (events[this.event] = []);
                queue.push({this:this, arguments: arguments});
            })
            this.sandbox.use(require('./fixtures/sandbox-plugin-fixture'));
            this.sandbox.use(Sandbox.timers);
            this.sandbox.run('test();setTimeout', this.callback);
        },
        'the plugin should load a runner plugin': function (result) {
            var msgs = this.events['child-message'].filter(function (msg) {
                return msg.arguments[0].type === 'test';
            });
            assert(result['typeof'] === 'function')
            assert(msgs.length, 1);
        }
    }
}).addBatch({
    'When using the timers plugin': {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.config.set('rlimit:timeout', 0)
            var events = this.events = {};
            this.sandbox.onAny(function() {
                var queue = events[this.event] || (events[this.event] = []);
                queue.push({this:this, arguments: arguments});
            })
            this.sandbox.use(Sandbox.timers);
            var cb = this.callback;
            var self = this;
            this.sandbox.run('setInterval(function() {print("heartbeat")},100)', function (err, result) {
                var msgs = self.events['child-message'].filter(function (msg) {
                    return msg.arguments[0].type === 'stdout';
                });
                assert.isTrue(msgs.length == 0)
                setTimeout(cb.bind(null, null, result), 1000)
            });
        },
        'the plugin should load a runner plugin that can keep the process alive after death': function (result) {
            var msgs = this.events['child-message'].filter(function (msg) {
                return msg.arguments[0].type === 'stdout';
            });
            assert.isTrue(msgs.length > 0)
        }
    }
}).export(module);