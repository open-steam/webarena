/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

UserChooser.title='The title';
UserChooser.infoText='This is the text that explains what the chooser is used for.';
UserChooser.buttonText='Not OK!';

UserChooser.updateHTMLContent = function(){
	console.log('UpdateHTMLContent');
}

UserChooser.createHTMLContent = function() {
	var self = this;
	
	var type=self.getAttribute('type');
	
	//var rep=this.getRepresentation();
	
	self.setHTML(
	'<div style="width:100%;height:100%;border:1px solid black;background:#eee;">'
	+'<div style="margin:5px;">'
	+'<h1 style="background:#ddd;margin:-5px;padding:5px;font-size:100%;font-weight:bold">'+self.translate(GUI.currentLanguage,self.title)+'</h1>'
	+'<p>'+self.translate(GUI.currentLanguage,self.infoText)+'</p>'
	+'<div style="text-align:right;font-size:120%"><button onclick="'+type+'.buttonClicked(this)">'+self.translate(GUI.currentLanguage,self.buttonText)+'</button></div>'
	+'</div>'
	+'</div>'
	);
	
	self.serverCall('startUserGetter');

}

UserChooser.buttonClicked=function(htmlobject){
	var object=this.getArenaObject(htmlobject);
	
	console.log('buttonClicked '+object);
}
