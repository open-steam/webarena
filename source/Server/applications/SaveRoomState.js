/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

"use strict";

var SaveRoomState=Object.create(require('./Application.js'));
var objectList={};
var Modules={};

SaveRoomState.init=function(name,theModules){
	this.name=name;
	Modules=theModules;
}

SaveRoomState.saveRoom=function(object, data){

}

module.exports=SaveRoomState;