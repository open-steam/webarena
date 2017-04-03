/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var SurveyTest=Object.create(Modules.ObjectManager.getPrototype('HtmlObject'));

SurveyTest.register=function(type){

	// Registering the object

	var HtmlObject=Modules.ObjectManager.getPrototype('HtmlObject');
	HtmlObject.register.call(this,type);

	this.registerAttribute('points_1',{hidden:false, type: 'number', min: -5, standard: 0, max: 5});
	this.registerAttribute('points_2',{hidden:false, type: 'number', min: -5, standard: 0, max: 5});
	this.registerAttribute('points_3',{hidden:false, type: 'number', min: -5, standard: 0, max: 5});
}

SurveyTest.sliderChange = function(sliderID, value){
	var slider = 'slider_'+sliderID;
	var display = 'display_'+sliderID;
	var attribute = 'points_'+sliderID;
	var value = value;

	this.setAttribute(attribute, value);
}


SurveyTest.register('SurveyTest');
SurveyTest.isCreatable=true;
SurveyTest.contentURLOnly = false;

module.exports=SurveyTest;