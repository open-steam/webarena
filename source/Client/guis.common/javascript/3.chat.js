"use strict";

/**
 * @namespace Holding methods and variables to display and send chat messages to other users
 */
GUI.chat = {};

/**
 * counter for new messages (displayed as a badge)
 */
GUI.chat.newMessages = 0;

/**
 * adds components for chat and event handlers for sending chat messages
 */
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

/**
 * Sets active users for chat online list
 * Content of users:
 * [
 * 	{
 * 		color : The assigned (hex-) color of the user	
 * 		username : The username of the user
 *  },
 *  ...
 * ]
 * 
 * @param {UserInfo[]} users Array of active users information
 */
GUI.chat.setUsers = function(users) {
	$("#chat_users").html("");
	for (var i = 0; i < users.length; i++) {
		var user = users[i];
		$("#chat_users").append('<div><span style="background-color: '+user.color+'"></span>'+user.username+'</div>');
	}
}


/**
 * clears all chat messages
 */
GUI.chat.clear = function() {
	
	$("#chat_messages").html('<span id="chat_messages_spacer"></span>');
	
}

/**
 * add a single message to the chat window
 * @param {String} username The username of the sender
 * @param {String} text The text of the message
 * @param {String} [userColor=#000000] The senders user color
 * @param {Boolean} read True, if it is an old message
 */
GUI.chat.addMessage = function(username, text, userColor, read) {
	
	/* check if the message was send by the own user */
	if (username == GUI.username) {
		var type = "mine";
	} else {
		
		var type = "other";
		
		if (!read && (GUI.sidebar.currentElement != "chat" || !GUI.sidebar.open)) {
			GUI.chat.newMessages++;
			GUI.chat.showNotifier();
		}
		
	}
	
	/* set default user color */
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
	

	
	text = replaceEmoticon(':)', 'emoticon_smile.png', text);
	text = replaceEmoticon(':D', 'emoticon_grin.png', text);
	text = replaceEmoticon(':P', 'emoticon_tongue.png', text);
	text = replaceEmoticon(':(', 'emoticon_unhappy.png', text);
	text = replaceEmoticon('(tux)', 'tux.png', text);
	text = replaceEmoticon(':o', 'emoticon_surprised.png', text);
	text = replaceEmoticon(';D', 'emoticon_wink.png', text);
	text = replaceEmoticon('<3', 'heart.png', text);
	text = replaceEmoticon('(ghost)', 'ghost.png', text);
	
	var date = new Date();
	var timestamp = (date.getHours()<10 ? '0' : '') + date.getHours() + ':' +(date.getMinutes()<10 ? '0' : '') + date.getMinutes() + ':' +(date.getSeconds()<10 ? '0' : '') + date.getSeconds();

	$("#chat_messages").append('<div class="chat_message_'+type+'"><span style="color: '+userColor+'">'+username+' ('+timestamp+')</span>'+text+'</div>');
	

	$("#chat_messages").scrollTop(200000); //scroll down

}


/**
 * called when chat is opened in GUI
 */
GUI.chat.opened = function() {
	GUI.chat.newMessages = 0;
	GUI.chat.hideNotifier();
	//$("#chat_message_input").focus(); //TODO: chrome bug
}


/**
 * show a notification (e.g. an icon badge) with the number of unread messages
 * called by GUI.chat.addMessage
 */
GUI.chat.showNotifier = function() {
	$("#chat_notifier").html(GUI.chat.newMessages);
	$("#chat_notifier").css("opacity", 1);
}

/**
 * hide the notification
 */
GUI.chat.hideNotifier = function() {
	$("#chat_notifier").css("opacity", 0);
}