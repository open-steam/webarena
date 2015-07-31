/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

"use strict";

function ACLManagerClient() {

};

ACLManagerClient.prototype.isAllowed = function(resource, permissions, cb) {
    //console.log("ACLManagerClient.isAllowed resource: " + resource);
    //console.log("ACLManagerClient.isAllowed permissions: " + permissions);
    Modules.Dispatcher.query('acl', { type: 'isAllowed', resource: resource, permissions: permissions }, function (data) {
        //console.log("ACLManagerClient.prototype.isAllowed -> ");
        //console.log(data);

        cb(null, data);
    });
};

// there is no necessity to send the user
// In the server side it will be taken from the session
ACLManagerClient.prototype.userRoles = function(userId, cb) {
    if (typeof userId == 'function') {
        cb = userId;
        userId = undefined;
    }

    Modules.Dispatcher.query('acl', { type: 'userRoles', userId: userId }, function (data) {
        cb(null, data);
    });
};


