"use strict";

/**
 * @namespace Holding methods and variables to display the trash basket
 */
GUI.trashbasket = {};

/**
 * called when the trashbasket is opened in GUI
 */
GUI.trashbasket.opened = function() {
	
	GUI.trashbasket.update();
	
	$("#sidebar").bind("mouseup", GUI.trashbasket.drop);
	$("#sidebar").bind("mouseenter", GUI.trashbasket.enter);
	$("#sidebar").bind("mouseleave", GUI.trashbasket.leave);
	
}


/**
 * updates the trashbasket content (called when opening the trashbasket, if an object was deleted or restored)
 */
GUI.trashbasket.update = function() {

	$('#trash').empty();

	var renderedTree = $("<div id='jsTrashTree' class='js-tree objectBrowserTree'></div>").jstree({
		"json_data": {
			"data": function(object, callback) {
				var room = ObjectManager.getObject(ObjectManager.getRoomID());
				room.serverCall("getDeletedObjects", function(result){
					if(result[0] == undefined && $("#trash").find("#emptyTrashMessage").length == 0){
						$("#trash").append('<p id="emptyTrashMessage" style="margin-left: 10px"><b>'+GUI.translate("The trash basket is empty. You can delete objects with the contextmenu, the Escape-Button or by dragging them into the trash basket.")+'</b></p>');
					}
					callback(result);
				});
			},
			"ui": {
				"select_limit": 1,
			},
			"progressive_render": true
		},
		"plugins": ["themes", "json_data", "ui"]
	}).bind("loaded.jstree", function() {
		$(this).find('a > .jstree-icon').css({'background-size': 'contain'});
		$(this).find('.jstree-leaf').attr("title", "Double click or drag to restore object");
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
	
    var cleanButton = $("<button type='button' style='margin-top:10px; margin-left:5px;' class='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only' role='button'><span class='ui-button-text'>"+GUI.translate("Clean Trashbucket")+"</span></button>");
    
    $(cleanButton).click(function() {
      GUI.trashbasket.clean();
    });
	$("#trash").append(cleanButton);
    $("#trash").append(renderedTree);
	
	$('#jsTrashTree').css("margin-top", "5px");
	
	$("#trash").on("dblclick", '.jstree-clicked', function() {
		GUI.trashbasket.restoreObject();
    })
	setTimeout(function(){ GUI.objectList.update();}, 300);
	
}


/**
 * called when the trashbasket is closed in GUI
 */
GUI.trashbasket.closed = function() {
	
	$("#sidebar").unbind("mouseup", GUI.trashbasket.drop);
	$("#sidebar").unbind("mouseenter", GUI.trashbasket.enter);
	$("#sidebar").unbind("mouseleave", GUI.trashbasket.leave);
	
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
	   
	if(moving){   
		for (var i in selected) {
			var object = selected[i];
			object.deleteIt();
		}
	}
}


/**
 * called when an object was dropped from the trashbasket on the canvas
 */
GUI.trashbasket.restoreObject = function(x, y) {

	var jstree_selected_item = $('#trash').find('.js-tree').jstree('get_selected');
		
	if(jstree_selected_item.length != 0){
		var objectID = jstree_selected_item.data('id');
		var room = ObjectManager.getObject(ObjectManager.getRoomID());
		var objectStillExist = false;
		
		room.serverCall("getDeletedObjects", function(result){
			for(var i=0; i<result.length; i++){
				if(result[i].metadata.id == objectID)
					objectStillExist=true;
			}

			if(objectStillExist){
				ObjectManager.restoreObject(objectID, x, y);	
			}else{
				var dialog_buttons = {};
	    
	
	    
				dialog_buttons[GUI.translate("Close message")] = function() {
					return;
				};
				
				GUI.dialog(
	            GUI.translate("Object does not exist"),
	            [GUI.translate("Object does not exist anymore. It was deleted by another user completely. Trashtree will up. Trash is updated")],
	            dialog_buttons,
	            300
	            );
			}
			
			GUI.trashbasket.update();			
			
			
		});
		
	}
	
}


/**
 * called when the mouse cursor enters the trashbasket area 
 */
GUI.trashbasket.enter = function() {
	var selected = ObjectManager.getSelected();
	var moving = false;
	
	//check if one of the selected objects has the property moving, than all selected objects are moved
    for (var i in selected) {
        var object = selected[i];
		if(object.moving){
			$('#jsTrashTree').hide();
			$("#trash").find("#emptyTrashMessage").hide();
			$("#trash").append('<p id="dropMessage" style="margin-left: 10px"><b>'+GUI.translate("Release the mouse button to delete")+'</b></p>');
			break;
		}
	}
}


/**
 * called when the mouse cursor leaves the trashbasket area 
 */
GUI.trashbasket.leave = function() {

	$("#trash").find("#dropMessage").remove();
	$("#trash").find("#emptyTrashMessage").show();
	$('#jsTrashTree').show();
	
}

/**
 * delete all objects in the trash folder
 */
GUI.trashbasket.clean = function() {
    GUI.showCheckDialog();
}

// open a Dialog and ask the user if he want to delete all objects in the trash
GUI.showCheckDialog = function() {
	
    var self = this;var that=this;
    var dialog_buttons = {};
    

    
    dialog_buttons[GUI.translate("Clean Trashbucket")] = function() {
        ObjectManager.getCurrentRoom().clearTrash();
    };
    dialog_buttons[GUI.translate( "Do not clean")] = function() {
     
    };
    
    var dialog_width = 300;
    
    var html = "<p>Möchten Sie den Papierkorb wirklich leeren?</p>";
    var content = [];
    content.push(html);
    
    var dialog = GUI.dialog(
            GUI.translate("Clean Trashbucket"),
            content,
            dialog_buttons,
            dialog_width
            );
    
    
}