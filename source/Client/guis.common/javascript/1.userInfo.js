/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

"use strict";

function UserInfo() {
    this.userInfoArea;
    this.inspector;
    this.inspectorArea;

    this.isAdmin = false;
};

UserInfo.prototype.init = function() {
    this.userInfoArea = $('#userInfo');

    this.inspectorArea = $("<div>");
    this.userInfoArea.append(this.inspectorArea);

    this.inspectorArea.jDesktopInspector();
    this.inspector = this.inspectorArea.data('jDesktopInspector');

    var cookie = JSON.parse($.cookie('WADIV').replace("j:", ""));

    // A new jQueryInspector page...
    var page = this.inspector.addPage("Basic");
    var section = page.addSection();

    var name = section.addElement("Name");
    name.setValue(cookie['name']);
    name.setInactive();

    var wadiv = section.addElement("WADIV");
    wadiv.setValue(cookie['WADIV']);
    wadiv.setInactive();

    var wadiv = section.addElement("Role");

    var that = this;
    Modules.ACLManager.userRoles(function (err, result) {
        var user = _.contains(result, 'admin') ? "admin" : "user";
        that.isAdmin = (user == 'admin');

        wadiv.setValue(user);
        wadiv.setInactive();
    });
};

GUI.userInfo = new UserInfo();
