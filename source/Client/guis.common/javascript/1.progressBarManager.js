GUI.progressBarManager = {};

GUI.progressBarManager.currentId = 0;
GUI.progressBarManager.progressList = {};
GUI.progressBarManager.progressCounter = 0;
GUI.progressBarManager.visible = false;
	
GUI.progressBarManager.show = function() {

	if (this.visible) return;

	$("#progressBar").show().css("opacity", 0);
	$("#progressBar").animate({
		"opacity":1
	}, 300);
	
	this.visible = true;
	
}

GUI.progressBarManager.hide = function() {

	if (!this.visible) return;

	if (this.progressCounter > 0) return;

	$("#progressBar").animate({
		"opacity":0
	}, 300, function() {
		$("#progressBar").hide();
	});

	this.visible = false;
	
}
	
GUI.progressBarManager.generateId = function() {
	this.currentId++;
	return this.currentId;
}
	
GUI.progressBarManager.adjustPosition = function(noAnimation) {
		
	var container = $("#progressBar > .progressBar_container");
	var height = 0;

	$.each(container.children(), function(index, item) {

		height += $(item).outerHeight(true);

	});

	var top = $(window).height()/2-height/2-20;

	if (noAnimation) {
		container.css("top", top);
	} else {
		container.animate({
			"top" : top
		}, 500);
	}
		
}
	
GUI.progressBarManager.addProgress = function(title, id) {

	if (id == undefined)
		var id = this.generateId();

	var dom = document.createElement("div");
	$(dom).html('<div class="progressBar_message">'+title+'</div><div class="progressBar_progress"><div></div></div>');
	
	$("#progressBar > .progressBar_container").append(dom);
	
	this.progressList[id] = {
		"title" : title,
		"value" : 0,
		"domElement" : dom
	};

	this.progressCounter++;

	this.show();

	if (this.progressCounter == 1) {
		this.adjustPosition(true);
	} else {
		this.adjustPosition();
	}
	
	return id;
		
}

GUI.progressBarManager.removeProgress = function(id) {

	if (this.progressList[id] == undefined) {
		return false;
	}
	
	$(this.progressList[id].domElement).remove();
	delete this.progressList[id];
	
	this.progressCounter--;

	this.adjustPosition();
	
	this.hide();
	
	return true;
	
}

GUI.progressBarManager.updateProgress = function(id, value, title, ignoreUnknownId) {
	var self = this;

	if (this.progressList[id] == undefined) {
		if (ignoreUnknownId == undefined) console.error("no progress with this id found!");
		return false;
	}
	
	if (title != undefined) {
		$(this.progressList[id].domElement).find(".progressBar_message").html(title);
	}
	
	if (value >= 100) {
		window.setTimeout(function() {
			self.removeProgress(id);
		}, 100);
	}
	
	value = $(this.progressList[id].domElement).find(".progressBar_progress").outerWidth()*(parseInt(value)/100);

	$($(this.progressList[id].domElement).find(".progressBar_progress>div")[0]).animate({
		"width": value
	}, 100);
	
	return true;
	
}


GUI.progressBarManager.error = function(id, title, ignoreUnknownId) {
	var self = this;

	if (this.progressList[id] == undefined) {
		if (ignoreUnknownId == undefined) console.error("no progress with this id found!");
		return false;
	}
	
	if (title != undefined) {
		$(this.progressList[id].domElement).find(".progressBar_message").html(title);
	}

	$($(this.progressList[id].domElement).find(".progressBar_progress>div")[0]).addClass("progressBar_error");
	
	window.setTimeout(function() {
		self.removeProgress(id);
	}, 2000);
	
	return true;
	
}