var Modules = require("../../server.js");

var Plotter = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Plotter.register = function(type) {
	// Registering the object.
	GeneralObject = Modules.ObjectManager.getPrototype('GeneralObject')
	GeneralObject.register.call(this, type);
	
	/* Maybe we will change this in the future. */
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
/* Plotter is accessible and displayable on mobile version. */
Plotter.onMobile = true;
Plotter.hasMobileRep = true;
Plotter.hasEditableMobileContent = true;
Plotter.moveByTransform = function() {
	return true;
}

Plotter.contentURLOnly = false;

/* The content describes a chart which can be drawn by the plotter. */
Plotter.content = JSON.stringify({
	xAxis: {
		label: "Strecke [m]",
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
		label: "Zeit [s]",
		scale: {
			min: 0,
			max: 100
		},
		ticks: {
			major: 10,
			minor: 0
		}
	},
	values: [
		[0, 10], [10, 0], [20, 10], [30, 0], [40, 10],
		[50, 0], [60, 10], [70, 0], [80, 10], [90, 0],
		[100, 10]
	]
});

/* Sets the default content on creation. */
Plotter.justCreated=function(){
	this.setContent(this.content);
}

/* Returns the content as an object. */
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

/* Sets content as a JSON string. */
Plotter.setContentAsJSON = function(content) {
	// Save content as a JSON string.
	this.setContent(JSON.stringify(content));
}

module.exports = Plotter;