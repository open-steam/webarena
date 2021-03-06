var ServerController = {}

var Modules = false;

ServerController.init = function(theModules) {
    Modules = theModules;
}

ServerController.bugreport = function(data, socket, responseID, callback) {


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

    if (Modules.config.bugreport === undefined) {
        console.log("Bug report settings missing!");

    } else {
        var email = require("emailjs/email");
        var server = email.server.connect({
            user: Modules.config.bugreport.server.user,
            password: Modules.config.bugreport.server.password,
            host: Modules.config.bugreport.server.host,
            ssl: Modules.config.bugreport.server.ssl,
            port: Modules.config.bugreport.server.port
        });

        if (Modules.config.bugreport.recipients !== undefined) {

            var counter = 0;

            for (var i in Modules.config.bugreport.recipients) {
                var emailAddress = Modules.config.bugreport.recipients[i];

                server.send({
                    text: text,
                    from: Modules.config.bugreport.server.from,
                    to: emailAddress,
                    subject: Modules.config.bugreport.server.subject
                }, function(err, message) {

                    if (counter == 0) {

                        if (err === null) {
                            Modules.Dispatcher.respond(socket, responseID, true); //ok
                        } else {
                        	console.log('Problem sending the bug report ',err);
                            Modules.Dispatcher.respond(socket, responseID, false); //error sending mail
                        }

                    }

                    counter++;

                });

            }

        } else {
            console.log("no recipients for bug report");
        }
    }
    var date = new Date();

    var dateHelper = "Datum: " + date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + ", " + date.getHours() + ":" + date.getMinutes() + " Uhr" + "\n";

    Modules.Logger.log('info', "A bug report has been sent from + " + data.user + " at " + dateHelper );

};
ServerController.clientErrorMessage = function(data, socket, responseID, callback) {
    Modules.Logger.log('error', 'errortype: client ' + 'message: ' + data.message + ' uri: ' + data.uri + ' line: ' + data.line + " roomID: " + data.roomID +
            " userID: " + data.user + " Navigator: " +data.nav);
};
ServerController.writeToServerConsole = function(data, socket, responseID, callback) {
    console.log(data);
};

module.exports = ServerController;

