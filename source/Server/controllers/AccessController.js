/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval , University of Paderborn, 2015
 *
 */
"use strict";

function AccessController(my_acl) {
    this.acl = my_acl;
}

AccessController.prototype.isAllowed = function(data, cb) {
    this.acl.isAllowed(data.passport.user, data.resource, data.permissions, function(err, allowed) {
        cb(err, allowed);
    });
}

exports = module.exports = AccessController;
