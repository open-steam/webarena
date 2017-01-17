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
	about:{
		project:'The WebArena Project',
		copyright:'2012-2016, Contextual Informatics, Universität Paderborn',
		contributors:
		  ['Felix Winkelnkemper',
		   'Tobias Kempkensteffen',
		   'Viktor Koop',
		   'Jan Petertonkoker',
		   'Steven Christopher Luecker',
		   'Christoph Sens',
		   'Andreas Schiller'],
		contact: 'Felix Winkelnkemper, felix.winkelnkemper@uni-paderborn.de',
		acknowledgements: '',
	},
	logoutURL:"", //URl string that is forwarded during logout
	
// Object handling
	
	enabledCategories: ['graphical','texts','collaboration','connections','content'],
	objectBlacklist: ['HtmlTest'],    //Syntax: objectBlacklist:['SharePoint','EasyDBImage']
	
// Functional restrictions
	
	collaborativeEditor:false, //sidebar
	chat:true,
	bugReport:true,
	trash: true,
	objectlist:true,
	cloud: false,
	recentChanges: true,
	
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
	
	server: { 
		
		// Server only configuration
		// the following values are not sent to the client.
		
		port: 8080,     // HTTP Port for server
		
		
		// Connector configuration.
		
		// FileConnector
		connector:require('./Server/connectors/FileConnector.js'), // The chosen connector
		filebase:'/path/to/data_folder', // The path where object data is saved
				
		/*
		// eLabConnector - Connecting WebArena to an eLab user manager
		connector:require('./Server/connectors/ElabConnector.js'), // The chosen connector
		filebase:'/path/to/data_folder', // The path where object data is saved
		elab: {
			filebase : '', // folder where the user management data is saved
			encryptionKey : '' // used as salt to create a hash of the user password (needs to be the same as on the user management platform)
		}
		*/
		
		/*
		// FTPConnector - Connecting WebArena to an FTP server
		connector:require('./Server/connectors/FTPConnector.js'), // The chosen connector
		
		// WebDavConnector - Connecting WebArena to a WebDav server
		connector:require('./Server/connectors/WebDavConnector.js'), // The chosen connector
		*/
		
	}
};