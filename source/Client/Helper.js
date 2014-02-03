/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2011
 *
 */

"use strict";

var module = {};  // For compatibility with node.js models.

function require(input) {
	switch (input) {
		case '../../server.js':
			return Modules;
		default:
			alert('Unknown requirement: ' + input);
	}
}

if (true) {
	Object.create = function (o) {
		function F() {
		}

		F.prototype = o;
		var result = new F();
		result.parent = o;           // allow access to prototype;
		return result;
	};
}

var Helper = new function () {


	//public method
	this.getCloneOfObject = function (oldObject) {
		var tempClone = {};

		if (typeof(oldObject) == "object")
			for (var prop in oldObject)
				// for array use private method getCloneOfArray
				if ((typeof(oldObject[prop]) == "object") &&
					(oldObject[prop]).__isArray)
					tempClone[prop] = this.getCloneOfArray(oldObject[prop]);
				// for object make recursive call to getCloneOfObject
				else if (typeof(oldObject[prop]) == "object")
					tempClone[prop] = this.getCloneOfObject(oldObject[prop]);
				// normal (non-object type) members
				else
					tempClone[prop] = oldObject[prop];

		return tempClone;
	}

	//private method (to copy array of objects) - getCloneOfObject will use this internally
	this.getCloneOfArray = function (oldArray) {
		var tempClone = [];

		for (var arrIndex = 0; arrIndex <= oldArray.length; arrIndex++)
			if (typeof(oldArray[arrIndex]) == "object")
				tempClone.push(this.getCloneOfObject(oldArray[arrIndex]));
			else
				tempClone.push(oldArray[arrIndex]);

		return tempClone;
	}


	/**
	 * assure - assure type security.
	 *
	 * Test, if a variable is set. If the variable is undefined
	 * an exception is thrown.
	 *
	 * If a datatype is provided, the variable is checked against
	 * that type, forcing an exception in case of a wrong type.
	 *
	 * Name is used for debugging purposes
	 **/
	this.assure = function (variable, name, datatype) {

		if (!name) name = '';

		if (variable === undefined) {
			throw 'missing variable ' + name;
		}

		if (!datatype) return true;

		if (typeof variable !== datatype) {
			throw 'variable ' + name + ' is not of type ' + datatype;
		}


	}

	//alias for "lodash random"
	this.getRandom = _.random

	this.getIntersectionOfArrays = function (A, B) {

		if (A.length == 0) {
			return B;
		}

		var all = A;

		all.concat(B);

		var result = new Array();

		$.each(all, function (key, value) {

			if (A.indexOf(value) != -1 && B.indexOf(value) != -1) {
				result.push(value);
			}

		});

		return result;

	}

}

function html2entities(input) {
	var output = '';

	for (var i = 0; i < input.length; i++) {
		var letter = input[i];

		switch (letter) {

			case "<":
				output += "&lt;";
				break;
			case ">":
				output += "&gt;";
				break;
			case "\"":
				output += "&quot;";
				break;
			case "'":
				output += "&#039;";
				break;
			case "&":
				output += "&amp;";
				break;
			default:
				output += letter;
		}

	}

	return output;
}