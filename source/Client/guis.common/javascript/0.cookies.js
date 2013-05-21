"use strict";

/**
 * Creates a new cookie
 * @param {String} name name of the new cookie
 * @param {String} value value of the new cookie
 * @param {int} days lifetime of the new cookie
 */
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

/**
 * Read an existing cookie identified by a given name
 * @param {String} name name of the cookie
 */
function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

/**
 * Delete a cookie identified by a given name
 * @param {String} name name of the cookie
 */
function eraseCookie(name) {
	createCookie(name,"",-1);
}