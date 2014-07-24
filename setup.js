#!/usr/bin/env node

//create temp. directory
//TODO: folder like tmp shouldn't be inside of source folder
var fs = require('fs');
var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }

if (!fs.existsSync(__dirname + "/source/tmp")) {
	fs.mkdirSync(__dirname + "/source/tmp", 777);
}


//Copy config files
if(! fs.existsSync(__dirname + "/source/Server/config.local.js")){
    var source = __dirname + "/source/Server/config.default.js";
    var target = __dirname + "/source/Server/config.local.js"
    fs.createReadStream(source).pipe(fs.createWriteStream(target));
}

if(! fs.existsSync(__dirname + "/source/Client/config.local.js")){
    var source = __dirname + "/source/Client/config.default.js";
    var target = __dirname + "/source/Client/config.local.js"
    fs.createReadStream(source).pipe(fs.createWriteStream(target));
}
