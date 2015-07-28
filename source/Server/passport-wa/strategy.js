/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 *
 */
"use strict";

/**
 * Module dependencies.
 */
var passport = require('passport-strategy')
    ,   util = require('util');

function Strategy(options) {
    options = options || {};

    this._cookieName = options.cookieName || 'WADIV';

    passport.call(this);
    this.name = 'wa';
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
    var self = this;

    function verified(err, user, info) {
        if (err) { return self.error(err); }
        if (!user) { return self.fail(info); }
        self.success(user, info);
    }

    try {
        authenticate(req, verified);
    } catch (ex) {
        return self.error(ex);
    }
};

Strategy.serializeUser = function() {
    return function(user, cb) {
        cb(null, user.WADIV);
    }
};

Strategy.deserializeUser = function() {
    return function(id, cb) {
        cb(null, id);
    }
};

function authenticate (req, cb){
    if (req.cookies.WADIV) {
        return cb(null, req.cookies.WADIV);
    } else return cb(null, false, { message: 'Missing web arena cookie' });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
