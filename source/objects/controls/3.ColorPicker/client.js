/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

"use strict";


ColorPicker.justCreated = function() {
	console.log("justCreated");
}

ColorPicker.isPreviewable = function() {
	return false;
}

ColorPicker.chooseColor = function() {
	var objID = this.getAttribute("Object ID");

	var compiledTemplate = _.template($('script#color-picker-dialog-template').html());
	var content = compiledTemplate({ objectID: objID});

	var onSave = function() {
		var color = $("#picker").spectrum("get");
		var rgb = 'rgb(' + parseInt(color._r) + ',' + parseInt(color._g) + ',' + parseInt(color._b) + ')';

		var args = ['fillcolor', rgb, false, {
								'transactionId': new Date().getTime(),
			  					'userId' : GUI.userid
								}];

		var remoteCall = {
			roomID: null,
			objectID: objID,
			fn: {
				name: 'setAttribute',
				params: args
			}
		}

		Modules.Dispatcher.query('serverCall', remoteCall);

		return true;
	};

	var onExit = function() {
		return true;
	};

	var buttons = {
		"Apply": onSave,
		"Cancel": onExit
	};

	var dialog = GUI.dialog(
		GUI.translate('Color Picker'),
		content,
		buttons,
		300
	);

	$("#picker").spectrum({
		flat: true,
		showPaletteOnly: true,
		showPalette:true,
		hideAfterPaletteSelect:true,
		color: 'blanchedalmond',
		palette: [
				["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff","#20124d","#4c1130","#bf9000"],
				["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f","#0c343d","#073763","#900"],
				["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc","#7f6000","#274e13","#134f5c"],
				["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd","#600","#783f04","#b45f06"],
				["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0","#351c75","#741b47","#38761d"],
				["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79","#0b5394"],
			]
	});
}

/**
*	determine if the object's bounding box intersects with the square x,y,width,height
*/
ColorPicker.objectIntersectsWith = function(ox, oy, ow, oh) {
	//console.log("ColorPicker.objectIntersectsWith");

	return false;
}