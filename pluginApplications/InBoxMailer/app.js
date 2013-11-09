var net = require('net');
var config = require('./config.js');
var EventEmmiter2 = require('eventemitter2').EventEmitter2;

var eventBus = new EventEmmiter2({
	wildcard: true,
	delimiter: '::'
});

var client = net.connect(config.apiPort, function () {
	this.on('data', function (data) {
		var response = JSON.parse(data.toString());

		if(response.eventData && response.eventData.sourceType && response.eventData.sourceType === "Tunnel"){
			console.log("Try to send a mail");
			sendMail();
		}
	});
});

//TODO improve error handling
client.on("error", function(err){console.log(err)});


function initialSubscribe (){
	var subscriptionRequest = {
		"requestType": "subscribeEvents",
		"eventlist": '**'
	};

	client.write(JSON.stringify(subscriptionRequest));
}

function startUp(){
	initialSubscribe()
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