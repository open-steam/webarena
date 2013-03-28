/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Room=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Room.register=function(type){
	
	var ObjectManager=this.ObjectManager;
	
    // Registering the object
    IconObject=Modules.ObjectManager.getPrototype('IconObject');
    IconObject.register.call(this,type);
    
	this.registerAttribute('locked',{hidden:true});
	this.registerAttribute('visible',{hidden:true});
	this.registerAttribute('x',{hidden:true});
	this.registerAttribute('y',{hidden:true});
	this.registerAttribute('group',{hidden:true});

    if (!Modules.Config.noContexts){
    
	    if (!ObjectManager.isServer){
	    
	    	this.registerAttribute('current_context',{type:'selection',options:['general','different','alternative'],standard:'general',readable:'current context',category:'Context'});
	    
	    } else {
	    	this.registerAttribute('current_context',{standard:'general',setFunction:function(object,value){
	    			var context=value;				
					object.set('current_context',context);
					var inventory=object.getInventory();
					for (var i in inventory){
						var object=inventory[i];
						object.onSwitchContext(value);
					}
	    	}});
	
	    }
    }
    
	//Hide unnecessary attributes (at least for now)
    
    this.registerAttribute('only_in_contexts',{hidden:true});
    this.registerAttribute('position_on_all_contexts',{hidden:true});
    this.registerAttribute('appearance_on_all_contexts',{hidden:true});
    this.registerAttribute('locked',{hidden:true});
	this.registerAttribute('visible',{hidden:true});
    this.registerAttribute('x',{hidden:true});
	this.registerAttribute('y',{hidden:true});
	this.registerAttribute('group',{hidden:true});
    
}

Room.execute=function(){
	var destination=this.getAttribute('id');	
	ObjectManager.loadRoom(destination);
}

Room.getContext=function(){
	return this.getAttribute('current_context')||'general';
}

Room.register('Room');
Room.isCreatable=false;

Room.category = 'Rooms';

module.exports=Room;