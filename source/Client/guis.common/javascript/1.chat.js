"use strict";

GUI.chat = {};

GUI.chat.newMessages = 0;

GUI.chat.init = function() {

	$("#chat").append('<div id="chat_messages"></div><div id="chat_message"><textarea id="chat_message_input"></textarea></div><div id="chat_users"></div>');
	
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

GUI.chat.setUsers = function(users) {
	$("#chat_users").html("");
	for (var i = 0; i < users.length; i++) {
		var user = users[i];
		$("#chat_users").append('<div><span style="background-color: '+user.color+'"></span>'+user.username+'</div>');
	}
}


GUI.chat.clear = function() {
	
	$("#chat_messages").html('<span id="chat_messages_spacer"></span>');
	
}


GUI.chat.addMessage = function(username, text, userColor) {
	
	if (username == GUI.username) {
		var type = "mine";
	} else {
		
		var type = "other";
		
		if (GUI.sidebar.currentElement != "chat" || !GUI.sidebar.open) {
			GUI.chat.newMessages++;
			GUI.chat.showNotifier();
		}
		
	}
	
	if (userColor == undefined) {
		var userColor = "#000000";
	}
	
	text = text.replace(/<(?:.|\n)*?>/gm, '');
	
	/* emoticons */
	
	var replaceEmoticon = function(code, image, str) {
		
		code = code.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		
		var replacer = new RegExp(code,"g");

		return str.replace(replacer,'<img src="/guis.common/images/emoticons/'+image+'" alt="" />');
		
	}
	
	if (text.indexOf('(ghost)') > -1) {
		GUI.huu();
	}
	
	text = replaceEmoticon(':)', 'emoticon_smile.png', text);
	text = replaceEmoticon(':D', 'emoticon_grin.png', text);
	text = replaceEmoticon(':P', 'emoticon_tongue.png', text);
	text = replaceEmoticon(':(', 'emoticon_unhappy.png', text);
	text = replaceEmoticon('(tux)', 'tux.png', text);
	text = replaceEmoticon(':o', 'emoticon_surprised.png', text);
	text = replaceEmoticon(';D', 'emoticon_wink.png', text);
	text = replaceEmoticon('<3', 'heart.png', text);
	text = replaceEmoticon('(ghost)', 'ghost.png', text);
	
	$("#chat_messages").append('<div class="chat_message_'+type+'"><span style="color: '+userColor+'">'+username+'</span>'+text+'</div>');
	

	$("#chat_messages").scrollTop(200000);

}


GUI.chat.opened = function() {
	GUI.chat.newMessages = 0;
	GUI.chat.hideNotifier();
	//$("#chat_message_input").focus(); //TODO: chrome bug
}


GUI.chat.showNotifier = function() {
	$("#chat_notifier").html(GUI.chat.newMessages);
	$("#chat_notifier").css("opacity", 1);
}

GUI.chat.hideNotifier = function() {
	$("#chat_notifier").css("opacity", 0);
}