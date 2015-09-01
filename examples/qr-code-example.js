/**
 * Created by Alejandro on 31.08.2015.
 */

var qr = require('qr-image');
var express = require('express');

var app = express();
var port = 80;

app.get('/', function(req, res) {
    var code = qr.image(new Date().toString(), { type: 'svg' });
    res.type('svg');
    code.pipe(res);
});

app.get('/helloWorld', function(req, res) {
    var code = qr.image("Hello World!!", { type: 'svg' });
    res.type('svg');
    code.pipe(res);
});

// Starting the server
app.listen(port, function() {
    console.log('QR example listening on port ' + port );
});
