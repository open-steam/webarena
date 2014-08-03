/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author WebArena developers, University of Paderborn, 2014
*
*	 This is the default config file for webArena. If you want to customize
*	 your version of webArena, do not edit this file but create a copy of it.
*    The copy does only need to contain those values that are different than
*	 the default values.
*
*/

module.exports={ 
	
// Appearance
	
	homepage: '/index.html', // The page that is shown when the server is called in a browsers
	
	projectTitle:'WebArena Development', // The WebArena title
	
	language:'de',	// The client language 
	
	presentationMode:false, // If set to true, no new objects can be created and the sidebar is hidden
	
	showSidebarbydefault:true, // Toggle the inital state of the sidebar
	
// Object handling
	
	enabledCategories: ['graphical','texts','collaboration','connections','content'],
	
	objectBlacklist: ['HtmlTest','CollText'],    //Syntax: objectBlacklist:['SharePoint','EasyDBImage']
	
// Functional restrictions
	
	couplingMode:true,
	
	collaborativeEditor:false,
	
	paintIcon:true,
	
	chatIcon:true,
	
	bugreportIcon:true,
	
	WebRTC: true,
	
// Development
	
	debugMode: false,
	
	logLevels : {
			"warn" : true,
			"debug" : false,
			"info" : false
	},
	
// Upload settings
	
	maxFilesizeInMB:10,
	
	imageUpload: {
			maxDimensions: 400
	},
	
// Other settings

	bidURL:'',
	
	server: { 
		
	// Server only configuration
		// the following values are not sent to the client.
		
		// http server configuration
		port: 8080,     // HTTP Port for server
		
	// Connector configuration.
		
		// FileConnector
		connector:require('./Server/connectors/FileConnector.js'), // The chosen connector
		filebase:'/path/to/data_folder', // The path where object data is saved
		
		/*
		// BidConnector - Connecting WebArena to a bid server
		connector:require('./Server/connectors/BidConnector.js'), // The chosen connector
		filebase:'/path/to/data_folder', // The path where object data is saved
		bidServer: 'www.bid-owl.de.localhost',
		bidPort: 80,
		*/
		
		/*
		// eLabConnector - Connecting WebArena to an eLab user manager
		connector:require('./Server/connectors/ElabConnector.js'), // The chosen connector
		filebase:'/path/to/data_folder', // The path where object data is saved
		elab: {
			filebase : '', // folder where the user management data is saved
			encryptionKey : '' // used as salt to create a hash of the user password (needs to be the same as on the user management platform)
		}
		*/
		
	 // API Server
	 
		tcpApiServer: false
		
	}
};