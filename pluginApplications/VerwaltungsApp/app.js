var config = require('./config.js');
var uuid = require('node-uuid');

var VerwaltungsApp = {};

var ContextObject = {
    user: {
        username: "server",
        password: "server"
    }
}

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


VerwaltungsApp.init = function (modules) {
    this.Modules = modules;
    this.eventBus = modules.EventBus;
    var that = this;
    this.eventBus.on("**", function (eventData) {
        if (eventData.sourceType && eventData.sourceType === "Tunnel") {
            that.sendMail();
        }
    });

    this.eventBus.on("applicationevent::kokoa::initMasterRooms", function () {
        that.initOverviewRooms();
    });

    this.eventBus.on("applicationevent::kokoa::initProcess", function () {
        that.initAppointmentProcedure();
    });

    this.eventBus.on("send_object", function(data){
         that.addLogEntry(data);
    });
}

VerwaltungsApp.addLogEntry = function(data){
    var from = data.from;
    var to = data.to;
    var timestamp = data.timestamp;
    var objectName = data.objectName;

    var pat =  /(^[a-zA-Z0-9]+)_/;

    var pFrom = pat.exec(from);
    var pTo = pat.exec(to);

    if(!pFrom[1]|| ! pTo[1])return;


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

VerwaltungsApp.sendMail = function () {
    //TODO create some possibility to add mails to a room
    var recipient = "viktor.koop@gmail.com" //Modules.config.mailRecipient;

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
        "to": recipient,
        "subject": subject,
        "text": text
    };

    smtpTransport.sendMail(mailOptions, function (err, response) {
        if (err) {
            console.log("Failed while trying to send a mail.");
            console.log(err);
        } else {
            console.log("Message send successfully");
        }
    });
}

function create() {
    return Object.create(VerwaltungsApp);
}

module.exports = {
    create: create
};