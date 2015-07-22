"use strict";

/**
 * @namespace Holding methods and variables to display the trash basket
 */
GUI.trashbasket = {};

/**
 * called when the room is entered
 */
GUI.trashbasket.opened = function() {
	
	GUI.trashbasket.update();
	
	$("#sidebar").bind("mouseup", GUI.trashbasket.drop);
	
}


/**
 * called when the trashbasket is opened in GUI
 */
GUI.trashbasket.update = function() {

	$('#jsTrashTree').remove();

	var renderedTree = $("<div id='jsTrashTree' class='js-tree objectBrowserTree'></div>").jstree({
		"json_data": {
			"data": function(object, callback) {
				var room = ObjectManager.getObject(ObjectManager.getRoomID());
				room.serverCall("getDeletedObjects", {"id": ObjectManager.getRoomID()}, callback);
			},
			"ui": {
				"select_limit": 1,
			},
			"progressive_render": true
		},
		"plugins": ["themes", "json_data", "ui"]
	}).bind("loaded.jstree", function() {
		$('a > .jstree-icon').css({'background-size': 'contain'});
		$('.jstree-leaf').attr("title", "Double click or drag to restore object");
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
	
	$("#trash").append(renderedTree)
	
	$('#jsTrashTree').css("margin-top", "5px");
	
	$("#trash").on("dblclick", '.jstree-clicked', function() {
		GUI.trashbasket.restoreObject();
    });
	
}


/**
 * called when the trashbasket is closed in GUI
 */
GUI.trashbasket.closed = function() {
	
	$("#sidebar").unbind("mouseup", GUI.trashbasket.drop);
	
}


/**
 * called when an object was dropped from the canvas in the trashbasket
 */
GUI.trashbasket.drop = function(event) {

	var selected = ObjectManager.getSelected();
	var moving = false;
	
	//check if one of the selected objects has the property moving, than all selected objects are moved
    for (var i in selected) {
        var object = selected[i];
		if(object.moving){
			moving = true;
			break;
		}
	}
	   
	for (var i in selected) {
        var object = selected[i];
		object.deleteIt();
	}
	
}


/**
 * called when an object was dropped from the trashbasket on the canvas
 */
GUI.trashbasket.restoreObject = function(x, y) {

	var jstree_selected_item = $('.js-tree').jstree('get_selected');
		
	if(jstree_selected_item.length != 0){
		var objectID = jstree_selected_item.data('id');
		ObjectManager.restoreObject(objectID, x, y);
		GUI.trashbasket.update();
	}
	
}