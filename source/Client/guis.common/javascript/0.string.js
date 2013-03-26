"use strict";

function splitSubstr(str, len) {
    var ret = [ ];
    for (var offset = 0, strLen = str.length; offset < strLen; offset += len) {
        ret.push(str.substr(offset, len));
    }
    return ret;
}

/**
 * convert special chars to html their representations
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
 * convert line breaks to html <br>-tags
 */
function nl2br(str){
	return str.replace(/\n/g, '<br />');
}

function htmlEncode(str){
	var enc = nl2br(htmlEscape(str));
	return enc
}

function htmlDecode(str){
	return $("<div>").html(str.replace(/<br[\s\/]*>/gi, '\n')).text()
}