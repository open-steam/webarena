"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');

var SP = require('./adaptedSharepoint');
var https = require('https');
var _ = require('lodash');

module.exports=theObject;

var getMediaUrl = function(extension, elem){
    var mediaUrl;
    if(extension === "docx" || extension === "doc"){
        mediaUrl = Modules.config.sharepoint.basepath + "_layouts/WordViewer.aspx?id=" + elem.Pfad + "/" + elem.Name
    } else if(extension === "pptx" || extension === "ppt"){
        mediaUrl = Modules.config.sharepoint.basepath + "_layouts/PowerPoint.aspx?PowerPointView=ReadingView&PresentationId=" + elem.Pfad + "/" + elem.Name
    } else if(extension === "xlsx" || extension === "xls"){
        mediaUrl = Modules.config.sharepoint.basepath + "_layouts/xlviewer.aspx?id=" + elem.Pfad + "/" + elem.Name
    }else{
        mediaUrl = elem.__metadata.media_src;
    }
    return mediaUrl;
}

theObject.buildTreeObject = function(data){
    var result = {data : "root"};


    function insertRec(elem, splitPathArray, arrPointer){
        var insertPointer = arrPointer;

        while(splitPathArray.length !== 0){
            var subdir = splitPathArray.shift();
            var subdirExists = false;
            var subdirIndex = -1;
            if(insertPointer.children){
                for(var i = 0; i< insertPointer.children.length; i++){
                    if(insertPointer.children[i].data == subdir){
                        subdirExists = true;
                        subdirIndex = i;
                        break;
                    }
                }
                if(subdirExists){
                    insertPointer = insertPointer.children[subdirIndex];
                } else {
                    insertPointer.children.push({
                        data: subdir
                    })
                    insertPointer = insertPointer.children[insertPointer.children.length - 1];
                }
            } else {
                insertPointer.children = [];
                insertPointer.children.push({
                    data: subdir
                })
                insertPointer = insertPointer.children[0];
            }
        }

        if(!insertPointer.children) insertPointer.children = [];
        var extension = elem.__metadata.media_src.split('.').pop();
        var mediaUrl = getMediaUrl(extension, elem);

        insertPointer.children.push({
            data : {
                title: elem.Name,
                icon : "../../guis.common/images/sharepoint/file.png"
            }, metadata: {
                media_src : mediaUrl,
                filename : elem.Name
            }
        })
    }



    _.each(data, function(elem){
        if(elem.Inhaltstyp ==="Dokument") insertRec(elem, elem.Pfad.split("/").splice(1), result);
    });

    if(result.children === undefined ){
        return [];
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

    var that = this;

    client.username =  this.context.user.username;
    client.password2 = this.context.user.password;

    var showResponse = function(err, data){
        callback(that.buildTreeObject(data.results));
    }

    documents.get(showResponse);
}

theObject.browse.public = true;