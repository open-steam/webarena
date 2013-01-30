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


EasyDBImage.register=function(type){
    GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
    GeneralObject.register.call(this,type);
    var that = this;

    var notNull = function(attrName){
        return function(object){
            if(object.data[attrName] && object.data[attrName] !== "null"){
                return object.data[attrName]
            } else {
                return "";
            }
        }
    }

    this.registerAttribute('easydbtitel',{category:'Meta Data', readonly:true, getFunction : notNull("easydbtitel")});
    this.registerAttribute('easydbkuenstler',{category:'Meta Data', readonly:true, getFunction : notNull("easydbkuenstler")});

    this.registerAttribute('easydbstandort',{category:'Meta Data', readonly:true, getFunction: notNull("easydbstandort")});
    this.registerAttribute('easydbdargestellter_ort',{category:'Meta Data', readonly:true, getFunction : notNull("easydbdargestellter_ort")});
}

EasyDBImage.register('EasyDBImage');
EasyDBImage.isCreatable=true;
EasyDBImage.restrictedMovingArea = false;
EasyDBImage.category='Images';

module.exports=EasyDBImage;

