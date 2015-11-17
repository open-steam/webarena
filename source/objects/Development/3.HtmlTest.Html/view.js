/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

HtmlTest.updateContent = function() {
	var self = this;
	
	var rep=this.getRepresentation();
	
	this.getContentAsString(function(text){

		if(text!=self.oldContent || !text){
			if (text == "") {
				$(rep).find("body").html("<span class=\"moveArea\">Move me here</span> EMPTY HTML OBJECT");
			} else {
				$(rep).find("body").html(text);
			}
		}
		
		self.oldContent=text;
		
	});
	
}