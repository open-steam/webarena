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
                    if (!GUI.couplingModeActive) {
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
        }

		
        if(openMethod == 'new Tab'){
            window.open(destination);
			return;
		}
        if(openMethod == 'new Window'){
			var newWindow = window.open(destination, Modules.Config.projectTitle, "height="+window.outerHeight+", width="+window.outerWidth);
			return;
        }
	
		//open in same tab
		if(String(destination).indexOf("http://www.") != 0){
			ObjectManager.loadRoom(destination, false, ObjectManager.getIndexOfObject(this.getAttribute('id')), callback);
		}
		else{
			window.open(destination,"_self")
		}
    }

	
	
}