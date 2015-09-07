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
var ResourceManager  = require('../resourceManager.js');
var Objects = require('../db/objects.js');

function AccessController(my_acl, my_CouplingManager, my_config) {
    this.acl = my_acl;
    this.couplingManager = my_CouplingManager;
    this.config = my_config;
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
            this._isAllowed(data.passport.user, data.resource, data.permissions, function(err, allowed) {
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
            this._allow(data.roles, data.resources, data.permissions, function(err, result) {
                cb(err, result);
            });
            break;
        default:
            throw new Error('AccessController:: query type unknown!!');
    }

}

AccessController.prototype._allow = function(roles, resources, permissions, cb) {
    resources   = _.isArray(resources)   ? resources   : [resources];
    permissions = _.isArray(permissions) ? permissions : [permissions];

    var context = { user: { username: "acl_username" } };
    var that = this;
    async.each(resources, function(resource, callback) {
        var objectId = that.acl.getIdFromACLName(resource);

        Objects.findOne( { objectID: objectId }, function(err, obj) {
            if (err) return callback(err);

            if (obj) {
                that.acl.allow(roles, resource, permissions, function(error) {
                    if (error) return callback(error);

                    if (_.intersection(permissions, ['couple', 'publish']).length > 0) {
                        var room = obj.room;

                        ObjectController.pokeObject(room, objectId, context);
                    }

                    return callback(null);
                });
            } else {
                var myError = new Error("Object with id: " + objectId + " not found");
                myError.myCode = -1;

                return callback(myError);
            }
        });
    }, function(err) {
        if (err) {
            console.warn("Error by AccessController._allow: " + err);

            if (err.myCode !== undefined) return cb(null, false);
            else return cb(err, false);
        }

        return cb(null, true);
    });
};

AccessController.prototype._isAllowed = function(userId, resource, permissions, cb) {
    var that = this;
    permissions = _.isArray(permissions) ? permissions : [permissions];

    this.acl.isAllowed2(userId, resource, permissions, function(err, allowed) {

        if (!allowed) {

            that.acl.userRoles(userId, function(err, roles) {
                var isSharedSurface = _.contains(roles, 'shared-surface');

                if (!isSharedSurface) {

                    if (that.config.usersCanCreateObjects && _.contains(permissions, 'create') &&
                        resource !== 'ui_static_tools_canUsersRequestCoupling') {
                        allowed = _.contains(ResourceManager.staticUIResources, resource);
                    }

                    if (that.config.canUsersRequestCoupling && _.contains(permissions, 'create') &&
                        resource === 'ui_static_tools_canUsersRequestCoupling') {
                        allowed = _.contains(ResourceManager.staticUIResources, resource);
                    }
                }

                cb(err, allowed);
            });
        } else cb(err, allowed);
    });
};

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
