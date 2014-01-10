var _ = require('lodash');
var moment = require('moment');

var StatusLights = {};
StatusLights.proceedingId = false;

var mileStonesDefault = [
    {
        id : 1,
        name : "Der erste Meilenstein",
        deadline: {
            recommended : 130 //days after finishing last milestone
        },
        done : false,
        startdate : false,
        enddate : false
    },
    {
        id : 2,
        name : "Der zweite Meilenstein",
        deadline: {
            recommended : 130 //days after finishing last milestone
        },
        done : false,
        startdate : false,
        enddate : false
    },
    {
        id : 3,
        name : "Der dritter Meilenstein",
        deadline: {
            recommended : 130 //days after finishing last milestone
        },
        done : false,
        startdate : false,
        enddate : false
    }
];

StatusLights.mileStonesAccess = [
    {
        milestoneId : 1,
        read : [],
        write : []
    }
];

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
    var path = require('path');
    var sourcePath = path.resolve("../source");
    var filename = sourcePath + "/status_" + this.proceedingId + ".json";
    var json;
    try{
        this.mileStones = require(filename);
    } catch (e){
        this.initFromDefault();
    }
}

StatusLights.initFromDefault = function(){
    this.mileStones = _.cloneDeep(mileStonesDefault);

    this.initMileStone(0);
}

StatusLights.initMileStone = function(index){
    var milestone = this.mileStones[index];
    var now = moment();
    milestone.startdate = now._d.getTime();
    milestone.enddate = now.add(milestone.deadline.recommended, "days")._d.getTime();
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

StatusLights.finishCurrent = function(){
    var firstNotDoneIndex = _(this.mileStones).findIndex(function(elem){
        return !elem.done;
    });
    var firstNotDone = this.mileStones[firstNotDoneIndex];
    firstNotDone.done = true;


    //only init if wasn't last milestone
    if(firstNotDoneIndex + 1 < this.mileStones.length){
        this.initMileStone(firstNotDoneIndex + 1);
    }

}

StatusLights.getCurrentMileStoneStatus = function(){
    var firstNotDone = _(this.mileStones).find(function(elem){
        return !elem.done;
    });

    if(!firstNotDone){
        return {
            name : "Abgeschlossen", status : "green"
        }
    }

    //calculate recommended end date
    var recommendedEndDate = moment(firstNotDone.enddate);

    var timeTogo = recommendedEndDate.diff(moment(), "days");
    var result = {
        name : firstNotDone.name
    };

    if(timeTogo < 0){
        result.status = "red"
    } else if(timeTogo < 7){
        result.status = "yellow"
    } else {
        result.status = "green"
    }
    return result;
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