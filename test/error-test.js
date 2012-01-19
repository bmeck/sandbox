var vows = require('vows'),
  assert = require('assert'),
  Sandbox = require('../');
vows.describe('error-test').addBatch({
    'When using a Sandbox with error': {
        topic: function () {
            this.sandbox = new Sandbox();
            var events = this.events = {};
            this.sandbox.use(Sandbox.timers);
            this.sandbox.onAny(function() {
                var queue = events[this.event] || (events[this.event] = []);
                queue.push({this:this, arguments: arguments});
            })
            var cb = this.callback;
            this.sandbox.run('setTimeout(function() {print(1)},0);throw new Error("$")', function() { cb() });
        },
        'Should return an error event': function (err) {
            var events = this.events['child-message'].filter(function(event) {
                var msg = event.arguments[0];
                if (msg.type === 'result') {
                    assert.notEqual(msg.error.stack, null);
                    assert.equal(msg.error.message, '$');
                    assert.equal(msg.error.name, 'Error');
                    return true;
                }
                return false;
            });
            assert.equal(1, events.length);
        },
        'Should kill the event loop': {
            topic: function () {
                setTimeout(this.callback.bind(this), 1000);
            },
            'and not allow timers to fire afterward': function () {
                var events = this.events['child-message'].filter(function(event) {
                    var msg = event.arguments[0];
                    if (msg.type === 'stdout') {
                        return true;
                    }
                    return false;
                });
               assert.equal(events.length, 0); 
            }
        }
    }
}).addBatch({
    'When using a Sandbox with error': {
        topic: function () {
            this.sandbox = new Sandbox();
            var events = this.events = {};
            this.sandbox.use(Sandbox.timers);
            this.sandbox.onAny(function() {
                var queue = events[this.event] || (events[this.event] = []);
                queue.push({this:this, arguments: arguments});
            })
            var cb = this.callback;
            this.sandbox.run('setTimeout(function() {print(1)},0);throw new Error("$")', function() { cb() });
        },
    }
}).export(module);