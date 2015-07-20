/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 *
 */
"use strict";

var path = require('path');
var flash = require('connect-flash');
var mongoose = require('mongoose');

var favicon = require('serve-favicon');
var express = require('express');
var Session = require('express-session');
var MongoStore = require('connect-mongo')(Session);
var session = Session({secret: 'keyboard gato',
                       key: 'sid', resave: false,
                       saveUninitialized: false,
                       store: new MongoStore({ mongooseConnection: mongoose.connection }),
                       cookie: { maxAge: (1800000 / 2) }}); // half an hour = 1800000
var checkMobile = require('connect-mobile-detection');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// passport config
var User = require('./db/users');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.ensureAuthenticated = ensureAuthenticated;

var app = express();
var hbs = require('hbs');
var blocks = {};

var Modules = false;
var LogginRouter = require('./routes/loginRouter');
var AppRouter = require('./routes/appRouter');

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

    new AppRouter(theModules, app);
    new LogginRouter(app, theModules.ACLManager);

    // Error handling ( most notably 'Insufficient permissions' )
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err,
            title: 'error'
        });
    });

    // Create the admin user
    User.register(new User({ username : 'admin', email : 'admin@webarena.com' }), 'admin', function(err, account) {
        if (err && (err.message != "User already exists with username admin")) {
            console.warn("User admin: " + err);
        }
    });

    var server = require('http').createServer(app);
    WebServer.server = server;
    WebServer.session = session;

    server.listen(Modules.config.port); // start server (port set in config file)
    server.on('listening', function (callback) {
        console.info("Http server now listening on port: " + Modules.config.port);
    });
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

app.set('views', path.resolve(__dirname, '../Client/views'))
    .set('view engine', 'html')
    .engine('html', hbs.__express)
    .use(favicon(path.resolve(__dirname, '../Client/favicon.ico')))
    .use(express.static(path.resolve(__dirname, '../Client')))
    .use('/guis/mobilephone/images', express.static(path.resolve(__dirname, '../Client/views/mobilephone/images')))
    .use('/Common', express.static(path.resolve(__dirname, '../Common')))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }))
    .use(checkMobile())
    .use(session) // session support
    .use(flash())
    .use(passport.initialize())
    .use(passport.session());

// a middleware with no mount path, gets executed for every request to the router
app.use(function(req, res, next) {
    if (req.phone) {
        req.guiType = 'mobilephone';
    } else {
        // the client is a tablet or a computer
        req.guiType = 'desktop';
    }

    if (req.isAuthenticated()) {
        var context = false;

        /* get userHash */
        var userHashIndex = req.path.indexOf("/___");
        if (userHashIndex > -1) {

            /* userHash found */
            var userHash = req.path.slice(userHashIndex + 1);
            var context = Modules.UserManager.getConnectionByUserHash(userHash);
        }

        req.context = context;
    }

    next();
});

// Simple route middleware to ensure user is authenticated.
// Use this route middleware on any resource that needs to be protected.  If
// the request is authenticated (typically via a persistent login session),
// the request will proceed.  Otherwise, the user will be redirected to the
// login page. NOTE: use as passport.ensureAuthenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

module.exports = WebServer;