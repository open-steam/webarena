/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

var Modules = require('../../../server.js')
var Matrix = Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Matrix.register = function(type) {

    // Registering the object
    Modules.ObjectManager.getPrototype('Rectangle').register.call(this, type);
    this.makeStructuring();
    var random = Math.random();
    this.registerAttribute('Row', {type: 'list', category: 'Table', standard: ["row 1", "row 2"]});
    this.registerAttribute('Column', {type: 'list', category: 'Table', standard: ["column 1", "column 2"]});
    this.registerAttribute('RowName', {type: 'text', standard: 'RowExampleAttr-' + random, category: 'Selection'});
    this.registerAttribute('ColumnName', {type: 'text', standard: 'ColumnExampleAttr-' + random, category: 'Selection'});

    this.standardData.fillcolor = 'white';
    this.standardData.linecolor = 'black';
    this.standardData.width = 400;
    this.standardData.height = 200;

}

Matrix.getStructuringAttributes=function(){
	
	var result=[];
	
	var rowAttribute=this.getAttribute('RowName');
	var columnAttribute=this.getAttribute('ColumnName');
	if (rowAttribute) result.push(rowAttribute);
	if (columnAttribute) result.push(columnAttribute);
	return result;
}

Matrix.execute = function(event) {
    if(!this.inPlaceEditingMode){
		this.editText(event);
	}
}


Matrix.isCreatable = true;


module.exports = Matrix;