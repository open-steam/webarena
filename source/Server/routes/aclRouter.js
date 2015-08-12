/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval , University of Paderborn, 2015
 *
 */
"use strict";

var express = require('express');
var acl_router = express.Router();

function ACLRouter(app, acl) {

    app.use('/acl', acl_router);

    // Assign the admin role to the user.
    acl_router.get('/makeMeAdmin', ensureAuthenticated, function(req, res) {
        acl.addUserRoles(req.cookies.WADIV.WADIV, 'admin', function(err) {
            if(err) {
                console.warn("ERROR!! by makeMeAdmin function" + err);
                return res.status(500).send("ERROR!! by makeMeAdmin function" + err);
            }

            return res.status(200).send("now you are an Admin");
        });
    });

    // Adds roles to a given user id.
    acl_router.get('/addUserRoles/:userId/:roles', function(req, res) {
        acl.addUserRoles(req.params.userId, req.params.roles, function(err) {
            if(err) {
                console.warn("ERROR!! by addUserRoles function" + err);
                return res.status(500).send("ERROR!! by addUserRoles function" + err);
            }

            return res.status(200).send("role(s) added");
        });
    });

    // Remove roles from a given user.
    acl_router.get('/removeUserRoles/:roles/:userId?', function(req, res) {
        var user = req.params.userId ? req.params.userId : req.cookies.WADIV.WADIV;

        acl.removeUserRoles(user, req.params.roles, function(err) {
            if(err) {
                console.warn("ERROR!! by removeUserRoles function" + err);
                return res.status(500).send("ERROR!! by removeUserRoles function" + err);
            }

            return res.status(200).send("role(s): " + req.params.roles + " removed");
        });
    });

    // Removes a role from the system.
    acl_router.get('/removeRole/:role', function(req, res) {
        acl.removeRole(req.params.role, function(err) {
            if(err) {
                console.warn("ERROR!! by removeRole function" + err);
                return res.status(500).send("ERROR!! by removeRole function" + err);
            }

            return res.status(200).send("role removed");
        });
    });

    // Return boolean whether user has the role
    acl_router.get('/hasRole/:userId/:rolename', function(req, res) {
        acl.hasRole(req.params.userId, req.params.rolename, function(err, hasRole) {
            if(err) {
                console.warn("ERROR!! by hasRole function" + err);
                return res.status(500).send("ERROR!! by hasRole function" + err);
            }

            return res.status(200).send(hasRole);
        });
    });

    // Returns true if any of the given roles have the right permissions.
    acl_router.get('/areAnyRolesAllowed/:roles/:resource/:permissions', function(req, res) {
        var roles       = req.params.roles;
        var resource    = req.params.resource;
        var permissions = req.params.permissions;

        acl.areAnyRolesAllowed(roles, resource, permissions, function(err, allowed) {
            if(err) {
                console.warn("ERROR!! by areAnyRolesAllowed function" + err);
                return res.status(500).send("ERROR!! by areAnyRolesAllowed function" + err);
            }

            return res.status(200).send(allowed);
        });
    });

    // Return all users who has a given role.
    acl_router.get('/roleUsers/:rolename', function(req, res) {
        acl.roleUsers(req.params.rolename, function(err, users) {
            if(err) {
                console.warn("ERROR!! by roleUsers function" + err);
                return res.status(500).send("ERROR!! by roleUsers function" + err);
            }

            return res.status(200).send(users);
        });
    });

    /// Return all the roles from a given user.
    acl_router.get('/userRoles/:user?', function(req, res) {
        var user = req.params.user ? req.params.user : req.cookies.WADIV.WADIV;

        acl.userRoles(user, function(err, roles) {
            if(err) {
                console.warn("ERROR!! by userRoles function" + err);
                return res.status(500).send("ERROR!! by userRoles function" + err);
            }

            return res.status(200).send(roles);
        });
    });

    // Returns what resources a given role has permissions over.
    acl_router.get('/whatResources/:role', function(req, res) {
        acl.whatResources(req.params.role, function(err, resources) {
            if(err) {
                console.warn("ERROR!! by whatResources function" + err);
                return res.status(500).send("ERROR!! by whatResources function" + err);
            }

            return res.status(200).send(resources);
        });
    });

    // Removes a resource from the system
    acl_router.get('/removeResource/:resource', function(req, res) {
        acl.removeResource(req.params.resource, function(err) {
            if(err) {
                console.warn("ERROR!! by removeResource function" + err);
                return res.status(500).send("ERROR!! by removeResource function" + err);
            }

            return res.status(200).send("resource removed");
        });
    });

    // Returns the permissions for the given resource and set of roles
    acl_router.get('/resourcePermissions/:roles/:resource', function(req, res) {
        acl.resourcePermissions(req.params.roles, req.params.resource, function(resource_Permissions) {
            if(err) {
                console.warn("ERROR!! by resourcePermissions function" + err);
                return res.status(500).send("ERROR!! by resourcePermissions function" + err);
            }

            return res.status(200).send(resource_Permissions);
        });
    });

    // Adds the given permissions to the given roles over the given resources.
    acl_router.get('/allow/:roles/:resources/:permissions', function(req, res) {
        var roles       = req.params.roles;
        var resources   = req.params.resources;
        var permissions = req.params.permissions;

        acl.allow(roles, resources, permissions, function(err) {
            if(err) {
                console.warn("ERROR!! by allow function" + err);
                return res.status(500).send("ERROR!! by allow function" + err);
            }

            return res.status(200).send("allowed");
        });
    });

    // Returns all the allowable permissions a given user have to access the given resources.
    acl_router.get('/allowedPermissions/:resources/:userId?', function(req, res) {
        var user = req.params.userId ? req.params.userId : req.cookies.WADIV.WADIV;
        var resources   = req.params.resources;

        acl.allowedPermissions(user, resources, function(err, obj) {
            if(err) {
                console.warn("ERROR!! by allowedPermissions function" + err);
                return res.status(500).send("ERROR!! by allowedPermissions function" + err);
            }

            return res.status(200).send(obj);
        });
    });

    acl_router.get('/rolesCollection', function(req, res) {
        acl.rolesCollection(function(err, roles) {
            if(err) {
                console.warn("ERROR!! by rolesCollection function" + err);
                return res.status(500).send("ERROR!! by rolesCollection function" + err);
            }

            return res.status(200).send(roles);
        });
    });

    /// Returns all the allowable permissions roles have to access the given resources.
    ///
    /// It returns an array of objects where every object maps a role name to a list of
    /// permissions for the resource.
    acl_router.get('/allowedRolesPermissions/:resources', function(req, res) {
        var resources = (typeof req.params.resources === 'string') ? [req.params.resources] : req.params.resources;

        acl.allowedRolesPermissions(resources, function(err, obj) {
            if(err) {
                console.warn("ERROR!! by allowedRolesPermissions function" + err);
                return res.status(500).send("ERROR!! by allowedRolesPermissions function" + err);
            }

            return res.status(200).send(obj);
        });
    });

    // Returns if a user is already registered in the system
    acl_router.get('/isUser/:user?', function(req, res) {
        var user = req.params.user ? req.params.user : req.cookies.WADIV.WADIV;

        acl.isUser(user, function(err, result) {
            if(err) {
                console.warn("ERROR!! by isUser function" + err);
                return res.status(500).send("ERROR!! by isUser function" + err);
            }

            return res.status(200).send(result);
        });
    });

    acl_router.get('/ping', function(req, res) {
        res.status(200).send("pong!");
    });
};

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }

    res.status(503).send("unknown user");
}

exports = module.exports = ACLRouter;
