/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

module.exports={
	filebase:'/path/to/server', // The path where object data is saved (for the fileConnector)
	connector:require('./FileConnector.js'), // The chosen connector
	language:'de', // The current language (e.g. for error messages)
	port: 8080,     // HTTP Port for server
	homepage: '/index.html',
	imageUpload: {
		maxDimensions: 400
	},
    easydb: {
        apiUrl : "easydb.uni-paderborn.de",
        apiPath: "/easy/fs.php?",
        username: "",
        password: ""
	},
    sharepoint : {
        basepath : "https://projects.uni-paderborn.de/websites/studiolo/"
    },
	bidServer: 'www.bid-owl.de.localhost',
	bidPort: 80,
	logLevels : {
		"warn" : true,
		"debug" : false,
		"info" : false
	},
	developerInfo: false,
	objectWhitelist: [],	//an empty whitelist whitelists everything
	objectBlacklist: ['HtmlTest'],    //Syntax: objectBlacklist:['SharePoint','EasyDBImage']
	noContexts: false,
    showDebugLineNumbers: false
};