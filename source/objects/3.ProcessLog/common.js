/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

var Modules=require('../../server.js');

var ProcessLog=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

ProcessLog.register=function(type){
	var that = this;
	// Registering the object
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);

	this.registerAttribute('font-family',{type:'font',standard:'Arial',category:'Appearance'});
	this.registerAttribute('font-size',{type:'fontsize',min:10,standard:12,unit:'px',category:'Appearance'});
	this.registerAttribute('font-color',{type:'color',standard:'black',category:'Appearance'});

	this.standardData.fillcolor='rgb('+240+','+240+','+240+')';
	this.standardData.width=200;
	this.standardData.height=100;

	this.registerAttribute('linesize',{hidden: true});
	this.registerAttribute('linecolor',{hidden: true});

}



ProcessLog.moveByTransform = function(){
	return false
}

ProcessLog.isCreatable=true;
ProcessLog.restrictedMovingArea = false;
ProcessLog.contentURLOnly = false;
ProcessLog.category='Texts';

ProcessLog.register('ProcessLog');

module.exports=ProcessLog;
