/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

PyramidElement.updateContent = function() {
	var self = this;
	
	var rep=this.getRepresentation();
	
	self.setHTML('<iframe src="https://beta.etherpad.org/p/wa_'+this.getAttribute('id')+'" style="width:100%;height:100%"></iframe>'
	+'<button onclick="PyramidElement.setFinished(this);">Fertig!</button>');

}

PyramidElement.setFinished=function(htmlobject){
	var object=this.getArenaObject(htmlobject);
	
	console.log(object);
}
