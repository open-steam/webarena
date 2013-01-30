/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var ResponsiveObject=Object.create(Modules.ObjectManager.getPrototype('ActiveObject'));

ResponsiveObject.register('ResponsiveObject');
ResponsiveObject.category = 'Responsive';
module.exports=ResponsiveObject;