Textobject.clientRegister=function(){
	
	Textobject.parent.clientRegister.call(this);
	
	this.registerAction('To front',function(){
	
		/* set a very high layer for all selected objects (keeping their order) */
		var selected = ObjectManager.getSelected();
		
		for (var i in selected){
			var obj = selected[i];
			
			obj.setAttribute("layer", obj.getAttribute("layer")+999999);
			
		}
		
		ObjectManager.renumberLayers();
		
	}, false);
	
	this.registerAction('To back',function(){
		
		/* set a very low layer for all selected objects (keeping their order) */
		var selected = ObjectManager.getSelected();
		
		for (var i in selected){
			var obj = selected[i];
			
			obj.setAttribute("layer", obj.getAttribute("layer")-999999);
			
		}
		
		ObjectManager.renumberLayers();
		
	}, false);

	

	

	
	this.registerAction('Put back', function(lastClicked){
	
        var selected = ObjectManager.getSelected();
		for(var i = 0; i<selected.length; i++){
			var objectID = selected[i].id;
			var host = selected[i].getAttribute("CloudConnection")[0];
			var user = selected[i].getAttribute("CloudConnection")[1];
			var pw = selected[i].getAttribute("CloudConnection")[2];
			var path = selected[i].getAttribute("CloudConnection")[3];
			GUI.cloud.putBack(host, user, pw, path, objectID);
		}
		
	}, false, function(){
	
	   /* check if there is at least one selected object which cannot put back due to missing cloud information */
		var selected = ObjectManager.getSelected();
		for(var i = 0; i<selected.length; i++){
			if(!selected[i].getAttribute("CloudConnection") || selected[i].getAttribute("CloudConnection")[0] == ""){
				return false;
			}
		}
		return true;
		
	});

}

Textobject.contentUpdated=function(){

	this.updateIcon();
}


Textobject.openFile=function(){
	var type = this.getAttribute("mimeType");
	
	if(type.indexOf("image") > -1 || type.indexOf("text") > -1 || type.indexOf("pdf") > -1){
		this.buildContentDialog(true);
		return;
	}
	window.open(this.getContentURL(), "_blank");
	
}

Textobject.isPreviewable=function(){
	
	return GUI.mimeTypeIsPreviewable(this.getAttribute("mimeType"));
	
}

Textobject.upload = function() {
	GUI.uploadFile(this,this.translate(GUI.currentLanguage, "Please select a file"));
}

/**
*	determine if the icon of the file intersects with the square x,y,width,height
*/
Textobject.objectIntersectsWith = function(ox,oy,ow,oh){
	if (!this.isGraphical) return false;

	var thisx = this.getViewBoundingBoxX();
	var thisy = this.getViewBoundingBoxY();
	var thisw = this.getViewBoundingBoxWidth();
	var thish = this.getViewBoundingBoxHeight();

	if (ox+ow<thisx) return false;
	if (ox>thisx+thisw) return false;
	if (oy+oh<thisy) return false;
	if (oy>thisy+thish) return false;
	
	return true;
	
}