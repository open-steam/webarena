/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');
var SurveyTeacher=Object.create(Modules.ObjectManager.getPrototype('HtmlObject'));

SurveyTeacher.register=function(type){
    // Registering the object
    HtmlObject=Modules.ObjectManager.getPrototype('HtmlObject');
    HtmlObject.register.call(this,type);

    // this.registerAttribute('initialised', {hidden: true, standard: false});
    this.registerAttribute('HTMLString', {hidden: true, type: 'text'});
    this.registerAttribute('stepping', {hidden: false, type: 'number', standard: 1});
    this.registerAttribute('minValue', {hidden: false, type: 'number', standard: 0});
    this.registerAttribute('maxValue', {hidden: false, type: 'number', standard: 3});
    this.registerAttribute('surveyLength', {hidden: false});
    this.registerAttribute('statements', {multiple: true, hidden: true, standard: []});
}

SurveyTeacher.getRoomID = function() {
    return this.get('inRoom');
}


SurveyTeacher.register('SurveyTeacher');
SurveyTeacher.isCreatable=true;
SurveyTeacher.contentURLOnly = false;

//set restrictedMovingArea to true, if you want to enable interface interaction within
//the HTML element. This is useful if you want to use buttons, links or even canvas elements.
//when set to true, you must specify an area where the object can be moved. This area must
//have its class set to "moveArea". Set restrictedMovingArea to false if you use the HTML
//element for diplaying purposes only.

SurveyTeacher.restrictedMovingArea = true;

module.exports=SurveyTeacher;