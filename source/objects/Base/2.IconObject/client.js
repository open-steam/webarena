IconObject.clientRegister=function(){
	
	IconObject.parent.clientRegister.call(this);   
	
	this.unregisterAction('to back');
	this.unregisterAction('to front');
	
	var self=this;
	
	
	this.registerAction('Switch context', function(clickedObject) {

	   // it does not matter which object has been clicked on
	   // get all selected objects instead.

       var selected = ObjectManager.getSelected();
       
       self.selectContextDialogue(clickedObject,function(context){
       	
           console.log(selected);
           console.log(context);
       	
       	   for (var i in selected) {
	           var object = selected[i];
	
	           //object.deleteIt();
	
	       }
       	
       });


    });
	
}



/**
* creates a Dialogbox, display all subrooms in a list and set the destination
*   context: Gate Object which is used
*/
IconObject.selectContextDialogue = function(clickedObject,callback) {

    var self = this;

    var dialog_buttons = {};
    var html;
	
	var contexts = clickedObject.getContexts();
	
	
	dialog_buttons[self.translate(GUI.currentLanguage, "set context")] = function() {
        saveDestination();
    };
	dialog_buttons[self.translate(GUI.currentLanguage, "cancel process")] = function() {
        return false;
    };
    
    var dialog_width = 350;
    var content = [];
	
    html = "<p>"+self.translate(GUI.currentLanguage, "please select a context")+"</p>";
	html = html + "<ul id='contextList'>";
	
	for( var i =0; i< contexts.length;i++){
		var contextItem=contexts[i];
		console.log(contextItem);
		
		html = html + "<li id='"+contextItem+"'><a >"+contextItem+"</a></li>";
	}	
	
	html = html + "</ul>";
	html = html + "<style>contextList li:hover { background-color: rgb(255, 255, 255); }li{ list-style: none; }</style>";


    content.push(html);

    var position = {
            open: function(event, ui) {
            $(event.target).parent().css('position', 'fixed');
            $(event.target).parent().css('top', clickedObject.getAttribute("y")+'px');
            $(event.target).parent().css('left', clickedObject.getAttribute("x")+'px');
        }
    };

    var dialog = GUI.dialog(
            self.translate(GUI.currentLanguage, "select context"),
            content,
            dialog_buttons,
            dialog_width,
            position
            );
            
    
	var saveDestination = function(selection){
		console.log(selection);
		callback(selection);
		dialog.dialog("close");
	};
	


}


IconObject.isBackgroundObject = function(){	return false;}