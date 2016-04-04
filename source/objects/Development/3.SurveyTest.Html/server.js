/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');
module.exports=theObject;

theObject.sendSurveyResult = function (attributes, callback){
	var that = this;
	var resultObject = Modules.ObjectManager.getObject(attributes.resultObjectRoom, attributes.resultObjectID, that.context);


	var results = resultObject.getAttribute('results');
	var min = attributes.minValue;
	var resultArray = attributes.resultArray;
	
	for(var i = 0; i < resultArray.length; i++){
		var absolute = Math.abs(min);
		var math = parseInt(resultArray[i])+absolute;
		results[i][math]++;
	}
	resultObject.setAttribute('results', results);
}

theObject.sendSurveyResult.public = true;