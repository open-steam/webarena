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


	if(!this.initialised){
		$(rep).find("body").html($('#survey-base').html());		
		this.initialised = true;
	}
	
	$(rep).find("#slider_1").attr('oninput', self.sliderChange(1, $(rep).find("#slider_1").val())); 
	$(rep).find("#display_1").value =  $(rep).find("#slider_1").val();
	$(rep).find("#slider_2").attr('oninput', self.sliderChange(2, $(rep).find("#slider_2").val())); 
	$(rep).find("#display_2").value =  $(rep).find("#slider_2").val();
	$(rep).find("#slider_3").attr('oninput', self.sliderChange(3, $(rep).find("#slider_3").val())); 
	$(rep).find("#display_3").value =  $(rep).find("#slider_3").val();


	theObject.saveChanges = function(){
					
	}

}
