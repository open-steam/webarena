/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js');
var Actor=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Actor.register('Actor');
Actor.isCreatable=false;

Actor.category='Evaluations';

module.exports=Actor;