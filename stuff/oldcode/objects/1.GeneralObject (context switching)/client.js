/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*	 GeneralObject client component
*
*/


GeneralObject.content=false;
GeneralObject.contentFetched=false;
GeneralObject.hasContent=false;
GeneralObject.normalOpacity = 1;

GeneralObject.setContent=function(content){
	this.content=content;
	this.contentFetched=true;
	
    this.serverCall('setContent', content, this.afterSetContent)	
}

/**
 * Call RPC-Method on server-side. Could be called like:
 *
 * this.serverCall("rpcMethod", arg1, arg2, arg3, ..., optionalCallback)
 * 
 * @param{...mixed} - 
 * 		remoteFnName : Name of the function that should be called
 * 		...args :  arbitrary number of arguments
 * 		callback: if the last element is a function, it is used as a callback. 
 */
GeneralObject.serverCall = function(){
    var args = Array.prototype.slice.call(arguments);
	var callback = false;

	//Look if last element is function 
	//don't use pop directly, because function
	//can be called without callback.
	var lastArg = args[args.length - 1];
	if ( _.isFunction( lastArg )) {
		callback = lastArg;
        args.pop();
	}

	//check if all needed arguments are present
	//and of right type
	var remoteFnName = args.shift();

	if( remoteFnName === undefined) throw "Function name is missing.";
	if( remoteFnName &&  ! _.isString(remoteFnName)) throw "Function names can be strings only.";

	var remoteCall = {
		roomID : this.getRoomID(),
		objectID : this.getId(),
		fn : {
			name : remoteFnName,
			params : args
		}
	}

	if (callback) Modules.Dispatcher.query('serverCall',remoteCall, callback);
	else Modules.Dispatcher.query('serverCall',remoteCall);
	
}

GeneralObject.fetchContent=function(worker, forced){

	if (this.contentURLOnly) return;

	if (!worker) worker=function(data){
		//console.log(data);
	}

	if (this.contentFetched && forced !== true) {
		worker(this.content);
		return;
	}

	var that=this;
	//Do not use "this" in response fucntions as they do not refer to the object in there!
	
	var functionLoadedCallback = function(newContent){
		that.content=newContent;
		that.contentFetched=true;
		worker(newContent);
	    return;
	}

	this.serverCall('getContent', functionLoadedCallback);
}

GeneralObject.utf8={};

GeneralObject.utf8.toByteArray = function(str) {
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

GeneralObject.utf8.parse = function(byteArray) {
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



GeneralObject.getContentAsString=function(callback){
	if (callback === undefined) {
		return GeneralObject.utf8.parse(this.content);
	} else {
		callback(GeneralObject.utf8.parse(this.content));
	}
}

GeneralObject.hasContent=function(){
	return this.getAttribute('hasContent');
}

GeneralObject.contentUpdated=function(){

	this.fetchContent(false, true);
	
	this.draw();
}


//triggered by non local change of values
GeneralObject.refresh = function() {
	if (this.moving) return;
	this.draw(true);
}


GeneralObject.getPreviewContentURL = function() {
	return "/getPreviewContent/"+this.getRoomID()+"/"+this.id+"/"+this.getAttribute('contentAge')+"/"+ObjectManager.userHash;
}

GeneralObject.getContentURL = function() {
	return "/getContent/"+this.getRoomID()+"/"+this.id+"/"+this.getAttribute('contentAge')+"/"+ObjectManager.userHash;
}

GeneralObject.create = function(attributes) {
	
	if (attributes === undefined) {
		var attributes = {

		};
	} else {

	}
	
	ObjectManager.createObject(this.type, attributes);
	
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

GeneralObject.getRoom=function(){
	return Modules.ObjectManager.getCurrentRoom();
}

/**
*	determine if the current object intersects with the square x,y,width,height
*/
GeneralObject.boxIntersectsWith=function(otherx,othery,otherwidth,otherheight){

	var thisx = this.getViewBoundingBoxX();
	var thisy = this.getViewBoundingBoxY();
	var thisw = this.getViewBoundingBoxWidth();
	var thish = this.getViewBoundingBoxHeight();

	if (otherx+otherwidth<thisx) return false;
	if (otherx>thisx+thisw) return false;
	if (othery+otherheight<thisy) return false;
	if (othery>thisy+thish) return false;
	
	return true;
	
}

/**
*	determine if the current object intersects with oanother object
*/
GeneralObject.intersectsWith=function(other){
	var otherx=other.getViewBoundingBoxX();
	var othery=other.getViewBoundingBoxY();
	var otherw=other.getViewBoundingBoxWidth();
	var otherh=other.getViewBoundingBoxHeight();
	
	return this.boxIntersectsWith(otherx,othery,otherw,otherh);
	
}

GeneralObject.hasPixelAt=function(x,y){
	
	//assume, that the GeneralObject is full of pixels.
	//override this if you can determine better, where there
	//object is nontransparent
	
	return this.boxIntersectsWith(x,y,0,0);
}

GeneralObject.boxContainsPoint=GeneralObject.hasPixelAt;
