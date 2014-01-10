/**
 * WebArena Plugin Application for the "Kokoa Project"
 *
 * @author Viktor Koop <viktor.koop@gmail.com>
 */

var config = require('./config.js');
var uuid = require('node-uuid');
var _ = require('lodash');

var VerwaltungsApp = {};

var ContextObject = {
    user: {
        username: "server",
        password: "server"
    }
}

/**
 * Create all needed structures for a "Berufungsverfahren".
 * - Create needed room-structures
 */
VerwaltungsApp.initAppointmentProcedure = function () {
    var that = this;
    //create room instances for all parties
    //e.g. faculty, dezernate1/4 etc.
    //naming of the template rooms should follow the convention:
    //Dezernat4_Berufungsverfahren_Template
    //PARTICIPANT_Berufungsverfahren_Template
    var participants = ["Dezernat1", "Dezernat4", "FakultaetX"];
    var instanceId = uuid.v4();

    participants.forEach(function (part) {
        //send command to copy the room
        var groupId = new Date().getTime();

        that.eventBus.emit("copyRoom", {
            fromRoom: part + "_Berufungsverfahren_Template",
            toRoom: part + "_Berufungsverfahren_Instance_" + instanceId,
            parentRoom: "Overview_Instance_" + part,
            roomName: "Verfahren " + instanceId,
            callback: function () {
                console.log("App got answer...");
            },
            context: ContextObject
        });

        that.eventBus.emit("createObject", {
            roomID: "Overview_Instance_" + part,
            type: "Subroom",
            callback: function () {
                console.log("Created object...");
            },
            context: ContextObject,
            attributes: {
                x: 40,
                y: 50,
                group: groupId,
                name: "Verfahren " + instanceId,
                destination: part + "_Berufungsverfahren_Instance_" + instanceId
            }
        });

        that.eventBus.emit("createObject", {
            roomID: "Overview_Instance_" + part,
            type: "ProcessLog",
            callback: function () {
                console.log("Created object...");
            },
            context: ContextObject,
            attributes: {
                x: 270,
                y: 50,
                group: groupId,
                kokoa_processid :  instanceId
            }
        });

        that.eventBus.emit("createObject", {
            roomID: "Overview_Instance_" + part,
            type: "ObjectTransport",
            callback: function () {
                console.log("Created object...");
            },
            context: ContextObject,
            attributes: {
                x: 150,
                y: 50,
                group: groupId,
                target : part + "_Berufungsverfahren_Instance_" + instanceId
            }
        });
    });
}

VerwaltungsApp.initOverviewRooms = function () {
    var that = this;
    var participants = ["Dezernat1", "Dezernat4", "FakultaetX"];

    participants.forEach(function (part) {
        that.eventBus.emit("copyRoom", {
            context: ContextObject,
            fromRoom: "Overview_Template",
            toRoom: "Overview_Instance_" + part,
            callback: function () {
                console.log("App got answer...")
            }
        });
    });
}


VerwaltungsApp.checkIfLoaded = function(proceedingID){
    //Load status of proceeding if not loaded already
    if(!this.statusLights[proceedingID]){
        this.statusLights[proceedingID] = require('./statusLights.js').create(proceedingID);
    }
}

VerwaltungsApp.init = function (modules) {
    this.Modules = modules;
    this.eventBus = modules.EventBus;
    var that = this;
    that.statusLights = {};

    //Should return:
    // green - if in time
    // yellow - if runs out of time soon
    // red - if out of time
    this.eventBus.on("applicationevent::kokoa::getMilestoneState", function (event) {
        var proceedingId = event.proceedingId;
        var callback = event.callback;

        that.checkIfLoaded(proceedingId);
        callback( that.statusLights[proceedingId].getCurrentMileStoneStatus());
    });

    this.eventBus.on("applicationevent::kokoa::initMasterRooms", function () {
        that.initOverviewRooms();
    });

    this.eventBus.on("applicationevent::kokoa::initProcess", function () {
        that.initAppointmentProcedure();
    });

    this.eventBus.on("send_object", function(data){
        that.addLogEntry(data);
        that.sendMail();
    });

    this.eventBus.on("applicationevent::kokoa::getContent", function(event){
        var proceedingId = event.proceedingId;
        var callback = event.callback;

        that.checkIfLoaded(proceedingId);

        var proceedingStatus = that.statusLights[proceedingId].getStatus();
        callback(proceedingStatus);
    });

    this.eventBus.on("applicationevent::kokoa::saveMilestones", function(event){
        var changedMilestone = event.milestoneChanges.milestoneIndex;
        var proceedingId = event.proceedingId;
        var callback = event.callback;

        that.checkIfLoaded(proceedingId);
        var currentProceeding = that.statusLights[proceedingId];

        if(event.milestoneChanges.diff.done){
            currentProceeding.finishCurrent();
        }
        if(event.milestoneChanges.diff.enddate){
            currentProceeding.mileStones[changedMilestone].enddate = event.milestoneChanges.diff.enddate;
        }

        currentProceeding.save(callback);

    })
}



