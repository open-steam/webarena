/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Rectangle=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Rectangle.register('Rectangle');
Rectangle.isCreatable=true;

module.exports=Rectangle;