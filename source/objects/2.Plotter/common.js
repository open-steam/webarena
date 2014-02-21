var Modules = require("../../server.js");

var Plotter = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Plotter.register = function(type) {
	// Registering the object.
	GeneralObject = Modules.ObjectManager.getPrototype('GeneralObject')
	GeneralObject.register.call(this, type);
	
	this.attributeManager.registerAttribute('linesize',{type:'number',min:1,standard:1,category:'Appearance'});
    this.attributeManager.registerAttribute('linestyle',{type:'selection',standard:'stroke',options:['stroke','dotted','dashed'],category:'Appearance'});
	this.attributeManager.registerAttribute('linecolor',{standard:'black'});
	this.attributeManager.registerAttribute('fill',{type:'text',standard:'none',hidden:true});
	this.registerAttribute('fillcolor',{hidden:true});
	
	this.registerAction('Edit',function(){
		$.each(ObjectManager.getSelected(), function(key, object) {
			object.execute();
		});
	}, true);
}

Plotter.execute=function(){
	this.editValueTable();
}

Plotter.register('Plotter');
Plotter.isCreatable = true;
Plotter.onMobile = true;
Plotter.hasMobileRep = true;
Plotter.hasEditableMobileContent = true;
Plotter.moveByTransform = function() {
	return true;
}

Plotter.contentURLOnly = false;

Plotter.content = JSON.stringify({
	xAxis: {
		scale: {
			min: 0,
			max: 100
		},
		ticks: {
			major: 10,
			minor: 0
		}
	},
	yAxis: {
		scale: {
			min: 0,
			max: 100
		},
		ticks: {
			major: 10,
			minor: 0
		}
	},
	points: [[0,0],[25,75],[50,25],[100,50]]
});

Plotter.justCreated=function(){
	this.setContent(this.content);
}

Plotter.getContentAsObject = function() {
	// Check if the content is already fetched as a string.
	if (typeof this.content != "string") {
		// Get the content as a JSON string.
		var that = this;
		this.getContentAsString(function(data) {
			if (!data) {
				that.content = undefined;
			} else {
				that.content = data;
			}
		});
	}
	
	// If the content is defined, return it as an object.
	if (this.content != undefined) {
		return JSON.parse(this.content);
	}
	
	return undefined;
}

Plotter.setContentAsJSON = function(content) {
	// Save content as a JSON string.
	this.setContent(JSON.stringify(content));
}

module.exports = Plotter;