VerwaltungsApp.addLogEntry = function(data){
    var from = data.from;
    var to = data.to;
    var timestamp = data.timestamp;
    var objectName = data.objectName;

    var pat =  /(^[a-zA-Z0-9]+)_/;

    var pFrom = pat.exec(from);
    var pTo = pat.exec(to);

    if(pFrom == null || pTo == null || !pFrom[1]|| ! pTo[1])return;


    var fromEntry = "Verschickt: (" + objectName + ") an " + pTo[1];
    var toEntry = "Erhalten ("+ objectName + ") von " + pFrom[1];

    var overviewRoomFrom = "Overview_Instance_" + pFrom[1];
    var overviewRoomTo = "Overview_Instance_" + pTo[1];

    //find log
    this.Modules.ObjectManager.getInventory(overviewRoomFrom, ContextObject, function(items){
        items.forEach(function(item){
            if(item.getType() === "ProcessLog" && item.getAttribute("kokoa_processid")){
                //Add text....
                var oldContent = item.getContentAsString()

                //try to parse the content
                try{
                    var content = JSON.parse(oldContent);
                } catch(e){
                    //failed to parse...reset the content
                    var content = {entries : []};
                }

                //add entry to json
                var entry  = {
                    "message" : fromEntry,
                    "timestamp" : timestamp,
                    "cssclass" : "outgoing-message"
                }

                content.entries.push(entry);

                //save the new content
                item.setContent(JSON.stringify(content));
            }
        });
    });

    this.Modules.ObjectManager.getInventory(overviewRoomTo, ContextObject, function(items){
        items.forEach(function(item){
            if(item.getType() === "ProcessLog" && item.getAttribute("kokoa_processid")){
                var oldContent = item.getContentAsString()

                //try to parse the content
                try{
                    var content = JSON.parse(oldContent);
                } catch(e){
                    //failed to parse...reset the content
                    var content = {entries : []};
                }

                //add entry to json
                var entry  = {
                    "message" : toEntry,
                    "timestamp" : timestamp,
                    "cssclass" :"incoming-message"
                }

                content.entries.push(entry);

                item.setContent(JSON.stringify(content));
            }
        });
    });

}

/**
 * Send mail to all users that are configured to get a mail when a new message entered
 * a room.
 *
 * @param roomID
 */
VerwaltungsApp.sendMail = function (roomID) {
    //TODO create some possibility to add mails to a room
    var recipients = this.Modules.config.kokoa.mail;

    var smtpServer = "";
    var smtpUser = config.smtp.user;
    var smtpPassword = config.smtp.password;


    var nodemailer = require("nodemailer");
    var subject = "Neue Nachricht.";
    var text = "Sehr geehrter Nutzer, in dem Postfach befindet sich eine neue Nachricht. ";

    var smtpTransport = nodemailer.createTransport("SMTP", {
        service: "Hotmail",
        auth: {
            user: smtpUser,
            pass: smtpPassword
        }
    });

    var mailOptions = {
        "from": config.tunnel.senderMail,
        "subject": subject,
        "text": text
    };

    _(recipients).each(function(recipient){
        mailOptions.to = recipient;
        smtpTransport.sendMail(mailOptions, function (err, response) {
            if (err) {
                console.log("Failed while trying to send a mail.");
                console.log(err);
            } else {
                console.log("Message send successfully");
            }
        });
    });

}

function create() {
    return Object.create(VerwaltungsApp);
}

module.exports = {
    create: create
};