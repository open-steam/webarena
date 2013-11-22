var config = require('./config.js');

var VerwaltungsApp = {};

VerwaltungsApp.init = function(eventBus){
	console.log("init plugin...")
	this.eventBus = eventBus;
	eventBus.on("**", function(eventData){
		if(eventData.sourceType && eventData.sourceType === "Tunnel"){
			console.log("Try to send a mail");
			sendMail();
		}
	});

	eventBus.on("applicationevent::kokoa::initProcess", function(){
		console.log("start init...");
		//create room instances for all parties
		//e.g. faculty, dezernate1/4 etc.
		//naming of the template rooms should follow the convention:
		//Dezernat4_Berufungsverfahren_Template
		//PARTICIPANT_Berufungsverfahren_Template
		var participants = ["Dezernat1", "Dezernat4", "FakultaetX"];

		participants.forEach(function(part){
			//send command to copy the room
//			eventBus.emit("rpc::server",{
//				method : "duplicateRoom",
//				//args: from, to
//				arguments : [part + "_Berufungsverfahren_Template", part]
//			});
			eventBus.emit("copyRoom", {
				fromRoom : part + "_Berufungsverfahren_Template",
				toRoom : part + "_" +(Math.random() * 10000 ),  //TODO change so better naming with UUID
				callback : function(){console.log("App got answer...")}
			});

		});
	});
}

var sendMail = function(){
	//TODO create some possibility to add mails to a room
	var recipient = "viktor.koop@gmail.com" //Modules.config.mailRecipient;

	var smtpServer = "";
	var smtpUser = config.smtp.user;
	var smtpPassword = config.smtp.password;


	var nodemailer = require("nodemailer");
	var subject = "Neue Nachricht.";
	var text = "Sehr geehrter Nutzer, in dem Postfach befindet sich eine neue Nachricht. ";

	var smtpTransport = nodemailer.createTransport("SMTP",{
		service: "Hotmail",
		auth: {
			user: smtpUser,
			pass: smtpPassword
		}
	});

	var mailOptions = {
		"from" : config.tunnel.senderMail ,
		"to" : recipient,
		"subject" : subject,
		"text" : text
	};

	smtpTransport.sendMail(mailOptions, function(err, response){
		if(err){
			console.log("Failed while trying to send a mail.");
			console.log(err);
		} else {
			console.log("Message send successfully");
		}
	});
}

function create(){
	return Object.create(VerwaltungsApp);
}

module.exports = {
	create : create
};