/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/
SurveyTeacher.clientRegister=function(){
	var that = this;
	SurveyTeacher.parent.clientRegister.call(this);
	
	this.registerAction('Send to users',function(object){
		that.chooseRecievingRoomsDialogue(object);
	},true);

	this.registerAction('Send to room', function(object){
		that.send(object);
	},true);

	 this.registerAction('Edit Survey', function(lastClicked) {
        var selected = ObjectManager.getSelected();
        lastClicked.showFormatDialog(selected);
    });
}

SurveyTeacher.send = function(object, roomID) {
    var sliders = [];
    var surveyLength = object.getAttribute('surveyLength');

    for(var i = 0; i < surveyLength; i++){
        sliders.push(0);
    }
    var attributes =    {statements: object.getAttribute('statements'), 
                         surveyLength: surveyLength,
                         minValue: object.getAttribute('minValue'),
                         maxValue: object.getAttribute('maxValue'), 
                         stepping: object.getAttribute('stepping'), 
                         resultObjectID: null,
                         resultObjectRoom: object.getAttribute('inRoom'), 
                         sliders: sliders};

	if (roomID != null) {
		object.serverCall("sendToRoom", roomID, attributes);
	}
}

SurveyTeacher.createRoomList = function(object){

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

SurveyTeacher.chooseRecievingRoomsDialogue = function(object) {
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

SurveyTeacher.showFormatDialog = function(selected) {
    var that = this;
    var dialog_buttons = {};
    dialog_buttons[that.translate(GUI.currentLanguage, "Speichere Anordnung von Aussagen")] = function() {
        var yAttributes = $("#sortable").children();
        var yAttributeValues = [];
        var surveyLength = 0;
        $(yAttributes).each(function() {
            surveyLength++;
            yAttributeValues.push($(this).children().attr("value"));
        });
        that.setAttribute('surveyLength', surveyLength);
        that.setAttribute("statements", yAttributeValues);
        GUI.updateInspector();
    };
    dialog_buttons[that.translate(GUI.currentLanguage, "Cancel")] = function() {
        return false;
    };
    var dialog_width = 560;
    var content = [];
    var html = "";

    html += '<div id="sort-headline">'
    html += ' Das gewünschte Element kann durch Ziehen von Symbol <span id="drag-icon-headline"><img src="../../guis.common/images/dragarea.png"></span> an die gewünschte Stelle per Drag & Drop bewegt werden.';
    html += ' Durch Betätigung der Schaltfläche + kann eine neue Aussage hinzugefügt werden.'
    html += '</div>'


    var attributesY = that.getAttribute("statements");
    html += '<div id="sortableDiv"><h2>Aussagen:</h2><div class="sortable-inner"><div onclick="SurveyTeacher.insertFirstRow(this);"><span style="font-weight:bold;font-size:1.44em;position:relative;left:-9px;top:5px;">+</span></div>';
    html += '<ul id="sortable" style="width: 500px">';
    for (var i in attributesY) {
        html += '<li class="ui-state-default"><input style="width: 90%" class="input-row-column" type="text" value="' + attributesY[i] + '"/><span class="drag-item"><img src="../../guis.common/images/dragarea.png" /></span><div onclick="$(this).parent().remove();" class="remove-item">X</div></li>';
    }


    html += "</ul></div></div>";


    var js = '$(document).ready(function(){$( "#sortable" ).sortable({axis:"y",placeholder:"ui-state-highlight"});});';
    var js1 = '$("#sortable li").each(function () {SurveyTeacher.createPluses(this);});'

    html += '<script>' + js + js1 + '</script>';
    content.push(html);
    var dialog = GUI.dialog(
            that.translate(GUI.currentLanguage, "Aussagen anpassen"),
            content,
            dialog_buttons,
            dialog_width,
            null
            );

}

SurveyTeacher.insertElement = function(obj) {
    var insertHtml = '<li class="ui-state-default"><input style="width: 90%" class="input-row-column" type="text" value="' + 'Neue Aussage' + '"/><span class="drag-item"><img src="../../guis.common/images/dragarea.png" /></span><div onclick="$(this).parent().remove();" class="remove-item">X</div><div style="position:relative;left:-20px;top:-8px;font-size:1.2em;" onclick="SurveyTeacher.insertElement(this);">+</div></li>';
    $($(insertHtml)).insertAfter($(obj).parent());
};
SurveyTeacher.createPluses = function(obj) {
    $(obj).append('<div onclick="SurveyTeacher.insertElement(this);">+</div>');
    $(obj).children('div').last().css('position', 'relative');
    $(obj).children('div').last().css('left', '-20px');
    $(obj).children('div').last().css('top', '-8px');
    $(obj).children('div').last().css('font-size', '1.2em');
};
SurveyTeacher.insertFirstRow = function(obj) {
    var insertHtml = '<li class="ui-state-default"><input style="width: 90%" class="input-row-column" type="text" value="' + 'Neue Aussage' + '"/><img src="../../guis.common/images/dragarea.png" /><div onclick="$(this).parent().remove();" class="remove-item">X</div><div style="position:relative;left:-20px;top:-8px;font-size:1.2em;" onclick="SurveyTeacher.insertElement(this);">+</div></li>';
    $("#sortable").prepend(insertHtml);
};