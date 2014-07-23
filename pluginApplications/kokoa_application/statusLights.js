var _ = require('lodash');
var moment = require('moment');
var config = require('./config.js');

var StatusLights = {};
StatusLights.proceedingId = false;

var mileStonesDefault = require('./milestones.json').milestones;


/**
 * Try to load status otherwise initalize with default values if couldn't load.
 */
StatusLights.load = function(){
    var sourcePath = config.datalocation;
    var filename = sourcePath + "/status_" + this.proceedingId + ".json";
    try{
        this.mileStones = require(filename);
    } catch (e){
        this.initFromDefault();
    }
}

/**
 * Initialize a proceeding with the default milestones.
 */
StatusLights.initFromDefault = function(){
    this.mileStones = _.cloneDeep(mileStonesDefault);
    this.initMileStone(0);
}

/**
 * 1. Set startdate
 * 2. Set enddate (calculated from startdate + recommended time-slot)
 *
 * @param index - milestone index
 */
StatusLights.initMileStone = function(index){
    var milestone = this.mileStones[index];
    var now = moment();
    milestone.startdate = now._d.getTime();
    milestone.enddate = now.add(milestone.deadline.recommended, "days")._d.getTime();
}

/**
 * Save status to disk. (JSON file)
 */
StatusLights.save = function(callback){
    var fs = require("fs");
    var content = JSON.stringify( this.mileStones );
    var location = config.datalocation + "/status_" + this.proceedingId +".json";

    fs.writeFile(location , content, "utf8", callback );
}

/**
 * Return the status of proceeding
 *
 * @returns {*}
 */
StatusLights.getStatus = function(){
    return this.mileStones;
}

/**
 * Search for current milestone (first undone). Set it to done.
 * Initialize next milestone.
 */
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

/**
 * Search for current milestone (first undone)
 * @returns { name : String , status : [green | yellow | res]}
 */
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

    if(timeTogo < 14){
        result.status = "red"
    } else if(timeTogo < 30){
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