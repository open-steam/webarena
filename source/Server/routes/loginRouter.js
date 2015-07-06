/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval , University of Paderborn, 2015
 *
 */
"use strict";

var express = require('express');
var passport = require('passport');
var path = require('path');
var Account = require('../db/account');
var router = express.Router();

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            res.location('login#toregister'); // TODO: Fix this hash navigation
            return res.render("login", {info: "Sorry. That username already exists. Try again."});
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/room/public');
        });
    });
});

router.get('/login', function(req, res) {
    var errors = req.flash('error');

    if ((errors != undefined) & (errors.length > 0)) {
        res.render('login', { user : req.user, errors: errors });
    } else {
        res.render('login', { user : req.user });
    }
});

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/login',
                                     failureFlash: true }),
    function(req, res) {
        res.redirect('/room/public');
    }
);

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;
