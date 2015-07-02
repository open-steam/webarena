/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author University of Paderborn, 2014
*
*	 @class UserDAO
*    @classdesc DAO Access the User collection
*/

"use strict";

var mongoDBConfig = require('./MongoDBConfig')();

var users = false;
var UserDAO = {};

/**
* @param username
* @param callback
*/
UserDAO.usersByUserName = function(username, callback) {
    users.find({username: username.toLowerCase()}, {}, callback);
}

/**
* @param id
* @param callback
*/
UserDAO.usersById = function(id, callback) {
    users.findById(id, callback);
}

/**
* @param newUserArrt
* @param callback
*/
UserDAO.createUsers = function(newUserAttr, callback) {
    users.insert({username: newUserAttr.login.toLowerCase(), password: newUserAttr.password, e_mail: newUserAttr.e_mail }, callback);
}

/**
* @param id
* @param newUserAttr
*/
UserDAO.updateUsersById = function(id, newUserAttr) {
    users.update({_id:id}, {$set:newUserAttr});
}

module.exports = function() {
    var db = require('monk')(mongoDBConfig.getURI());

    users = db.get('users');
    users.ensureIndex( { "username": 1 }, { unique: true } )

    return UserDAO;
}
