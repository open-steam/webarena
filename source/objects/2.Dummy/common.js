/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Dummy=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Dummy.register('Dummy');
Dummy.isCreatable=true;

Dummy.category = 'Pointer';

module.exports=Dummy;