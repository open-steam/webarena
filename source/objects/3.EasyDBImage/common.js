/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var EasyDBImage=Object.create(Modules.ObjectManager.getPrototype('ImageObject'));


EasyDBImage.execute=function(){
	
	var that=this;
	
	//GUI.uploadFile(this,this.translate(GUI.currentLanguage, "please select an image"));
	// <-- this is the right place to select an easyDB image =)

}

EasyDBImage.register('EasyDBImage');
EasyDBImage.isCreatable=true;

EasyDBImage.category='Images';

module.exports=EasyDBImage;