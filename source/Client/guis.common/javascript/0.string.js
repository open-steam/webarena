"use strict";

/**
 * Split a string into parts of length L - last part can be shorter.
 *
 * @param {String} Item that should be split
 * @param {Number} length of resulting parts
 * @returns {Array.<String>} Array with split items
 */
function splitSubstr(str, len) {
    var ret = [ ];
    for (var offset = 0, strLen = str.length; offset < strLen; offset += len) {
        ret.push(str.substr(offset, len));
    }
    return ret;
}

/**
 *
 * Convert special chars to html their representations
 *
 * @param {String} String that should be escaped
 * @returns {String} escaped string
 */
function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

/**
 * Convert line breaks to html <br>-tags
 *
 * @param {String} Input
 * @returns {String} Output
 */
function nl2br(str){
	return str.replace(/\n/g, '<br />');
}

/**
 *
 * @param {String}
 * @returns {String}
 */
function htmlEncode(str){
    return nl2br(htmlEscape(str));
}

/**
 *
 * @param {String}
 * @returns {String}
 */
function htmlDecode(str){
	return $("<div>").html(str.replace(/<br[\s\/]*>/gi, '\n')).text()
}