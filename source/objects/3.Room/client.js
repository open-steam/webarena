/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


Room.getContext=function(){
	return this.getAttribute('current_context');
}

Room.updateContexts=function(){
	
	if (Config.noContexts) return;
	
	var contexts=[];
	var temp={}
	
	var inventory=this.getInventory();
	
	var loopFunction=function(element){
		var list=element.whichContexts();
		console.log(element.toString(),list);
		for (var j in list){
			var context=list[j];
			if (!temp[context]) contexts.push(context);
			temp[context]=true;
		}
	}
	
	for (var i in inventory){
		var element=inventory[i];
		loopFunction(element);
	}
	
	if (!contexts.length) contexts=['general'];
	
	this.registerAttribute('current_context',{type:'selection',options:contexts,standard:'general',readable:'current context',category:'Context'});
	    
	console.log(this+' updateContexts',contexts);
}

Room.getInventory=function(){
	return Modules.ObjectManager.getObjects();
}