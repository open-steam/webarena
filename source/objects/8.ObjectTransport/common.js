var Modules=require('../../server.js')
var ObjectTransport=Object.create(Modules.ObjectManager.getPrototype('Hotspot'));

ObjectTransport.register=function(type){

	// Registering the object
	Modules.ObjectManager.getPrototype('Hotspot').register.call(this,type);
	this.makeSensitive();
	this.registerAttribute('target',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('cut',{type:'boolean',standard:false, category:'Selection'});

}

ObjectTransport.execute=function(){
    var destination = this.getAttribute("target");
    ObjectManager.loadRoom(destination, false, ObjectManager.getIndexOfObject(this.getAttribute('id')));
}

ObjectTransport.isCreatable=true;
ObjectTransport.category = 'Active';


module.exports=ObjectTransport;