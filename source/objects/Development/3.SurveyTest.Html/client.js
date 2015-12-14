/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/
SurveyTest.clientRegister=function(){
	var that = this;
	SurveyTest.parent.clientRegister.call(this);
	
	this.registerAction('Send to users',function(object){
		that.chooseRecievingRoomsDialogue(object);
	},true);

	this.registerAction('Send to room', function(object){
		that.send(object);
	},true);
}

SurveyTest.send = function(object, roomID) {
	//unneccessary if-clause, as long as userRoomList is correctly working (for prototyping/development)
	if (roomID != null) {
		object.serverCall("sendToRoom", roomID);
	}
}

SurveyTest.createRoomList = function(object){

	var that = this;
	var fromRoom = this.getRoom().id;

	//getUserRooms ServerCall
	object.serverCall("getUserRoomList", function callback(result){
		var htmlString = '<div class ="checkbox_container">';
		for(var i = 0; i < result.length; i++ ){
			//Prevent current room from being listed
			if(!(fromRoom == result[i])){
				htmlString= htmlString + '<label name="roomName"><input type="checkbox" name='+result[i]+' class="roomCheckbox" />'+result[i]+'</label><br />'
			}
		}
		htmlString = htmlString + '</div>';
		that.roomList = $(htmlString);

		//Just accidentally working or is this correct?
		$('#tabs-1').html(that.roomList);	
	});
}

SurveyTest.chooseRecievingRoomsDialogue = function(object) {
	var that = this; 
	var dialog_buttons = {};

	dialog_buttons["Send"] = function() {		
		var selectedRooms = [];
		
		$("input:checkbox[class=roomCheckbox]:checked").each(function(){
			selectedRooms.push($(this).attr("name"));	
		});
		
		for(var i = 0; i < selectedRooms.length; i++){
			that.send(object, selectedRooms[i]);	
		}
		
	}

	dialog_buttons["Cancel"] = function() {
        return false;
    };

    var dialog_width = 600;
	var additional_dialog_options = {
		create: function(){
			$('.ui-dialog-content').html('<div id="tabs">'+
				'<ul>'+
				'<li><a id="internal_Tab" href="#tabs-1">'+that.translate(GUI.currentLanguage, "Räume")+' (Webarena)</a></li>'+
				'</ul>'+
				'<div id="tabs-1" style="height:250px">'+
				'</div>'+
				'</div>');

			that.createRoomList(object); //asking the server for the current UserRoomList

			$(function() {
				$( "#tabs" ).tabs();
			});

    	},
    	height: 400
	}

	var dialog = GUI.dialog(
            "Raum auswaehlen",
            "",
            dialog_buttons,
            dialog_width,
            additional_dialog_options
            )
}