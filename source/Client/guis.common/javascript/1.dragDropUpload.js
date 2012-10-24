"use strict";

/* upload files via drag and drop (HTML5) */

$(function() {
	
	var drop = function(event) {
		
		var x = event.clientX+parseInt($("body").scrollLeft());
		var y = event.clientY+parseInt($("body").scrollTop())-$("#content").offset().top;
		
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy'; //show that this is a copy
		
		var files = event.dataTransfer.files;
		
		if (files != undefined && files != null && files.length > 0) {
			/* files dropped */

			for (var i=0; i < files.length; i++) {
				
				var progressBarId = GUI.progressBarManager.addProgress("Create file object");
				
				var filename = files[i].fileName;
				var mimeType = files[i].type;
				var file = files[i];

				/* create new object */
					//x,y
				ObjectManager.createObject("File",{
					"x":x,
					"y":y,
					"hasContent":true //prevent calling justCreated() after object creation (would display file upload dialog)
				},false,function(newObject) {
					/* object created --> upload content */
					
					
					
					var fd=new FormData();
					fd.append("file", file); // Append the file
					
					var xhr = new XMLHttpRequest();
					
					
					xhr.upload.addEventListener("progress",function(evt) {
						if (evt.lengthComputable){
							
							var percentComplete=Math.round(evt.loaded * 100 / evt.total);
							GUI.progressBarManager.updateProgress(progressBarId, percentComplete);
							
						}
					}, false);
					
					xhr.addEventListener("load",function() {
						GUI.progressBarManager.updateProgress(progressBarId, 100, "Upload completed", true);
					},false);
					
					xhr.addEventListener("error",function() {
						GUI.progressBarManager.error(progressBarId, "Error while uploading file");
					},false);
					
					xhr.addEventListener("abort",function() {
						GUI.progressBarManager.error(progressBarId, "Upload aborted");
					},false);
					
					xhr.open("POST", "/setContent/"+newObject.getCurrentRoom()+"/"+newObject.getAttribute('id')+"/"+ObjectManager.userHash);
					xhr.send(fd);
				
				
					GUI.progressBarManager.updateProgress(progressBarId, 0, "Upload file");
				
					
				});
				
			}
			
		}
		
	}
	
	$("body").get(0).addEventListener("drop", drop, false);
	
	
	$("body").get(0).addEventListener("dragenter", function(e) {
		e.stopPropagation();
		  e.preventDefault();
	}, false);
	
	$("body").get(0).addEventListener("dragover", function(e) {
		e.stopPropagation();
		  e.preventDefault();
	}, false);
	

});