"use strict";

/**
 * @namespace Holding methods and variables to display the recent changes
 */
GUI.recentChanges = {};


/**
 * add a single change entry
 */
GUI.recentChanges.addChange = function(room, change) {
	
	var action = GUI.translate(change.action);
	if(change.action == "set Attribute"){
		action = action+': '+room.translate(GUI.currentLanguage, change.attribute);
	}
	
	$("#recent_changes").prepend(
		'<div class="recent_change">'+
		'<span style="color:  #000000">'+change.user+' ('+change.date+')</span>'+
		'<span style="color:  #000000; font-weight: normal;">'+change.name+'</span>'+
		action+
		'</div>'
	);
}


/**
 * called when the recent changes window is opened in GUI
 */
GUI.recentChanges.opened = function() {

	$("#recentChanges").empty();
	
	$("#recentChanges").append('<div id="recent_changes"></div>');
	
	var room = ObjectManager.getCurrentRoom();

	room.serverCall("getRecentChanges", {"roomID" : room.id}, function(result){
		
		if(result.length == 0){
			$("#recentChanges").append('<p id="emptyChangesMessage" style="margin-left: 10px"><b>'+GUI.translate("There are no recent changes")+'</b></p>');
		}
		else{
			for(var i = 0; i<result.length; i++){
				GUI.recentChanges.addChange(room, result[i]);
			}
		}
	});
	
}


/**
 * called when the recent changes window is closed in GUI
 */
GUI.recentChanges.update = function() {

	GUI.recentChanges.opened();

}