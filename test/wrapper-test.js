var vows = require('vows'),
  assert = require('assert'),
  Sandbox = require('../');

vows.describe('wrapper-test').addBatch({
    'When using a Sandbox': {
        topic: function () {
            this.sandbox = new Sandbox();
            this.sandbox.config.set('options:persistent', true)
            this.sandbox.config.set('rlimit:timeout', 0)
            var events = this.events = {};
            this.sandbox.onAny(function() {
                var queue = events[this.event] || (events[this.event] = []);
                queue.push({this:this, arguments: arguments});
            })
            return this
        },
        'functions passes in and then out should return the original': {
            topic: function () {
                var cb = this.callback;
                this.sandbox.run('(function f(o) {return o})', function(err, result) {
                    this.run('exit(1)', cb)
                });    
            },
            'should be the same as the runner\'s global': function(result) {
                console.error(result)
            }
        }
    }
}).export(module);