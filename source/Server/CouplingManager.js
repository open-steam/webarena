/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

"use strict";

function CouplingManager(userManager) {
    this.userManager = userManager;
};

CouplingManager.prototype.getConnectedUsers = function(cb) {
    var connectedUsersCollection = this.userManager.getConnectedUsers();
    cb(null, connectedUsersCollection);
};

exports = module.exports = CouplingManager;
