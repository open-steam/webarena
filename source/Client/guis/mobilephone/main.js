/**
 * GUI specific file upload method
 * @param {webarenaObject} object The webarena object to upload the file
 * @param {String} message A message displayed when selecting the file
 */
GUI.uploadFile=function(object,message){

    var uploadDialog = document.createElement("div");
	$(uploadDialog).attr("id", "uploadWindow");
    $(uploadDialog).html('<div style="display: block; width: auto; min-height: 43px; max-height: none; height: auto;"><input type="file" id="fileInput" style="position: relative; left:10px; bottom:0px;"></div><div><div><button type="button" id="CancelButton" role="button" style="position: relative; left: 10px; bottom:0px;"><span>'+GUI.translate('cancel')+'</span></button></div></div></div>');

	$("body").append(uploadDialog);
	
	$("#CancelButton").bind('click', function (){
		$(uploadDialog).remove();
	});
	
	$("#fileInput").change(function(){
		
		var fd = new FormData();
	
		var x = document.getElementById("fileInput");

		if ('files' in x) {
			if (x.files.length == 0){
				alert(GUI.translate("Please select a file"));
			} else {
				for (var i = 0; i < x.files.length; i++){
					fd.append("file", x.files[0]);
				}
			}
		} 
		else {
			if (x.value == ""){
				alert(GUI.translate("Please select a file"));
			}
		}

		var filename = $(this).val().replace("C:\\fakepath\\", "");
		object.setAttribute('name', filename, true);

		var xhr = new XMLHttpRequest();

		xhr.addEventListener("load", function() {
            //upload complete
            $(uploadDialog).remove();
        }, false);
        xhr.addEventListener("error", function() {
            //failed
            alert(GUI.translate("Error while uploading file"));
        }, false);
        xhr.addEventListener("abort", function() {
            //canceled
            alert(GUI.translate("Upload aborted")); 
        }, false);
		
		xhr.open("POST", "/setContent/"+object.getCurrentRoom()+"/"+object.getAttribute('id')+"/"+ObjectManager.userHash);
		xhr.send(fd);
		
		$(uploadDialog).html(GUI.translate('File is currently being uploaded...'));

	});
	
}

/**
 * GUI specific inspector update
 */
GUI.updateInspector = function(selectionChanged) {

	if(typeof $("#inspector").data("jDesktopInspector") != 'undefined'){
		if (!selectionChanged && $("#inspector").data("jDesktopInspector").hasFocus) {
			return; // do not update inspector content when the inspector has focus
		}

		$("#inspector").data("jDesktopInspector").update();
		$("#sidebar_content").scrollTop(0);
	}

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