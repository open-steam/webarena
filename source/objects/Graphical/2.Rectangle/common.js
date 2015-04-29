/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Rectangle=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Rectangle.register=function(type){
	// Registering the object
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);

	this.registerAttribute('label',{type:'text',standard:'',category:'Label'});
	this.registerAttribute('font-family',{type:'font',standard:'Arial',category:'Label'});
	this.registerAttribute('font-size',{type:'fontsize',min:10,standard:22,max:80,unit:'px',category:'Label'});
	this.registerAttribute('font-color',{type:'color',standard:'black',category:'Label'});
	this.registerAttribute('vertical-align',{type:'selection',standard:'middle',options:['top','middle','bottom'],category:'Label'});
	this.registerAttribute('horizontal-align',{type:'selection',standard:'center',options:['left','center','right'],category:'Label'});
	this.registerAttribute('opacity', {type: 'number', min: 10, max: 100, standard: 100, category: 'Appearance', stepsize: 10});
}

Rectangle.execute=function(){
	if(!this.input){
		this.editText();
	}	
}

Rectangle.register('Rectangle');
Rectangle.isCreatable=true;
Rectangle.onMobile = true;
Rectangle.input = false;

Rectangle.moveByTransform = function(){return true;}

module.exports=Rectangle;