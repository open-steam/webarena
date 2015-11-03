/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

var Modules = require('../../../server.js')
var Table = Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Table.register = function(type) {

    // Registering the object
    Modules.ObjectManager.getPrototype('Rectangle').register.call(this, type);
    //this.makeStructuring();

    this.registerAttribute('Row', {type: 'list', category: 'Table', standard: ["row 1", "row 2"]});
    this.registerAttribute('Column', {type: 'list', category: 'Table', standard: ["column 1", "column 2"]});
    this.standardData.fillcolor = 'white';
    this.standardData.linecolor = 'black';
    this.standardData.width = 400;
    this.standardData.height = 200;

    this.registerAction('Zeilen und Spalten anpassen', function(lastClicked) {
        var selected = ObjectManager.getSelected();
        lastClicked.showFormatDialog(selected);

    });
    
    this.registerAction('Edit',function(){
		$.each(ObjectManager.getSelected(), function(key, object) {
            console.info("Table common.js - register each EDIT");
			object.execute();
		});
	}, true);
}

Table.execute=function(){
	console.info("Table common.js -this.input: "+this.input);
	if(!this.input){
        console.info("Table common.js - execute editText()"); 
		this.editText();
	}
	
}

Table.isCreatable = true;
Table.input = false;
console.info("table common.js: Table.input ="+Table.input);

Table.decideIfActive = function(object) {
    return true;
}
Table.execute = function() {
    //TODO: Hier die GUI für die Tabellenspalten aufrufen.
    //GUI.dialog
}


module.exports = Table;

