/**
 * GUI specific file upload method
 * @param {webarenaObject} object The webarena object to upload the file
 * @param {String} message A message displayed when selecting the file
 */
GUI.uploadFile=function(object,message){

    var uploadDialog = document.createElement("div");
    $(uploadDialog).attr("title", GUI.translate("Upload file"));
    $(uploadDialog).html('<p>'+message+'</p>');

    var form = document.createElement("input");
    $(form).attr("type", "file");
	
	$(form).change(function(){

        var progress = document.createElement("div");
        $(progress).css("margin-top", "10px");
        $(progress).progressbar({
            value: 0
        });

        $(uploadDialog).append(progress);

        var fd = new FormData();
        fd.append("file", form.files[0]);

        var filename = $(this).val().replace("C:\\fakepath\\", "");
		if(message.indexOf("image") > 0 || message.indexOf("Bild") > 0){
			var filenameArray = filename.split(".");
			var filenameType = filenameArray[filenameArray.length - 1].toLowerCase();
			if(!GUI.mimeTypeIsPreviewable("image/"+filenameType)){
				alert(GUI.translate('This filetype is not an image or is not supported.')); 
				return;
			}
		}
		
        object.setAttribute('name', filename, true);

		/* Restrict the uploaded file size, the maximum filesize is spezified in config.default */
		var filesize = form.files[0].size;  
		if(Modules.Config.maxFilesizeInMB*1000000<filesize){
			alert(GUI.translate('This file is too large. You can only upload files with a maximum size of ')+Modules.Config.maxFilesizeInMB+' megabyte!'); 
		}
		else{
	
			var xhr = new XMLHttpRequest();
			xhr.upload.addEventListener("progress", function(evt) {

				if (evt.lengthComputable) {
					var percentComplete = Math.round(evt.loaded * 100 / evt.total);
					$(progress).progressbar("value", percentComplete);
				} else {
					$(progress).progressbar("destroy");
					$(progress).html("unable to compute progress");
				}

			}, false);

			xhr.addEventListener("load", function() {
				//upload complete
				$(uploadDialog).dialog("close");
			}, false);
			xhr.addEventListener("error", function() {
				//failed
				alert("failed");
			}, false);
			xhr.addEventListener("abort", function() {
				//canceled
				alert("cancel");
			}, false);
			xhr.open("POST", "/setContent/"+object.getCurrentRoom()+"/"+object.getAttribute('id')+"/"+ObjectManager.userHash);
			xhr.send(fd);

			var dialogButtons = {};
			dialogButtons[GUI.translate("cancel")] = function() {
				xhr.abort();
				$(this).dialog("close");
			}

			$(uploadDialog).dialog("option", "buttons", dialogButtons);
		
		}

	});

    $(uploadDialog).append(form);

    var dialogButtons = {};
    dialogButtons[GUI.translate("cancel")] = function() {
        $(this).dialog("close");
    }

    $(uploadDialog).dialog({
        modal: true,
        resizable: false,
        buttons: dialogButtons
    });

}

/**
 * GUI specific inspector update
 */
GUI.updateInspector = function(selectionChanged) {

    if (!selectionChanged && $("#inspector").data("jDesktopInspector").hasFocus) {
        return; // do not update inspector content when the inspector has focus
    }


    $("#inspector").data("jDesktopInspector").update();
    $("#sidebar_content").scrollTop(0);

}

/**
 * GUI specific setup of inspector
 */
GUI.setupInspector = function() {

    /* add jQuery inspector plugin to inspector-div */
    $("#inspector").jDesktopInspector({
        onUpdate : function(domEl, inspector) {

            GUI.setupInspectorContent(inspector);

        }
    });

}



/**
 * Initates streaming the devices's back camera feed and dynamically capture and store a picture from this live video stream.
 * @param {webarenaObject} object The webarena object to upload the file
*/
GUI.setPictureFile=function(object){

	var video1 =document.createElement("video");
	video1.style.width="45vw";
	video1.style.height="50vw";
	video1.style.background = "blue";
	video1.style.position="relative";
	video1.style.alignment="center";
	video1.autoplay;
	video1.style.color = "white";
	video1.id="video1";
	video1.style.zIndex=0;
	document.body.appendChild(video1);

	var img1=document.createElement("img");
	img1.style.width="45vw";
	img1.style.height="50vw";
	img1.style.background = "red";
	img1.style.position="relative";
	img1.style.color = "white";
	img1.id="img1";
	img1.style.zIndex=0;
	img1.style.visibility='hidden';
	document.body.appendChild(img1);

	var button1=document.createElement("button");
	button1.style.background = "yellow";
	button1.style.color = "black";
	button1.innerHTML = "Take Picture and Save";
	button1.style.width="100%";
	button1.style.height="12%";
	button1.style.position="relative";
	button1.id="button1";
	document.body.appendChild(button1);

	var canvas1=document.createElement("canvas");
	canvas1.style.width="45vw";
	canvas1.style.height="50vw";
	canvas1.style.position="relative";
	canvas1.style.background = "green";
	canvas1.style.color = "white";
	canvas1.id="canvas1";
	canvas1.style.visibility='hidden';
	document.body.appendChild(canvas1);

	//Obtaining access to the device back camera using the WebRTC API and MediaDevices interface.
	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

		navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: { exact: "environment" } }  }).then(function(stream) {

			//Append the live video stream onto the video element.
			video1.src= window.URL.createObjectURL(stream);
			video1.play();

		});

	}

    //Elements for taking the snapshot
	var canvasbase = document.getElementById('canvas1');
	var context = canvasbase.getContext('2d');
	var imgAsDataURL;

    //Trigger photo take and photo save
	document.getElementById('button1').addEventListener("click", function() {

		context.drawImage(video1, 0, 0, 300,300); //300,270

		img1.setAttribute('src',canvasbase.toDataURL('image/jpg'));

		// Get canvas contents as a data URL
		imgAsDataURL = canvasbase.toDataURL("image/jpg");


		// Save image and append to the object.
		var dataURL = canvasbase.toDataURL("image/jpg");
		document.body.removeChild(video1);
		document.body.removeChild(img1);
		document.body.removeChild(button1);


		var progress = document.createElement("div");
		$(progress).css("margin-top", "10px");
		$(progress).progressbar({
			value: 0
		});


		var blob =dataURLSourcetoBlobFormat(dataURL);


		var fd = new FormData();
		fd.append("file", blob);

		var filename = "Take Picture";

		object.setAttribute('name', filename, true);


			var xhr = new XMLHttpRequest();
			xhr.open("POST", "/setContent/"+object.getCurrentRoom()+"/"+object.getAttribute('id')+"/"+ObjectManager.userHash);
			xhr.send(fd);

	});



}

