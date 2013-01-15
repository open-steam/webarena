var http = require('https');
var _ = require('underscore');
var Log = require('../../Common/Log.js');
var Modules=require('../../server.js');

var EasyDbAPI = {};

EasyDbAPI.apiUrl = Modules.config.easydb.apiUrl; //"easydb.uni-paderborn.de";
EasyDbAPI.apiPath = Modules.config.easydb.apiPath; //"/easy/fs.php?";

//Not used yet
//TODO: should be used to check if apicall method exists
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

EasyDbAPI.retrieveImageUrlForSize = function(imageId, size, callback){
    var args = {
        function: 'object_retrieve_bulk',
        ids : imageId,
        image_size : "125px",
        output : 'json',
        download_size : size
    }

    this.apicall(args, function(results){
        var decodedResponse = JSON.parse(results);
        var imageURL = decodedResponse['response']['objects'][0]['data']['bild.image']['download_url'];

        callback(imageURL);
    });
}

EasyDbAPI.retrieveDetailedImageInformation = function(data, imageSize, callback){
    var ids = _.map(data, function(dataEntry){
        return dataEntry['id'];
    });

    var mappedIdObject = {};

    _.each(data, function(dataEntry){
        mappedIdObject[dataEntry['id']] = dataEntry;
    });

    var args = {
        function: 'object_retrieve_bulk',
        ids : ids.join(","),
        image_size : imageSize,
        output : 'json',
        download_size : '800'
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
                    kuenstler : value['kuenstler_name'],
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

    console.log(callPath);
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

EasyDbAPI.buildSQL = function(sargs){

    var sp = sargs.searchParams;
    var limit = sargs.limit || false;
    var offset = sargs.offset || false;

    var defaults = {
        artist : false,
        presentedLocation:  false,
        location : false,
        title : false,
        reference : false
    }

    sp = _.defaults(sp, defaults);


    var intSQL = function(mod, innerQuery){
        var sql = ""+
        "SELECT " + (!innerQuery    ? "count(*) as cnt" : "b1.*, so1.name as standort , ho1.name as dargestellterort, p1.name AS kuenstler_name, ctna.cnt") + " FROM " + (innerQuery ? "(": "") +"Bilder b" + mod +" " +(innerQuery ? ", (" +innerQuery + ") as ctna) " : "")+
             "LEFT JOIN person p"+mod+"    ON p"+mod+".id=b" + mod +".kuenstler_id "    +
             "LEFT JOIN ort so"+mod+"      ON so"+mod+".id=b"+mod+".standort_id "       +
             "LEFT JOIN ort ho"+mod+"      ON ho"+mod+".id=b"+mod+".herstellungsort_id " +

        "WHERE  "+
            ((sp.title ?            _.reduce(sp.title.split(" "),
                function(mem, part){return mem + "titel               LIKE '%" + part +"%' AND "}, "").slice(0,-4) + " OR " : "")+
            (sp.reference ?         _.reduce(sp.reference.split(" "),
                function(mem, part){return mem + "abbildungsnachweis  LIKE '%" + part +"%' AND "}, "").slice(0,-4) + " OR ": "")+
            (sp.artist ?            _.reduce(sp.artist.split(" "),
                function(mem, part){return mem + "p"+mod+".name       LIKE '%" + part +"%' AND "}, "").slice(0,-4) + " OR ": "")+
            (sp.presentedLocation ? _.reduce(sp.presentedLocation.split(" "),
                function(mem, part){return mem + "so"+mod+".name      LIKE '%" + part +"%' AND "}, "").slice(0,-4) + " OR ": "")+
            (sp.location ?          _.reduce(sp.location.split(" "),
                function(mem, part){return mem + "ho"+mod+".name      LIKE '%" + part +"%' AND "}, "").slice(0,-4) + " OR ": "")).slice(0,-3)
            if(innerQuery){
                sql+=(limit ? " limit " + limit + " " : "")+
                    (offset ? " offset " + offset + " " : "")
            }


        return sql;
    }

    var finishedSQL = intSQL(1, intSQL(2));

    return finishedSQL;

}

/**
 * Search and retrieve urls
 *
 * @param searchTerm
 * @param callback
 */
EasyDbAPI.search = function(searchArgs){
    var searchParams = searchArgs.searchParams;
    var sql = this.buildSQL(searchArgs);

    Log.debug("EasyDbAPI","search", "Start search: ");
    var that = this;

    var argumentsItems = {
        function : 'object_search',
        sql : sql,
        output : "json"
    };

    function executeGetItems(callback){
        that.apicall(argumentsItems, function(data){
            var searchResults = JSON.parse(data);

            if(searchResults['response']['data']){
                that.retrieveDetailedImageInformation(searchResults['response']['data'], "150px", function(resultUrls){
                    callback(resultUrls);
                });
            } else {
                callback({});
            }
        });
    }

    executeGetItems(searchArgs.callback);


}

module.exports=EasyDbAPI;
