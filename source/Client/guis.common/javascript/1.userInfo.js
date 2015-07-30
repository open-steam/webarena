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
};

UserInfo.prototype.init = function() {
    this.userInfoArea = $("#userInfo");

    var objectArea = $("<div>");
    objectArea.addClass("jDesktopInspector_main");
    objectArea.html('<div class="jDesktopInspector_pageHead">Basic</div>');
    this.userInfoArea.append(objectArea);

    this.inspectorArea = $("<div>");
    this.userInfoArea.append(this.inspectorArea);

    this.inspectorArea.jDesktopInspector();
    this.inspector = this.inspectorArea.data("jDesktopInspector");


};

GUI.userInfo = new UserInfo();
