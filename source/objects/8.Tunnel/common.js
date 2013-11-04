var Modules=require('../../server.js')
var Tunnel=Object.create(Modules.ObjectManager.getPrototype('Hotspot'));

Tunnel.register=function(type){

	// Registering the object
	Modules.ObjectManager.getPrototype('Hotspot').register.call(this,type);
	this.makeSensitive();

	this.registerAttribute('attribute',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Selection'});

	this.registerAttribute('target',{type:'text',standard:'',category:'Selection'});
}

Tunnel.isCreatable=true;
Tunnel.category = 'Active';


module.exports=Tunnel;