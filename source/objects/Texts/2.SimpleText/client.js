/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

SimpleText.clientRegister = function(){
	
	 SimpleText.parent.clientRegister.call(this);
	
		this.registerAction('Edit',function(){
		$.each(ObjectManager.getSelected(), function(key, object) {
			object.execute();
		});
	}, true);	
}

SimpleText.objectCreated=function(){
	this.setContent(this.translate(this.currentLanguage, 'No text yet!'));
}