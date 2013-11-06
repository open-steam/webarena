/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js');
var OrangeActor=Object.create(Modules.ObjectManager.getPrototype('Actor'));

OrangeActor.isCreatable=true;

module.exports=OrangeActor;