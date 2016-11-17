WAFile.clientRegister = function () {

	WAFile.parent.clientRegister.call(this);


	this.registerAction('open File', function () {

		var selected = ObjectManager.getSelected();

		for (var i in selected) {
			var obj = selected[i];
			obj.openFile();
		}
	});

	this.registerAction('Make Selfie', function () {

	});



	this.registerAction('Take Picture',function(){


	});




	this.registerAction('Make Video Selfie', function () {

		//To be implemented
	});

	this.registerAction('Make Video', function () {

		//To be implemented
	});

	this.registerAction('Make Audio Recording', function () {

		//To be implemented
	});

	this.registerAction('To front', function () {

		/* set a very high layer for all selected objects (keeping their order) */
		var selected = ObjectManager.getSelected();

		for (var i in selected) {
			var obj = selected[i];

			obj.setAttribute("layer", obj.getAttribute("layer") + 999999);

		}

		ObjectManager.renumberLayers();

	}, false);

	this.registerAction('To back', function () {

		/* set a very low layer for all selected objects (keeping their order) */
		var selected = ObjectManager.getSelected();

		for (var i in selected) {
			var obj = selected[i];

			obj.setAttribute("layer", obj.getAttribute("layer") - 999999);

		}

		ObjectManager.renumberLayers();

	}, false);

	this.registerAction(this.translate(this.currentLanguage, "Upload file"), function () {

		var selected = ObjectManager.getSelected();

		for (var i in selected) {
			var obj = selected[i];

			obj.upload();

		}

	}, true, function () {
		return (ObjectManager.getSelected()[0].hasContent() === false);
	});

	this.registerAction(this.translate(this.currentLanguage, "Change content"), function () {

		var selected = ObjectManager.getSelected();

		for (var i in selected) {
			var obj = selected[i];

			obj.upload();
			obj.removeContentDialog();
		}

	}, true, function () {
		return (ObjectManager.getSelected()[0].hasContent() === true);
	});


	this.registerAction(this.translate(this.currentLanguage, "Download"), function () {

		var selected = ObjectManager.getSelected();

		for (var i in selected) {
			var obj = selected[i];

			obj.downloadFile();

		}

	}, true, function () {

		var selected = ObjectManager.getSelected();

		for (var i in selected) {
			var obj = selected[i];

			return (obj.hasContent() == true);

		}

	});

	this.registerAction('Put back', function (lastClicked) {

		var selected = ObjectManager.getSelected();
		for (var i = 0; i < selected.length; i++) {
			var objectID = selected[i].id;
			var host = selected[i].getAttribute("CloudConnection")[0];
			var user = selected[i].getAttribute("CloudConnection")[1];
			var pw = selected[i].getAttribute("CloudConnection")[2];
			var path = selected[i].getAttribute("CloudConnection")[3];
			GUI.cloud.putBack(host, user, pw, path, objectID);
		}

	}, false, function () {

		/* check if there is at least one selected object which cannot put back due to missing cloud information */
		var selected = ObjectManager.getSelected();
		for (var i = 0; i < selected.length; i++) {
			if (!selected[i].getAttribute("CloudConnection") || selected[i].getAttribute("CloudConnection")[0] == "") {
				return false;
			}
		}
		return true;

	});

}

WAFile.contentUpdated = function () {

	this.updateIcon();

}

WAFile.objectCreated = function () {
	if (!this.getAttribute('hasContent')) this.upload();
}


WAFile.downloadFile = function () {

	window.open(this.getDownloadURL())

}


WAFile.openFile = function () {
	var type = this.getAttribute("mimeType");

	if (type.indexOf("image") > -1 || type.indexOf("text") > -1 || type.indexOf("pdf") > -1) {
		this.buildContentDialog();
		return;
	}
	window.open(this.getContentURL(), "_blank");

}

WAFile.isPreviewable = function () {

	return GUI.mimeTypeIsPreviewable(this.getAttribute("mimeType"));

}

WAFile.upload = function () {
	GUI.uploadFile(this, this.translate(GUI.currentLanguage, "Please select a file"));
}

//Method for the action 'Make Selfie' for objects of 'FileObject'.
WAFile.setSelfiePicture=function(){
	GUI.setSelfiePictureFile(this);
}

//Method for the action 'Take Picture' for objects of 'FileObject'.
WAFile.setPicture=function(){
	GUI.setPictureFile(this);
}


/**
 *    determine if the icon of the file intersects with the square x,y,width,height
 */
WAFile.objectIntersectsWith = function (ox, oy, ow, oh) {
	if (!this.isGraphical) return false;

	var thisx = this.getViewBoundingBoxX();
	var thisy = this.getViewBoundingBoxY();
	var thisw = this.getViewBoundingBoxWidth();
	var thish = this.getViewBoundingBoxHeight();

	if (ox + ow < thisx) return false;
	if (ox > thisx + thisw) return false;
	if (oy + oh < thisy) return false;
	if (oy > thisy + thish) return false;

	return true;

}