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

	console.log("***********CLIENTSIDE**************");
	console.log("SurveyResultArray " + surveyResultArray);
	console.log("resultObjectRoom "+ that.getAttribute('resultObjectRoom') );
	console.log("resultObjectID "+ that.getAttribute('resultObjectID'));

	 var attributes =    {resultArray: surveyResultArray,
	 					  resultObjectRoom: that.getAttribute('resultObjectRoom'),
	 					  resultObjectID: that.getAttribute('resultObjectID'),
	 					  minValue: that.getAttribute('minValue'),
                         };

	that.serverCall("sendSurveyResult", attributes);
}