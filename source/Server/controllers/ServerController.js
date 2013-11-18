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

module.exports = ServerController;

