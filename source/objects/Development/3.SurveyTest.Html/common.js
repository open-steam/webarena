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

	HtmlObject=Modules.ObjectManager.getPrototype('HtmlObject');
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

	//$(display).value = value;
	this.setAttribute(attribute, value);
}


SurveyTest.register('SurveyTest');
SurveyTest.isCreatable=true;
SurveyTest.contentURLOnly = false;

//set restrictedMovingArea to true, if you want to enable interface interaction within
//the HTML element. This is useful if you want to use buttons, links or even canvas elements.
//when set to true, you must specify an area where the object can be moved. This area must
//have its class set to "moveArea". Set restrictedMovingArea to false if you use the HTML
//element for diplaying purposes only.

SurveyTest.restrictedMovingArea = true;

module.exports=SurveyTest;