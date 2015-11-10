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
			if(user.id != ObjectManager.user.id){ // add call/video call icon
				$("#chat_users").append('<div><span id='+user.id+' style="background-color: '+user.color+'"></span>'+user.username+'<video id="video'+user.id+'" autoplay width="0"></video></div>');
				if(Modules.Config.WebRTC && (navigator.mozGetUserMedia || navigator.webkitGetUserMedia)){
					GUI.chat.addChatIcon(user.id, true);
					GUI.chat.addChatIcon(user.id, false);
				}
			}
			else{
				showNotification = false;
				$("#chat_users").append('<div><span id='+user.id+' style="background-color: '+user.color+'"></span>'+user.username+'<video id="video'+user.id+'" autoplay muted width="0"></video></div>');
			}
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


/**
 * add video/audio chat icon
 */
GUI.chat.addChatIcon = function(userId, video){	
	
	var icon = document.createElement("img");
	
	$(icon).attr("class", "VideoAudioIcon");
	
	if(video){
		$(icon).attr("id", "VideoIconUser"+userId);
		$(icon).attr("src", "../../guis.common/images/startVideochat.png").attr("alt", "");
		$(icon).attr("title", "start video call");
		$(icon).css("margin-left", "190px");
	}
	else{
		$(icon).attr("id", "AudioIconUser"+userId);
		$(icon).attr("src", "../../guis.common/images/startAudiochat.png").attr("alt", "");
		$(icon).attr("title", "start voice call");
		$(icon).css("margin-left", "160px");
	}
	
	$(icon).attr("width", "24").attr("height", "24");
	
	$(icon).attr("align", "right");

	$(icon).hover( 
		function () { 
			$(this).css("opacity", 0.9);
		}, 
		function () { 
			$(this).css("opacity", 0.6);
		} 
	); 
	
	$(icon).css("position", "absolute");
		
	$(icon).css("margin-top", "-6px");
	
	$(icon).css("z-index", 11001);
	
	$(icon).css("cursor", "pointer");
	
	$(icon).css("opacity", 0.6);
	
	$("#"+userId).append(icon);
	
	if(WebRTCManager.busy){
		$(icon).hide();
	}
	
	if (GUI.isTouchDevice) {
		$(icon).bind("touchstart", function(ev) {
			var title = $(this).attr("title");
			
			var targetname = $(this).parent()[0].nextSibling.data;
			var targetId = $(this).parent().attr("id");
			
			if(title == "start video call"){
				WebRTCManager.startCall(true, targetId, targetname);
				return;
			}
			if(title == "start voice call"){
				WebRTCManager.startCall(false, targetId, targetname);
				return;
			}

			WebRTCManager.hangup();
			
		});
	} else {
		$(icon).bind("mousedown", function(ev) {
			var title = $(this).attr("title");
			
			var targetname = $(this).parent()[0].nextSibling.data;
			var targetId = $(this).parent().attr("id");
			
			if(title == "start video call"){
				WebRTCManager.startCall(true, targetId, targetname);
				return;
			}
			if(title == "start voice call"){
				WebRTCManager.startCall(false, targetId, targetname);
				return;
			}

			WebRTCManager.hangup();
			
		});
	}
	
}


/**
 * sets the icon source and the icon title of the audio/video chat icons
 */
GUI.chat.changeAudioVideoIcon = function(startOrLeave){
	
	if(WebRTCManager.constraints.video){
		$("#VideoIconUser"+WebRTCManager.callerId).attr("src", "../../guis.common/images/"+startOrLeave+"Videochat.png").attr("alt", "");
		$("#VideoIconUser"+WebRTCManager.callerId).attr("title", startOrLeave+" video call");
	}
	else{
		$("#AudioIconUser"+WebRTCManager.callerId).attr("src", "../../guis.common/images/"+startOrLeave+"Audiochat.png").attr("alt", "");
		$("#AudioIconUser"+WebRTCManager.callerId).attr("title", startOrLeave+" voice call");
	}

}


/**
 * starts the pulsating animation of the audio/video icon
 */
GUI.chat.startAudioVideoIconAnimation = function(){

		var icon;
		if(WebRTCManager.constraints.video){
			icon = $("#VideoIconUser"+WebRTCManager.callerId);
		}
		else{
			icon = $("#AudioIconUser"+WebRTCManager.callerId);
		}
		
		icon.css("-webkit-animation", "pulsate 1s ease-out");
		icon.css("-moz-animation", "pulsate 1s ease-out");
		icon.css("-webkit-animation-iteration-count", "infinite"); 
		icon.css("-moz-animation-iteration-count", "infinite");
		
}


/**
 * stops the pulsating animation of the audio/video icon
 */
GUI.chat.stopAudioVideoIconAnimation = function(){

	$(".VideoAudioIcon").css("-webkit-animation", "");
	$(".VideoAudioIcon").css("-moz-animation", "");
	$(".VideoAudioIcon").css("-webkit-animation-iteration-count", ""); 
	$(".VideoAudioIcon").css("-moz-animation-iteration-count", "");

}


/**
 * hide all audio/video icons (except the active one)
 */
GUI.chat.hideAudioVideoIcons = function(){

	$(".VideoAudioIcon").hide();
	if(WebRTCManager.constraints.video){
		$("#VideoIconUser"+WebRTCManager.callerId).show();
	}
	else{
		$("#AudioIconUser"+WebRTCManager.callerId).show();
	}

}


/**
 * show all audio/video icons
 */
GUI.chat.showAudioVideoIcons = function(){

	$(".VideoAudioIcon").show();

}


/**
 * sets the size of the video stream container
 */
GUI.chat.setVideoSize = function(id, width, height){

	if(WebRTCManager.constraints.video){
		$('#video'+id).attr('width', width);
		$('#video'+id).attr('height', height);
	}

}


/**
 * returns the containers for the video streams
 */
GUI.chat.getVideoContainer = function(id){

	return document.querySelector('#video'+id);

}