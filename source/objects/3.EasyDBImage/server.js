/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
var EasyDbAPI = require('./EasyDbAPI.js');
var http = require('http');

module.exports=theObject;

theObject.search = function(args){
    var that = this;

    var api = Object.create( EasyDbAPI);
    api.getAuth = function(){
        return {username : that.context.user.username, password : that.context.user.password}
    }

    api.search(args);
}
