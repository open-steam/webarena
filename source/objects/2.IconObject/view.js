IconObject.createRepresentation = function() {
	
	rep = GUI.svg.image(10, 10, 16, 16, this.getIconPath());

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}


IconObject.draw=function(){
	
	var rep=this.getRepresentation();

	this.setViewX(this.getAttribute('x'));
	this.setViewY(this.getAttribute('y'));
	
	this.setViewWidth(36);
	this.setViewHeight(36);

}
