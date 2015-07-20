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
}

ACLManager.prototype.addUserRoles = function(userId, roles, cb) {
    acl.addUserRoles(userId, roles, cb);
}

ACLManager.prototype.isAllowed = function(userId, resource, permissions, cb) {
    acl.isAllowed(userId, resource, permissions, cb);
}

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