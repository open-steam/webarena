var Modules=require('../../server.js')
var TunnelEndpoint=Object.create(Modules.ObjectManager.getPrototype('Hotspot'));

TunnelEndpoint.register=function(type){

	// Registering the object
	Modules.ObjectManager.getPrototype('Hotspot').register.call(this,type);
    this.makeSensitive();
    this.makeStructuring();

	this.registerAttribute('source',{type:'text',standard:'',category:'Selection'});
}



TunnelEndpoint.isCreatable=true;
TunnelEndpoint.category = 'Active';


module.exports=TunnelEndpoint;