/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

var Modules=require('../../../server.js')
var ElementSwitcher=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

ElementSwitcher.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
	
	this.registerAttribute('show1',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('show2',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('show3',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('show4',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide1',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide2',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide3',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide4',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('mode',{type:'text',standard:''});

}

ElementSwitcher.onDrop=function(where){
	
	var show1=this.getAttribute('show1');
	var show2=this.getAttribute('show2');
	var show3=this.getAttribute('show3');
	var show4=this.getAttribute('show4');

	var hide1=this.getAttribute('hide1');
	var hide2=this.getAttribute('hide2');
	var hide3=this.getAttribute('hide3');
	var hide4=this.getAttribute('hide4');
	
	if (hide1 && ObjectManager.getObject(hide1)) ObjectManager.getObject(hide1).setAttribute('visible',false);
	if (hide2 && ObjectManager.getObject(hide2)) ObjectManager.getObject(hide2).setAttribute('visible',false);
	if (hide3 && ObjectManager.getObject(hide3)) ObjectManager.getObject(hide3).setAttribute('visible',false);
	if (hide4 && ObjectManager.getObject(hide4)) ObjectManager.getObject(hide4).setAttribute('visible',false);
	
	if (show1 && ObjectManager.getObject(show1)) ObjectManager.getObject(show1).setAttribute('visible',true);
	if (show2 && ObjectManager.getObject(show2)) ObjectManager.getObject(show2).setAttribute('visible',true);
	if (show3 && ObjectManager.getObject(show3)) ObjectManager.getObject(show3).setAttribute('visible',true);
	if (show4 && ObjectManager.getObject(show4)) ObjectManager.getObject(show4).setAttribute('visible',true);

	var mode=this.getAttribute('mode');
	var oldMode=this.getRoom().getAttribute('mode');
	
	if (mode){
		this.getRoom().setAttribute('mode',mode);
		var elements=this.getRoom().getInventory();
		
		for (var i in elements){
			var element=elements[i];
			if (!element.getAttribute('modeSensitive')) continue;
			
			element.setAttribute('mode_'+oldMode+'_x',element.getAttribute('x'));
			element.setAttribute('mode_'+oldMode+'_y',element.getAttribute('y'));
			element.setAttribute('x',element.getAttribute('mode_'+mode+'_x'));
			element.setAttribute('y',element.getAttribute('mode_'+mode+'_y'));
		}
	}
	
}

ElementSwitcher.isCreatable=true; 

module.exports=ElementSwitcher;