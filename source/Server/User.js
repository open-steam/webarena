/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var User=function(UserManager){
	
	this.username=false;
	this.home=false;
	
	
	this.toString=function(){
		return 'User '+this.username;
	}

}

module.exports=User;