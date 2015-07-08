/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */
"use strict";

var mongoDBConfig = require('./db/MongoDBConfig')();
var path = require('path');
var flash = require('connect-flash');

// mongoose
var mongoose = require('mongoose');
mongoose.connect(mongoDBConfig.getURI());

var favicon = require('serve-favicon');
var express = require('express');
var Session = require('express-session');
var MongoStore = require('connect-mongo')(Session);
var session = Session({secret: 'keyboard gato',
                       key: 'sid', resave: false,
                       saveUninitialized: false,
                       store: new MongoStore({ mongooseConnection: mongoose.connection }),
                       cookie: { maxAge: 1800000 }}); // half an hour = 1800000
var checkMobile = require('connect-mobile-detection');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// passport config
var Account = require('./db/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());
passport.ensureAuthenticated = ensureAuthenticated;

var logginRouter = require('./routes/loginRouter');
var appRouter = require('./routes/appRouter');

var app = express();

var hbs = require('hbs');
var blocks = {};

var Modules = false;

/**
 * @class WebServer
 * @classdesc Web Server that manages http requests 
 */
var WebServer = {};

/**
 * Init function called in server.js to initialize this module.
 *
 * @param {Object} theModules variable to access the other modules.
 */
WebServer.init = function(theModules) {
    Modules = theModules;

    // initialize the router
    appRouter.init(theModules);

    var server = require('http').createServer(app);
    WebServer.server = server;
    WebServer.session = session;

    server.listen(Modules.config.port); // start server (port set in config file)
};

hbs.registerHelper('extend', function(name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
});

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});

//hbs.localsAsTemplateData(app);

app.use(favicon(path.resolve(__dirname, '../Client/favicon.ico')))
    .use(express.static(path.resolve(__dirname, '../Client')))
    .use('/guis/mobilephone/images', express.static(path.resolve(__dirname, '../Client/views/mobilephone/images')))
    .set('views', path.resolve(__dirname, '../Client/views'))
    .set('view engine', 'html')
    .engine('html', hbs.__express)
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }))
    .use(checkMobile())
    .use(session) // session support
    .use(flash())
    .use(passport.initialize())
    .use(passport.session())
    .use('/Common', express.static(path.resolve(__dirname, '../Common')));

app.use(appRouter.router);
app.use(logginRouter);

// Simple route middleware to ensure user is authenticated.
// Use this route middleware on any resource that needs to be protected.  If
// the request is authenticated (typically via a persistent login session),
// the request will proceed.  Otherwise, the user will be redirected to the
// login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

module.exports = WebServer;