Weblink.clientRegister=function(){
	
	Weblink.parent.clientRegister.call(this);
	
	this.registerAction('Follow',function(object){
		object.execute();
	},true);
}

/**
* create a Dialog with inputfield for an Adress. When Adressed entered the desitionation will be setted
*	context: Weblink object which ist uesd
*/
Weblink.showLinklDialog = function(context) {
    var self = this;
	var that=this;
    var dialog_buttons = {};
    var html;
	var htmlWarning;
  	var checkURL = function(){
		var isWebLink=false;
		var destination = $('#WeblinkInput').val();
        if (String(destination).indexOf("http://") == 0) isWebLink=true;
        if (String(destination).indexOf("https://") == 0) isWebLink=true;

		if(!isWebLink){
			if(htmlWarning == null){
				htmlWarning=  html+ "<br><p id='WeblinkWarning' style='display: inline; color:red;'>"+that.translate(GUI.currentLanguage, "check out if the adress is valide")+"</p>";
			}
			content = [];
			content.push(htmlWarning);
			GUI.dialog(
            	that.translate(GUI.currentLanguage, "enter Weblink"),
            	content,
            	dialog_buttons,
            	dialog_width,
            	position
            );
		}
		else{
			context.saveDestination(destination);
			dialog.dialog("close");
		}
	}
    
    dialog_buttons[that.translate(GUI.currentLanguage, "save Weblink")] = function() {
		checkURL();
    };
    
    dialog_buttons[that.translate(GUI.currentLanguage, "cancel process")] = function() {
        return false;
    };
    
    var dialog_width = 350;
    var content = [];
    html = "<p>"+that.translate(GUI.currentLanguage, "please enter the andress")+"</p>";
	if(context.getAttribute("destination") == "choose"){
		html = html + '<input id="WeblinkInput" style="width:100%;" type="url" name="deine-url" value="http://www.">';
	}else{
		html = html + '<input id="WeblinkInput" style="width:100%;" type="url" name="deine-url" value="'+context.getAttribute("destination")+'">';
	}
    
    content.push(html);

    var position = {
            open: function(event, ui) {
            $(event.target).parent().css('position', 'fixed');
            $(event.target).parent().css('top', context.getAttribute("y")+'px');
            $(event.target).parent().css('left', context.getAttribute("x")+'px');
        }
    };

    var dialog = GUI.dialog(
            that.translate(GUI.currentLanguage, "enter Weblink"),
            content,
            dialog_buttons,
            dialog_width,
            position
            );

     document.onkeydown = function(event){ 
            if(event.keyCode ==13){
            	checkURL();
            }
        }

}

/**
* opend a new tab with saved destination
*	destionation: URL of website
*/
Weblink.openURL= function(destination){
	window.open(destination,"_blank");
};