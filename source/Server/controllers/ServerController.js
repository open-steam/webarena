var ServerController = {}

var Modules = false;

ServerController.init = function(theModules){
	Modules = theModules;
}

//TODO: test if it works
ServerController.getMemoryUsage =  function (data, context, callback) {
	var util = require('util');
	var result = {};

	result.memory = util.inspect(process.memoryUsage());

	console.log(result);
	callback(null, result);

}

//TODO: refactor use email template instead of ugly string concat
ServerController.bugreport = function (data, context, callback) {

	if (Modules.config.bugreport === undefined) {
		console.log("Bug report settings missing!");
		return;
	}

	var email = require("emailjs/email");
	var server = email.server.connect({
		user: Modules.config.bugreport.server.user,
		password: Modules.config.bugreport.server.password,
		host: Modules.config.bugreport.server.host,
		ssl: Modules.config.bugreport.server.ssl,
		port: Modules.config.bugreport.server.port
	});

	var date = new Date();

	var text = "Datum: " + date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + ", " + date.getHours() + ":" + date.getMinutes() + " Uhr" + "\n";
	text += "UserAgent: " + data.userAgent + "\n";
	text += "Benutzer: " + data.user + "\n";
	text += "eMail: " + data.email + "\n\n";

	text += "Was wollten Sie tun?\n----------------------------------\n";
	text += data.task + "\n\n\n";

	text += "Welches Problem ist aufgetreten?\n----------------------------------\n";
	text += data.problem + "\n\n\n";

	text += "Objekte im Raum:\n----------------------------------\n";
	text += data.objects;

	if (Modules.config.bugreport.recipients !== undefined) {

		var counter = 0;

		for (var i in Modules.config.bugreport.recipients) {
			var emailAddress = Modules.config.bugreport.recipients[i];

			server.send({
				text: text,
				from: Modules.config.bugreport.server.from,
				to: emailAddress,
				subject: Modules.config.bugreport.server.subject
			}, function (err, message) {

				if (counter == 0) {

					if (err === null) {
						Modules.Dispatcher.respond(socket, responseID, true); //ok
					} else {
						Modules.Dispatcher.respond(socket, responseID, false); //error sending mail
					}

				}

				counter++;

			});

		}

	} else {
		console.log("no recipients for bug report");
	}

};

module.exports = ServerController;

