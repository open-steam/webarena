/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

SurveyTest.updateContent = function() {
	var self = this;

	var rep=this.getRepresentation();

	this.setAttribute("width", 400);
	this.setAttribute("height", 400);

    //this.setAttribute('init',true);
    //
	this.surveyBaseHtml = function(){
		var string = '<span class="moveArea"> MOVE HERE </span>'+
  		'<div data-role="main" class="ui-content">'+
			    'Bewerten Sie die folgenden Aussagen auf einer Skala von minValue bis  maxValue'+
			    '<br>'+
			    '<br>'+
			    '<form method="post" action="#">'+
			    	'Diese Aussage ist super. '+
			    	'<br>'+
			    	'<input type="range" id="slider_0"   min="-5" max="5" class="surveyslider">'+
			    	'Punkte: <output id="display_0"></output>'+
			    	'<br>'+
			    	'Diese Aussage ist okay. <br>'+
			    	'<input type="range" id="slider_1" min="-5" max="5" class="surveyslider">'+
			    	'Punkte: <output id="display_1"></output>'+
			    	'<br>'+
			    	'Diese Aussage ist schlecht. <br>'+
			    	'<input type="range" id="slider_2" min="-5" max="5" class="surveyslider">'+
			    	'Punkte: <output id="display_2"></output>'+
			    	'<br>'+
			    	'<input type="submit" data-inline="true" value="Ergebnis absenden">'+
			   	'</form>'+
			'</div>'
			return string;
	}

	if(!this.initialised){
		self.setHTML(self.surveyBaseHtml());		
		this.initialised = true;
	}
	
	//Send slidervalues to the server and update the attributes, then update the display values as well.
	$('.surveyslider').each(function (index, Element) {
		$(Element).attr('oninput', self.sliderChange(index, $(Element).val()));
		$(rep).find('#display_'+index).val($(Element).val()); 
	});

	this.saveChanges = function(){
					
	}


}
