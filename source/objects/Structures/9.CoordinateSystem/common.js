/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

var Modules = require('../../../server.js')
var CoordinateSystem = Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

CoordinateSystem.register = function(type) {

    // Registering the object
    Modules.ObjectManager.getPrototype('Rectangle').register.call(this, type);
    this.makeStructuring();

    // this are hidden attributes
	this.registerAttribute('vertical-align',{type:'selection',standard:'middle',options:['top','middle','bottom'],category:'Label',hidden:true});
	this.registerAttribute('horizontal-align',{type:'selection',standard:'center',options:['left','center','right'],category:'Label',hidden:true});
    
    this.registerAttribute('minX', {type: 'number', standard: 1, category: 'Scale2',checkFunction:function(object,value){
        if(value==object.getAttribute('maxX')){
            object.setAttribute('maxX',parseInt(value)+1);
        }
        if(value>object.getAttribute('maxX')){
            object.setAttribute('maxX',parseInt(value)+1);
        }
    }});
    this.registerAttribute('maxX', {type: 'number', standard: 5, category: 'Scale2',checkFunction:function(object,value){
        if(value==object.getAttribute('minX')){
            object.setAttribute('minX',parseInt(value)-1);
        }
        if(value<object.getAttribute('minX')){
            object.setAttribute('minX',parseInt(value)-1);
        }
    }});
    this.registerAttribute('minY', {type: 'number', standard: 1, category: 'Scale2',checkFunction:function(object,value){
        if(value==object.getAttribute('maxY')){
            object.setAttribute('maxY',parseInt(value)+1);
        }
        if(value>object.getAttribute('maxY')){
            object.setAttribute('maxY',parseInt(value)+1);
        }
    }});
    this.registerAttribute('maxY', {type: 'number', standard: 5, category: 'Scale2',checkFunction:function(object,value){
        if(value==object.getAttribute('minY')){
            object.setAttribute('minY',parseInt(value)-1);
        }
        if(value<object.getAttribute('minY')){
            object.setAttribute('minY',parseInt(value)-1);
        }
    }});
    this.registerAttribute('steppingX', {type: 'number', standard: 1, min: 1, category: 'Scale2',changedFunction:function(object,value){
       var maxStep = Math.abs(object.getAttribute('maxX')-object.getAttribute('minX'));
        if(value>=maxStep){
           ObjectManager.getObject(object.id).setAttribute('steppingX',maxStep);
        }
    }});
    this.registerAttribute('steppingY', {type: 'number', standard: 1, min: 1, category: 'Scale2',changedFunction:function(object,value){
        var maxStep = Math.abs(object.getAttribute('maxY')-object.getAttribute('minY'));
        if(value>maxStep){
            ObjectManager.getObject(object.id).setAttribute('steppingY',maxStep);
        }
    }});
    
    this.registerAttribute('labelX', {type: 'text',standard: '', category: 'Scale2' });
    this.registerAttribute('labelY', {type: 'text', standard: '', category: 'Scale2'});
    this.registerAttribute('font-size',{type:'fontsize',min:10,standard:22,max:22,category:'Label'});
    
    this.standardData.fillcolor = 'white';
    this.standardData.linecolor = 'black';

}

CoordinateSystem.isCreatable = true;


module.exports = CoordinateSystem;