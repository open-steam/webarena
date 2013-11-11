ProcessLog.draw = function(external){
	GeneralObject.draw.call(this, external);
	console.log("Draw...");
}

ProcessLog.createRepresentation = function(){

	var rep = GUI.svg.other("foreignObject");
	var body = document.createElement("body");

	var compiled = _.template($( "script#process-log-template" ).html());

	var logHeader = this.getAttribute("logHeader") || "LOG HEADER";

	var remoteContent = {}
	try{
		var remoteContent = JSON.parse ( this.getContentAsString() );
	} catch(e){}


	var messages = [{
		timestamp : new Date(),
		message : "asdf"
	}, {
		timestamp : new Date(),
		message : "asdf2"
	}];

	$(body).append(
			compiled({"logEntries" : messages})
	)

	$(rep).append(body);
	$(rep).attr("id", this.getAttribute('id'));

	return rep;


}