/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*	 GeneralObject client component
*
*/

GeneralObject.getAttributeFromServer=function(attribute,respFunction){
	if (!respFunction) respFunction=function(data){
		console.log(data);
	}
	
	var requestData={};
	
	requestData.roomID=this.getRoomID();
    requestData.objectID=this.id;
    requestData.key=attribute;
	
	Modules.Dispatcher.query('getAttribute',requestData,respFunction);
	
}

GeneralObject.content=false;
GeneralObject.contentFetched=false;
GeneralObject.hasContent=false;
GeneralObject.normalOpacity = 1;

GeneralObject.setContent=function(content){
	this.content=content;
	this.contentFetched=true;
	
	var requestData={};
	
	requestData.roomID=this.getRoomID();
    requestData.objectID=this.id;
    requestData.content=content;
	
	Modules.Dispatcher.query('setContent',requestData);
	
	if (this.afterSetContent) this.afterSetContent();
	
}

GeneralObject.withContent=function(worker){
	
	if (!worker) worker=function(data){
		console.log(data);
	}
	
	if (this.contentFetched) {
		
		worker(this.content);
		return;
	}

	var requestData={};
	
	requestData.roomID=this.getRoomID();
    requestData.objectID=this.id;
	
	var that=this;
	//Do not use "this" in response fucntions as they do not refer to the object in there!
	Modules.Dispatcher.query('getContent',requestData,function(newContent){
		that.content=newContent;
		that.contentFetched=true;
		worker(newContent);
	    return;
	});
}

GeneralObject.getContent=function(){
	return this.content;
};

GeneralObject.getContentAsString=function(){
	
	var utf8 = {}

	utf8.toByteArray = function(str) {
	    var byteArray = [];
	    for (var i = 0; i < str.length; i++)
	        if (str.charCodeAt(i) <= 0x7F)
	            byteArray.push(str.charCodeAt(i));
	        else {
	            var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
	            for (var j = 0; j < h.length; j++)
	                byteArray.push(parseInt(h[j], 16));
	        }
	    return byteArray;
	};
	
	utf8.parse = function(byteArray) {
	    var str = '';
	    for (var i = 0; i < byteArray.length; i++)
	        str +=  byteArray[i] <= 0x7F?
	                byteArray[i] === 0x25 ? "%25" : // %
	                String.fromCharCode(byteArray[i]) :
	                "%" + byteArray[i].toString(16).toUpperCase();
	    try {
	    	return decodeURIComponent(str);
	    } catch (e) {
	    }
	    return '';
	};
	
	
	var result='';
	
	result=utf8.parse(this.content);
	
	return result;
}

GeneralObject.hasContent=function(){
	return this.getAttribute('hasContent');
}

GeneralObject.contentUpdated=function(){
	
	//should be overwritten for objects that get binary content by HTTP;
	
	var requestData={};
	
	requestData.roomID=this.getRoomID();
    requestData.objectID=this.id;
	
	var that=this;
	
	this.contentFetched=false;
	
	var that=this;
	
	this.withContent(function(newContent){
		that.content=newContent;
		that.draw();
	});
}


GeneralObject.refresh = function() {
	this.draw();
}


GeneralObject.getPreviewContentURL = function() {
	return "/getPreviewContent/"+this.getRoomID()+"/"+this.data.id+"/"+Math.round(new Date().getTime() / 1000);
}

GeneralObject.getContentURL = function() {
	return "/getContent/"+this.getRoomID()+"/"+this.data.id+"/"+Math.round(new Date().getTime() / 1000);
}

GeneralObject.create = function() {
	
	ObjectManager.createObject(this.type, {
		hidden: GUI.hiddenObjectsVisible
	});
	
}

GeneralObject.removeRepresentation = function() {
	
	var rep = this.getRepresentation();

	this.deselect();

	$(rep).remove();
	
}


GeneralObject.getIconPath = function() {
	return "/objectIcons/"+this.getType();
}

GeneralObject.justCreated=function(){
	//react on client side if an object has just been created and needs further input
}

GeneralObject.duplicate=function() {
	
	var requestData={};
	
	requestData.roomID=this.getRoomID();
    requestData.objectID=this.id;

	Modules.Dispatcher.query('duplicate',requestData,function(){

	});
	
	GUI.deselectAllObjects();
	
}