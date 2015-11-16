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
				self.setHTML("<span class=\"moveArea\">Move me here</span> EMPTY HTML OBJECT - <span onclick=\"HtmlTest.onclick(this);\">Click me</span>");
			} else {
				self.setHTML(text);
			}
		}
		
		self.oldContent=text;
		
	});
	
}

HtmlTest.onclick=function(htmlobject){
	var object=this.getArenaObject(htmlobject);
	
	alert(object);
}