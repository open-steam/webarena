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
	
	if (this.updateContextDelay){
		clearTimeout(this.updateContextDelay);
		this.updateContextDelay=false;
	}
	
	var that=this;
	this.updateContextDelay=setTimeout(function(){
	
		var contexts=[];
		var temp={}
		
		var inventory=that.getInventory();
		
		var loopFunction=function(element){
			var list=element.whichContexts();
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
		
		that.registerAttribute('current_context',{type:'selection',options:contexts,standard:'general',readable:'current context',category:'Context'});
		
		GUI.updateInspector();
	},1000);
	
}

Room.getInventory=function(){
	return Modules.ObjectManager.getObjects();
}