$(function() {
    /**
     * Set translated placeholder for username input at login screen
     */
    $("#login_username").attr("placeholder", GUI.translate("Username"));

    /**
     * Reporting of bugs
     */
    $("#bug_submit").bind("click", function(event) {

        $("#bug_report").hide();
        $("#bug_result").show();
        $("#bug_result").html('Der Fehlerbericht wird gesendet...');

        var task = $("#bug_task").val();
        var problem = $("#bug_problem").val();
		var email = $("#bug_email").val();
		
        var objectsString = "";

        var objects = ObjectManager.getObjects();
        for (var i in objects) {
            var object = objects[i];

            objectsString += "\n"+i+":\n--------------------\n";

            var data=object.get();
            for (var name in data) {
                objectsString += name+": "+data[name]+"\n";
            }
        }

        ObjectManager.reportBug({
            "task" : task,
            "problem" : problem,
            "user" : GUI.username,
			"email" : email,
            "objects" : objectsString,
            "userAgent" : navigator.userAgent
        }, function(result) {

            if (result === true) {
                $("#bug_result").html('<p class="bug_success">Vielen Dank für Ihren Fehlerbericht.<br />Unsere Entwickler wurden informiert und werden sich schnellst möglich um das Problem kümmern.</p>');
				$("#bug_email").val("");
				$("#bug_task").val("");
                $("#bug_problem").val("");
            } else {
                $("#bug_result").html('<p class="bug_error">Leider konnte der Fehlerbericht nicht gesendet werden. Bitte versuchen Sie es später noch einmal.</p>');
            }

            window.setTimeout(function() {
                $("#bug_report").show();
                $("#bug_result").hide();
            }, 10000);

        });

    });

});