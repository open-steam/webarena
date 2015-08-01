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

    acl_router.get('/makeAdmin', ensureAuthenticated, function(req, res) {
        acl.addUserRoles(req.cookies.WADIV.WADIV, 'admin', function(err) {
            if(err) {
                console.warn("ERROR!! by makeAdmin function" + err);
                return res.status(500).send("ERROR!! by makeAdmin function" + err);
            }

            return res.status(200).send("now you are an Admin");
        });
    });

    acl_router.get('/removeRole/:role', function(req, res) {
        acl.removeRole(req.params.role, function(err) {
            if(err) {
                console.warn("ERROR!! by removeRole function" + err);
                return res.status(500).send("ERROR!! by removeRole function" + err);
            }

            return res.status(200).send("role removed");
        });
    });

    acl_router.get('/hasRole/:userId/:rolename', function(req, res) {
        acl.hasRole(req.params.userId, req.params.rolename, function(err, hasRole) {
            if(err) {
                console.warn("ERROR!! by hasRole function" + err);
                return res.status(500).send("ERROR!! by hasRole function" + err);
            }

            return res.status(200).send(hasRole);
        });
    });

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

    acl_router.get('/roleUsers/:rolename', function(req, res) {
        acl.roleUsers(req.params.rolename, function(err, users) {
            if(err) {
                console.warn("ERROR!! by roleUsers function" + err);
                return res.status(500).send("ERROR!! by roleUsers function" + err);
            }

            return res.status(200).send(users);
        });
    });

    acl_router.get('/userRoles/:user?', function(req, res) {
        var user = req.params.user ? req.params.user : req.cookies.WADIV.WADIV

        acl.userRoles(user, function(err, roles) {
            if(err) {
                console.warn("ERROR!! by userRoles function" + err);
                return res.status(500).send("ERROR!! by userRoles function" + err);
            }

            return res.status(200).send(roles);
        });
    });

    acl_router.get('/whatResources/:role', function(req, res) {
        acl.whatResources(req.params.role, function(err, resources) {
            if(err) {
                console.warn("ERROR!! by whatResources function" + err);
                return res.status(500).send("ERROR!! by whatResources function" + err);
            }

            return res.status(200).send(resources);
        });
    });

    acl_router.get('/removeResource/:resource', function(req, res) {
        acl.removeResource(req.params.resource, function(err) {
            if(err) {
                console.warn("ERROR!! by removeResource function" + err);
                return res.status(500).send("ERROR!! by removeResource function" + err);
            }

            return res.status(200).send("resource removed");
        });
    });

    acl_router.get('/resourcePermissions/:roles/:resource', function(req, res) {
        acl.resourcePermissions(req.params.roles, req.params.resource, function(resource_Permissions) {
            if(err) {
                console.warn("ERROR!! by resourcePermissions function" + err);
                return res.status(500).send("ERROR!! by resourcePermissions function" + err);
            }

            return res.status(200).send(resource_Permissions);
        });
    });

    acl_router.get('/isUser/:user?', function(req, res) {
        var user = req.params.user ? req.params.user : req.cookies.WADIV.WADIV

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
