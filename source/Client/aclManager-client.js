/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

"use strict";

// This list contains actions that should be check for authorization
ACLManagerClient.prototype.notForEveryOne = ['Delete',
                                            'object.show.roles.permissions',
                                            'object.coupling.action'];

function ACLManagerClient() {

};

ACLManagerClient.prototype.makeACLName = function(id) {
    return 'ui_dynamic_object_' + id;
};

// userId got in server side using the session
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

ACLManagerClient.prototype.allowedRolesPermissions = function(id, cb) {
    var resources = [this.makeACLName(id)];

    Modules.Dispatcher.query('acl', { type: 'allowedRolesPermissions', resources: resources }, function (data) {
        if (cb != undefined) return cb(data);

        var buttons = {};
        var content = '<div id="allowedRolesPermissions_group">';

        _.each(data, function (value, key, list) {
            content += '<div id="' + key + '_resource">';
            content += '<p>';
            _.each(value, function (value2, key2, list2) {
                content += '<p>';
                content += '<span><b>Role:</b> ' +  value2.role + '</span>';
                content += '<br>';
                content += '<span><b>Permissions:</b> [';

                _.each(value2.permissions, function (element, index, list3) {
                    content += element;
                    if (value2.permissions.length < (index + 1))  content += ',';
                });

                content += ']</span>';
                content += '</p>';
            });

            content += '</p>';
            content += '</div>';
        });

        content += '</div>';

        GUI.dialog("Roles and Permissions", $(content), buttons, undefined, false);
    });
};

