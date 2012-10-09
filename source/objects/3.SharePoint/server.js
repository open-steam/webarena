"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var SP = require('sharepoint');
var https = require('https');
var _ = require('underscore');

module.exports=theObject;

theObject.getAuth = function(){
    return {username : Modules.config.sharepoint.username, password: Modules.config.sharepoint.password};
}

SP.RestService.prototype.request = function(options, next) {
    var req_data = options.data || '',
        list = options.list,
        id = options.id,
        query = options.query,
        ssl = (this.protocol == 'https:'),
        path = this.path + this.odatasvc + list +
            (id ? '(' + id + ')' : '') +
            (query ? '?' + qs.stringify(query) : '');

    var req_options = {
        method: options.method,
        host: this.host,
        path: path,
        auth: Modules.config.sharepoint.username +":" + Modules.config.sharepoint.password,
        headers: {
            'Accept': options.accept || 'application/json',
            'Content-type': 'application/json',
            'Cookie': 'FedAuth=' + this.FedAuth + '; rtFa=' + this.rtFa,
            'Content-length': req_data.length
        }
    };

    // Include If-Match header if etag is specified
    if (options.etag) {
        req_options.headers['If-Match'] = options.etag;
    };

    // support for using https
    var protocol = (ssl ? https : http);

    var req = protocol.get(req_options, function (res) {
        var res_data = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //console.log('CHUNK:', chunk);
            res_data += chunk;
        });
        res.on('end', function () {
            // if no callback is defined, we're done.
            if (!next) return;

            // if data of content-type application/json is return, parse into JS:
            if (res_data && (res.headers['content-type'].indexOf('json') > 0)) {
                res_data = JSON.parse(res_data).d
            }

            if (res_data) {
                next(null, res_data)
            }
            else {
                next()
            }
        });
    })

    req.end(req_data);
}

theObject.buildTreeObject = function(data){
    var result = {data : "root"};
    var splitPath;

    var tmp;



    function insertRec(elem, pathSpliced, arrPointer){

        if(pathSpliced.length === 0){
            if(!arrPointer.children) arrPointer.children = new Array();

            var extension = elem.__metadata.media_src.split('.').pop();
            var mediaUrl;
            if(extension === "docx" || extension === "doc"){
                mediaUrl = Modules.config.sharepoint.basepath + "_layouts/WordViewer.aspx?id=" + elem.Pfad + "/" + elem.Name
            } else if(extension === "pptx" || extension === "ppt"){
                mediaUrl = Modules.config.sharepoint.basepath + "_layouts/PowerpointViewer.aspx?id=" + elem.Pfad + "/" + elem.Name
            } else {
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

    //remove root node
    return new Array(result.children[0]);

}





theObject.search=function(content, a, b, callback){
    console.log('search');
    var that = this;

    var url = 'https://vkoop:!mO8dke7@projects.uni-paderborn.de/websites/studiolo/';

    var client = new SP.RestService(url),
        documents = client.list('FreigegebeneDokumente');


    var showResponse = function(err, data){


        callback(that.buildTreeObject(data.results));


    }

    documents.get(showResponse);
}