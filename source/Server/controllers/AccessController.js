/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval , University of Paderborn, 2015
 *
 */
"use strict";

var _ = require('underscore');

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
        case 'grantFullRights':
            this._grantFullRights('admin', data.objects, cb);
            break;
        default:
            throw new Error('AccessController:: query type unknown!!');
    }

}

AccessController.prototype._grantFullRights = function(roles, objects, cb) {
    var prefix = "ui_dynamic_object_";
    var resources = _.map(objects, function(obj){ return prefix + obj; });

    this.acl.allow(roles, resources, "*", function(err) {
        var error = (err != null);
        var msg = (error) ? ("" + err) : "";

        cb(null, { err: error, msg: msg });
    });
};

exports = module.exports = AccessController;
