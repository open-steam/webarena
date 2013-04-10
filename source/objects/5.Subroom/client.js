BidExit.filterObject = function(obj) {

	if (obj.attributes.isWebarena == 1) {
		return true;
	}
	
	return false;
	
}

BidExit.selectFile = function(id, name) {
	
	this.setAttribute("destination", id);
	this.setAttribute("hasContent", true);
	this.setAttribute("name", name);
	
	this.dialog.dialog("close");
	
}

BidExit.hasContent=function(){
	if (this.getAttribute('destination') == undefined || this.getAttribute('destination') == false || this.getAttribute('destination') == "") {
		return false;
	} else {
		return true;
	}
}
