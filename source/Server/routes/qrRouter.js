/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval , University of Paderborn, 2015
 *
 */
"use strict";

var qr = require('qr-image');
var express = require('express');
var qr_router = express.Router();

function QRRouter(app) {

    app.use('/qr', qr_router);

    qr_router.get('/helloWorld', function(req, res) {
        var code = qr.image("Hello World!!", { type: 'svg' });
        res.type('svg');
        code.pipe(res);
    });

    qr_router.get('/create/:msg', function(req, res) {
        var msg = req.params.msg;

        res.set({
            'Content-Type' : 'image/png',
            'Content-Disposition': 'inline',
            'filename': req.params.msg + '.png'
        });

        var objStream = qr.image(msg, { type: 'png' });
        objStream.pipe(res);
        objStream.on("end", function() {
            try {
                res.status(200).end();
            } catch (err) {
                console.error("create QR ex: " + err);
            }
        });
    });

};

exports = module.exports = QRRouter;
