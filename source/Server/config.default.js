/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

module.exports={
	filebase:'/path/to/data_folder', // The path where object data is saved (for the fileConnector)
	connector:require('./connectors/FileConnector.js'), // The chosen connector
	language:'de', // The current language (e.g. for error messages)
	port: 8080,     // HTTP Port for server
	homepage: '/index.html',
	tcpApiServer: false,
	maxFilesizeInMB:10,
	imageUpload: {
		maxDimensions: 400
	},
	bidServer: 'www.bid-owl.de.localhost',
	bidPort: 80,
	elab: {
		filebase : '', // folder where the user management data is saved
		encryptionKey : '' // used as salt to create a hash of the user password (needs to be the same as on the user management platform)
	},
	logLevels : {
		"warn" : true,
		"debug" : false,
		"info" : false
	},
	objectBlacklist: ['HtmlTest'],    //Syntax: objectBlacklist:['SharePoint','EasyDBImage']
	enabledCategories: ['graphical','texts','collaboration','connections','content'],
	debugMode: false
};