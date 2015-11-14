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

	this.getContentAsString(function(text){
		if(text!=self.oldContent || !text){
			if (text == "") {
				$(rep).find("body").html($('#survey-base').html());
			} else {
				$(rep).find("body").html(text);
			}
		}

		self.oldContent=text;

	});

	this.unmakeMovable = function() {
	    var rep;
	    if (this.restrictedMovingArea) {
	        rep = $(this.getRepresentation()).find(".moveArea").get(0);
	    } else {
	        rep = this.getRepresentation();
	    }

	    $(rep).unbind("mousedown");

	//caused errors ("ontouchstart" is undefined in ...), deleted because the function itself was empty
	//rep.removeEventListener("touchstart", self.moveStart, false);
    //rep.ontouchstart = function() {
    //};

	}

}