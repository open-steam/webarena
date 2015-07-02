/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval , University of Paderborn, 2015
 *
 */
"use strict";

var everyauth = require('everyauth');
var validator = require('validator');
var userDAO   = require('./db/UserDAO')();

/**
 * @class Authenticator
 * @classdesc authentication agent
 */
var Authenticator = {};

everyauth.password
    .loginFormFieldName('username')
    .passwordFormFieldName('password')
    .getLoginPath('/login')  // Uri path to the login page
    .postLoginPath('/login') // Uri path that your login form POSTs to
    .loginView('login.html')
    .authenticate(function(login, password) {
        var promise;
        var errors = [];

        if (!login) {
            errors.push('Missing username');
        }

        if (!password) {
            errors.push('Missing password');
        }

        if (errors.length) return errors;

        promise = this.Promise();
        userDAO.usersByUserName(login, function(err, doc) {
            if (err) {
                return promise.fulfill([ err ]);
            } else if (doc.length === 0) {
                return promise.fulfill([ 'Username not found' ]);
            } else {
                var user = doc[0];
                if (user.password != password) {
                    return promise.fulfill([ 'Wrong password' ]);
                }

                promise.fulfill(doc[0]);
            }
        });

        return promise;
    })
    .loginSuccessRedirect('/room/public') // Where to redirect to after a
                                          // login

    .getRegisterPath('/login#toregister')     // Uri path to the registration page
    .postRegisterPath('/register')            // The Uri path that your registration form POSTs to
    .registerView('login.html')
    .validateRegistration(function(newUserAttributes) {
        var errors = [];

        if (!newUserAttributes.login) {
            errors.push('Missing username');
        } else if (!validator.isLength(newUserAttributes.login, 3, 10)) {
            errors.push('Username should be 3 to 10 characters long');
        }

        if (!newUserAttributes.password) {
            errors.push('Missing password');
        } else if (!validator.isLength(newUserAttributes.password, 3, 8)) {
            errors.push('Password should be 3 to 8 characters long');
        } else if (newUserAttributes.password != newUserAttributes.passwordsignup_confirm) {
            errors.push('Password confirmation does not match');
        }

        if ((newUserAttributes.e_mail) && (!validator.isEmail(newUserAttributes.e_mail))) {
            errors.push('A valid email is required');
        }

        return errors;
    })
    .registerUser(function(newUserAttributes) {
        var promise = this.Promise();

        userDAO.createUsers(newUserAttributes, function(err, user) {
            if (err) {

                if (err.code == 11000) return promise.fulfill(["A user with the same name already exists. Use a different name"]);
                return promise.fulfill([err]);
            }
            promise.fulfill(user);
        });

        return promise;
    })
    .registerSuccessRedirect('/room/public'); 	// Where to redirect to
                                                // after a successful
                                                // registration

everyauth.password.extractExtraRegistrationParams(function(req) {
    return {
        e_mail: req.body.e_mail,
        passwordsignup_confirm: req.body.passwordsignup_confirm
    };
});

everyauth.everymodule.findUserById(function(id, callback) {
    userDAO.usersById(id, callback);
});

// key field in the User collection
everyauth.everymodule.userPkey('_id');

Authenticator.everyauth = everyauth;

module.exports = Authenticator;