var Modules = require('../../server.js');

var Button = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Button.register = function (type) {
	GeneralObject = Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this, type);

	this.registerAttribute('linesize', {hidden: true});
	this.registerAttribute('linecolor', {hidden: true});
	this.registerAttribute('fillcolor', {hidden: true});
	this.registerAttribute('width', {hidden: true});
	this.registerAttribute('height', {hidden: true});
	this.registerAttribute('event', {type: 'text', standard: '', category: 'Selection'});
}

Button.register('Button');
Button.isCreatable = true;
Button.moveByTransform = function () {
	return false;
}

Button.isResizable=function(){
	return false;
}

module.exports = Button;
