/**
 * Simple Token module. Parses specified authTokenFile.
 * Provides method to check if requested auth token is valid
 *
 * Auth token could be designed using uuid.v4()
 */

"use strict";

var fs = require('fs');
var tokens = [];
var tokenMap = {};

var authTokenFilePath = "auth_tokens";

var init = function(){
  if(fs.existsSync(authTokenFilePath)){
    tokens = fs.readFileSync(authTokenFilePath).toString().split("\n");
    tokens.forEach(function(t){
      tokenMap[t] = true;
    })
  } else {
    console.log("WARNING: auth_tokens file is missing");
  }
}
init();

var check = function(token){
  if(tokenMap[token]) return true
  else return false
};

module.exports = {
  "check" :  check
}