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
	koalaServer: 'www.bid-owl.de.localhost',
	koalaPort: 80
};