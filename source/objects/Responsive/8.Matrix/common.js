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

    this.registerAttribute('Row', {type: 'list', category: 'Table', standard: ["row 1", "row 2"]});
    this.registerAttribute('Column', {type: 'list', category: 'Table', standard: ["column 1", "column 2"]});
    this.standardData.fillcolor = 'white';
    this.standardData.linecolor = 'black';
    this.standardData.width = 400;
    this.standardData.height = 200;

}

Matrix.isCreatable = true;

Matrix.decideIfActive = function(object) {

    return true;
}


module.exports = Matrix;