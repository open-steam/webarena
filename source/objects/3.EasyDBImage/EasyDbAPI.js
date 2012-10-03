var http = require('https');
var _ = require('underscore');
var Log = require('../../Common/Log.js');
var Modules=require('../../server.js');

var EasyDbAPI = {};

EasyDbAPI.apiUrl = Modules.config.easydb.apiUrl; //"easydb.uni-paderborn.de";
EasyDbAPI.apiPath = Modules.config.easydb.apiPath; //"/easy/fs.php?";
EasyDbAPI.methods = {
    object_search : ['table_name',
        'search',
        'search_mask',
        'search_request',
        'sql',
        'sql_where'
    ],
    object_retrieve_bulk : [
        'table_name',
        'ids',
        'image_size',
        'download_size',
        'download_with_iptc'
    ],
    object_html : [
        'table_name',
        'ids'
    ],
    object_retrieve_structure : [
        'table_name'
    ]
};



//private
EasyDbAPI.getAuth = function(){
    return {username : Modules.config.easydb.username, password: Modules.config.easydb.password};
}

EasyDbAPI.retrieveDetailedImageInformation = function(data, imageSize, callback){
    var ids = _.map(data, function(dataEntry){
        return dataEntry['id'];
    });

    var mappedIdObject = {};

    _.each(data, function(dataEntry){
        mappedIdObject[dataEntry['id']] = dataEntry;
    });

    Log.debug("EasyDbAPI","retrieveImageUrls", "");
    var args = {
        function: 'object_retrieve_bulk',
        ids : ids.join(","),
        image_size : imageSize,
        output : 'json',
        download_size : 'original'
    }


    this.apicall(args, function(results){
        var filtered = new Array();
        var decodedResponse = JSON.parse(results);

        _.each(decodedResponse['response']['objects'], function(obj){
            if(obj.error === undefined){
                _.extend(mappedIdObject[obj.data.id], obj['data']);

            }
        });


        //filter information
        _.each(mappedIdObject, function(value, key){
            try{
                filtered.push({
                    titel : value.titel,
                    url : value['bild.image']['remote_uri'] || '',
                    kommentar : value['kommentar'],
                    kuenstler : value['kuenstler_id.name'],
                    easydbId : value['id'],
                    originalUrl : value['bild.image']['download_url'],
                    cnt : value['cnt']
                });
            } catch(e){}

        });




        callback(filtered);
    });
}

//public

/**
 * Call to EasyDB-API. Please use the arguments as defined in
 * http://docs.easydb.de/latest-stable/admin/connector/serverapi/serverapi.text
 *
 * for example:
 * {
 *     function : 'object_search',
 *     search   : 'hund'
 * }
 *
 * @param args
 * @param callback
 */
EasyDbAPI.apicall = function(args, callback){
    Log.debug("EasyDbAPI","apicall", "");
    //todo: check if args are valid - use easydbapi.methods
    var that = this;
    var authData = that.getAuth();
    var callPath = this.apiPath;

    for(var index in args){
        callPath += index + "=" + encodeURIComponent(args[index]) + "&";
    }

    Log.debug("EasyDbAPI","call path", callPath);

    var options = {
        host: this.apiUrl,
        port: 443,
        path: callPath,
        method: 'GET',
        auth: authData.username + ":" + authData.password
    };

    http.get(options, function(res){
        //otherwise stream will be returned
        res.setEncoding();
        var data = ""
        res.on('data', function(d) {
            data += d;
        });
        res.on('end', function(){
            callback(data);

        });
    }).on('error', function(e) {Log.error(e);})
}

/**
 * Search and retrieve urls
 *
 * @param searchTerm
 * @param callback
 */
EasyDbAPI.search = function(searchArgs, callback){
    var searchTerm = searchArgs.searchTerm || searchArgs;

    //dirty sql query - hack to get count in every row. To avoid need of second request.
    var sql = ""+
        "SELECT * "+
        "FROM Bilder, " +
            "(" +
                "SELECT COUNT(*) as cnt FROM Bilder WHERE  "+"titel LIKE '%" + searchTerm + "%' "+
                "OR kommentar LIKE '%"+searchTerm  +"%'" +
            ") as cnta " +
        "WHERE  "+
            "titel LIKE '%" + searchTerm + "%' "+
            "OR kommentar LIKE '%"+searchTerm  +"%'"; // OR PERSON.KUENSTLER_ID LIKE '%" + searchTerm +"%'";

    console.log(searchArgs);

    if(typeof searchArgs === "string"){

    } else if(typeof searchArgs === "object"){
        if(searchArgs.limit !== undefined){
            sql += " LIMIT " + searchArgs.limit;
            if(searchArgs.offset !== undefined){
                sql += " OFFSET " + searchArgs.offset;
            }
        }
    }
    console.log(sql);

    Log.debug("EasyDbAPI","search", "Start search: " + sql);
    var that = this;

    var arguments = {
        function : 'object_search',
        search : searchTerm,
        //table_name : "Bilder",
        sql : sql,
        output : "json"
    };

    that.apicall(arguments, function(data){
        var searchResults = JSON.parse(data);

        if(searchResults['response']['data']){
            that.retrieveDetailedImageInformation(searchResults['response']['data'], "150px", function(resultUrls){callback(resultUrls);});

        } else {
            callback({});
        }
    });
}

module.exports=EasyDbAPI;