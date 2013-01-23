"use strict";

/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var DataSet=function(){	
	this.name='unnamed';
	this.type='Object';
	this.x=40;
	this.y=40;
	this.width=100;
	this.height=100;
	this.id=false;
	this.layer=999999999;
	this.fillcolor='#c0c0c0';
	this.contentAge=0;	
}

module.exports=DataSet;