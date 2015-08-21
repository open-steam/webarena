/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval , University of Paderborn, 2015
 *
 */
"use strict";

var _ = require('underscore');

var ObjectController = require('./ObjectController.js');

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
            this._grantFullRights('admin', data.resources, cb);
            break;
        case 'allowedRolesPermissions':
            this.acl.allowedRolesPermissions(data.resources, function(err, obj) {
                cb(err, obj);
            });
            break;
        case 'allow':
            this.acl.allow(data.roles, data.resources, data.permissions, function(err) {
                var result = err ? false : true;

                if ((data.permissions == 'couple') && data.extras) {
                    _.each(data.extras, function(element){
                        var room = element.room;
                        var objectID = element.objectID;
                        var context = { user: { username: "acl_username" } };

                        ObjectController.pokeObject(room.id, objectID, context);
                    });
                }

                cb(err, result);
            });
            break;
        default:
            throw new Error('AccessController:: query type unknown!!');
    }

}

AccessController.prototype._grantFullRights = function(roles, resources, cb) {
    this.acl.allow(roles, resources, "*", function(err) {
        var error = (err != null);
        var msg = (error) ? ("" + err) : "";

        cb(null, { err: error, msg: msg });
    });
};

exports = module.exports = AccessController;
