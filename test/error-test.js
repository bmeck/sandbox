var vows = require('vows'),
  assert = require('assert'),
  helpers = require('./helpers.js'),
  Sandbox = require('../');
vows.describe('error-test').addBatch({
    'When using a Sandbox with error with exitOnError': {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.use(Sandbox.timers);
            var code = 'setTimeout(function() {print(1)},0);throw new Error("$")';
            var cb = this.callback.bind(this, null);
            this.child = helpers.queueEventsAndRun(this.sandbox, ['result', 'stdout'], code, cb)
        },
        'Should return an error event': function (err) {
            var events = this.child.events['result'];
            assert.notEqual(err.stack, null);
            assert.equal(err.message, '$');
            assert.equal(err.name, 'Error');
            assert.equal(1, events.length);
        },
        'Should kill the event loop': {
            topic: function () {
                setTimeout(this.callback.bind(this), 1000);
            },
            'and not allow timers to fire afterward': function () {
                var events = this.child.events['stdout'];
               assert.equal(events, undefined); 
            }
        }
    }
}).addBatch({
    'When using a Sandbox with error without exitOnError': {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.use(Sandbox.timers);
            this.sandbox.config.set('options:exitOnError', false);
            var code = 'setTimeout(function() {print(1)},0);throw new Error("$")';
            var cb = this.callback.bind(this, null);
            this.child = helpers.queueEventsAndRun(this.sandbox, ['result', 'stdout'], code, cb)
        },
        'Should return an error event': function (err) {
            var events = this.child.events['result'];
            assert.notEqual(err.stack, null);
            assert.equal(err.message, '$');
            assert.equal(err.name, 'Error');
            assert.equal(1, events.length);
        },
        'Should not kill the event loop': {
            topic: function () {
                setTimeout(this.callback.bind(this), 1000);
            },
            'and should allow timers to fire afterward': function () {
               var events = this.child.events['stdout'];
               assert.equal(events, undefined);
               this.child.kill();
            }
        }
    }
}).addBatch({
    'When using a plugin with error': {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.use(require('./fixtures/sandbox-plugin-fixture.js'));
            var code = 'var x;try { err() } catch (e) {x=e};x instanceof Error';
            this.child = helpers.queueEventsAndRun(this.sandbox, [], code, this.callback.bind(this))
        },
        'The error should propagate the error and wrap it': function (err, result) {
            assert.equal(!!err, false)
            assert.equal(result.result, true)
        }
    }
}).addBatch({
    'When using a plugin with an oob error': {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.use(Sandbox.timers)
            this.sandbox.use(require('./fixtures/sandbox-plugin-fixture.js'));
            var code = 'setTimeout(err, 1000);undefined';
            var child = helpers.queueEventsAndRun(this.sandbox, ['uncaughtException'], code, function() {})
            var cb = this.callback.bind(this, null);
            child.on('uncaughtException', function () {
                cb.apply(this, arguments)
            })
        },
        'The error should propagate the error and wrap it': function (err) {
            assert.equal(err.error.message, 'herp')
        }
    }
}).export(module);