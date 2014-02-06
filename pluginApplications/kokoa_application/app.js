/**
 * WebArena Plugin Application for the "Kokoa Project"
 *
 * @author Viktor Koop <viktor.koop@gmail.com>
 */

var config = require('./config.js');
var uuid = require('node-uuid');
var _ = require('lodash');
var async = require('async');

var VerwaltungsApp = {
    overviewRoomTemplateName : "Overview_Template",
    overviewRoomInstancePrefix : "Overview_Instance_",
    proceedingRoomTemplateSuffix : "_Berufungsverfahren_Template",
    proceedingRoomInstanceInfix : "_Berufungsverfahren_Instance_"
};


var ContextObject = {};
ContextObject.user = config.application_context_user;


/**
 * Create all needed structures for a "Berufungsverfahren".
 * - Create needed room-structures
 */
VerwaltungsApp.initProceedingInstance = function (faculty) {
    var that = this;

    /*
     * create room instances for all parties
     * e.g. faculty, dezernate1/4 etc.
     * naming of the template rooms should follow the convention:
     * Dezernat4_Berufungsverfahren_Template
     */
    var participants = ["Dezernat1", "Dezernat4", "Fakultaet" + faculty];
    var instanceId = uuid.v4();

    var rewireObjectTransports = function (room, proceedingID) {
        var roomToGet = room;
        var transformTransportTargets = function (items) {
            if(items){
                items.forEach(function (item) {
                    var regex = /(^[a-zA-Z0-9]+)_/;
                    var toTransfrom;

                    if(item.getType() == "TunnelEndpoint"){
                        toTransfrom = item.getAttribute("source");
                    } else if(item.getType() == "ObjectTransport"){
                        toTransfrom = item.getAttribute("target");
                    }

                    var match = regex.exec( toTransfrom ) ;

                    //links to overview rooms don't need to be rewired
                    if(match[1] == "Overview") return;

                    if(match[1] == "Fakultaet"){
                        var rewiredTarget = "Fakultaet" + faculty + that.proceedingRoomInstanceInfix + proceedingID;
                    } else {
                        var rewiredTarget = match[1] + that.proceedingRoomInstanceInfix + proceedingID;
                    }


                    if(item.getType() == "TunnelEndpoint"){
                        item.setAttribute("source", rewiredTarget);
                    } else if(item.getType() == "ObjectTransport"){
                        item.setAttribute("target", rewiredTarget);
                        item.setAttribute("customKeyValuePair", "processID:" + proceedingID);
                    }
                });
            }
        }

        that.Modules.ObjectManager.getInventory(roomToGet, ContextObject, transformTransportTargets);
    }

    participants.forEach(function (part) {
        //send command to copy the room
        var groupId = new Date().getTime();

        var copyEventData = {
            fromRoom: part + that.proceedingRoomTemplateSuffix,
            toRoom: part + that.proceedingRoomInstanceInfix + instanceId,
            parentRoom: that.overviewRoomInstancePrefix + part,
            roomName: "Verfahren " + instanceId,
            callback: function () {
                rewireObjectTransports( part + that.proceedingRoomInstanceInfix + instanceId , instanceId );
            },
            context: ContextObject
        }

        //All faculties share the same template-room
        if(part.indexOf("Fakultaet") !== -1 ){
            copyEventData.fromRoom = "Fakultaet" + that.proceedingRoomTemplateSuffix;
        }

        that.eventBus.emit("copyRoom", copyEventData);

        var objectDefaults = {
            roomID: that.overviewRoomInstancePrefix + part,
            context: ContextObject,
            callback: function () {

            }
        }

        var objectsToCreate = [
            {
                type: "Subroom",
                attributes: {
                    x: 40,
                    y: 50,
                    group: groupId,
                    name: "Verfahren " + instanceId,
                    destination: part + that.proceedingRoomInstanceInfix + instanceId
                }
            },
            {
                type: "ProcessLog",
                attributes: {
                    x: 270,
                    y: 50,
                    group: groupId,
                    kokoa_processid: instanceId
                }
            },
            {
                type: "ObjectTransport",
                attributes: {
                    x: 150,
                    y: 50,
                    group: groupId,
                    target: part + that.proceedingRoomInstanceInfix + instanceId
                }
            },
            {
                type: "StatusLight",
                attributes : {
                    x : 40,
                    y : 10,
                    group: groupId,
                    proceedingID : instanceId

                }
            }
        ];

        //add default values for all objects
        objectsToCreate = objectsToCreate.map(function (elem) {
            return _.defaults(elem, objectDefaults)
        });

        objectsToCreate.forEach(function (objectToCreate) {
            that.eventBus.emit("createObject", objectToCreate);
        });
    });
}

