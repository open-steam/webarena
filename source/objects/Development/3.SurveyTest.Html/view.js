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
			    	'Punkte: <output i="display_0"></output>'+
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
	
	// for(var i = 0; i < 3; i++){
	// 	$(rep).find('#slider_'+i).attr('oninput', self.sliderChange(1, $(rep).find('#slider_'+i).val())); 
	// 	$(rep).find('#display_'+i).value =  $(rep).find('#slider_'+i).val();
	// }
	$('.surveyslider').each(function (index, Element) {
		$(Element).attr('oninput', self.sliderChange(index, $(Element).val()));
		$(rep).find('#display_'+index).value =  $(Element).val();
	});

	// $(rep).find("#slider_1").attr('oninput', self.sliderChange(1, $(rep).find("#slider_1").val())); 
	// $(rep).find("#display_1").value =  $(rep).find("#slider_1").val();
	// $(rep).find("#slider_2").attr('oninput', self.sliderChange(2, $(rep).find("#slider_2").val())); 
	// $(rep).find("#display_2").value =  $(rep).find("#slider_2").val();
	// $(rep).find("#slider_3").attr('oninput', self.sliderChange(3, $(rep).find("#slider_3").val())); 
	// $(rep).find("#display_3").value =  $(rep).find("#slider_3").val();
// 

	this.saveChanges = function(){
					
	}


}
