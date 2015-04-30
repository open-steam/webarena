'use strict';

var WebRTCManager = {};

var isChannelReady;
var isInitiator;
var isStarted;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pc_config;
var pc_constraints;
var sdpConstraints;

WebRTCManager.constraints = {video: true, audio: true};
WebRTCManager.room = false;
WebRTCManager.callerId = false;
WebRTCManager.callername = false;
WebRTCManager.busy = false;

WebRTCManager.init = function(){

	pc_config = webrtcDetectedBrowser === 'firefox' ?
	{'iceServers':[{'url':'stun:23.21.150.121'}]} : // number IP
	{'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
  
  
	pc_constraints = {
		'optional': [
			{'DtlsSrtpKeyAgreement': true},
			{'RtpDataChannels': true}
		]
	};

  
	// Set up audio and video regardless of what devices are present
	sdpConstraints = {'mandatory': {
		'OfferToReceiveAudio':true,
		'OfferToReceiveVideo':true }
	};
  
}


WebRTCManager.startCall = function(showVideo, partnerId, partnername){

	if(!WebRTCManager.busy){ 

		WebRTCManager.room = ObjectManager.user.id+"_and_"+partnerId;
		
		if (WebRTCManager.room !== '') {
			//console.log('WebRTC:create/join ', room);
			//socket.emit('WebRTC-message', {message:'create/join', data:room});
			SocketClient.sendWebRTCCall('create/join', "", WebRTCManager.room);
		}

		WebRTCManager.callerId = partnerId;	
		WebRTCManager.callername = partnername;
		WebRTCManager.busy = true;
		
		isInitiator = true;
		
		WebRTCManager.constraints.video = showVideo;
		
		getUserMedia(WebRTCManager.constraints, handleUserMedia, handleUserMediaError);
		//console.log('Getting user media with constraints', constraints);

		if (location.hostname != "localhost") {
			requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
		}
		
		window.onbeforeunload = function(e){
			sendMessage('bye');
		}
	}
		
}


WebRTCManager.receiveCall = function(showVideo, r, caller){
	
	if(!WebRTCManager.busy && (navigator.mozGetUserMedia || navigator.webkitGetUserMedia)){
	
		var result = false;
		
		if(showVideo){
			result = confirm(caller+GUI.translate(' invites you to join a video chat! Accept?'));
		}else{
			result = confirm(caller+GUI.translate(' invites you to join a voice chat! Accept?'));
		}
		
		if (result) {

			WebRTCManager.busy = true;
		
			WebRTCManager.callername = caller;

			WebRTCManager.callerId = r.split("_and_")[0];
		
			WebRTCManager.room = r;
						
			WebRTCManager.constraints.video = showVideo;
			
			getUserMedia(WebRTCManager.constraints, handleUserMedia, handleUserMediaError);
			//console.log('Getting user media with constraints', constraints);
			
			if (location.hostname != "localhost") {
				requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
			}
			
			window.onbeforeunload = function(e){
				sendMessage('bye');
			}
			
		}
		else{
			SocketClient.sendWebRTCCall('decline', {partner:r.split("_and_")[0]}, undefined);
		}
	}
	else{
		SocketClient.sendWebRTCCall('decline', {partner:r.split("_and_")[0]}, undefined);
	}
		
}


WebRTCManager.receiveMessage = function(data){

	var message = data.message;
	
	switch (message) {
		case "log":
			//console.log.apply(console, data.data);
			break;
		case "invite":
			WebRTCManager.receiveCall(data.video, data.room, data.caller);
			break;
		case "decline":
			alert(WebRTCManager.callername+GUI.translate(" is currently in a call, has declined your request or do not allow access to webcam or microphone!"));
			
			GUI.chat.stopAudioVideoIconAnimation();
			
			WebRTCManager.hangup();
			break;
		case "created":
			//console.log('WebRTC:Created room ' + data.data);
			break;
		case "full":
			console.log('Room ' + data.data + ' is full');
			break;
		case "join":
			//console.log('Another peer made a request to join room ' + data.data);
			//console.log('This peer is the initiator of room ' + data.data + '!');
			
			GUI.chat.stopAudioVideoIconAnimation();
			
			GUI.chat.changeAudioVideoIcon("leave");
				
			isChannelReady = true;
			break;
		case "joined":
			//console.log('This peer has joined room ' + data.data);
			
			GUI.chat.changeAudioVideoIcon("leave");
			
			isChannelReady = true;
			break;
		case "message":
			var status = data.data;
			//console.log('Received message:', status);
			if (status === 'got user media') {
				maybeStart();
			} else if (status.type === 'offer') {
				if (!isInitiator && !isStarted) {
					maybeStart();
				}
				pc.setRemoteDescription(new RTCSessionDescription(status));
				doAnswer();
			} else if (status.type === 'answer' && isStarted) {
				pc.setRemoteDescription(new RTCSessionDescription(status));
			} else if (status.type === 'candidate' && isStarted) {
				var candidate = new RTCIceCandidate({sdpMLineIndex:status.label,
				candidate:status.candidate});
				pc.addIceCandidate(candidate);
			} else if (status === 'bye' && isStarted) {
				handleRemoteHangup();
			}
			break;
	}
	
}


function sendMessage(message){
	//console.log('Sending message: ', message);
	//socket.emit('WebRTC-message', {message:'message', data:message});
	SocketClient.sendWebRTCCall('message', message, WebRTCManager.room);
}


function handleUserMedia(stream) {

	if (isInitiator) {
		SocketClient.sendWebRTCCall('invite', {partnerId:WebRTCManager.callerId, callername:ObjectManager.user.username, video:WebRTCManager.constraints.video}, WebRTCManager.room);
	
		maybeStart();
		
		GUI.chat.startAudioVideoIconAnimation();
		
	}
	else{
		if (WebRTCManager.room !== '') {
			//console.log('WebRTC:create/join ', r);
			//socket.emit('WebRTC-message', {message:'create/join', data:room});
			SocketClient.sendWebRTCCall('create/join', undefined, WebRTCManager.room);
		}
	}

	GUI.chat.hideAudioVideoIcons();
	
	localStream = stream;
  
  	var localVideo = GUI.chat.getVideoContainer(ObjectManager.user.id);
	
	GUI.chat.setVideoSize(ObjectManager.user.id, 215, 170);
  
	attachMediaStream(localVideo, stream);
	//console.log('Adding local stream.');
	sendMessage('got user media');
}


function handleUserMediaError(error){
	console.log('getUserMedia error: ', error);
	if(WebRTCManager.constraints.video){
		alert(GUI.translate("For video calls it is necessary to allow the access to the webcam and the microphone!"));
	}
	else{
		alert(GUI.translate("For voice calls it is necessary to allow the access to the microphone!"));
	}
	if (isInitiator) {
		GUI.chat.stopAudioVideoIconAnimation();
		WebRTCManager.hangup();
	}
	else{
		SocketClient.sendWebRTCCall('decline', {partner:WebRTCManager.callerId}, undefined);
		stop();
	}
}


function maybeStart() {
	if (!isStarted && localStream && isChannelReady) {
		createPeerConnection();
		pc.addStream(localStream);
		isStarted = true;
		if (isInitiator) {
		doCall();
		}
	}
}


function createPeerConnection() {
	try {
		pc = new RTCPeerConnection(pc_config, pc_constraints);
		pc.onicecandidate = handleIceCandidate;
		//console.log('Created RTCPeerConnnection with:\n' +
		// '  config: \'' + JSON.stringify(pc_config) + '\';\n' +
		// '  constraints: \'' + JSON.stringify(pc_constraints) + '\'.');
	} catch (e) {
		console.log('Failed to create PeerConnection, exception: ' + e.message);
		alert('Cannot create RTCPeerConnection object.');
		return;
	}
  
	pc.onaddstream = handleRemoteStreamAdded;
	pc.onremovestream = handleRemoteStreamRemoved;

}


function handleIceCandidate(event) {
	//console.log('handleIceCandidate event: ', event);
	if (event.candidate) {
		sendMessage({
		type: 'candidate',
		label: event.candidate.sdpMLineIndex,
		id: event.candidate.sdpMid,
		candidate: event.candidate.candidate});
	} else {
		//console.log('End of candidates.');
	}
}


function doCall() {
	var constraints = {'optional': [], 'mandatory': {'MozDontOfferDataChannel': true}};
	// temporary measure to remove Moz* constraints in Chrome
	if (webrtcDetectedBrowser === 'chrome') {
		for (var prop in constraints.mandatory) {
			if (prop.indexOf('Moz') !== -1) {
				delete constraints.mandatory[prop];
			}
		}
	}
	constraints = mergeConstraints(constraints, sdpConstraints);
	//console.log('Sending offer to peer, with constraints: \n' +
	// '  \'' + JSON.stringify(constraints) + '\'.');
	pc.createOffer(setLocalAndSendMessage, function(errror){}, constraints);
}


function doAnswer() {
	//console.log('Sending answer to peer.');
	pc.createAnswer(setLocalAndSendMessage, function(errror){}, sdpConstraints);
}


function mergeConstraints(cons1, cons2) {
	var merged = cons1;
	for (var name in cons2.mandatory) {
		merged.mandatory[name] = cons2.mandatory[name];
	}
	merged.optional.concat(cons2.optional);
	return merged;
}


function setLocalAndSendMessage(sessionDescription) {
	// Set Opus as the preferred codec in SDP if Opus is present.
	sessionDescription.sdp = preferOpus(sessionDescription.sdp);
	pc.setLocalDescription(sessionDescription);
	sendMessage(sessionDescription);
}


function requestTurn(turn_url) {
	var turnExists = false;
	for (var i in pc_config.iceServers) {
		if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
			turnExists = true;
			turnReady = true;
			break;
		}
	}
	if (!turnExists) {
		//console.log('Getting TURN server from ', turn_url);
		// No TURN server. Get one from computeengineondemand.appspot.com:
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if (xhr.readyState === 4 && xhr.status === 200) {
				var turnServer = JSON.parse(xhr.responseText);
				//console.log('Got TURN server: ', turnServer);
				pc_config.iceServers.push({
					'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
					'credential': turnServer.password
				});
				turnReady = true;
			}
		};
		xhr.open('GET', turn_url, true);
		xhr.send();
	}
}


