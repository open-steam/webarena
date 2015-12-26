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
	var newContent=this.getAttribute('userNames');
	
	if (newContent!=this.oldContent){
		
		var rep=this.getRepresentation();
		var contentArea=$(rep).find('.content')[0];
		
		var html='';
		
		for (var j in newContent){
			var user=newContent[j];
			html+='<label>';
            html+='<input type="checkbox" name="users" value="'+user+'">';
            html+=user;
            html+='</label><br>'; 
		}
		
		contentArea.innerHTML=html;
		
		this.adjustHeight();
		
	}
	
	this.oldContent=newContent;
}

UserChooser.createHTMLContent = function() {
	var self = this;
	
	var type=self.getAttribute('type');
	
	//var rep=this.getRepresentation();
	
	self.setHTML(
	'<div style="width:100%;border:1px solid black;background:#eee;" class="dialogbox">'
	+'<div style="margin:5px;">'
	+'<h1 style="background:#ddd;margin:-5px;padding:5px;font-size:100%;font-weight:bold">'+self.translate(GUI.currentLanguage,self.title)+'</h1>'
	+'<p>'+self.translate(GUI.currentLanguage,self.infoText)+'</p>'
	+'<div class="content"></div>'
	+'<div style="text-align:right;font-size:120%"><button onclick="'+type+'.buttonClicked(this)">'+self.translate(GUI.currentLanguage,self.buttonText)+'</button></div>'
	+'</div>'
	+'</div>'
	);
	
	self.adjustHeight();
	
	self.serverCall('startUserGetter');

}

UserChooser.buttonClicked=function(htmlobject){
	var object=this.getArenaObject(htmlobject);
	
	var rep=object.getRepresentation();
	
	var checkboxes=$(rep).find('input');
	
	var selection={};
	
	for (var i=0;i<checkboxes.length;i++){
		var box=checkboxes[i];
		selection[box.value]=box.checked;
	}
	
	if (object.proceed){
		object.proceed(selection);
	} else {
		console.log('ERROR: missing proceed(selection) function in '+object,selection);
	}
}

UserChooser.adjustHeight=function(){
	
	var self=this;
	
	window.setTimeout(function(){
	
		var htmlElement=$(self.getRepresentation()).find('.dialogbox')[0];
		
		var height=$(htmlElement).height();
		
		self.setAttribute('height',height);
		
	},10);
}
