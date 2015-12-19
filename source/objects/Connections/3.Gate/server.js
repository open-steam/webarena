/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');
var _ = require('lodash');

//intelligently rename gates after their target room
theObject.intelligentRename=function(attribute,value){
	
	if (attribute=='destination'){
		
		var self=this;
		
		Modules.ObjectManager.getRoom(value, this.context, false, function(target){
			var name=target.getAttribute('name');
			if (!name) name=value;
			self.setAttribute('name',name);
		})
		
	}
}

module.exports=theObject;