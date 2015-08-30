/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 *
 */

"use strict";

/*
 * @Deprecated: this class ist not used anymore
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Users = new Schema({
    username: String,
    password: String,
    email: String
});

Users.plugin(passportLocalMongoose);

module.exports = mongoose.model('Users', Users);
