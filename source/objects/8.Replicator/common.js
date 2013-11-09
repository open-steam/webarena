var Modules=require('../../server.js')
var Replicator=Object.create(Modules.ObjectManager.getPrototype('Hotspot'));

Replicator.register=function(type){

	// Registering the object
	Modules.ObjectManager.getPrototype('Hotspot').register.call(this,type);
	this.makeSensitive();

	this.registerAttribute('target',{type:'text',standard:'',category:'Selection'});
}

Replicator.isCreatable=true;
Replicator.category = 'Active';


module.exports=Replicator;