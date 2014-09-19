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
	this.registerAttribute('show5',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('show6',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('show7',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('show8',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('show9',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('show10',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('show11',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('show12',{type:'text',standard:'',category:'Elements'});
	
	
	
	this.registerAttribute('hide1',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide2',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide3',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide4',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide5',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide6',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide7',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide8',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide9',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide10',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide11',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('hide12',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('mode',{type:'text',standard:''});

}

ElementSwitcher.onDrop=function(where){
	
	var show1=this.getAttribute('show1');
	var show2=this.getAttribute('show2');
	var show3=this.getAttribute('show3');
	var show4=this.getAttribute('show4');
	var show5=this.getAttribute('show5');
	var show6=this.getAttribute('show6');
	var show7=this.getAttribute('show7');
	var show8=this.getAttribute('show8');
	var show9=this.getAttribute('show9');
	var show10=this.getAttribute('show10');
	var show11=this.getAttribute('show11');
	var show12=this.getAttribute('show12');

	var hide1=this.getAttribute('hide1');
	var hide2=this.getAttribute('hide2');
	var hide3=this.getAttribute('hide3');
	var hide4=this.getAttribute('hide4');
	var hide5=this.getAttribute('hide5');
	var hide6=this.getAttribute('hide6');
	var hide7=this.getAttribute('hide7');
	var hide8=this.getAttribute('hide8');
	var hide9=this.getAttribute('hide9');
	var hide10=this.getAttribute('hide10');
	var hide11=this.getAttribute('hide11');
	var hide12=this.getAttribute('hide12');
	
	if (hide1 && ObjectManager.getObject(hide1)) ObjectManager.getObject(hide1).setAttribute('visible',false);
	if (hide2 && ObjectManager.getObject(hide2)) ObjectManager.getObject(hide2).setAttribute('visible',false);
	if (hide3 && ObjectManager.getObject(hide3)) ObjectManager.getObject(hide3).setAttribute('visible',false);
	if (hide4 && ObjectManager.getObject(hide4)) ObjectManager.getObject(hide4).setAttribute('visible',false);
	if (hide5 && ObjectManager.getObject(hide5)) ObjectManager.getObject(hide5).setAttribute('visible',false);
	if (hide6 && ObjectManager.getObject(hide6)) ObjectManager.getObject(hide6).setAttribute('visible',false);
	if (hide7 && ObjectManager.getObject(hide7)) ObjectManager.getObject(hide7).setAttribute('visible',false);
	if (hide8 && ObjectManager.getObject(hide8)) ObjectManager.getObject(hide8).setAttribute('visible',false);
	if (hide9 && ObjectManager.getObject(hide9)) ObjectManager.getObject(hide9).setAttribute('visible',false);
	if (hide10 && ObjectManager.getObject(hide10)) ObjectManager.getObject(hide10).setAttribute('visible',false);
	if (hide11 && ObjectManager.getObject(hide11)) ObjectManager.getObject(hide11).setAttribute('visible',false);
	if (hide12 && ObjectManager.getObject(hide12)) ObjectManager.getObject(hide12).setAttribute('visible',false);
	
	if (show1 && ObjectManager.getObject(show1)) ObjectManager.getObject(show1).setAttribute('visible',true);
	if (show2 && ObjectManager.getObject(show2)) ObjectManager.getObject(show2).setAttribute('visible',true);
	if (show3 && ObjectManager.getObject(show3)) ObjectManager.getObject(show3).setAttribute('visible',true);
	if (show4 && ObjectManager.getObject(show4)) ObjectManager.getObject(show4).setAttribute('visible',true);
	if (show5 && ObjectManager.getObject(show5)) ObjectManager.getObject(show5).setAttribute('visible',true);
	if (show6 && ObjectManager.getObject(show6)) ObjectManager.getObject(show6).setAttribute('visible',true);
	if (show7 && ObjectManager.getObject(show7)) ObjectManager.getObject(show7).setAttribute('visible',true);
	if (show8 && ObjectManager.getObject(show8)) ObjectManager.getObject(show8).setAttribute('visible',true);
	if (show9 && ObjectManager.getObject(show9)) ObjectManager.getObject(show9).setAttribute('visible',true);
	if (show10 && ObjectManager.getObject(show10)) ObjectManager.getObject(show10).setAttribute('visible',true);
	if (show11 && ObjectManager.getObject(show11)) ObjectManager.getObject(show11).setAttribute('visible',true);
	if (show12 && ObjectManager.getObject(show12)) ObjectManager.getObject(show12).setAttribute('visible',true);

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