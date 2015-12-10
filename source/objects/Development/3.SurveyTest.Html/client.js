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
		that.send(object);
	},true);
}

SurveyTest.createRoomList = function(){
				return $('<div class="checkbox_container">'+
				'<input type="checkbox" /> This is checkbox <br />'+
				'<input type="checkbox" /> This is checkbox <br />'+
				'<input type="checkbox" /> This is checkbox <br />'+
				'<input type="checkbox" /> This is checkbox <br />'+
				'<input type="checkbox" /> This is checkbox <br />'+
				'<input type="checkbox" /> This is checkbox <br />'+
				'<input type="checkbox" /> This is checkbox <br />'+
				'<input type="checkbox" /> This is checkbox <br />'+
				'<input type="checkbox" /> This is checkbox <br />'+
				'<input type="checkbox" /> This is checkbox <br />'+
				'</div>');
}

SurveyTest.send = function(object) {
	// var roomID = prompt("Bitte RaumID eingeben", "public2");
	// if (roomID != null) {
	// 	object.serverCall("sendToRoom", roomID);
	// }
	// 
	this.chooseRecievingRooms();
}

SurveyTest.chooseRecievingRooms = function() {
	var that = this; 

	var dialog_buttons = {};

	dialog_buttons[that.translate(GUI.currentLanguage, "Send")] = function() {		
		//TODO: acquire selected rooms and call send accordingly
		prompt("this is working", "dummy");
	}

	dialog_buttons[that.translate(GUI.currentLanguage, "Cancel")] = function() {
        return false;
    };

    var dialog_width = 600;
	var additional_dialog_options = {
		create: function(){
			var roomList = that.createRoomList();

			$('.ui-dialog-content').html('<div id="tabs">'+
				'<ul>'+
				'<li><a id="internal_Tab" href="#tabs-1">'+that.translate(GUI.currentLanguage, "Räume")+' (Webarena)</a></li>'+
				'</ul>'+
				'<div id="tabs-1" style="height:250px">'+
				'</div>'+
				'</div>');

			$('#tabs-1').html(roomList);

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