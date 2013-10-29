SimpleText.contentUpdated=function(){
	var that = this;
	var drawNewContent = function() {
		that.draw();
	}
	this.fetchContent(drawNewContent, true);
}