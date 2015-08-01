/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval , University of Paderborn, 2015
 *
 */
"use strict";

var AUTHENTICATE_STRATEGY = 'wa'; // 'local', 'wa'
var COOKIE_NAME = 'WADIV';

var uuid     = require('node-uuid');
var passport = require('passport');

function LoginRouter(app, acl) {

    app.get('/register', function(req, res) {
        if (!req.cookies.WADIV) {
            res.render('register');
        } else {
            res.redirect('/login');
        }
    });

    app.post('/register', function(req, res) {
        var name = req.body.username;
        var WADIV = uuid.v1();

        var d = new Date();
        d.setFullYear(2030, 0, 14);
        res.cookie(COOKIE_NAME, { WADIV: WADIV, name: name }, { expires: d,
                                                                secure: false,
                                                                httpOnly: false });

        console.info("New Device WADIV: " + WADIV + "with name: " + name);

        // create a new acm_user with 'user' role that represents this device
        acl.addUserRoles(WADIV, 'user', function(err) {
            if(err) {
                console.warn("ERROR!! by adding acm_user role to the new user" + err);
                return  res.status(501).send("ERROR!! by adding acm_user role to the new user" + err);
            }

            res.redirect('/login');
        });
    });

    app.get('/unregister', function(req, res) {
        console.info("unregister called from");
        console.info(req.cookies.WADIV);

        acl.removeUserRoles(req.cookies.WADIV.WADIV, 'user', function(err) {
            if(err) {
                console.warn("ERROR!! by removing acm_user role from device" + err);
            } else {

                // Delete cookie
                res.clearCookie(COOKIE_NAME);

                console.info("Device: " + req.cookies.WADIV.WADIV + "unregistered");
            }

            res.redirect('/logout');
        });
    });

    app.get('/login', function(req, res) {
        //console.info("login called from");
        //console.info(req.cookies.WADIV);

        if (req.cookies.WADIV) {
            var WADIV = req.cookies.WADIV.WADIV;

            acl.isUser(WADIV, function(err, result) {
                if (result) {
                    passport.authenticate(AUTHENTICATE_STRATEGY)(req, res, function () {
                        res.redirect('/room/public');
                    });
                } else {
                    // create a new acm_user with 'user' role that represents this device
                    acl.addUserRoles(WADIV, 'user', function(err) {
                        if(err) {
                            console.warn("ERROR!! by adding acm_user role to the new user" + err);
                            return  res.status(501).send("ERROR!! by adding acm_user role to the new user" + err);
                        }

                        passport.authenticate(AUTHENTICATE_STRATEGY)(req, res, function () {
                            res.redirect('/room/public');
                        });
                    });
                }
            });
        } else {
            res.redirect('/register');
        }
    });

    app.get('/logout', function(req, res) {
        req.logout();

        //res.redirect('/login');
        res.status(200).send("you are now logged out!");
    });

    app.get('/ping', function(req, res) {
        res.status(200).send("pong!");
    });
};

exports = module.exports = LoginRouter;
