var vows = require('vows'),
  assert = require('assert'),
  helpers = require('./helpers'),
  Sandbox = require('../');
vows.describe('plugin-test').addBatch({
    'When using a Sandbox plugin': {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.use(Sandbox.timers);
            this.sandbox.use(require('./fixtures/sandbox-plugin-fixture'));
            var code = 'test();setTimeout';
            var cb = this.callback.bind(this);
            this.child = helpers.queueEventsAndRun(this.sandbox, ['test'], code, cb)
        },
        'the plugin should load a runner plugin': function (err, result) {
            var events = this.child.events['test'];
            assert.equal(events.length, 1)
            assert.equal(result['typeof'], 'function')
        }
    }
}).addBatch({
    'When using the timers plugin': {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.config.set('rlimit:timeout', 0)
            this.sandbox.use(Sandbox.timers);
            this.sandbox.use(require('./fixtures/sandbox-plugin-fixture'));
            var code = 'setInterval(function() {print("heartbeat")},100)';
            var cb = this.callback.bind(this);
            this.child = helpers.queueEventsAndRun(this.sandbox, ['stdout'], code, function () {})
            this.child.once('stdout', cb)
        },
        'the plugin should load a runner plugin that can keep the process alive after death': function (err, result) {
            var events = this.child.events['stdout']
            assert.isTrue(events.length > 0)
        }
    }
}).export(module);