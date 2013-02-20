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

    this.registerAttribute('easydbtitel',{type:'metadata', category:'Meta Data',  getFunction : notNull("easydbtitel")});
    this.registerAttribute('easydbkuenstler',{type:'metadata', category:'Meta Data',  getFunction : notNull("easydbkuenstler")});

    this.registerAttribute('easydbstandort',{type:'metadata', category:'Meta Data',  getFunction: notNull("easydbstandort")});
    this.registerAttribute('easydbdargestellter_ort',{type:'metadata', category:'Meta Data',  getFunction : notNull("easydbdargestellter_ort")});
    this.registerAttribute('easydbdatierung',{type:'metadata', category:'Meta Data',  getFunction : notNull("easydbdatierung")});


    this.registerAttribute('linesize',{hidden: true});
    this.registerAttribute('linecolor',{hidden: true});
        this.registerAttribute('fillcolor',{hidden: true});
}

EasyDBImage.register('EasyDBImage');
EasyDBImage.isCreatable=true;
EasyDBImage.restrictedMovingArea = false;
EasyDBImage.category='Images';

module.exports=EasyDBImage;

