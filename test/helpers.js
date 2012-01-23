exports.queueEventsAndRun = function queueEventsAndRun(sandbox, events, code, callback) {
    var child = sandbox.run(code, function () {
        callback.apply(this, arguments)
    });
    child.events = {};
    events.forEach(function(event) {
        child.on(event, function (e) {
            var events = child.events[event] = child.events[event] || (child.events[event] = [])
            events.push(arguments)
        })
    })
    return child
}