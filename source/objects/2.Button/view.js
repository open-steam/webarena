Button.clickHandler = function(event) {

	event.stopPropagation();
	event.preventDefault();
	var myEvent = this.getAttribute("event");

	this.serverCall("fireEvent", myEvent, {
		objectID : this.id
	});
}

Button.dblclickHandler = function(event){
	event.stopPropagation();
	event.preventDefault();
}

Button.createRepresentation = function () {

	var rep = GUI.svg.other("foreignObject");
	rep.dataObject = this;
	var body = document.createElement("body");

	$(body).append("<button>Test123</button>");
	$(rep).append(body);
	$(rep).attr("id", this.getAttribute('id'));

	console.log("recreate...");

	return rep;
}