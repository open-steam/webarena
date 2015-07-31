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

AccessController.prototype.query = function(data, cb) {
    switch(data.type) {
        case 'isAllowed':
            this.acl.isAllowed(data.passport.user, data.resource, data.permissions, function(err, allowed) {
                cb(err, allowed);
            });
            break;
        case 'userRoles':
            var user = data.userId ? data.userId : data.passport.user;

            this.acl.userRoles(user, function(err, roles) {
                cb(err, roles);
            });
            break;
        default:
            throw new Error('AccessController:: query type unknown!!');
    }

}

exports = module.exports = AccessController;
