var Modules=require('../../../server.js')
var ObjectTransport=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

ObjectTransport.register=function(type){

	// Registering the object
	Modules.ObjectManager.getPrototype('GeneralObject').register.call(this,type);
	this.makeSensitive();
	this.registerAttribute('target',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('cut',{type:'boolean',standard:false, category:'Selection'});

    this.registerAttribute('customKeyValuePair', {type: 'text', standard: '', category: 'Selection'});

}

ObjectTransport.execute=function(){
    var destination = this.getAttribute("target");
    ObjectManager.loadRoom(destination, false, ObjectManager.getIndexOfObject(this.getAttribute('id')));
}

ObjectTransport.isCreatable=true;
ObjectTransport.isResizable = function(){ return true;};

module.exports=ObjectTransport;