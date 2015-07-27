"use strict";

/**
 * @namespace Holding methods and variables to display the cloud
 */
GUI.cloud = {};

/**
 * called when the cloud page is opened
 */
GUI.cloud.opened = function() {
	
	if((typeof GUI.cloud.host === 'undefined' || GUI.cloud.host == "") && $("#cloud").find("p").length == 0){
	
		$("#cloud").append(
			'<p style="margin-right: 10px; margin-left:10px;">'+GUI.translate("Please fill in the given boxes to connect with an FTP-Server")+'</p>'+
			'<form name="login" style="margin-left: 40px;">'+
			'<input type="text" id="host" name="host" placeholder="ftp.xyz.com"/>'+
			'<input type="text" id="user" name="username" placeholder="'+GUI.translate("Username")+'" style="margin-top: 5px;"/>'+
			'<input type="password" id="pw" name="password" placeholder="'+GUI.translate("Password")+'" style="margin-top: 5px;"/>'+
			'<input type="button" id="SubmitButton" value="'+GUI.translate("Connect")+'" style="margin-top: 10px"/>'+
			'</form>');
		
		if (GUI.isTouchDevice) {
			$("#cloud").find("#SubmitButton").bind("touchstart", GUI.cloud.clickSubmit);
		} else {
			$("#cloud").find("#SubmitButton").bind("click", GUI.cloud.clickSubmit);
		}
		
	}
	
}


/**
 * called after entering the ftp-connection-data
 */
GUI.cloud.buildContent = function() {

	$('#jsCloudTree').remove();

	var renderedTree = $("<div id='jsCloudTree' class='js-tree objectBrowserTree'></div>").jstree({
		"json_data": {
			"data": function(object, callback) {
				var room = ObjectManager.getObject(ObjectManager.getRoomID());
				if(object == -1){
					room.serverCall("getFTPFiles", {"host": GUI.cloud.host, "user": GUI.cloud.user, "pw": GUI.cloud.pw, "path": "."}, callback);
				}
				else{
					room.serverCall("getFTPFiles", {"host": GUI.cloud.host, "user": GUI.cloud.user, "pw": GUI.cloud.pw, "path": object.data("path")}, callback);
				}
			},
			"ui": {
				"select_limit": 1,
			},
			"progressive_render": true
		},
		"plugins": ["themes", "json_data", "ui"]
	}).bind("loaded.jstree", function() {
		$('a > .jstree-icon').css({'background-size': 'contain'});
		$('.jstree-leaf').attr("title", "Double click or drag to copy object");
		$('.jstree-leaf').find("a").draggable({
			helper: function(event) { 
				return $(this).html().replace("&nbsp;", "");
			}, 
			appendTo: $('#content'), 
			zIndex: 11003, 
			scope: "ContentDrag", 
			cursorAt: {top: 8, left: 8}
		}); 
	}).bind("open_node.jstree", function() {
		$('a > .jstree-icon').css({'background-size': 'contain'})
	});
	
	$("#cloud").append(
		'<p style="margin-left: 5px;">'+GUI.cloud.host+
		'<input type="button" id="ChangeButton" value="'+GUI.translate("Change")+'" style="margin-left: 10px;"/>'+
		'</p>'
	);
	
	$("#cloud").append(renderedTree)
	
	$('#jsCloudTree').css("margin-top", "-10px");
	
	if (GUI.isTouchDevice) {
		$("#cloud").find("#ChangeButton").bind("touchstart", GUI.cloud.clickChange);
	} else {
		$("#cloud").find("#ChangeButton").bind("click", GUI.cloud.clickChange);
	}
	
	$("#cloud").on("dblclick", '.jstree-clicked', function() {
		//TODO
    });
	
}


/**
 * called when the cloud is closed in GUI
 */
GUI.cloud.closed = function() {
	
}


/**
 * called when an object was dropped from the cloud on the canvas
 */
GUI.cloud.copyObject = function(x, y) {

	/*
	var jstree_selected_item = $('.js-tree').jstree('get_selected');
		
	if(jstree_selected_item.length != 0){
		var objectID = jstree_selected_item.data('name');
		
		//TODO
		
	}
	*/
	
}


/**
 * called when the submit button is clicked
 */
GUI.cloud.clickSubmit = function() {

	if($("#cloud").find("#host").val() == ""){
        $("#cloud").find("#host").css("borderColor", "red");
		return;
	}

	GUI.cloud.host = $("#cloud").find("#host").val();
	GUI.cloud.user = $("#cloud").find("#user").val();
	GUI.cloud.pw = $("#cloud").find("#pw").val();

	$("#cloud").find("p").remove();
	$("#cloud").find("form").remove();

	GUI.cloud.buildContent();
	
}


/**
 * called when the change button is clicked
 */
GUI.cloud.clickChange = function() {

	GUI.cloud.host = "";
	GUI.cloud.user = "";
	GUI.cloud.pw = "";

	$("#cloud").find("p").remove();
	$('#jsCloudTree').remove();
	
	GUI.cloud.opened();
	
}