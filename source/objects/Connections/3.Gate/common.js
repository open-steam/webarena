/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Gate=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Gate.register=function(type){
	// Registering the object
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
	
	this.registerAttribute('destination', {type: 'Hyperlink', standard: "choose", linkFunction: function(object) {
            object.showExitDialog()
        }, category: 'Hyperlink', changedFunction: function(object) {
            if(object.updateIcon){object.updateIcon()};
        }});
    this.registerAttribute('destinationObject', {type: 'Hyperlink', standard: "choose", hidden: true, linkFunction: function(object) {
            object.showExitDialog()
        }, category: 'Hyperlink'});
    this.registerAttribute('filterObjects', {type: 'boolean', standard: false, hidden: true});
		
	this.registerAttribute('open in',{type:'selection',standard:'same Tab',options:['same Tab','new Tab','new Window'],category:'Hyperlink'});
		
	this.registerAttribute('filterObjects',{type:'boolean',standard:false, hidden:true});

	this.registerAction('Follow',function(object){
		object.execute();
	},true);
	
	this.registerAction('Open in new window',function(object){	
		object.execute(true);
	},true); 

};

Gate.execute=function(){

		this.follow(this.getAttribute("open in"));

}

Gate.isCreatable=true;
Gate.moveByTransform = function(){return true;};

module.exports=Gate; 