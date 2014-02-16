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
Plotter.moveByTransform = function() {
	return true;
}

Plotter.content = JSON.stringify({
	xAxis: {
		scale: {
			min: 0,
			max: 200
		},
		ticks: {
			major: 20,
			minor: 5
		}
	},
	yAxis: {
		scale: {
			min: 0,
			max: 100
		},
		ticks: {
			major: 10,
			minor: 5
		}
	},
	points: [[0,0],[50,100],[100,0],[150,100]]
});

Plotter.justCreated=function(){
	this.setContent(this.content);
}

module.exports = Plotter;