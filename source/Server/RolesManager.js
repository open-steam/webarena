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
var app = undefined;

function RolesManager(app_express) {
    app = app_express;
    mongo_connected();
}

function mongo_connected() {
    var mongoBackend = new node_acl.mongodbBackend( mongoose.connection.db /*, {String} prefix */ );

    // Create a new access control list by providing the mongo backend
    // Also inject a simple logger to provide meaningful output
    acl = new node_acl( mongoBackend, logger() );

    // Defining roles and routes
    set_roles();
    set_routes();

    console.info("Roles manager successfully loaded.");
}

// This creates a set of roles which have permissions on
// different resources.
function set_roles() {

    // Define roles, resources and permissions
    acl.allow([
        {
            roles: 'admin',
            allows: [
                { resources: '/secret', permissions: 'create' },
                { resources: '/topsecret', permissions: '*' }
            ]
        }, {
            roles: 'user',
            allows: [
                { resources: '/secret', permissions: 'get' }
            ]
        }, {
            roles: 'guest',
            allows: []
        }
    ], function(err) {
        console.log("set_roles error: " + err);
    });

    // Inherit roles
    // Every user is allowed to do what guests do
    // Every admin is allowed to do what users do
    acl.addRoleParents( 'user', 'guest' );
    acl.addRoleParents( 'admin', 'user' );
}

// Defining routes ( resources )
function set_routes() {

    // Simple overview of granted permissions
    app.get( '/info',
        function(req, res) {
            acl.allowedPermissions(get_user_id(req), [ '/info', '/secret', '/topsecret' ], function(error, permissions){
                res.json(permissions);
            });
        }
    );

    // Only for users and higher
    app.get('/secret', acl.middleware(),
        function(req, res) {
            res.send('Welcome Sir!');
        }
    );

    // Only for admins
    app.get('/topsecret', acl.middleware(),
        function(req, res) {
            res.send('Hi Admin!');
        }
    );

    // Setting a new role
    app.get('/allow/:user/:role', function(req, res) {
        acl.addUserRoles( req.params.user, req.params.role );
        res.send( req.params.user + ' is a ' + req.params.role );
    });

    // Unsetting a role
    app.get('/disallow/:user/:role', function(req, res) {
        acl.removeUserRoles( req.params.user, req.params.role );
        res.send( req.params.user + ' is not a ' + req.params.role + ' anymore.' );
    });
}

// Provide logic for getting the logged-in user
function get_user_id(req) {
    return req.user != undefined? req.user.id : "bob";
}

// Generic debug logger for node_acl
function logger() {
    return {
        debug: function( msg ) {
            console.log( '-DEBUG-', msg );
        }
    };
}

exports = module.exports = RolesManager;