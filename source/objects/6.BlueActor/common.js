/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js');
var BlueActor=Object.create(Modules.ObjectManager.getPrototype('Actor'));

BlueActor.isCreatable=true;
BlueActor.category='Evaluations';

module.exports=BlueActor;