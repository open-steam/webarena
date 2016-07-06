"use strict";

/**
 * @namespace Holding methods and variables to display the trash basket
 */
GUI.objectList = {};

/**
 * called when the objectList is opened in GUI
 */
GUI.objectList.opened = function() {
	GUI.objectList.update();
}

/**
 * a list of objects where you navigate to
 */
GUI.navigateList = null;

/**
 * updates the trashbasket content (called when opening the trashbasket, if an object was deleted or restored)
 */
GUI.objectList.update = function() {
	
	var that = this;
	$('#objectList').empty();

	var renderedTree = $("<div id='objectListTree' class='js-tree objectBrowserTree'></div>").jstree({
		"json_data": {
			"data": function(object, callback) {
				var currentObjects = ObjectManager.getInventory();
				var size = Object.keys(currentObjects).length;
				var objectArray = new Array();
				var count = 0;
				
				for (var prop in currentObjects) {
					count++;
					var tmpObject = ObjectManager.getObject(prop);

					var id = tmpObject.getAttribute('id');
					var type = tmpObject.getAttribute('type');
					var name = tmpObject.getAttribute('name');
					var coordX = tmpObject.getAttribute('x');
					var coordY = tmpObject.getAttribute('y');
					var node = {
							data : {
								title : count+". "+name +"_("+coordX+"|"+coordY+")",
								icon : '/objectIcons/'+type,
								x : coordX,
								y : coordY
							},
							metadata : {
								id : id,
								name : name,
								type : type,
							}
						}
					objectArray.push(node);
				}
				GUI.navigateList = objectArray;
				callback(objectArray);
			},
			"ui": {
				"select_limit": 1,
			},
			"progressive_render": true
		},
		"plugins": ["themes", "json_data", "ui"]
	}).bind("loaded.jstree", function() {
		$(this).find('a > .jstree-icon').css({'background-size': 'contain'});
		$(this).find('.jstree-leaf').attr("title", "Double click to focus the object");
		$(this).find('.jstree-leaf').find("a").draggable({
			helper: function(event) { 
				return $(this).html().replace("&nbsp;", "");
			}, 
			appendTo: $('#content'), 
			zIndex: 11003, 
			scope: "ContentDrag", 
			cursorAt: {top: 8, left: 8}
		}); 
	}).bind("open_node.jstree", function() {
		$(this).find('a > .jstree-icon').css({'background-size': 'contain'})
	});
	
    $("#objectList").append(renderedTree);
	
	$('#objectListTree').css("margin-top", "10px");
	
	$("#objectList").on("dblclick", '.jstree-clicked', function() {
		GUI.objectList.navigate();
    });

}



/**
 * scroll to the selected object
 */
GUI.objectList.navigate = function() {
	if(GUI.navigateList != null){
		var jstree_selected_item = $('#objectList').find('.js-tree').jstree('get_selected')[0].textContent;
		jstree_selected_item = jstree_selected_item.substr(0,jstree_selected_item.indexOf("."))
		jstree_selected_item = jstree_selected_item.replace("  ","");
		var selectedObject = GUI.navigateList[parseInt(jstree_selected_item)-1]
		window.scrollTo(selectedObject.data[0].x, selectedObject.data[0].y);
		ObjectManager.getObject(selectedObject.metadata.id).select();
	}
}