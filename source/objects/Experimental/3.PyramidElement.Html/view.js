/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

PyramidElement.createHTMLContent = function() {
	var self = this;
	
	var rep=this.getRepresentation();
	
	self.setHTML('initializing');

}

PyramidElement.updateHTMLContent = function(){
	var self = this;
	
	var rep=this.getRepresentation();
	
	var server=window.location.protocol+'//'+window.location.hostname+':9001';
	
	this.active=this.getAttribute('active');
	this.ready=this.getAttribute('ready');
	
	if (this.ready!==this.oldReady && this.ready){
		self.setHTML('<iframe src="'+server+'/p/wa_'+this.getAttribute('users')+'" style="width:100%;height:100%"></iframe>'
		+'<button onclick="PyramidElement.finishedClicked(this);">Fertig!</button>');
		this.oldReady=true;
	} else if (this.active!==this.oldActive && this.active){
		self.setHTML('<iframe src="'+server+'/p/wa_'+this.getAttribute('users')+'" style="width:100%;height:100%"></iframe>'
		+'<button onclick="PyramidElement.finishedClicked(this);">Fertig!</button>');
		this.oldActive=true;
	} else if (!this.active){
		self.setHTML('<div style="background:#c0c0c0;width:100%;height:100%">Not yet!</div>');	
	}
}

PyramidElement.finishedClicked=function(htmlobject){
	var object=this.getArenaObject(htmlobject);
	
	object.setAttribute('ready',true);
}
