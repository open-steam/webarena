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
    this.wadiv   = undefined;
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

    this.wadiv = cookie['WADIV'];

    var wadivInfo = section.addElement("WADIV");
    wadivInfo.setValue(this.wadiv);
    wadivInfo.setInactive();

    var role = section.addElement("Role");

    var that = this;
    Modules.ACLManager.userRoles(function (err, result) {
        var user = _.contains(result, 'admin') ? "admin" : "user";
        that.isAdmin = (user == 'admin');

        role.setValue(user);
        role.setInactive();
    });
};

GUI.userInfo = new UserInfo();
