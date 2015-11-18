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

SurveyTest.send = function(object) {
	var roomID = prompt("Bitte RaumID eingeben", "public2");
	if (roomID != null) {
		object.serverCall("sendToRoom", roomID);
	}
}