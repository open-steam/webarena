/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

"use strict";

// This list contains actions that should be check for authorization
ACLManagerClient.prototype.notForEveryOne = ['Delete',
                                            'object.show.roles.permissions',
                                            'object.coupling.action',
                                            'object.decoupling.action'];

function ACLManagerClient() {

};

ACLManagerClient.prototype.makeACLName = function(id) {
    return 'ui_dynamic_object_' + id;
};

ACLManagerClient.prototype.getIdFromACLName = function(aclName) {
    return aclName.replace('ui_dynamic_object_', '');
};

ACLManagerClient.prototype.removeAllow = function(roles, resources, permissions, extras, cb) {
    if (_.isFunction(extras) && !cb) {
        cb = extras;
    }

    Modules.Dispatcher.query('acl', { type: 'removeAllow', roles: roles, resources: resources,
                                                           permissions: permissions, extras: extras }, function(result) {
        cb(result);
    });
};

ACLManagerClient.prototype.roleUsers = function(rolenames, cb) {
    Modules.Dispatcher.query('acl', { type: 'roleUsers', rolenames: rolenames }, function(users) {
        cb(users);
    });
};

ACLManagerClient.prototype.whatRolesAllowed = function(resource, permission, cb) {
    Modules.Dispatcher.query('acl', { type: 'whatRolesAllowed',
                                      resource: resource,
                                      permission: permission }, function(roles) {
        cb(roles);
    });
};

ACLManagerClient.prototype.allow = function(roles, resources, permissions, extras, cb) {
    if (_.isFunction(extras) && !cb) {
        cb = extras;
    }

    Modules.Dispatcher.query('acl', { type: 'allow',
                                      roles: roles,
                                      resources: resources,
                                      permissions: permissions,
                                      extras: extras }, function(result) {
        cb(result);
    });
};

ACLManagerClient.prototype.grantFullRights = function(resources, cb) {
    Modules.Dispatcher.query('acl', { type: 'grantFullRights', resources: resources }, function(result) {
        cb(result);
    });
};

// userId got in server side using the session
ACLManagerClient.prototype.isAllowed = function(resource, permissions, cb) {
    Modules.Dispatcher.query('acl', { type: 'isAllowed', resource: resource, permissions: permissions }, function (data) {
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
    var resources = [ this.makeACLName(id)];

    Modules.Dispatcher.query('acl', { type: 'allowedRolesPermissions', resources: resources }, function (data) {
        if (cb != undefined) return cb(data);

        var buttons = {};
        var content = '<div id="allowedRolesPermissions_group">';

        _.each(data, function (value, key) {
            content += '<div id="' + key + '_resource">';
            content += '<p>';
            _.each(value, function (value2) {
                content += '<p>';
                content += '<span><b>Role:</b> ' + value2.role + '</span>';
                content += '<br>';
                content += '<span><b>Permissions:</b> [';

                _.each(value2.permissions, function (element, index) {
                    content += element;
                    if ((index + 1) < value2.permissions.length) {
                        content += ' , ';
                    }
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

