/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 *
 */

var MONGODB_PREFIX = "acl_";

var async = require('async');
var _ = require('underscore');
var node_acl = require('acl');
var mongoose = require('mongoose');

// The actual acl will reside here
var acl = undefined;

function ACLManager(db_url) {
    var db = require('monk')(db_url);
    this._roles = db.get(MONGODB_PREFIX + 'roles');
    this._users = db.get(MONGODB_PREFIX + 'users');

    mongo_connected();
};

ACLManager.prototype.addUserRoles = function(userId, roles, cb) {
    acl.addUserRoles(userId, roles, cb);
};

ACLManager.prototype.removeUserRoles = function(userId, roles, cb) {
    acl.removeUserRoles(userId, roles, cb);
};

ACLManager.prototype.userRoles = function(userId, cb) {
    acl.userRoles(userId, cb);
};

ACLManager.prototype.roleUsers = function(rolename, cb) {
    acl.roleUsers(rolename, cb);
};

ACLManager.prototype.hasRole = function(userId, rolename, cb) {
    acl.hasRole(userId, rolename, cb);
};

ACLManager.prototype.addRoleParents = function(role, parents, cb) {
    acl.addRoleParents(role, parents, cb);
};

ACLManager.prototype.removeRoleParents = function(role, parents, cb) {
    acl.removeRoleParents(role, parents, cb);
};

ACLManager.prototype.removeRole = function(role, cb) {
    acl.removeRole(role, cb);
};

ACLManager.prototype.removeResource = function(resource, cb) {
    acl.removeResource(resource, cb);
};

ACLManager.prototype.allow = function(roles, resources, permissions, cb) {
    acl.allow(roles, resources, permissions, cb);
};

//ACLManager.prototype.allow = function(permissionsArray, cb) {
//    acl.allow(permissionsArray, cb);
//};

ACLManager.prototype.removeAllow = function(role, resources, permissions, cb) {
    acl.removeAllow(role, resources, permissions, cb);
};

ACLManager.prototype.allowedPermissions = function(userId, resources, cb) {
    acl.allowedPermissions(userId, resources, cb);
};

ACLManager.prototype.isAllowed = function(userId, resource, permissions, cb) {
    acl.isAllowed(userId, resource, permissions, cb);
};

// Like isAllowed but these method return true if any permission ist fulfill
ACLManager.prototype.isAllowed2 = function(userId, resource, permissions, cb) {
    var that = this;
    that.allowedPermissions(userId, resource, function(err, obj) {
        if (err) return cb(err, false);

        var userPermissions = obj[resource];

        permissions = _.isArray(permissions) ? permissions : [permissions];
        if (_.intersection(userPermissions, permissions).length > 0) return cb(null, true);
        if (_.contains(userPermissions, "*")) return cb(null, true);

        // PATCH:
        // before returning false, check if the user hat the admin role.
        that.hasRole(userId, 'admin', function(err, hasRole) {
            return cb(err, hasRole);
        })
    });
};

ACLManager.prototype.areAnyRolesAllowed = function(roles, resource, permissions, cb) {
    acl.areAnyRolesAllowed(roles, resource, permissions, cb);
};

ACLManager.prototype.whatResources = function(role, cb) {
    acl.whatResources(role, cb);
};

// +--- The following methods are not part of the original acl API  ----+

ACLManager.prototype.isUser = function(user, cb) {
    this._users.findOne({ key: user }, function (err, user) {
        cb(err, (user != null));
    });
};

ACLManager.prototype.rolesCollection = function(cb) {
    this._roles.find({}, ['key'], function (err, docs) {
        if (!err)docs = _.pluck(docs, 'key');

        cb(err, docs);
    });
};

ACLManager.prototype.allowedRolesPermissions = function(resources, cb) {
    resources = _.isArray(resources) ? resources : [resources];

    this.rolesCollection(function(err, roles) {
        if(err) {
           return cb(err, null);
        }

        var result = {};

        _.each(resources, function (resource) {
            result[resource] = [];
        });

        async.each(roles, function(role, callback) {
            acl.whatResources(role, function(err, obj) {
                if (err) return callback(err);

                _.each(resources, function (resource) {

                    if (obj[resource]) {
                        var temp = {role: role, permissions: obj[resource]};
                        result[resource].push(temp);
                    }
                });

                callback(null);
            });
        }, function(err) {
            if (err) return cb(err, null);
            else {
                result = _.omit(result, function(value) {
                    return value.length == 0;
                });

                return cb(null, result);
            }
        });
    });
};

ACLManager.prototype.whatRolesAllowed = function(resource, permission, cb) {
    this.allowedRolesPermissions(resource, function (err, obj) {
        if (err) return cb(err, null);
        else {
            var roles = [];

            _.each(obj, function (resourceObj) {
                _.each(resourceObj, function (element) {
                    if (_.contains(element.permissions, permission)) {
                        roles.push(element.role);
                    }
                });
            });

            return cb(null, roles);
        }
    });
};

// +---------------------------------------------------------------------------+

ACLManager.prototype.logError = logError;

ACLManager.prototype.makeACLName = function(id, condition) {
    if (id == undefined || id == null) new Error("id by makeACLName function must not be null");

    if (_.isFunction(condition) && condition()) {
        return id;
    } else return 'ui_dynamic_object_' + id;
};

ACLManager.prototype.getIdFromACLName = function(aclName) {
    return aclName.replace('ui_dynamic_object_', '');
};

function mongo_connected() {
    var mongoBackend = new node_acl.mongodbBackend( mongoose.connection.db, MONGODB_PREFIX );

    // Create a new access control list by providing the mongo backend
    // Also inject a simple logger to provide meaningful output
    acl = new node_acl( mongoBackend, logger() );

    // Defining roles and routes
    set_roles();

    console.info("Roles manager successfully loaded.");
};

// This creates a set of roles which have permissions on
// different resources.
function set_roles() {

    // This array contains all the static (not dynamically created) objects/resources
    // which can be accessed by the admin role
    var staticUIList = ['ui_static_graphical_ellipse',
                        'ui_static_graphical_line',
                        'ui_static_graphical_polygon',
                        'ui_static_graphical_rectangle',
                        'ui_static_graphical_arrow',
                        'ui_static_graphical_coordinatesystem',
                        'ui_static_graphical_table',
                        'ui_static_graphical_timeline',
                        'ui_static_texts_simpletext',
                        'ui_static_texts_textarea',
                        'ui_static_connections_exit',
                        'ui_static_connections_subroom',
                        'ui_static_content_file',
                        'ui_static_tools_coupling',
                        'ui_static_tools_chatIcon',
                        'ui_static_tools_grantFullRightsIcon',

                        // mobile UI
                        'mb_ui_static_graphical_menu'
                        ];

    // Create the 'admin' Role
    // Create roles implicitly by giving them permissions:
    acl.allow('admin', staticUIList, '*', logError);

    // Create the 'user' Role
    acl.allow('user','public' , '*', logError);

    // Inherit roles
    // Every admin is allowed to do what users do
    acl.addRoleParents( 'admin', 'user', logError);
};

function logError(err) {
    if (err) console.warn("Error!!! -> " + err);
};

// Provide logic for getting the logged-in user
function get_user_id(req, res) {
    return req.user != undefined? req.user.id : undefined;
};

// Generic debug logger for node_acl
function logger() {
    return {
        debug: function( msg ) {
            console.log( '-DEBUG-', msg );
        }
    };
};

exports = module.exports = ACLManager;
