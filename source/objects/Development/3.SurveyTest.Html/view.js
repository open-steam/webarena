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

	this.setAttribute("width", 500);
	this.setAttribute("height", 950);
	if(!this.getAttribute("initialised")){
		this.setAttribute("initialised", false);
	}
	//for convenience
	var initialised = this.getAttribute("initialised");

	this.addStatement = function(text, id){
		var oldSliders = that.getAttribute('sliders');
		var minValue = that.getAttribute('minValue');
		var maxValue = that.getAttribute('maxValue');

		self.setAttribute('points_'+id, oldSliders[id]);

		//this.sliderChange(id, $('slider_'+id).val())
		if(!(that.getAttribute('sent'))){
			return text+'<br><input type="range" id="slider_'+id+'" min="'+minValue+'" max="'+maxValue+'" class="surveyslider" value="'+oldSliders[id]+'"> '+
			'<b><output id="display_'+id+'"> '+oldSliders[id]+'</output></b>';
		}else{
			return text+'<br>'+
			'<b><output id="display_'+id+'"> '+oldSliders[id]+'</output></b>';
		}
	}

	this.sliderChange = function(event){
		var str = event.srcElement.id;
		var id = str.substr(str.indexOf("_") + 1); // Contains id of slider

    	var attribute = 'points_'+id;
    	var value = event.srcElement.value;

    	self.setAttribute(attribute, value);
		$('#display_'+id).val(event.srcElement.value); 

		let slider = self.getAttribute('sliders');
		console.log(slider);
		slider[id] = event.srcElement.value; 
		self.setAttribute('sliders', slider);
	}


	//Initial load of the SurveyBase with standard values and sliders at 0
	this.surveyBaseHtmlInit = function(){
		var statements = that.getAttribute('statements');
		var string = '<span class="moveArea" style="background-color:grey;"> MOVE HERE </span>'+
  		'<div data-role="main" class="ui-content">'+
			    'Bewerten Sie die folgenden Aussagen auf einer Skala von '+that.getAttribute('minValue')+' (ich stimme gar nicht zu) bis '+that.getAttribute('maxValue')+'  (ich stimme vollkommen zu)<br>';
		for(var i = 0; i < that.getAttribute('surveyLength'); i++){
			string += that.addStatement(statements[i], i)+'<br>';
		}
		if(!(that.getAttribute('sent')))	 	    	
			string += '<br><input type="button" class="surveysend" data-inline="true" value="Ergebnis absenden"></div>'
		return string;
	}

	//called when the page has been reloaded
	this.surveyBaseHtmlReload = function(){
		var statements = that.getAttribute('statements');
		var string = '<span class="moveArea"  style="background-color:grey;"> MOVE HERE </span>'+
  		'<div data-role="main" class="ui-content">'+
			    'Bewerten Sie die folgenden Aussagen auf einer Skala von '+that.getAttribute('minValue')+' (ich stimme gar nicht zu) bis '+that.getAttribute('maxValue')+'  (ich stimme vollkommen zu)<br><br>';
		for(var i = 0; i < that.getAttribute('surveyLength'); i++){
			string += '<br>'+that.addStatement(statements[i], i)+'<br>';
		}
		
		if(!(that.getAttribute('sent')))	    	
			string += '<br><input type="button" class="surveysend" data-inline="true" value="Ergebnis absenden"></div>'
		return string;
	}


	// //If the SurveyTest-Object is loaded the first time, it is created initially
	if(!initialised){
		self.setHTML(self.surveyBaseHtmlInit());
		//Send slidervalues to the server and update the attributes, then update the display values as well.
	

		$('.surveyslider').each(function (index, Element) {
			var slider = $(rep).find('#slider_'+index);
			//slider.attr('oninput', self.sliderChange(index, slider.val(), rep));
			//slider.setAttribute('oninput', self.blob);
			//slider.oninput =  self.blob();
			console.log(Element);
			//Element.setAttribute("oninput",  self.blob);
			Element.oninput = self.sliderChange;
			//$(rep).find('#display_'+index).val($(Element).val()); 
		});

		//Attach functions to send buttons
		$('.surveysend').each(function (index, Element){
			$(Element).bind('click', {that: self}, self.sendSurveyResult);
		});
		
		this.setAttribute("initialised", true);

	//Else check if the content of the SurveyTest-Object differs from what is currently loaded in the room 
	//if so: reload it, else keep the old content
	//This prevents the range-sliders from resetting or the HTML-Content not rendering after refreshing the page
	//TODO (probably) Keep not only the attributes synced, but also the position of the range slider 
	//(currently causes problems with multiple users in 1 room)
	}else{ 
		this.getContentAsString(function(text){ //TODO: Function does not do what expected, new working function needs to be written (getAttributeHash)
			if(text!=that.oldContent){
				self.setHTML(self.surveyBaseHtmlReload());
				//Attach functions to send buttons
				$('.surveysend').each(function (index, Element){
					$(Element).bind('click', {that: self}, self.sendSurveyResult);
				});
			}

			//Send slidervalues to the server and update the attributes, then update the display values as well.
			$('.surveyslider').each(function (index, Element) {
				//var slider = $(rep).find('#slider_'+index);
				console.log(Element);
				Element.oninput = self.sliderChange; 
				//$(rep).find('#display_'+index).val($(Element).val()); 
			});

			that.oldContent=text;
		});
	}
}