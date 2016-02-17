/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/
SurveyTest.clientRegister=function(){
	var that = this;
	SurveyTest.parent.clientRegister.call(this);
}

SurveyTest.sendSurveyResult = function(event){
	var that = event.data.that;
	var surveyResultArray = [];

	for(var i = 0; i < that.getAttribute('surveyLength'); i++){
		surveyResultArray.push(that.getAttribute('points_'+i));
	}

	console.log("ResultObjectRoom "+ that.getAttribute('resultObjectRoom'));
	console.log("ResultObjectID "+ that.getAttribute('resultObjectID'));
	console.log();

	var resultObject = Modules.ObjectManager.getObject(that.getAttribute('resultObjectRoom'), that.getAttribute('resultObjectID'), that.context);
	console.log(resultObject);
	console.log();
	var result = resultObject.getAttribute('result');
	console.log(result);
}