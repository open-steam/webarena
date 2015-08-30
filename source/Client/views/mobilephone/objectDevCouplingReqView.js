"use strict";

var ObjectDevCouplingReqView = {};

ObjectDevCouplingReqView.settings = {
    visible: false,
}

window.onresize = function() {
	console.log("ObjectDevCouplingReqView::window.onresize");
}

ObjectDevCouplingReqView.settings.visible = true;
ObjectDevCouplingReqView.titlebar = undefined;

ObjectDevCouplingReqView.build = function() {
	
	// Create the title bar of the object view.
	var titlebar = $('<div></div>');
	var titlebarInner = $('<p style="margin: 0px; padding: 0px"></p>');
	var backButton = $('<img src="../../guis/mobilephone/images/abc_ic_ab_back_holo_light.png" style="opacity: 1; vertical-align: middle; margin-right: 14px; cursor: pointer" />');
	$(titlebarInner).append(backButton);
	$(titlebarInner).append('<span style="vertical-align: middle">' + "Object-device coupling" + '</span>');
	$(titlebar).append(titlebarInner);
	$(titlebar).addClass("header");

	ObjectDevCouplingReqView.titlebar = titlebar;
	
	$("body").append(titlebar);
	
	$(backButton).bind("click", ObjectDevCouplingReqView.close);

	$('#objectdevreqcouplingview').append(ObjectDevCouplingReqView.buildUI());
}

ObjectDevCouplingReqView.buildUI = function() {
	var ui  = $('<div class="coupling-device-req"></div>');
	var ui2 = $('<div id="instructions" style="margin: 30px 5px 0px 5px;"><span>Enter the Id of the object to couple with.</span></div>');

	ui2.append('<input id="objectidFeld" class="input" style="width: 100%; text-align: left" type="text" size="8" value="" "/>');
	ui2.append('<input id="simpleTextSave" class="inputButton" style="margin-top: 10px; margin-bottom: 10px" type="button" value="Couple" />');

	ui2.find('#simpleTextSave').bind('click', function() {
		var objectId = ui2.find('#objectidFeld').val().trim();

		if (objectId) {
			var resources = Modules.ACLManager.makeACLName(objectId);

			Modules.ACLManager.allow(GUI.userInfo.wadiv, resources, 'couple', function(result) {
				ObjectDevCouplingReqView.close();

				if (!result) {
					alert("Object with id " + objectId + " not found.");
				}
			});
		}
	});

	return ui.append(ui2);
}

ObjectDevCouplingReqView.close = function() {
	ObjectDevCouplingReqView.settings.visible = false;
	ObjectView.settings.visible = false;
	ObjectList.settings.visible = true;
	$("#objectdevreqcouplingview").fadeOut("slow");
	$("#objectview").fadeOut("slow");
	$("#createmenu").fadeOut("slow");
	$("#objectlist").fadeIn("slow");

	$("#objectview div").remove();
	$("#objectdevreqcouplingview div").remove();
	$(ObjectDevCouplingReqView.titlebar).remove();
};
