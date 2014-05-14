/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

module.exports={ //general config AND Client config
	projectTitle:'WebArena 1.0',
	language:'de',
	presentationMode:false,
	couplingMode:true,
	paintIcon:true,
	chatIcon:true,
	bugreportIcon:true,
	showSidebarbydefault:true,
	maxFilesizeInMB:10,
	bidURL:'',
	server: { //exclusive!!! server config
		filebase:'/path/to/data_folder', // The path where object data is saved (for the fileConnector)
		connector:require('./Server/connectors/FileConnector.js'), // The chosen connector
		port: 8080,     // HTTP Port for server
		homepage: '/index.html',
		tcpApiServer: false,
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
	}
};