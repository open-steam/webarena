Gate.clientRegister=function(){
	
	Gate.parent.clientRegister.call(this);
	
	this.registerAction('Follow',function(object){
		object.execute();
	},true);
}


Gate.follow = function(openMethod) {

    var destination = this.getAttribute('destination');
	
    if (!destination || destination == "choose") {
        return this.showExitDialog();
    } else {
        var self = this;

        var callback = false;
        if (self.getAttribute("destinationObject") !== '') {
            callback = function() {
                if (document.getElementById(self.getAttribute("destinationObject"))) {
                        $(document).scrollTo(
                                $('#' + self.getAttribute("destinationObject")),
                                1000,
                                {
                                    offset: {
                                        top: (self.getAttribute("height") / 2) - ($(window).height() / 2),
                                        left: (self.getAttribute("width") / 2) - ($(window).width() / 2)
                                    }
                                }
                        );
                }
            }
        }

		
        if(openMethod == 'new Tab'){
            window.open(destination);
			return;
		}
        if(openMethod == 'new Window'){
			var newWindow = window.open(destination, Modules.Config.projectTitle, "height="+window.outerHeight+", width="+window.outerWidth);
			return;
        }
        
        
        var isWebLink=false;
        
        if (String(destination).indexOf("http://") == 0) isWebLink=true;
        if (String(destination).indexOf("https://") == 0) isWebLink=true;
	
		//open in same tab
		if(!isWebLink){
			ObjectManager.loadRoom(destination, false, callback);
		}
		else{
			window.open(destination,"_self");
		}
    }

	
	
}