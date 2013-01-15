/*
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');
var EasyDBImage=Object.create(Modules.ObjectManager.getPrototype('ImageObject'));



EasyDBImage.isResizable=function(){
    //if (this.getAttribute('remote_url') == false) return false;
    return true;
}

EasyDBImage.register('EasyDBImage');
EasyDBImage.isCreatable=true;
EasyDBImage.restrictedMovingArea = false;
EasyDBImage.category='Images';

module.exports=EasyDBImage;

