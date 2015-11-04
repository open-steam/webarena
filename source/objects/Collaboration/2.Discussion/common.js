/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Discussion=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Discussion.register=function(type){
	var that = this;
    // Registering the object
    GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
    GeneralObject.register.call(this,type);
    
    this.registerAttribute('font-family',{type:'font',standard:'Arial',category:'Appearance'});
    this.registerAttribute('font-size',{type:'fontsize',min:10,standard:12,unit:'px',category:'Appearance'});
    this.registerAttribute('font-color',{type:'color',standard:'black',category:'Appearance'});

    this.standardData.fillcolor='rgb('+240+','+240+','+240+')';
    this.standardData.width=200;
    this.standardData.height=100;

    this.registerAttribute('linesize',{hidden: true});
    this.registerAttribute('linecolor',{hidden: true});

    this.registerAttribute("embedded-width", {type: 'number', min: 5, standard: 400, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("embedded-height", object.getAttribute("embedded-height") * (value / object.getAttribute("embedded-width")));
            }

            return true;

        }
	});
	
	this.registerAttribute("embedded-height",{type: 'number', min: 5, standard: 500, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("embedded-width", object.getAttribute("embedded-width") * (value / object.getAttribute("embedded-height")));
            }

            return true;

        }
	});
	
	this.registerAttribute('name', {
		type: 'text',
		changedFunction: function(object, value) {
            object.updateHeading(value);
        }
	})
	
	this.registerAction('open/close',function(){
	
		var selected = ObjectManager.getSelected();
		
		for (var i in selected){
			var obj = selected[i];
			obj.switchState();
		}
	});

}


Discussion.execute=function(){
    this.switchState();
}


Discussion.moveByTransform = function(){
   return false 
}


Discussion.isResizable = function(){
    if(this.showEmbedded){
		return false;
	}
	else{
		return true;
	}
}


Discussion.isCreatable=true;
Discussion.showEmbedded=false;
Discussion.restrictedMovingArea = false; 
Discussion.contentURLOnly = false;

Discussion.register('Discussion');

module.exports=Discussion;
