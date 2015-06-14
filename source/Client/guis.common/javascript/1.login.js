"use strict";

GUI.username = undefined;
GUI.password = undefined;
GUI.userid = undefined;

GUI.loginProcessActive = false;

GUI.externalSession = false;

/**
 * true if the user is logged in
 */
GUI.isLoggedIn = false;

/**
 * Show login prompt
 * @param {bool|String} [err=false] Optional error message 
 */
GUI.showLogin = function(err) {
	
	/* check for an external session login request in the URL hash */
	if (window.location.hash != "" && window.location.hash.indexOf('externalSession') > -1) {
		GUI.login();
		return;
	}
	
	/* true if the login process is active */
	GUI.loginProcessActive = false;
	
	$("#login_background").show();
	
	$("#login").css("opacity", 0);
	$("#login").show();

	if (err) {
		$("#login > .login_error").html(err);
		$("#login > .login_error").show();
	} else {
		$("#login > .login_error").hide();
	}
	
	$("#login").animate({
		opacity: 1
	}, 1000);
	
	$("#login_title").html(Config.projectTitle||'WebArena');
	
	$("#login_username").focus();
	
	if(navigator.userAgent.indexOf("Trident") > -1){
		$("#login").append("<p>"+GUI.translate('Unfortunately Microsoft Internet Explorer did not support all features of this system. We recommend using Google Chrome or Mozilla Firefox. Thank you for your understanding.')+"</p>");
	}
	
	$("#login_submit").click(GUI.login);  
	
//	var userDataObject = GUI.retrieveUserData();
//
//	if (userDataObject) {
//		GUI.login();
//	}
	GUI.login();
}

/**
 * hide the login prompt
 */
GUI.hideLogin = function() {
	
	$("#login").hide();
	$("#login_background").hide();
	$("#login_background").css("opacity", 1);
	
	GUI.progressBarManager.updateProgress("login", 100);

	GUI.loginProcessActive = false;

}

/**
 * called when the user is logged in
 */
GUI.loggedIn = function() {
	if (GUI.isLoggedIn) return;
	
	GUI.isLoggedIn = true;

	GUI.progressBarManager.updateProgress("login", 30, GUI.translate('loading room'));
}

/**
 * called when the login failed
 * @param {bool|String} [err=false] Optional error message
 */
GUI.loginFailed = function(err) {
	GUI.progressBarManager.removeProgress("login");
	GUI.showLogin(err);
	GUI.loginProcessActive = false;
	GUI.username = undefined;
	GUI.password = undefined;
	GUI.clearUserStorage();
}

/**
 * called when hitting the login-button
 */
GUI.login = function() {
	
	if (GUI.loginProcessActive) return;
	if (GUI.isLoggedIn) return;

	GUI.loginProcessActive = true;
	
	if (GUI.username === undefined)	GUI.username = $("#login_username").val();
	if (GUI.password === undefined) GUI.password = $("#login_password").val();
	
	$("#login_username").blur();
	$("#login_password").blur();
	
	GUI.externalSession = false;
	if (window.location.hash != "" && window.location.hash.indexOf('externalSession/') > -1) {
		
		var hashData = window.location.hash.substr(1).split("/")
		
		if (hashData[0] == "externalSession") {
		
			GUI.username = hashData[1];
			GUI.password = hashData[2];
			
			GUI.externalSession = true;
			
			GUI.storeUserData();
			window.location.replace('#');
		
		}
		
	}
	
	if (GUI.username == "") GUI.username = "User";
	
	var userDataObject = GUI.retrieveUserData();

	if (userDataObject) {
		GUI.username = userDataObject.username;
		GUI.password = userDataObject.password;
		GUI.externalSession = userDataObject.external;
	} 
	
	GUI.userid = GUI.username;

	$("#disconnected_message").remove();
	
	GUI.progressBarManager.addProgress(GUI.translate('checking login information'), "login");
	
	GUI.loadGUI(); //reload GUI
}


/**
 * stores the user data in the local storage
 */
GUI.storeUserData = function() {

	var userDataObject = {'username': GUI.username, 'password': GUI.password, 'external': GUI.externalSession};

	if (typeof(Storage) != "undefined") {
		localStorage.setItem('webarena', JSON.stringify(userDataObject));
	} 
}

/**
 * remove local storage of user data
 */
GUI.clearUserStorage = function() {

	if (typeof(Storage) != "undefined") {
		localStorage.clear();
	} 
}


/**
 * reads out the user data from the local storage
 */
GUI.retrieveUserData = function() {
	var userDataObject = localStorage.getItem('webarena');
	
	return JSON.parse(userDataObject);

}


/**
 * deletes the user data from the local storage
 */
GUI.deleteUserData = function() {

	localStorage.removeItem('webarena');

}