/**
 * Create overview rooms. Can be used during server setup etc.
 */
VerwaltungsApp.initOverviewRooms = function () {
    var that = this;
    var participants = this.getFacultiesWithPrefix();
    
    participants = participants.concat(["Dezernat1", "Dezernat4"]);

    participants.forEach(function (part) {
        that.eventBus.emit("copyRoom", {
            context: ContextObject,
            fromRoom: that.overviewRoomTemplateName,
            toRoom: that.overviewRoomInstancePrefix + part,
            callback: function () {

            }
        });
    });
}

/**
 * Create all needed template rooms:
 * 1. Overview template (used by each participant)
 * 2. Individual proceeding templates for each participant, e.g. Dezernat 2/4
 */
VerwaltungsApp.initTemplates = function () {
    var that = this;
    var overviewRoomTemplateName = that.overviewRoomTemplateName;
    var proceedingRoomTemplateSuffix = that.proceedingRoomTemplateSuffix;

    //all faculties + Dezernat 1/4
    var participants = ["Dezernat1", "Dezernat4", "Fakultaet"];
    var proceedingRoomTemplates = participants.map(function (participant) {
        return participant + proceedingRoomTemplateSuffix;
    });

    var createRoom = function (name, callback) {
        var data = {
            roomID: name
        };
        that.Modules.RoomController.createRoom(data, ContextObject, callback);
    }

    var roomsToCreate = proceedingRoomTemplates.concat([overviewRoomTemplateName]);

    async.each(roomsToCreate, createRoom, function (err) {
        console.log("Finished creating templaterooms");
    });
}

/**
 *
 * @returns {Array<String>} - The faculties
 */
VerwaltungsApp.getFaculties = function () {
    return config.faculties;
}

VerwaltungsApp.getFacultiesWithPrefix = function () {
    return this.getFaculties().map(function(faculty){
        return "Fakultaet" + faculty;
    });
}

VerwaltungsApp.checkIfLoaded = function (proceedingID) {
    //Load status of proceeding if not loaded already
    if (!this.statusLights[proceedingID]) {
        this.statusLights[proceedingID] = require('./statusLights.js').create(proceedingID);
    }
}


VerwaltungsApp.getMilestoneState = function (event) {
    var proceedingId = event.proceedingId;
    var callback = event.callback;

    this.checkIfLoaded(proceedingId);
    callback(this.statusLights[proceedingId].getCurrentMileStoneStatus());
}

VerwaltungsApp.initProceeding = function (event) {
    var faculties = this.getFaculties();
    var that = this;

    //get socket from context
    var clientSocket = event.context.socket;
    var processAnswer = function (response) {
        var faculty = response.choice;
        that.initProceedingInstance(faculty);
    }

    //set request to client
    that.Modules.SocketServer.askSocket(clientSocket, "askForChoice",
        {
            'choices': faculties,
            'title': "Beteiligte Fakultät"
        }, processAnswer);
}

VerwaltungsApp.sendObjectHandler = function (data) {
    this.addLogEntry(data);
    this.sendMail();
}

VerwaltungsApp.getContent = function (event) {
    var proceedingId = event.proceedingId;
    var callback = event.callback;

    this.checkIfLoaded(proceedingId);

    var proceedingStatus = this.statusLights[proceedingId].getStatus();
    callback(proceedingStatus);
}

