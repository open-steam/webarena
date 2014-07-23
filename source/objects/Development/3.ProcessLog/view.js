ProcessLog.draw = function(external){
	GeneralObject.draw.call(this, external);
	console.log("Draw...");
}

ProcessLog.createRepresentation = function(){

	var rep = GUI.svg.other("foreignObject");
	var body = document.createElement("body");

    $(body).html("<div class='processlog'></div>")



	$(rep).append(body);
	$(rep).attr("id", this.getAttribute('id'));

	return rep;
}

ProcessLog.setViewHeight = function (value) {
    GeneralObject.setViewHeight.call(this, value);
    $(this.getRepresentation()).attr("height", parseInt(value));
    this.updateInnerHeight(parseInt(value));
}

ProcessLog.updateInnerHeight = function (value) {
    var rep = this.getRepresentation();

    $(rep).find("body>.processlog").css("height", value + "px");
}