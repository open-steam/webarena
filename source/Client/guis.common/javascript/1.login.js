GUI.showLogin = function(err) {
	
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

GUI.username = undefined;
GUI.password = undefined;
GUI.userid = undefined;

GUI.loginProcessActive = false;

GUI.login = function() {
	
	if (GUI.loginProcessActive) return;
	if (GUI.isLoggedIn) return;

	GUI.loginProcessActive = true;
	
	GUI.username = $("#login_username").val();
	GUI.password = $("#login_password").val();
	GUI.userid = GUI.username;
        
        // add cookie with user id
//        Webserver.response.writeHead(200, {
//            'Set-Cookie': 'userid='+GUI.userid
//        });
	
	GUI.progressBarManager.addProgress("Anmeldeinformationen überprüfen", "login");
	
	GUI.loadGUI(); //reload GUI
	
}
