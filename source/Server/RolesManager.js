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
    var mongoBackend = new node_acl.mongodbBackend( mongoose.connection.db, "acl_" );

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

    //acl.allow("guest", [], "", function(err) {
    //
    //});

    acl.addUserRoles('joed', 'guest', function(err, res){
        if (err){
            console.log("Error ---> " + err);
        } else console.log("Todo chido ---> " + res);
    });

    // guest is allowed to view blogs
    // acl.allow('guest', 'blogs', 'view');

    // Inherit roles
    // Every user is allowed to do what guests do
    // Every admin is allowed to do what users do
    //acl.addRoleParents( 'user', 'guest' );
    //acl.addRoleParents( 'admin', 'user' );
}

// Defining routes ( resources )
// an HTTP API for ACL
function set_routes() {

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

exports = module.exports = RolesManager;