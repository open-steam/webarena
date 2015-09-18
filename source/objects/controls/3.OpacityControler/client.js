/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

"use strict";


OpacityControler.justCreated = function() {
	console.log("justCreated");
}

OpacityControler.isPreviewable = function() {
	return false;
}

OpacityControler.setOpacity = function() {
	var objID = this.getAttribute("Object ID");

	var compiledTemplate = _.template($('script#opacity-controller-dialog-template').html());
	var content = compiledTemplate({ objectID: objID});

	var onSave = function() {
		var opacityValue = $("#slider").slider("value");

		var args = ['opacity', opacityValue, false, {
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
		GUI.translate('Opacity controller'),
		content,
		buttons,
		300
	);

	$("#slider").slider({
		range: "min",
		min: 0,
		max: 100,
		value: 100,

		slide: function(event, ui) {
			//console.log("val: " + ui.value);
		}
	});
}

/**
*	determine if the object's bounding box intersects with the square x,y,width,height
*/
OpacityControler.objectIntersectsWith = function(ox, oy, ow, oh) {
	//console.log("OpacityControler.objectIntersectsWith");

	return false;
}
