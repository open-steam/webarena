"use strict";

GUI.showLogin = function(err) {
	
	if (window.location.hash != "" && window.location.hash.indexOf('externalSession') > -1) {
		GUI.login();
	}
	
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
	
	$("#login_username").focus();
	
	$("#login_submit").click(GUI.login);
       
	$("#login input").keyup( function(event) {
		if (event.keyCode == 13) {
			GUI.login();
		}
	});
	
}

GUI.hideLogin = function() {
	
	$("#login").hide();
	$("#login_background").hide();
	$("#login_background").css("opacity", 1);
	
	GUI.progressBarManager.updateProgress("login", 100);

	GUI.loginProcessActive = false;

}


GUI.isLoggedIn = false;

GUI.loggedIn = function() {
	if (GUI.isLoggedIn) return;
	
	GUI.isLoggedIn = true;

	GUI.progressBarManager.updateProgress("login", 30, GUI.translate('loading room'));
	
}


GUI.loginFailed = function(err) {
	GUI.progressBarManager.removeProgress("login");
	GUI.showLogin(err);
	GUI.loginProcessActive = false;
	GUI.username = undefined;
	GUI.password = undefined;
}



GUI.username = undefined;
GUI.password = undefined;
GUI.userid = undefined;

GUI.loginProcessActive = false;

GUI.externalSession = false;

GUI.login = function() {
	
	if (GUI.loginProcessActive) return;
	if (GUI.isLoggedIn) return;

	GUI.loginProcessActive = true;
	
	if (GUI.username === undefined)	GUI.username = $("#login_username").val();
	if (GUI.password === undefined) GUI.password = $("#login_password").val();
	
	if (window.location.hash != "" && window.location.hash.indexOf('externalSession/') > -1) {
		
		var hashData = window.location.hash.substr(1).split("/")
		
		if (hashData[0] == "externalSession") {
		
			GUI.username = hashData[1];
			GUI.password = hashData[2];
			
			GUI.externalSession = true;
			window.location.hash = "";
		
		}
		
	}
	
	if (GUI.username == "") GUI.username = "User";
	
	GUI.userid = GUI.username;
        
        // add cookie with user id
//        Webserver.response.writeHead(200, {
//            'Set-Cookie': 'userid='+GUI.userid
//        });
	
	$("#disconnected_message").remove();
	
	GUI.progressBarManager.addProgress(GUI.translate('checking login information'), "login");
	
	GUI.loadGUI(); //reload GUI
	
}
