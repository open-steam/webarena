/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval , University of Paderborn, 2015
 *
 */
"use strict";

var _     = require('underscore');
var async = require('async');

var ObjectController = require('./ObjectController.js');

function AccessController(my_acl, my_CouplingManager) {
    this.acl = my_acl;
    this.couplingManager = my_CouplingManager;
}

AccessController.prototype.query = function(data, cb) {
    switch(data.type) {
        case 'removeAllow':
            this._removeAllow(data.roles, data.resources, data.permissions, data.extras, function(err) {
                cb(err, true);
            });
            break;
        case 'roleUsers':
            this._roleUsers(data.rolenames, cb);
            break;
        case 'whatRolesAllowed':
            this.acl.whatRolesAllowed(data.resource, data.permission, function(err, roles) {
                cb(err, roles);
            });
            break;
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
                    _.each(data.extras, function(element) {
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

AccessController.prototype._removeAllow = function(roles, resources, permissions, extras, cb) {
    var that = this;

    var context = { user: { username: "acl_username" } };

    // we assumed that all the objects are in the same room
    var room = extras[0].room;
    permissions = _.isArray(permissions) ? permissions : [permissions];

    async.each(roles, function(role, callback) {
        that.acl.removeAllow(role, resources, permissions, function(err) {
            if (_.contains(permissions, 'couple') && !err) {

                _.each(resources, function(resource) {

                    // Delete the object in the clients if they are online
                    var socket = that.couplingManager.getSocket(role);

                    if (socket) {
                        var objectId = that.acl.getIdFromACLName(resource);
                        ObjectController.deleteFromClient(room.id, objectId, context, socket);
                    }
                });
            }

            callback(err);
        });
    }, function(err) {
        if (err) {
            console.warn("Error by AccessController._removeAllow: " + err);

            return cb(err, null);
        }

        return cb(null, 'OK');
    });
};

AccessController.prototype._roleUsers = function(rolenames, cb) {
    var usersCollection = [];

    var that = this;
    async.each(rolenames, function(rolename, callback) {
        that.acl.roleUsers(rolename, function(err, users)  {
            if (!err) usersCollection.push(users);

            callback(err);
        });
    }, function(err) {
        if (err) {
            console.warn("Error by AccessController._roleUsers: " + err);

            return cb(err, null);
        }

        return cb(null, _.flatten(usersCollection));
    });
};

AccessController.prototype._grantFullRights = function(roles, resources, cb) {
    this.acl.allow(roles, resources, "*", function(err) {
        var error = (err != null);
        var msg = (error) ? ("" + err) : "";

        cb(null, { err: error, msg: msg });
    });
};

exports = module.exports = AccessController;
