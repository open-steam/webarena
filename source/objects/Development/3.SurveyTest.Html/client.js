/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/
SurveyTest.clientRegister=function(){
	SurveyTest.parent.clientRegister.call(this);
}

SurveyTest.sendSurveyResult = function(event){
	var that = event.data.that;
	var surveyResultArray = [];

	for(var i = 0; i < that.getAttribute('surveyLength'); i++){
		surveyResultArray.push(that.getAttribute('points_'+i));
	}

	 var attributes =    {resultArray: surveyResultArray,
	 					  resultObjectRoom: that.getAttribute('resultObjectRoom'),
	 					  resultObjectID: that.getAttribute('resultObjectID'),
	 					  minValue: that.getAttribute('minValue'),
                         };

	that.serverCall("sendSurveyResult", attributes);
	$(".surveysend").remove();
	alert('Ihre Abstimmung wurde entgegengenommen');
}