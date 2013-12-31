var _ = require('lodash');

var StatusLights = {};
StatusLights.proceedingId = false;

var mileStonesDefault = [
    {
        id : 1,
        name : "Der erste Meilenstein",
        deadline: {
            recommended : 130, //days after finishing last milestone
            choosen : 140 // e.g. April, 1st 2014
        },
        status : "todo"
    },
    {
        id : 2,
        name : "Der zweite Meilenstein",
        deadline: {
            recommended : 130, //days after finishing last milestone
            choosen : 140 // e.g. April, 1st 2014
        },
        status : "todo"
    }
];

StatusLights.mileStonesAccess = [
    {
        milestoneId : 1,
        read : [],
        write : []
    }
]

StatusLights.mayRead = function(context, callback){
    //TODO
    callback(true);
}

StatusLights.mayWrite = function(context, callback){
    callback(true);
}

/**
 * Try to load status otherwise initalize with default values
 */
StatusLights.load = function(){
    var filename = "status_" + this.proceedingId + ".json";
    var json;
    try{
        this.mileStones = require(filename);
    } catch (e){
        this.mileStones = _.cloneDeep(mileStonesDefault);
    }
}

/**
 * Save status to disk.
 */
StatusLights.save = function(callback){
    var fs = require("fs");
    fs.writeFile( "status_" + this.proceedingId +".json", JSON.stringify( this.mileStones ), "utf8", callback );
}

/**
 * Return the status of proceeding
 *
 * @returns {*}
 */
StatusLights.getStatus = function(){
    return this.mileStones;
}

function create(proceedingId) {
    var statusObject = Object.create(StatusLights);
    statusObject.proceedingId = proceedingId;
    statusObject.load();
    return statusObject;
}

module.exports = {
    create: create
};