function handleRemoteStreamAdded(event) {
	//console.log('Remote stream added.');
	//reattachMediaStream(miniVideo, localVideo);
 
	var remoteVideo = GUI.chat.getVideoContainer(WebRTCManager.callerId);

	GUI.chat.setVideoSize(WebRTCManager.callerId, 215, 170);
 
	attachMediaStream(remoteVideo, event.stream);
	remoteStream = event.stream;
	//waitForRemoteVideo();
}


function handleRemoteStreamRemoved(event) {
	//console.log('Remote stream removed. Event: ', event);
}


WebRTCManager.hangup = function() {
	if(WebRTCManager.busy){
		//console.log('Hanging up.');
		sendMessage('bye');
		stop();
	}
}


function handleRemoteHangup() {
	//console.log('Session terminated.');
	stop();
}


function stop() {

	GUI.chat.changeAudioVideoIcon("start");
	
	GUI.chat.showAudioVideoIcons();
	
	GUI.chat.setVideoSize(WebRTCManager.callerId, 0, 0);
	
	GUI.chat.setVideoSize(ObjectManager.user.id, 0, 0);

	// isAudioMuted = false;
	// isVideoMuted = false;
	WebRTCManager.busy = false;
	isStarted = false
	if(typeof pc != 'undefined' && pc != null){
		pc.close();
	}
	pc = null;
	WebRTCManager.room = false;
	WebRTCManager.callerId = false;
	WebRTCManager.callername = false;
	WebRTCManager.busy = false;
	isChannelReady = false;
	isInitiator = false;
	turnReady = false;
}


// Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
	var sdpLines = sdp.split('\r\n');
	var mLineIndex;
	// Search for m line.
	for (var i = 0; i < sdpLines.length; i++) {
		if (sdpLines[i].search('m=audio') !== -1) {
			mLineIndex = i;
			break;
		}
	}
	if (mLineIndex === null) {
		return sdp;
	}

	// If Opus is available, set it as the default in m line.
	for (i = 0; i < sdpLines.length; i++) {
		if (sdpLines[i].search('opus/48000') !== -1) {
			var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
			if (opusPayload) {
				sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
			}
			break;
		}
	}

	// Remove CN in m line and sdp.
	sdpLines = removeCN(sdpLines, mLineIndex);

	sdp = sdpLines.join('\r\n');
	return sdp;
}


function extractSdp(sdpLine, pattern) {
	var result = sdpLine.match(pattern);
	return result && result.length === 2 ? result[1] : null;
}


// Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
	var elements = mLine.split(' ');
	var newLine = [];
	var index = 0;
	for (var i = 0; i < elements.length; i++) {
		if (index === 3) { // Format of media starts from the fourth.
			newLine[index++] = payload; // Put target payload to the first.
		}
		if (elements[i] !== payload) {
			newLine[index++] = elements[i];
		}
	}
	return newLine.join(' ');
}


// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
	var mLineElements = sdpLines[mLineIndex].split(' ');
	// Scan from end for the convenience of removing an item.
	for (var i = sdpLines.length-1; i >= 0; i--) {
		var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
		if (payload) {
			var cnPos = mLineElements.indexOf(payload);
			if (cnPos !== -1) {
				// Remove CN payload from m line.
				mLineElements.splice(cnPos, 1);
			}
			// Remove CN line in sdp
			sdpLines.splice(i, 1);
		}
	}

	sdpLines[mLineIndex] = mLineElements.join(' ');
	return sdpLines;
}