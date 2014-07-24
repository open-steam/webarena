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

theObject.search = function(searchArgs, offset, limit, callback){
    var that = this;

    var api = Object.create( EasyDbAPI);
    api.getAuth = function(){
        return {username : that.context.user.username, password : that.context.user.password}
    }

    searchArgs.offset = offset;
    searchArgs.limit = limit;
    searchArgs.callback = callback;

    api.search(searchArgs);
}

theObject.getUrls = function(imgId, imgSize, callback){
    var that = this;
    var api = Object.create( EasyDbAPI);
    api.getAuth = function(){
        return {username : that.context.user.username, password : that.context.user.password}
    }

    api.retrieveImageUrlForSize(imgId, imgSize, callback);
}

theObject.getUrls.public=true; //Function can be accessed by customObjectFunctionCall
theObject.search.public=true;