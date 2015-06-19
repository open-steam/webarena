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
			var filenameType = filenameArray[filenameArray.length - 1];
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



