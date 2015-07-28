/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 *
 */

var node_acl = require('acl');
var mongoose = require('mongoose');

// The actual acl will reside here
var acl = undefined;

function ACLManager() {
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

ACLManager.prototype.allow = function(permissionsArray, cb) {
    acl.allow(permissionsArray, cb);
};

ACLManager.prototype.removeAllow = function(role, resources, permissions, cb) {
    acl.removeAllow(role, resources, permissions, cb);
};

ACLManager.prototype.allowedPermissions = function(userId, resources, cb) {
    acl.allowedPermissions(userId, resources, cb);
};

ACLManager.prototype.isAllowed = function(userId, resource, permissions, cb) {
    acl.isAllowed(userId, resource, permissions, cb);
};

ACLManager.prototype.areAnyRolesAllowed = function(roles, resource, permissions, cb) {
    acl.areAnyRolesAllowed(roles, resource, permissions, cb);
};

ACLManager.prototype.whatResources = function(role, cb) {
    acl.whatResources(role, cb);
};

function mongo_connected() {
    var mongoBackend = new node_acl.mongodbBackend( mongoose.connection.db, "acl_" );

    // Create a new access control list by providing the mongo backend
    // Also inject a simple logger to provide meaningful output
    acl = new node_acl( mongoBackend, logger() );

    // Defining roles and routes
    set_roles();

    console.info("Roles manager successfully loaded.");
}

// This creates a set of roles which have permissions on
// different resources.
function set_roles() {

    // This array contains all the static (not dynamically created) objects/resources
    // which can be accessed by the admin role
    var staticUIList = ['/ui/static/graphical/ellipse',
                        '/ui/static/graphical/line',
                        '/ui/static/graphical/polygon',
                        '/ui/static/graphical/rectangle',
                        '/ui/static/graphical/arrow',
                        '/ui/static/graphical/coordinatesystem',
                        '/ui/static/graphical/table',
                        '/ui/static/graphical/timeline',
                        '/ui/static/texts/simpletext',
                        '/ui/static/texts/textarea',
                        '/ui/static/connections/exit',
                        '/ui/static/connections/subroom',
                        '/ui/static/content/file',
                        '/ui/static/tools/coupling'
                        ];

    // Create the 'admin' Role
    // Create roles implicitly by giving them permissions:
    acl.allow('admin', staticUIList, '*');
    // Now create the 'acl_admin' user and assign the role 'admin' to him
    acl.addUserRoles('admin', 'admin');

    // Create the 'user' Role and the 'acl_user' user
    // by default every new user in the system get this role (except for admin)
    acl.addUserRoles('user', 'user');
    acl.allow('user','/public' , '*');

    // Inherit roles
    // Every admin is allowed to do what users do
    acl.addRoleParents( 'admin', 'user' );
}

// Provide logic for getting the logged-in user
function get_user_id(req, res) {
    return req.user != undefined? req.user.id : undefined;
}

// Generic debug logger for node_acl
function logger() {
    return {
        debug: function( msg ) {
            console.log( '-DEBUG-', msg );
        }
    };
}

exports = module.exports = ACLManager;