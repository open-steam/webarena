"use strict";

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
	
	//translate all buttons
	$("#login_submit").attr('value', GUI.translate("Login"));
	$("#impressum_button").attr('value', GUI.translate("About"));
	$("#impressum_close_button").attr('value', GUI.translate("Close About"));
	
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
	
	var printImprint = function(){
	var imprint = Config.about;
	var printList = function(aData){		
		var list="";
		
		if (!aData) return list;
		
		for (var i = 0; i < aData.length; i++) { 
			logo.push("<li>"+aData[i]+'</li>');
		}
		return list;
	};
    var logo = ['<h2>'+imprint.project+'</h2>'];
    
    	logo.push('<p>'+imprint.copyright+'</p>');
		logo.push('<h3>Main contributors:</h3>');
		logo.push('<ul>');
	 	printList(imprint.contributors);
	 	logo.push('</ul>');
		logo.push('<h3>Contact information</h3>');
		logo.push('<p>'+imprint.contact+'</p>');
		logo.push('<h3>Acknowledgements</h3>');
		logo.push('<p>'+imprint.acknowledgements+'</p>');

		logo.forEach(function(l) {
			$( "#impressum" ).append(l);
		});
	
	};
	
	printImprint();
	
	$("#impressum").hide();
	
	$("body").append("<p id='TouchMouseNote' style='position: fixed; bottom: 10px; z-index: 15002; left: 10%'>"+GUI.translate('Please note: if you are using a computer with touchscreen AND mouse, press the login button with your prefered device. The webarena interface will be optimized for the selected input method.')+"</p>");
	
	$("#login_submit").on("touchend", function () {
		GUI.isTouchDevice = true;
		GUI.login();
	});
	
	$("#login_submit").on("mouseup", function () {
		GUI.login();
	});
	
	var fitAboutBox = function(){
		var p = $( "#login" );
		var position = p.position();
		$("#impressum").css("top",window.innerHeight*0.05+"px");
		$("#impressum").css("left",(position.left-402)+"px");
		$("#impressum").css("width",(804)+"px");
		$("#impressum").css("height",(Math.min(800,window.innerHeight*0.7))+"px");
	}
	$("#impressum_button").on("touchend", function () {
		fitAboutBox();
		$("#impressum").show();
	});
	
	$("#impressum_button").on("mouseup", function () {
		fitAboutBox();
		$("#impressum").show();
	});
	
	var userDataObject = GUI.retrieveUserData();

	if(userDataObject){
		GUI.login();
	}
	
}

/**
 * hide the login prompt
 */
GUI.hideLogin = function() {
	
	$("#login").hide();
	$("#impressum").hide();
	$("#login_background").hide();
	$("#login_background").css("opacity", 1);
	$("#TouchMouseNote").hide();
	
	GUI.progressBarManager.updateProgress("login", 100);

	GUI.loginProcessActive = false;

}

/**
 * true if the user is logged in
 */
GUI.isLoggedIn = false;

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



GUI.username = undefined;
GUI.password = undefined;
GUI.userid = undefined;

GUI.loginProcessActive = false;

GUI.externalSession = false;

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

	if(userDataObject){
		GUI.username = userDataObject.username;
		GUI.password = userDataObject.password;
		GUI.externalSession = userDataObject.external;
		GUI.isTouchDevice = userDataObject.isTouchDevice;
	}
	else{
		GUI.storeUserData();
	}
	
	GUI.userid = GUI.username;
        
        // add cookie with user id
//        Webserver.response.writeHead(200, {
//            'Set-Cookie': 'userid='+GUI.userid
//        });
	
	$("#disconnected_message").remove();
	
	GUI.progressBarManager.addProgress(GUI.translate('checking login information'), "login");
	
	GUI.loadGUI(); //reload GUI
	
}


/**
 * stores the user data in the local storage
 */
GUI.storeUserData = function() {

	var userDataObject = {'username': GUI.username, 'password': GUI.password, 'external': GUI.externalSession, 'isTouchDevice': GUI.isTouchDevice};

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
	
	if (Config.debugMode) return undefined;

	var userDataObject = localStorage.getItem('webarena');
	
	return JSON.parse(userDataObject);

}


/**
 * deletes the user data from the local storage
 */
GUI.deleteUserData = function() {

	localStorage.removeItem('webarena');

}