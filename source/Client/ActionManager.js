"use strict";

/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2010
*
*/

var ActionManager=Object.create(Object);

ActionManager.proto=false;
ActionManager.actions=false;

ActionManager.init=function(proto){
	
	this.proto=proto;
	this.actions={};
}

ActionManager.toString=function(){
	return 'ActionManager for '+this.proto;
}


ActionManager.registerAction=function(name,func,single,visibilityFunc){
	
	this.actions[name] = {
		"func": func,
		"single": single,
		"visibilityFunc": visibilityFunc,
	};
	
	return this;
	
}

ActionManager.unregisterAction=function(name){
	delete(this.actions[name]);
	return this;
}


ActionManager.performAction=function(name, clickedObject){
	
	if (!this.actions[name]) {
		debug(this + ' has no action ' + name);
		return;
	}
	
	this.actions[name]["func"](clickedObject);
	
	return this;

}

ActionManager.getActions=function(){
	return this.actions;
}

module.exports=ActionManager;