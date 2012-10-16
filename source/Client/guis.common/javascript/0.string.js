"use strict";

function splitSubstr(str, len) {
    var ret = [ ];
    for (var offset = 0, strLen = str.length; offset < strLen; offset += len) {
        ret.push(str.substr(offset, len));
    }
    return ret;
}