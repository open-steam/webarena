IconObject.createRepresentation = function() {
	
	var rep = GUI.svg.group(this.getAttribute('id'));

	var rect = GUI.svg.rect(rep, 0,0,10,10);
	$(rect).attr("fill", "transparent");
	$(rect).addClass("borderRect");

	GUI.svg.image(rep, 0, 0, 16, 16, this.getIconPath());
	
	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}


IconObject.draw=function(external){
	
	var rep=this.getRepresentation();

	this.drawDimensions(external);
	
	this.setViewWidth(36);
	this.setViewHeight(36);

}


IconObject.setViewWidth = function(value) {
	
	$(this.getRepresentation()).find("image").attr("width", parseInt(value));
	$(this.getRepresentation()).find("rect").attr("width", parseInt(value));

	GeneralObject.setViewWidth.call(this, value);
	
}

IconObject.setViewHeight = function(value) {

	$(this.getRepresentation()).find("image").attr("height", parseInt(value));
	$(this.getRepresentation()).find("rect").attr("height", parseInt(value));
	GeneralObject.setViewHeight.call(this, value);

}