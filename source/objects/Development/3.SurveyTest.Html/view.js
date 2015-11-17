/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/
SurveyTest.updateContent = function() {
	var self = this;

	var rep=this.getRepresentation();
	var that = this;

	this.setAttribute("width", 400);
	this.setAttribute("height", 400);
	if(!this.getAttribute("initialised")){
		this.setAttribute("initialised", false);
	}
	var initialised = this.getAttribute("initialised");


	
	this.surveyBaseHtmlInit = function(){
		var string = '<span class="moveArea"> MOVE HERE </span>'+
  		'<div data-role="main" class="ui-content">'+
			    'Bewerten Sie die folgenden Aussagen auf einer Skala von minValue bis  maxValue'+
			    '<br>'+
			    '<br>'+
			    '<form method="post" action="#">'+
			    	'Diese Aussage ist super. '+
			    	'<br>'+
			    	'<input type="range" id="slider_0" min="-5" max="5" class="surveyslider">'+
			    	'Punkte: <output id="display_0"></output>'+
			    	'<br>'+
			    	'Diese Aussage ist okay. <br>'+
			    	'<input  type="range" id="slider_1" min="-5" max="5" class="surveyslider">'+
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

	this.surveyBaseHtmlReload = function(){
		var string = '<span class="moveArea"> MOVE HERE </span>'+
  		'<div data-role="main" class="ui-content">'+
			    'Bewerten Sie die folgenden Aussagen auf einer Skala von minValue bis  maxValue'+
			    '<br>'+
			    '<br>'+
			    '<form method="post" action="#">'+
			    	'Diese Aussage ist super. '+
			    	'<br>'+
			    	'<input type="range" id="slider_0" value='+this.getAttribute('points_0')+' min="-5" max="5" class="surveyslider">'+
			    	'Punkte: <output id="display_0"></output>'+
			    	'<br>'+
			    	'Diese Aussage ist okay. <br>'+
			    	'<input type="range" id="slider_1" value='+this.getAttribute('points_1')+' min="-5" max="5" class="surveyslider">'+
			    	'Punkte: <output id="display_1"></output>'+
			    	'<br>'+
			    	'Diese Aussage ist schlecht. <br>'+
			    	'<input type="range" id="slider_2" value='+this.getAttribute('points_2')+' min="-5" max="5" class="surveyslider">'+
			    	'Punkte: <output id="display_2"></output>'+
			    	'<br>'+
			    	'<input type="submit" data-inline="true" value="Ergebnis absenden">'+
			   	'</form>'+
			'</div>'
			return string;
	}


	//If the SurveyTest-Object is loaded the first time, it is created initially
	if(!initialised){
		self.setHTML(self.surveyBaseHtmlInit());
	//Else check if the content of the SurveyTest-Object differs from what is currently loaded in the room 
	//if so: reload it, else keep the old content
	//This prevents the range-sliders from resetting or the HTML-Content not rendering after refreshing the page
	}else{ 
		this.getContentAsString(function(text){

		if(text!=that.oldContent){
			self.setHTML(self.surveyBaseHtmlReload());
		}
		that.oldContent=text;
	});
	}

	
	//Send slidervalues to the server and update the attributes, then update the display values as well.
	$('.surveyslider').each(function (index, Element) {
		$(Element).attr('oninput', self.sliderChange(index, $(Element).val()));
		$(rep).find('#display_'+index).val($(Element).val()); 
	});

	this.setAttribute("initialised", true);

	this.saveChanges = function(){
					
	}
}
