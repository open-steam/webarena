/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Objects = new Schema({
    objectID: String,
    room: String,
    type: String
});

module.exports = mongoose.model('Objects', Objects);