//Converting DataURL to the Blob data format.
//Referenced from -http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
function dataURLSourcetoBlobFormat(dataURLSource) {
	// convert the base64/URLEncoded data to the raw binary data format
	var byteStringFormat;
	if (dataURLSource.split(',')[0].indexOf('base64') >= 0)
		byteStringFormat = atob(dataURLSource.split(',')[1]);
	else
		byteStringFormat = unescape(dataURLSource.split(',')[1]);

	// Obtain the mime component from the dataURLSource
	var mimeContent = dataURLSource.split(',')[0].split(':')[1].split(';')[0];

	var typedArray = new Uint8Array(byteStringFormat.length);
	for (var i = 0; i < byteStringFormat.length; i++) {
		typedArray[i] = byteStringFormat.charCodeAt(i);
	}

	return new Blob([typedArray], {type:mimeContent});
}


/**
 * Initates streaming the devices's back camera feed and dynamically capture and store a picture from this live video stream.
 * @param {webarenaObject} object The webarena object to upload the file
 */
GUI.setSelfiePictureFile=function(object){

	var video1 =document.createElement("video");
	video1.style.width="45vw";
	video1.style.height="50vw";
	video1.style.background = "blue";
	video1.style.position="relative";
	video1.style.alignment="center";
	video1.autoplay;
	video1.style.color = "white";
	video1.id="video1";
	video1.style.zIndex=0;
	document.body.appendChild(video1);

	var img1=document.createElement("img");
	img1.style.width="45vw";
	img1.style.height="50vw";
	img1.style.background = "red";
	img1.style.position="relative";
	img1.style.color = "white";
	img1.id="img1";
	img1.style.zIndex=0;
	img1.style.visibility='hidden';
	document.body.appendChild(img1);

	var button1=document.createElement("button");
	button1.style.background = "yellow";
	button1.style.color = "black";
	button1.innerHTML = "Make Selfie and Save";
	button1.style.width="100%";
	button1.style.height="12%";
	button1.style.position="relative";
	button1.id="button1";
	document.body.appendChild(button1);

	var canvas1=document.createElement("canvas");
	canvas1.style.width="45vw";
	canvas1.style.height="50vw";
	canvas1.style.position="relative";
	canvas1.style.background = "green";
	canvas1.style.color = "white";
	canvas1.id="canvas1";
	canvas1.style.visibility='hidden';
	document.body.appendChild(canvas1);

	//Obtaining access to the device back camera using the WebRTC API and MediaDevices interface.
	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

		navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: { exact: "environment" } }  }).then(function(stream) {

			//Append the live video stream onto the video element.
			video1.src= window.URL.createObjectURL(stream);
			video1.play();
		});
	}

	//Elements for taking the snapshot
	var canvasbase = document.getElementById('canvas1');
	var context = canvasbase.getContext('2d');
	var imgAsDataURL;

	//Trigger photo take and photo save
	document.getElementById('button1').addEventListener("click", function() {

		context.drawImage(video1, 0, 0, 300,300); //300,270

		img1.setAttribute('src',canvasbase.toDataURL('image/jpg'));

		// Get canvas contents as a data URL
		imgAsDataURL = canvasbase.toDataURL("image/jpg");

		// Save image and append to the object.
		var dataURL = canvasbase.toDataURL("image/jpg");
		document.body.removeChild(video1);
		document.body.removeChild(img1);
		document.body.removeChild(button1);

		var progress = document.createElement("div");
		$(progress).css("margin-top", "10px");
		$(progress).progressbar({
			value: 0
		});

		var blob = dataURLSourcetoBlobFormat(dataURL);

		var fd = new FormData();
		fd.append("file", blob);

		var filename = "Take Picture";

		object.setAttribute('name', filename, true);

		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/setContent/"+object.getCurrentRoom()+"/"+object.getAttribute('id')+"/"+ObjectManager.userHash);
		xhr.send(fd);

	});

}

/**
 * Initates streaming the devices's back camera feed and dynamically capture and store a picture from this live video stream.
 * @param {webarenaObject} object The webarena object to upload the file
 */
GUI.saveLocalStorage=function(data){

	console.log("Data to be saved as local storage with key-DeviceIdentified  -"+JSON.stringify(data));
	if(!ClientDeviceDetection.isRetrieved) {
		if (typeof(Storage) != "undefined") {
			localStorage.setItem('DeviceIdentified', JSON.stringify(data));
			}
		}

}
