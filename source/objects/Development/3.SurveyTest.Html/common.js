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
	this.registerAttribute('stepping', {hidden: false, type: 'number'});
    this.registerAttribute('minValue', {hidden: false, type: 'number'});
    this.registerAttribute('maxValue', {hidden: false, type: 'number'});
    this.registerAttribute('surveyLength', {hidden: false});
    this.registerAttribute('statements', {multiple: true, hidden: false, standard: []});
    this.registerAttribute('resultObjectID', {hidden: false});
    this.registerAttribute('resultObjectRoom', {hidden: false});

	// TODO: implement
    // this.generateHash();
}

SurveyTest.sliderChange = function(sliderID, value){
	var slider = 'slider_'+sliderID;
	var display = 'display_'+sliderID;
	var attribute = 'points_'+sliderID;
	var value = value;

	this.setAttribute(attribute, value);
}

SurveyTest.generateHash = function(){
	var that = this;
	var  hash = {roomID: that.getRoomID(),
				 testID: that.getTestID()};
	this.setAttribute('testHash', hash);
}

SurveyTest.getRoomID = function() {
    return this.get('inRoom');
}

SurveyTest.sendSurveyResult = function(event){
	var that = event.data.that;
	var surveyResultArray = [];

	for(var i = 0; i < that.getAttribute('surveyLength'); i++){
		surveyResultArray.push(that.getAttribute('points_'+i));
	}

	//TODO: Send Array to SurveyResult-Object
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