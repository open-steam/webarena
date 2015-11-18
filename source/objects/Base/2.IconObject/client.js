IconObject.clientRegister=function(){
	
	IconObject.parent.clientRegister.call(this);   
	
	this.unregisterAction('to back');
	this.unregisterAction('to front');
	
}

IconObject.isBackgroundObject = function(){	return false;}