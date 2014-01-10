/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

var Modules = require('../../server.js');

var StatusLight = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

StatusLight.register = function (type) {

    // Registering the object

    GeneralObject = Modules.ObjectManager.getPrototype('GeneralObject');
    GeneralObject.register.call(this, type);

    this.registerAttribute('proceedingID',{type:'text',standard:'',category:'Selection'});

}


StatusLight.register('StatusLight');
StatusLight.isCreatable = true;
StatusLight.category = 'Texts';
StatusLight.isResizable = function(){ return false; }

module.exports = StatusLight;