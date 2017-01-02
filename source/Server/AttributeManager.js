"use strict";

/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/


var Modules={};
var _ = require('underscore');
/**
*	Each object type get its attribute manager. This is the server side
*   AttributeManager which mainly is responsible for channeling through
*   object changes to the data connector as well as for calling attribute
*   evaluation code.
*
*   Note: Data is stored in the static attributeData member. This assures that
*   even when several instances of the same object exist (which is common on
*   the server side), they all have the same attribute set they operate on.
*/
var AttributeManager=new function(){
	
	//actual attribute data is kept private, so it can only be maniplulated
	//by setter and getter functions.
	
	var attributeData={};

	//setters and getter for attribute data. For convenience, object.set
	//and object.get can be used instead.
	
	//Notice: These functions set and get unfiltered data. It is not checked
	//if these data are within a specific range, of a certain type or even
	//exist at all. Changes made this way are not automatically distributed
	//to the client. Use this.set only when you can be sure the data you are 
	//storing fits range and type and make sure you persist
	//your data afterwards. In the general case use setAttribute instead.
	
	this.set=function(id,key,value){
		if (id==undefined || value==undefined){
			console.log('ERROR: undefined set',id,key,value);
			console.trace();
			return;
		}
		
		if (!attributeData[id]) attributeData[id]=this.proto.standardData||{};
		attributeData[id][key]=value;
	}

	this.get=function(id,key){
		if (!attributeData[id]) return undefined;
		if (!key) return attributeData[id];
        if(typeof attributeData[id][key] ==="object"){
            return JSON.parse(JSON.stringify(attributeData[id][key]));
        }
		return attributeData[id][key];
	}
	
	//setAll is used, when an object is loaded and gets its primary data. The
	//loaded data is accepted as is without any further checks.
	
	this.setAll=function(id,data){
		
		if (id==undefined){
			console.log('ERROR: undefined setAll',id,data);
			console.trace();
			return;
		}
		attributeData[id]=data;
	}
	
	this.toString=function(){
		return 'Server side AttributeManager for '+this.proto;
	}
	
};


/**
*	init
*	
*	called when an object type is registred (see GeneralObject). During this
*	project, each object type derives an Attributemanager whicht is herein
*	bound to its prototype and gets an empty attribute array which is then
*	again filled in the registration procress.
**/
AttributeManager.init=function(proto){
	
	//on the initial init, the evenvironment is provided
	if(proto.config) {
		Modules=proto;
	}

	this.proto=proto;
	this.attributes={};
	
}

/**
*	register an attribute for a prototype
*
*	data: 	type - 'text','number','color',...
*			min - integer
*			max - integer
*			standard
*			setFunction - function
*			getFunction - function
*			readonly - true, false
*
*/
AttributeManager.registerAttribute=function(attribute,data){
	
	if (!attribute) return;
	var manager=this;
	

	// fill in old properties, if the attribute has yet been registred.
	var oldData=this.attributes[attribute] || {};
	
	for (var key in oldData){
		var oldValue=oldData[key];
		if (data[key]===undefined) data[key]=oldValue;
	}
	
	if (data.type===undefined) data.type='text';
	if (data.min===undefined) data.min=-50000;
	if (data.max===undefined) data.max=50000;
	if (data.standard==undefined) data.standard=0;
	
	
	data.setter=function(object,value){	
		
		if (value===undefined) value=data.standard;
		if (data.type=='number' || data.type=='fontsize'){
			value=parseInt(value,10);
			if (isNaN(value)) value=data.standard;
			if (value<data.min) value=data.min;
			if (value>data.max) value=data.max;
		}
		if (data.setFunction) {
			data.setFunction(object,value);
		}
		else {
			object.set(attribute,value);
		}
	}
	

	data.getter=function(object){
		if (!data.getFunction) {
			var result=object.get(attribute);
		} else {
			var result=data.getFunction(object);
		}
		if (result===undefined) {
			result=data.standard;
		}

		if (data.type=='number' && attribute!='id'){
			result=parseInt(result,10);
			if (isNaN(result)) result=data.standard;
			if (result<data.min) result=data.min;
			if (result>data.max) result=data.max;
		}			
		
		return result;
	}
	
	this.attributes[attribute]=data;
	
	return data;

}

/**
*	set an attribute to a value on a specified object
*/
AttributeManager.setAttribute=function(object,attribute,value,forced, notify){

	var that = this;
	
	// do nothing, if value has not changed
	//previous solution with "===" did not work correctly
	if (_.isEqual(object.get(attribute),value)){
        return false;
    }

    if(attribute=='id'){
		console.log('ERROR: TRIED TO SET ID');
		console.trace();
	}
	
	// evaluation
	//
	// if the position ob the object has changed. evaluatePosition is called. This function
	// should wait and collect data for a while, as position and dimension information is hardly
	// ever changed in only one aspect.
		
	if (attribute=='x' || attribute=='y' || attribute=='width' || attribute=='height'){
		if (object.evaluatePosition)
			object.evaluatePosition(attribute,value,object.getAttribute(attribute));
	}
	
	// for every other attribute which may have changed, a changed function is called
	// (eg. if the attribute test has changed, we try to call testChanged on the server)
	
	var fnName=attribute+'Changed';
    if (object[fnName]) object[fnName](value);
	
	// get the object's setter function. If the attribute is not registred,
	// create a setter function which directly sets the attribute to the
	// specified value
	var setter=false;
	
	if(this.attributes[attribute]){
		setter=this.attributes[attribute].setter;
	} else {
		setter=function(object,value){object.set(attribute,value);};
	}
	
	// check if the attribute is read only
	if (this.attributes[attribute] && this.attributes[attribute].readonly) {
		console.log('ERROR: Attribute '+attribute+' is read only for '+this.proto);
		return undefined;
	}
	
	// call the setter function and persist the results
	setter(object,value);
	object.persist();
	
	//give the object a proper name if no name has been chosen so far
	if (attribute!='name' && attribute!='x' && attribute!='y' && attribute!='width' && attribute!='height'){
		object.intelligentRename(attribute,value);
	}
	
	//inform applications if notify is set to true or undefined
	var data={};
	data[attribute]=value;
	if(notify || notify == undefined){
		Modules.Applications.event('setAttribute',object,data);	
	}
	
	return true;
}

/**
*	get an attribute of a specified object
*/
AttributeManager.getAttribute=function(object,attribute,noevaluation){
	
	//on unregistred attributes directly return their value
	if (this.attributes[attribute]==undefined){
		return object.get(attribute);
	}
	
	var getter=this.attributes[attribute].getter;
	
	// call the getter function
	
	return getter(object);
}

/**
*	get a full attribute set of an object
*	with getter functions and evaluations
*/
AttributeManager.getAttributeSet=function(object){
	
	var result={};
	
	for (var key in object.get()){
		result[key]=AttributeManager.getAttribute(object,key);
	}
	
	return result;
}


AttributeManager.hasAttribute=function(object,attribute) {
	return (this.attributes[attribute]!=undefined);
}

/**
*	get the attributes (e.g. for GUI)
*
*	returns only registred attribute data, not their contents or unregistred attributes
*/
AttributeManager.getAttributes=function(){
	return this.attributes;
}

module.exports=AttributeManager;