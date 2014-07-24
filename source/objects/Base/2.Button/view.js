Button.clickHandler = function (event) {

	event.stopPropagation();
	event.preventDefault();
	var myEvent = this.getAttribute("event");

	this.serverCall("fireEvent", myEvent, {
		objectID: this.id
	});
}

Button.dblclickHandler = function (event) {
	event.stopPropagation();
	event.preventDefault();
}

Button.draw = function (external) {
	GeneralObject.draw.call(this, external);

	var rep = this.getRepresentation();
	var label = this.getAttribute("name");
	$(rep).find("button").html(label);
}

Button.createRepresentation = function () {
	var rep = GUI.svg.other("foreignObject");
	rep.dataObject = this;
	var body = document.createElement("body");
	var label = this.getAttribute("name");

	$(body).append('<button>' + label + '</button>');

	$(rep).append(body);
	$(rep).attr("id", this.getAttribute('id'));

	return rep;
}