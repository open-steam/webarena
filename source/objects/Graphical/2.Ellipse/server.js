/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');
module.exports=theObject;

theObject.getBoundingBox=function(){
	
	if (this.hasAttribute('linesize')) {
		var linesize = this.getAttribute('linesize')/2;
	} else {
		var linesize = 0;
	}
	
	var x=this.getAttribute('x')-this.getAttribute('width');
	var y=this.getAttribute('y')-this.getAttribute('height');
	var width=this.getAttribute('width')*2+linesize;
	var height=this.getAttribute('height')*2+linesize;
	return {'x':x,'y':y,'width':width,'height':height};
	
}