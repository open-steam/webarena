/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Discussion=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Discussion.register=function(type){
	
	// Registering the object
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.registerAttribute('font-family',{type:'font',standard:'Arial',category:'Appearance'});
	this.registerAttribute('font-size',{type:'fontsize',min:10,standard:22,unit:'px',category:'Appearance'});
	this.registerAttribute('font-color',{type:'color',standard:'black',category:'Appearance'});

    this.standardData.fillcolor='rgb('+240+','+240+','+240+')';
    this.standardData.width=400;
    this.standardData.height=400;

}

Discussion.execute=function(){
    if(!this.getAttribute("show_embedded")){
        this.switchState();
    }
}

Discussion.moveByTransform = function(){
   return false
}

Discussion.isCreatable=true;
Discussion.restrictedMovingArea = true;
Discussion.contentURLOnly = false;
Discussion.category='Texts';

Discussion.register('Discussion');

module.exports=Discussion;