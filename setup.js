//create temp. directory
//TODO: folder like tmp shouldn't be inside of source folder
var fs = require('fs');
if (!fs.existsSync(__dirname + "/source/tmp")) {
	fs.mkdirSync(__dirname + "/source/tmp", 777);
}

//TODO: copy config files

