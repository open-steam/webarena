"use strict";

/**
 * @namespace Holds functions and variables for displaying a progress bar
 */
GUI.progressBarManager = {};

GUI.progressBarManager.currentId = 0;

/**
 * List of active progresses
 */
GUI.progressBarManager.progressList = {};

/**
 * Number of active progresses
 */
GUI.progressBarManager.progressCounter = 0;

/**
 * True if the progress bar manager is visible
 */
GUI.progressBarManager.visible = false;
	
/**
 * Show progress bar manager
 */
GUI.progressBarManager.show = function() {

	if (this.visible) return;

	$("#progressBar").show().css("opacity", 0);
	$("#progressBar").animate({
		"opacity":1
	}, 300);
	
	this.visible = true;
	
}

/**
 * Hide progress bar manager
 */
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
	
/**
 * Generate a unique id for a progress
 */
GUI.progressBarManager.generateId = function() {
	this.currentId++;
	return this.currentId;
}
	
/**
 * Adjust position of all shown progress bares
 * @param {bool} [noAnimation=false] True to prevent animation
 */
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
	
/**
 * Add a new progress
 * @param {String} title Initial Title of the new progress
 * @param {int|String} [id] Custom ID of the new progress
 * @returns {int|String} ID of new progress
 */
GUI.progressBarManager.addProgress = function(title, id) {
	
	if (this.progressList[id] !== undefined) return;
	
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

/**
 * Remove progress
 * @param {int|String} id Id of the progress to remove
 */
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

/**
 * Update progress bar for a progress
 * @param {int|String} id Id of the progress to update
 * @param {String} value New title for the progress
 * @param {bool} [ignoreUnknownId=false] True if an unknown ID should be ignored
 */
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
		}, 200);
	}
	
	value = $(this.progressList[id].domElement).find(".progressBar_progress").outerWidth()*(parseInt(value)/100);

	$($(this.progressList[id].domElement).find(".progressBar_progress>div")[0]).animate({
		"width": value
	}, 100);
	
	return true;
	
}

/**
 * Display and error for a progress and remove it after 2 sec.
 * @param {int|String} id Id of the progress
 * @param {String} title New title for the progress
 * @param {bool} [ignoreUnknownId=false] True if an unknown ID should be ignored
 */
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