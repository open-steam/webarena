/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

Textarea.draw=function(external){

	if (!this.isVisible()) {
		return;
	}
	var rep=this.getRepresentation();
	
	this.drawDimensions(external);
	
	
	$(rep).attr("width", this.getAttribute('width'));
	$(rep).attr("height", this.getAttribute('height'));

	var linesize = this.getAttribute('linesize')-1+1;
	
	if (linesize > 0) {
		
		$(rep).find("body>div").css("border-color", this.getAttribute('linecolor'));
		$(rep).find("body>div").css("border-width", this.getAttribute('linesize'));
		$(rep).find("body>div").css("border-style", "solid");
		$(rep).find("body>div>div").css("padding", "5px");
		
	} else {
		
		$(rep).find("body>div").css("border-color", "none");
		$(rep).find("body>div").css("border-width", "0px");
		$(rep).find("body>div").css("border-style", "solid");
		$(rep).find("body>div>div").css("padding", "0px");
		
	}
	
	$(rep).find("body>div").css("background-color", this.getAttribute('fillcolor'));
	
	$(rep).find("body").css("font-size", this.getAttribute('font-size'));
	$(rep).find("body").css("font-family", this.getAttribute('font-family'));
	$(rep).find("body").css("color", this.getAttribute('font-color'));
	
	$(rep).attr("layer", this.getAttribute('layer'));
	
	if (!$(rep).hasClass("webarena_ghost")) {
		if (this.getAttribute("visible") || this.selected) {
			$(rep).css("visibility", "visible");
		} else {
			$(rep).css("visibility", "hidden");
		}
	}

	var that=this;
	
	this.getContentAsString(function(text){

		//if(text!=that.oldContent){

            text = htmlEncode(text);

			$(rep).find("body>div>div").html(text);
		//}
		
		that.oldContent=text;
		
	});
	
	this.updateInnerHeight();
}


Textarea.updateInnerHeight = function() {
	
	var rep=this.getRepresentation();

	$(rep).find("body").css("height", ($(rep).attr("height"))+"px");
	$(rep).find("body>div").css("height", ($(rep).attr("height")-(2*parseInt(this.getAttribute('linesize'))))+"px");
	
}


Textarea.createRepresentation = function(parent) {
	
	var rep = GUI.svg.other(parent,"foreignObject");

	rep.dataObject=this;
	
	var body = document.createElement("body");
	$(body).html('<div class="overfloating-y"><div>TEXT</div></div>');

	$(rep).append(body);

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}

Textarea.buildFormForEditableContent = function() {
	var style = 'font-family: ' + this.getAttribute("font-family")+'; ';
	style += 'font-size: ' + this.getAttribute("font-size")+'px; ';
	style += 'color: ' + this.getAttribute("font-color") + '; ';
	style += 'text-align: left; ';
	style += 'border: 1px solid #3E3E3E; ';
	style += 'border-radius: 5px; ';
	
	var content = this.getContentAsString();
	var placeholder = this.translate(this.currentLanguage, 'No text yet!');
	if (content == placeholder) content = "";
	else placeholder = "";
	var that = this;

	var dom = $('<table style="width: 100%; font-size: 16px; text-align: center"></table>');
	var preview = $('<tr><td>Preview</td></tr>');
	var showingRow = $('<tr><td style="' + style + '"><div class="overfloating" style="width: ' + (parseInt($(window).width()) - 10) + 'px; height: 100px;"><div>' + htmlEncode(content.replace(/"/g, "&quot;")) + '</div></div></td></tr>');
	var inputRow = $('<tr></tr>');
	var buttonRow = $('<tr></tr>');
	var inputCol = $('<td></td>');
	var buttonCol = $('<td></td>');
	var textInput = $('<textarea class="input" name="textedit" rows="6" placeholder="' + placeholder + '" style="width: 100%; margin-top: 25px">' + this.getContentAsString() + '</textarea>');
	var submitButton = $('<input class="inputButton" style="margin-top: 10px; margin-bottom: 10px" type="button" value="Text speichern" />');
	
	$(dom).append(preview);
	$(dom).append(showingRow);
    $(dom).append(inputRow);
	$(dom).append(buttonRow);
	$(inputRow).append(inputCol);
	$(buttonRow).append(buttonCol);
	$(inputCol).append(textInput);
	$(buttonCol).append(submitButton);
	
	var changeText = function() {
		var value = $(textInput).val();
		if (that.intelligentRename) {
			that.intelligentRename(value);
		}
		that.setContent(value);
	}
	
    submitButton.bind('click', changeText);
	
	return dom;
}


Textarea.editText = function() {
	
	var passThrough = { 
		"resizable" : true,  
		resizeStart : function(event,ui) { 
			$('textarea[name=textedit]').css('height', '100%'); 
		} 
	};
	GUI.editText(this, true, this.getViewWidth(), this.getViewHeight(), passThrough);

}

/**
 * Called when the colors of the appearence of an object are changed
 * @param {String} attribute attribute that was changed
 * @param {String} value new value of the attribute
 */
Textarea.checkTransparency = function(attribute, value) {
	if (attribute === 'fillcolor') {
		var fillcolor = value;
	} else {
		var fillcolor = this.getAttribute('fillcolor');
	}
	if (attribute === 'font-color') {
		var fontcolor = value;
	} else {
		var fontcolor = this.getAttribute('font-color');
	}
	if (attribute === 'linecolor') {
		var linecolor = value;
	} else {
		var linecolor = this.getAttribute('linecolor');
	}
	if ((fillcolor === 'transparent' && linecolor === 'transparent' && fontcolor === 'transparent') || (fillcolor === 'transparent' && linecolor === 'transparent' && this.getContentAsString().trim() === '')) {
		return false;
	} else return true;
}