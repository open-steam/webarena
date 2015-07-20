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
    Modules.Dispatcher.query('isAllowed', { resource: resource, permissions: permissions }, function (data) {
        //console.log("ACLManagerClient.prototype.isAllowed -> ");
        //console.log(data);

        cb(null, data);
    });
};







