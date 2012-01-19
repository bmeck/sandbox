var Sandbox = require('../../');
var util = require('util');
var UID = 0;
var server = require('http').createServer(function (req, res) {
    var buff = [];
    var id = ++UID;
    console.log('%d) got request', id)
    req.on('data', function (data) {
        buff[buff.length] = data;
    })
    req.on('end', function () {
        buff = buff.join('');
        console.log('%d) running script: %s', id, buff)
        new Sandbox().run(buff, function (err, results) {
            if (err) {
                res.writeHead(500);
            }
            var resultStr = JSON.stringify(results)
            console.log('%d) results: \n%s', id, util.inspect(results, false, 3, true))
            res.end(resultStr);
        });
    })
});
server.listen(process.env.PORT || 8080);
console.log('Server listening for data on port', server.address().port)
console.log('You can run scripts via the following (replace :data)')
console.log('  curl -X POST --data :data 127.0.0.1:'+server.address().port)