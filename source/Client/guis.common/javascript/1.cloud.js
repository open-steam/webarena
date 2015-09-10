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
			'<p style="margin-right: 10px; margin-left:10px; font-weight:bold;">FTP-Server:</p>'+
			'<form name="login" style="margin-left: 40px;">'+
			'<input type="text" id="FTPHost" name="host" placeholder="ftp.xyz.com"/>'+
			'<input type="text" id="FTPUser" name="username" placeholder="'+GUI.translate("Username")+'" style="margin-top: 5px;"/>'+
			'<input type="password" id="FTPPw" name="password" placeholder="'+GUI.translate("Password")+'" style="margin-top: 5px;"/>'+
			'<input type="button" id="SubmitFTPButton" value="'+GUI.translate("Connect")+'" style="margin-top: 10px"/>'+
			'</form>'+
			'<p style="margin-right: 10px; margin-left:10px; font-weight:bold;">Koala:</p>'+
			'<form name="login" style="margin-left: 40px;">'+
			'<input type="text" id="KoalaUser" name="username" placeholder="'+GUI.translate("Username")+'" style="margin-top: 5px;"/>'+
			'<input type="password" id="KoalaPw" name="password" placeholder="'+GUI.translate("Password")+'" style="margin-top: 5px;"/>'+
			'<input type="button" id="SubmitKoalaButton" value="'+GUI.translate("Connect")+'" style="margin-top: 10px"/>'+
			'</form>'
		);
		
		if (GUI.isTouchDevice) {
			$("#cloud").find("#SubmitFTPButton").bind("touchstart", GUI.cloud.clickSubmitFTP);
			$("#cloud").find("#SubmitKoalaButton").bind("touchstart", GUI.cloud.clickSubmitKoala);
		} else {
			$("#cloud").find("#SubmitFTPButton").bind("click", GUI.cloud.clickSubmitFTP);
			$("#cloud").find("#SubmitKoalaButton").bind("click", GUI.cloud.clickSubmitKoala);
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
				var path;
				if(object == -1){
					var start = GUI.cloud.host.substring(0, 3).toLowerCase();
					if(start == "ftp"){
						path = ".";
					}
					else{
						path = "";
					}
				}
				else{
					path = object.data("path");
				}
				Modules.Dispatcher.query('listCloudFiles', {
					'host': GUI.cloud.host,
					'user': GUI.cloud.user,
					'pw': GUI.cloud.pw,
					'path': path
				}, function(result){callback(result)});
			},
			"ui": {
				"select_limit": 1,
			},
			"progressive_render": true
		},
		"plugins": ["themes", "json_data", "ui"]
	}).bind("loaded.jstree after_open.jstree", function() {
		$(this).find('a > .jstree-icon').css({'background-size': 'contain'});
		$(this).find('.jstree-leaf').attr("title", GUI.translate("Double click or drag to copy object"));
		$(this).find('.jstree-leaf').find("a").draggable({
			helper: function(event) { 
				return $(this).html().replace("&nbsp;", "").replace("jstree-icon", "jstree-icon file");
			}, 
			appendTo: $('#content'), 
			zIndex: 11003, 
			scope: "ContentDrag", 
			cursorAt: {top: 8, left: 8}
		}); 
	}).bind("open_node.jstree", function() {
		$(this).find('a > .jstree-icon').css({'background-size': 'contain'})
	});
	
	var name = GUI.cloud.host;
	if(name.indexOf("koala") > -1) name = "Koala"; 
	
	$("#cloud").append(
		'<p style="margin-left: 5px; font-weight:bold;">'+name+
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
		GUI.cloud.copyObject();
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

	var jstree_selected_item = $('#cloud').find('.js-tree').jstree('get_selected');
	
	if(jstree_selected_item.length != 0){
		var path = jstree_selected_item.data('path');
		var attributes = undefined;
		if(x){
			attributes = {"x": x, "y": y};
		}
		
		var roomID = ObjectManager.getRoomID();
		var room = ObjectManager.getObject(roomID);
		
		ObjectManager.createObject("File", attributes, "dummyContent", function(object){

			object.setAttribute("CloudConnection", [GUI.cloud.host, GUI.cloud.user, GUI.cloud.pw, path,]);
		
			Modules.SocketClient.serverCall('setCloudFileAsContent', {
				'host': GUI.cloud.host,
				'user': GUI.cloud.user,
				'pw': GUI.cloud.pw,
				'path': path,
				'object': object.id
			});
		
		}, undefined);	
	}	
}


/**
 * called when the FTP submit button is clicked
 */
GUI.cloud.clickSubmitFTP = function() {

	if($("#cloud").find("#FTPHost").val() == ""){
        $("#cloud").find("#FTPHost").css("borderColor", "red");
		return;
	}

	GUI.cloud.host = $("#cloud").find("#FTPHost").val();
	GUI.cloud.user = $("#cloud").find("#FTPUser").val();
	GUI.cloud.pw = $("#cloud").find("#FTPPw").val();

	$("#cloud").find("p").remove();
	$("#cloud").find("form").remove();

	GUI.cloud.buildContent();
	
}


/**
 * called when the Koala submit button is clicked
 */
GUI.cloud.clickSubmitKoala = function() {

	if($("#cloud").find("#KoalaUser").val() == ""){
        $("#cloud").find("#KoalaUser").css("borderColor", "red");
		return;
	}
	if($("#cloud").find("#KoalaPw").val() == ""){
        $("#cloud").find("#KoalaPw").css("borderColor", "red");
		return;
	}

	GUI.cloud.host = "https://koala.uni-paderborn.de/webdav/";
	GUI.cloud.user = $("#cloud").find("#KoalaUser").val();
	GUI.cloud.pw = $("#cloud").find("#KoalaPw").val();

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


/**
 * Uploads the content of the object and delete it
 */
GUI.cloud.putBack = function(host, user, pw, path, objectID) {

	path = path.substring(0, path.length - 1);
	
	Modules.Dispatcher.query('putBack', {
		'host': host,
		'user': user,
		'pw': pw,
		'path': path,
		'object': objectID,
		'room': ObjectManager.getRoomID()
	}, function(result){
		var object = ObjectManager.getObject(objectID);
		object.deleteIt();
	});
}