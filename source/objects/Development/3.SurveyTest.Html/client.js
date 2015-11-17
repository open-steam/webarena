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
		that.send();
	},true);
}

SurveyTest.send = function() {
		alert("works");
}