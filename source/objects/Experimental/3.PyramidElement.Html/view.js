/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

PyramidElement.createHTMLContent = function() {
	var self = this;
	
	var rep=this.getRepresentation();
	
	self.setHTML('<iframe src="http://localhost:9001/p/wa_'+this.getAttribute('id')+'" style="width:100%;height:100%"></iframe>'
	+'<button onclick="PyramidElement.finishedClicked(this);">Fertig!</button>');

}

PyramidElement.updateHTMLContent = function(){
}

PyramidElement.finishedClicked=function(htmlobject){
	var object=this.getArenaObject(htmlobject);
	
	console.log(object);
}
