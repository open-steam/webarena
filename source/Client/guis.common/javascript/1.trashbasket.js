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
		$('.jstree-leaf').attr("title", "Double click to restore object");
	}).bind("open_node.jstree", function() {
		$('a > .jstree-icon').css({'background-size': 'contain'})
	});
	
	$("#trash").append(renderedTree)
	
	$('#jsTrashTree').css("margin-top", "5px");
	
	$("#trash").on("dblclick", '.jstree-clicked', function() {
        var jstree_selected_item = $('.js-tree').jstree('get_selected');
		
		if(jstree_selected_item.length != 0){
			var objectID = jstree_selected_item.data('id');
			ObjectManager.restoreObject(objectID);
			GUI.trashbasket.update();
		}
    });
}


/**
 * called when the trashbasket is closed in GUI
 */
GUI.trashbasket.closed = function() {

	//TODO

}