VerwaltungsApp.saveMilestones = function (event) {
    var changedMilestone = event.milestoneChanges.milestoneIndex;
    var proceedingId = event.proceedingId;
    var callback = event.callback;

    this.checkIfLoaded(proceedingId);
    var currentProceeding = this.statusLights[proceedingId];

    if (event.milestoneChanges.diff.done) {
        currentProceeding.finishCurrent();
    }
    if (event.milestoneChanges.diff.enddate) {
        currentProceeding.mileStones[changedMilestone].enddate = event.milestoneChanges.diff.enddate;
    }

    currentProceeding.save(callback);
}

VerwaltungsApp.init = function (modules) {
    this.Modules = modules;
    this.eventBus = modules.EventBus;
    var that = this;
    that.statusLights = {};


    this.eventBus.on("applicationevent::kokoa::getMilestoneState", that.getMilestoneState.bind(that));

    this.eventBus.on("applicationevent::kokoa::initMasterRooms", that.initOverviewRooms.bind(that));

    this.eventBus.on("applicationevent::kokoa::initProcess", that.initProceeding.bind(that));

    this.eventBus.on("send_object", that.sendObjectHandler.bind(that));

    this.eventBus.on("applicationevent::kokoa::getContent", that.getContent.bind(that));

    this.eventBus.on("applicationevent::kokoa::saveMilestones", that.saveMilestones.bind(that))

    this.eventBus.on("applicationevent::kokoa::initTemplates", that.initTemplates.bind(that));
}


VerwaltungsApp.addLogEntry = function (data) {
    var that = this;
    var from = data.from;
    var to = data.to;
    var timestamp = data.timestamp;
    var objectName = data.objectName;
    var processID = data.processID;

    var pat = /(^[a-zA-Z0-9]+)_/;

    var pFrom = pat.exec(from);
    var pTo = pat.exec(to);

    if (pFrom == null || pTo == null || !pFrom[1] || !pTo[1])return;

    var fromEntry = "Verschickt: (" + objectName + ") an " + pTo[1];
    var toEntry = "Erhalten (" + objectName + ") von " + pFrom[1];

    var overviewRoomFrom = this.overviewRoomInstancePrefix + pFrom[1];
    var overviewRoomTo = this.overviewRoomInstancePrefix + pTo[1];



    var addEntry = function(logobject, message, cssClass){
        //Add text....
        var oldContent = logobject.getContentAsString()

        //try to parse the content
        try {
            var content = JSON.parse(oldContent);
        } catch (e) {
            //failed to parse...reset the content
            var content = {entries: []};
        }

        //add entry to json
        var entry = {
            "message": message,
            "timestamp": timestamp,
            "cssclass": cssClass
        }

        content.entries.push(entry);

        //save the new content
        logobject.setContent(JSON.stringify(content));
    }



    var addToLog = function(roomName, message, cssClass){
        async.waterfall([
            function(cb){that.Modules.ObjectManager.getInventory( roomName, ContextObject, function(items){
                cb(null, items);
            })},
            function(items, cb){
                var logsItems = _.filter(items, function(item){
                    var valid = item.getType() === "ProcessLog" && item.getAttribute("kokoa_processid") && item.getAttribute("kokoa_processid") === processID;
                    return valid;
                });
                cb(null, logsItems);
            }
        ], function(err, logItems){
            logItems.forEach(function(logItem){
                addEntry(logItem, message, cssClass)
            })
        });
    }

    //if objects are copied from "overview" room they shouldn't be logged
    if(pFrom[1] !== "Overview"){
        addToLog(overviewRoomFrom, fromEntry, "outgoing-message")
        addToLog(overviewRoomTo, toEntry, "incoming-message")
    }
}

/**
 * Send mail to all users that are configured to get a mail when a new message entered
 * a room.
 *
 * @param roomID
 */
VerwaltungsApp.sendMail = function (roomID) {
    //TODO create some possibility to add mails to a room
    //TODO load from user tool
    var recipients = [];

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

    _(recipients).each(function (recipient) {
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