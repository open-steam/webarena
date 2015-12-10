/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/
SurveyTest.clientRegister=function(){
	var that = this;
	SurveyTest.parent.clientRegister.call(this);
	
	this.registerAction('Send to users...',function(){
		that.chooseRecievingRoomsDialogue();
	},true);
}

SurveyTest.sendSurveyResult = function(){
	for(var i = 0; i < this.getAttribute('surveyLength'); i++){
		//get point_i and save it in a new object (surveyResult) to gather all data
	}
}

SurveyTest.send = function() {
	var roomID = prompt("Bitte RaumID eingeben", "public2");
	if (roomID != null) {
		this.serverCall("sendToRoom", roomID);
	}
}

SurveyTest.createRoomList = function(){
	var that = this; 

	this.serverCall("getUserRooms", function callback(result){
		console.log('getUserRooms callback happened');
		that.userRoomList = result;
	});

	return this.userRoomList;

	// 	console.log('done');
	// 	return $('<div class="checkbox_container">'+
	// 	'<label><input type="checkbox" /> This is checkbox </label><br />'+
	// 	'<label><input type="checkbox" /> This is checkbox </label><br />'+
	// 	'<label><input type="checkbox" /> This is checkbox </label><br />'+
	// 	'<label><input type="checkbox" /> This is checkbox </label><br />'+
	// 	'<label><input type="checkbox" /> This is checkbox </label><br />'+
	// 	'<label><input type="checkbox" /> This is checkbox </label><br />'+
	// 	'<label><input type="checkbox" /> This is checkbox </label><br />'+
	// 	'<label><input type="checkbox" /> This is checkbox </label><br />'+
	// 	'<label><input type="checkbox" /> This is checkbox </label><br />'+
	// 	'<label><input type="checkbox" /> This is checkbox </label><br />'+
	// 	'</div>');
	// });
}

SurveyTest.chooseRecievingRoomsDialogue = function() {
	var that = this; 
	var dialog_buttons = {};

	dialog_buttons[that.translate(GUI.currentLanguage, "Send")] = function() {		
		//TODO: acquire selected rooms and call send accordingly
		that.send();
	}

	dialog_buttons[that.translate(GUI.currentLanguage, "Cancel")] = function() {
        return false;
    };

    var dialog_width = 600;
	var additional_dialog_options = {
		create: function(){
			that.createRoomList();

			$('.ui-dialog-content').html('<div id="tabs">'+
				'<ul>'+
				'<li><a id="internal_Tab" href="#tabs-1">'+that.translate(GUI.currentLanguage, "Räume")+' (Webarena)</a></li>'+
				'</ul>'+
				'<div id="tabs-1" style="height:250px">'+
				'</div>'+
				'</div>');

			$('#tabs-1').html(that.roomList);

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