"use strict";

GUI.chat = {};

GUI.chat.newMessages = 0;

GUI.chat.init = function() {

	$("#chat").append('<div id="chat_messages"></div><div id="chat_message"><textarea id="chat_message_input"></textarea></div>');
	
	$("#chat_message_input").attr("placeholder", GUI.translate("Message"));
	
	$("#chat_message_input").bind("keyup", function(event) {
	
		if (event.which == 13) {
			var val = $(this).val();
			if (jQuery.trim(val) == "") {
				$(this).val("");
				return;
			}
			ObjectManager.tell(val);
			$(this).val("");
		}
		
	});
	
}


GUI.chat.clear = function() {
	
	$("#chat_messages").html("");
	
}


GUI.chat.addMessage = function(username, text) {
	
	if (username == GUI.username) {
		var type = "mine";
	} else {
		
		var type = "other";
		
		if (GUI.sidebar.currentElement != "chat" || !GUI.sidebar.open) {
			GUI.chat.newMessages++;
			GUI.chat.showNotifier();
		}
		
	}
	
	$("#chat_messages").append('<div class="chat_message_'+type+'"><span>'+username+'</span>'+text+'</div>');
	

	$("#chat_messages").scrollTop(200000);

}


GUI.chat.opened = function() {
	GUI.chat.newMessages = 0;
	GUI.chat.hideNotifier();
}


GUI.chat.showNotifier = function() {
	$("#chat_notifier").html(GUI.chat.newMessages);
	$("#chat_notifier").css("opacity", 1);
}

GUI.chat.hideNotifier = function() {
	$("#chat_notifier").css("opacity", 0);
}