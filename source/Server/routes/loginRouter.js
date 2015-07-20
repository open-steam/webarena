/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval , University of Paderborn, 2015
 *
 */
"use strict";
var passport = require('passport');
var User = require('../db/users');

function LoginRouter(app, acl) {

    app.get('/register', function(req, res) {
        res.render('register', { });
    });

    app.post('/register', function(req, res) {
        User.register(new User({ username : req.body.username, email : req.body.e_mail }), req.body.password, function(err, account) {
            if (err) {
                res.location('login#toregister'); // TODO: Fix this hash navigation
                return res.render("login", {info: "Sorry. That username already exists. Try again."});
            }

            // create a new acm_user with 'user' role that represents this user
            acl.addUserRoles(req.body.username, 'user', function(err) {
                 if(err) {
                      console.warn("ERROR!! by adding acm_user role to the new user" + err);
                 }
            });

            passport.authenticate('local')(req, res, function () {
                res.redirect('/room/public');
            });
        });
    });

    app.get('/login', function(req, res) {
        var errors = req.flash('error');

        if ((errors != undefined) & (errors.length > 0)) {
            res.render('login', { user : req.user, errors: errors });
        } else {
            res.render('login', { user : req.user });
        }
    });

    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/login',
            failureFlash: true }),
        function(req, res) {
            res.redirect('/room/public');
        }
    );

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });

    app.get('/ping', function(req, res){
        res.status(200).send("pong!");
    });
};

exports = module.exports = LoginRouter;
