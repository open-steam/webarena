/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

"use strict";

function CouplingManager() {

};

CouplingManager.prototype.getConnectedUsers = function(cb) {
    Modules.Dispatcher.query('getConnectedUsers', { }, function (data) {
        cb(null, data);
    });
};
