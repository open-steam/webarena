var WebRTCManager = {};

var config;
var conferenceUI;
var videosContainer;
var btnSetupNewRoom;
var roomsList;
var myRoomData;

WebRTCManager.init = function(){

	config = {
		openSocket: function(config) {
			var SIGNALING_SERVER = '/',
				defaultChannel = location.hash.substr(1) || 'video-conferencing-hangout';

			var channel = config.channel || defaultChannel;
			var sender = Math.round(Math.random() * 999999999) + 999999999;

			io.connect(SIGNALING_SERVER).emit('new-WebRTC-channel', {
				channel: channel,
				sender: sender
			});

			var socket = io.connect(SIGNALING_SERVER + channel);
			socket.channel = channel;
			socket.on('connect', function() {
				if (config.callback) config.callback(socket);
			});

			socket.send = function(message) {
				socket.emit('WebRTC-message', {
					sender: sender,
					data: message
				});
			};

			socket.on('WebRTC-message', config.onmessage);
		},
		onRemoteStream: function(media) {
		
			var mediaElement = getMediaElement(media.video, {
				//width: (videosContainer.clientWidth / 2) - 50,
				width: 223,
				buttons: ['mute-audio', 'mute-video', 'volume-slider']
			});
			mediaElement.id = media.streamid;
			
			if(typeof InstallTrigger !== 'undefined'){  //Firefox, display the videos on the canvas		
				videosContainer.insertBefore(mediaElement, videosContainer.firstChild);
			}	
			else{ //display videos in the chat window
				$("#"+media.user).parent().after(mediaElement);
			}
		},
		onRemoteStreamEnded: function(stream, video) {
			if (video.parentNode && video.parentNode.parentNode && video.parentNode.parentNode.parentNode) {
				video.parentNode.parentNode.parentNode.removeChild(video.parentNode.parentNode);
			}
		},
		onRoomFound: function(room) {
			var alreadyExist = document.querySelector('button[data-broadcaster="' + room.broadcaster + '"]');
			if (alreadyExist) return;

			//if (typeof roomsList === 'undefined') roomsList = document.body;

			myRoomData = room;
			GUI.sidebar.setVideoChatIcon("join");
					
		},
		onRoomClosed: function(room) {
				
			var joinButton = document.querySelector('button[data-roomToken="' + room.roomToken + '"]');
			if (joinButton) {
				// joinButton.parentNode === <li>
				// joinButton.parentNode.parentNode === <td>
				// joinButton.parentNode.parentNode.parentNode === <tr>
				// joinButton.parentNode.parentNode.parentNode.parentNode === <table>
				joinButton.parentNode.parentNode.parentNode.parentNode.removeChild(joinButton.parentNode.parentNode.parentNode);
			}
		},
		onNewRemoteUser: function(user) {
		
			remoteUsers.push(user);
		
		}
	};
	
	conferenceUI = conference(config);
	
	/* UI specific */
	videosContainer = document.getElementById('videos-container') || document.body;
	btnSetupNewRoom = document.getElementById('setup-new-room');
	roomsList = document.getElementById('rooms-list');

	//if (btnSetupNewRoom) btnSetupNewRoom.onclick = setupNewRoomButtonClickHandler;
	
	(function() {
	var uniqueToken = document.getElementById('unique-token');
	if (uniqueToken)
		if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
		else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
	})();
	
	window.onresize = scaleVideos;
	
}

WebRTCManager.setupNewRoomButtonClickHandler = function() {
	//btnSetupNewRoom.disabled = true;
	//document.getElementById('conference-name').disabled = true;
	captureUserMedia(function() {
		conferenceUI.createRoom({
			roomName: ObjectManager.currentRoomID["left"]
		});
	}, function() {
		//btnSetupNewRoom.disabled = document.getElementById('conference-name').disabled = false;
	});
}

WebRTCManager.joinRoomButtonClickHandler = function() {

	captureUserMedia(function() {
		conferenceUI.joinRoom({
			roomToken: myRoomData.roomToken,
			joinUser: myRoomData.broadcaster
		});
	}, function() {
		joinRoomButton.disabled = false;
	});

}

WebRTCManager.leaveRoomButtonClickHandler = function() {

	conferenceUI.leaveRoom();
		
	GUI.sidebar.setVideoChatIcon("create");
	
	$(".media-container").remove();

}

function captureUserMedia(callback, failure_callback, forceSkipCustomGetUserMediaBar) {
	if(!forceSkipCustomGetUserMediaBar) {
		var mediaConstraints = {
			audio: true,
			video: true
		};

		navigator.customGetUserMediaBar(mediaConstraints, function () {

			// now you can invoke "getUserMedia" to seamlessly capture user's media
			captureUserMedia(callback, failure_callback, true);

		}, function () {

			// user clicked "Deny" or "x" button
			// throw new Error('PermissionDeniedError');
			alert('PermissionDeniedError: User denied permission.');
			
			if(failure_callback) failure_callback();

		});
		return;
	}

	var video = document.createElement('video');

	getUserMedia({
		video: video,
		onsuccess: function(stream) {
			config.attachStream = stream;
			callback && callback();

			video.setAttribute('muted', true);
			
			GUI.sidebar.setVideoChatIcon("leave");
			
			var mediaElement = getMediaElement(video, {
				//width: (videosContainer.clientWidth / 2) - 50,
				width: 223,
				buttons: ['mute-audio', 'mute-video', 'volume-slider']
			});
			mediaElement.toggle('mute-audio');
			
			if(typeof InstallTrigger !== 'undefined'){  //Firefox, display the videos on the canvas		
				videosContainer.insertBefore(mediaElement, videosContainer.firstChild);
			}	
			else{ //other Browsers: display videos in the chat window
				$("#"+ObjectManager.getUser().id).parent().after(mediaElement);	
			}
		},
		onerror: function() {
			alert('unable to get access to your webcam');
			callback && callback();
		}
	});
}


function rotateVideo(video) {
	video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
	setTimeout(function() {
		video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
	}, 1000);
}


function scaleVideos() {
	var videos = document.querySelectorAll('video'),
		length = videos.length, video;

	var minus = 130;
	var windowHeight = 700;
	var windowWidth = 600;
	var windowAspectRatio = windowWidth / windowHeight;
	var videoAspectRatio = 4 / 3;
	var blockAspectRatio;
	var tempVideoWidth = 0;
	var maxVideoWidth = 0;

	for (var i = length; i > 0; i--) {
		blockAspectRatio = i * videoAspectRatio / Math.ceil(length / i);
		if (blockAspectRatio <= windowAspectRatio) {
			tempVideoWidth = videoAspectRatio * windowHeight / Math.ceil(length / i);
		} else {
			tempVideoWidth = windowWidth / i;
		}
		if (tempVideoWidth > maxVideoWidth)
			maxVideoWidth = tempVideoWidth;
	}
	for (var i = 0; i < length; i++) {
		video = videos[i];
		if (video)
			video.width = maxVideoWidth - minus;
	}
}