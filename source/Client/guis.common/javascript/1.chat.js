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
 * list of all current users in the room
 */
GUI.chat.users = [];

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
	
	var userIds = [];
	for(var j = 0; j<users.length; j++){   //new user: add in GUI.chat.users and create a representation
		userIds.push(users[j].id);
		if(GUI.chat.users.indexOf(users[j].id) == -1){ 
			GUI.chat.users.push(users[j].id);
			
			var user = users[j];
			var showNotification = true;
			if(user.id == ObjectManager.user.id) showNotification = false;
			
			$("#chat_users").append('<div><span id='+user.id+' style="background-color: '+user.color+'"></span>'+user.username+'</div>');
			if(showNotification) GUI.showNotification(true, "chat");
		}
	}
	
	for(var i = 0; i<GUI.chat.users.length; i++){ 	//user left: remove from GUI.chat.users and remove the representation
		if(userIds.indexOf(GUI.chat.users[i]) == -1){
			var userid = GUI.chat.users[i];
			
			GUI.showNotification(false, "chat");
			$("#"+userid).parent().remove();
			GUI.chat.users.splice(i, 1);
		}
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