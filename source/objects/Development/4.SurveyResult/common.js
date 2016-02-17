/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var SurveyResult = Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

SurveyResult.register=function(type){
	
	// Registering the object
	
	Rectangle=Modules.ObjectManager.getPrototype('Rectangle');
	Rectangle.register.call(this,type);


 	this.registerAttribute('width', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("height", object.getAttribute("height") * (value / object.getAttribute("width")));
            }

            return true;

    }});

    this.registerAttribute('height', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("width", object.getAttribute("width") * (value / object.getAttribute("height")));
            }

            return true;

    }});

    this.makeStructuring();
 	this.registerAttribute('linestyle', {type: 'selection', standard: 'stroke', options: ['stroke', 'dotted', 'dashed'], category: 'Appearance'});

    this.registerAttribute('minValue', {type: 'number'});
    this.registerAttribute('maxValue', {type: 'number'});
    this.registerAttribute('stepping', {type: 'number',min: 1});
    this.registerAttribute('surveyLength', {type: 'number'});
    /*this.registerAttribute('distinct',{type:'boolean',standard:false,category:'Scale'});
     this.registerAttribute('orientation',{type:'selection',standard:'bottom',options:['bottom','top','left','right'],category:'Scale'});
     */
    this.registerAttribute('results', {multiple: true, standard: []});

    this.registerAttribute('label', {type: 'text', standard: 'Ergebnisse', category: 'TimeLine', hidden: 'true'});
    this.registerAttribute('vertical-align', {hidden:true});
    this.registerAttribute('horizontal-align', {hidden:true});
    this.standardData.fillcolor = 'white';
    this.standardData.linecolor = 'black';
    this.registerAttribute('direction', {type: 'selection', standard: 'horizontal', options: ['horizontal', 'vertical'], category: 'TimeLine',changedFunction: function(object, value) {
            var tmpWidth =object.getAttribute("width");
            var tmpHeight =object.getAttribute("height");
            object.setAttribute("width",tmpHeight);
            object.setAttribute("height",tmpWidth);
          
        }});

	//Define attributes needed
    this.standardData.linecolor = 'black';
	this.standardData.fillcolor = 'grey';
}

SurveyResult.initResultArray = function(){
    var step = this.getAttribute('stepping');
    var maxValue = this.getAttribute('maxValue');
    var minValue = this.getAttribute('minValue');
    var scaleLength = this.getAttribute('maxValue') - this.getAttribute('minValue') + 1;
    var surveyLength = this.getAttribute('surveyLength');
    var array = new Array(surveyLength);

    for(var j = 0; j < surveyLength; j++){
        array[j] = new Array(scaleLength);
    }

    for(var i = 0; i < surveyLength; i++){
        for(var j = 0; j < scaleLength; j++){
            array[i][j] = 0;
        }
    }

    this.setAttribute('results', array);
}

SurveyResult.register('SurveyResult');
SurveyResult.isCreatable=true;
SurveyResult.input = false;

module.exports=SurveyResult;