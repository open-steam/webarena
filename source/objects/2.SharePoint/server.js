"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');

var SP = require('./adaptedSharepoint');
var https = require('https');
var _ = require('underscore');

module.exports=theObject;

theObject.getAuth = function(){
    return {username : Modules.config.sharepoint.username, password: Modules.config.sharepoint.password};
}

theObject.buildTreeObject = function(data){
    var result = {data : "root"};
    var splitPath;
    var tmp;

    function insertRec(elem, pathSpliced, arrPointer){

        if(pathSpliced.length === 0){
            if(!arrPointer.children) arrPointer.children = new Array();
            var mediaUrl;
            var extension = elem.__metadata.media_src.split('.').pop();
            if(extension === "docx" || extension === "doc"){
                mediaUrl = Modules.config.sharepoint.basepath + "_layouts/WordViewer.aspx?id=" + elem.Pfad + "/" + elem.Name
            } else if(extension === "pptx" || extension === "ppt"){
                mediaUrl = Modules.config.sharepoint.basepath + "_layouts/PowerPoint.aspx?PowerPointView=ReadingView&PresentationId=" + elem.Pfad + "/" + elem.Name
            } else if(extension === "xlsx" || extension === "xls"){
                mediaUrl = Modules.config.sharepoint.basepath + "_layouts/xlviewer.aspx?id=" + elem.Pfad + "/" + elem.Name
            }else{
                mediaUrl = elem.__metadata.media_src;
            }

            arrPointer.children.push({
                data : {
                    title: elem.Name,
                    icon : "../../guis.common/images/sharepoint/file.png"
                }, metadata: {
                    media_src : mediaUrl,
                    filename : elem.Name
                }
            })
        } else {
            var firstSubdir = pathSpliced.shift();
            var found = false;
            if(arrPointer.children){
                for(var i = 0; i< arrPointer.children.length; i++){
                    if(arrPointer.children[i].data == firstSubdir){
                        found = true;
                        break;
                    }
                }
            } else {
                arrPointer.children = new Array();
            }

            if(found){
                arrPointer = arrPointer.children[i];
            } else {
                arrPointer.children.push({
                    data : firstSubdir
                });
                arrPointer = arrPointer.children[arrPointer.children.length -1];
            }

            insertRec(elem, pathSpliced, arrPointer);
        }
    }

    _.each(data, function(elem, index){
        if(elem.Inhaltstyp ==="Dokument") insertRec(elem, elem.Pfad.split("/").splice(1), result);
    });

    if(result.children === undefined ){
        return new Array();
    } else {
        return new Array(result.children[0]);
    }
}

theObject.browse=function(argsIn, callback){
    var defaultArgs = {
        location: 'https://projects.uni-paderborn.de/websites/studiolo/',
        folder: 'FreigegebeneDokumente'
    }
    var args = _.defaults(argsIn, defaultArgs);

    var client = new SP.RestService(args['location']),
        documents = client.list(args['folder']);

    var that = this

    client.username =  this.context.user.username;
    client.password2 = this.context.user.password;

    var showResponse = function(err, data){
        callback(that.buildTreeObject(data.results));
    }

    documents.get(showResponse);
}

theObject.browse.public = true;