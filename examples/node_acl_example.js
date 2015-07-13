/**
 * Created by Alejandro on 08.07.2015.
 */

/**
 * Simple node_acl example with mongoDB and expressjs
 *
 * Usage:
 *  1. Start this as server
 *  2. Play with the resoures
 *
 *     Show all permissions (as JSON)
 *      http://localhost/info
 *
 *     Only visible for users and higher
 *      http://localhost/secret
 *
 *     Only visible for admins
 *      http://localhost/topsecret
 *
 *     Manage roles
 *     user is 'bob' and role is either 'guest', 'user' or 'admin'
 *      http://localhost/allow/:user/:role
 *      http://localhost/disallow/:user/:role
 *
 * Don't forget to disallow a role, if you want to revoke its
 *  permissions.
 */

var mongoose = require('mongoose');
    express = require( 'express' ),
    node_acl = require( 'acl' ),
    port = 80,
    app = express();

// The actual acl will reside here
var acl = undefined;

// Error handling ( most notably 'Insufficient permissions' )
app.use( app.router );
app.use( function( error, request, response, next ) {
    if( !error ) return next();
    response.send( error.msg, error.errorCode );
});

// Connecting to our mongo database
mongoose.connect('mongodb://127.0.0.1:27017/acl_example');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.info("connection to MongoDB succeed.");
    _mongo_connected(null, mongoose.connection.db);
});

//mongodb.connect( 'mongodb://127.0.0.1:27017/acl_example', _mongo_connected );

function _mongo_connected( error, db ) {

    var mongoBackend = new node_acl.mongodbBackend( db /*, {String} prefix */ );

    // Create a new access control list by providing the mongo backend
    //  Also inject a simple logger to provide meaningful output
    acl = new node_acl( mongoBackend, logger() );

    // Defining roles and routes
    set_roles();
    set_routes();
}

// This creates a set of roles which have permissions on
//  different resources.
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
    ]);

    // Inherit roles
    //  Every user is allowed to do what guests do
    //  Every admin is allowed to do what users do
    acl.addRoleParents( 'user', 'guest' );
    acl.addRoleParents( 'admin', 'user' );
}

// Defining routes ( resources )
function set_routes() {

    // Simple overview of granted permissions
    app.get( '/info',
        function( request, response, next ) {
            acl.allowedPermissions( get_user_id(), [ '/info', '/secret', '/topsecret' ], function( error, permissions ){
                response.json( permissions );
            });
        }
    );

    // Only for users and higher
    app.get( '/secret', acl.middleware( 1, get_user_id ),
        function( request, response, next ) {
            response.send( 'Welcome Sir!' );
        }
    );

    // Only for admins
    app.get( '/topsecret', acl.middleware( 1, get_user_id ),
        function( request, response, next ) {
            response.send( 'Hi Admin!' );
        }
    );

    // Setting a new role
    app.get( '/allow/:user/:role', function( request, response, next ) {
        acl.addUserRoles( request.params.user, request.params.role );
        response.send( request.params.user + ' is a ' + request.params.role );
    });

    // Unsetting a role
    app.get( '/disallow/:user/:role', function( request, response, next ) {
        acl.removeUserRoles( request.params.user, request.params.role );
        response.send( request.params.user + ' is not a ' + request.params.role + ' anymore.' );
    });
}

// Provide logic for getting the logged-in user
//  This is a job for your authentication layer
function get_user_id( request, response ) {
    return 'bob';
}

// Generic debug logger for node_acl
function logger() {
    return {
        debug: function( msg ) {
            console.log( '-DEBUG-', msg );
        }
    };
}

// Starting the server
app.listen( port, function() {
    console.log( 'ACL example listening on port ' + port );
});