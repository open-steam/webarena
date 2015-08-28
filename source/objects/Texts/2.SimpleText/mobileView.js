/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

SimpleText.draw=function(external){
	
	if (!this.isVisible()) {
		return;
	}
	var rep=this.getRepresentation();
	
	this.drawPreview($(rep).find('.preview'));
	this.drawContentPane($(rep).find('.objectcontent'));
	/*
	this.drawDimensions(external);

	//$(rep).attr("fill", this.getAttribute('fillcolor'));
		
	if (!$(rep).hasClass("selected")) {
		var linecolor = this.getAttribute('linecolor');
		if(linecolor == "rgba(0, 0, 0, 0)"){
			$(rep).find("text").removeAttr("stroke");
			$(rep).find("text").removeAttr("stroke-width");
		}
		else{
			$(rep).find("text").attr("stroke", linecolor);
			$(rep).find("text").attr("stroke-width", this.getAttribute('linesize'));
		}
	}
	
	$(rep).find("text").attr("font-size", this.getAttribute('font-size'));
	$(rep).find("text").attr("font-family", this.getAttribute('font-family'));
	$(rep).find("text").attr("fill", this.getAttribute('font-color'));
	
	$(rep).attr("layer", this.getAttribute('layer'));

    var rotation = this.getAttribute("rotation") || 0;
    $(rep).find("text").attr("transform", "rotate(" + rotation + " 0 0)");

	if (!$(rep).hasClass("webarena_ghost")) {
		if (this.getAttribute("visible") || this.selected) {
			$(rep).css("visibility", "visible");
		} else {
			$(rep).css("visibility", "hidden");
		}
	}

	var that=this;
	
	$(rep).attr("transform", "translate(0, " + 50 + ")");
	
	this.getContentAsString(function(data){
		//if(data!=that.oldContent){
			if ((!data && !that.oldContent) || data == "") {
				$(rep).find("text").get(0).textContent='';
			} else {
				$(rep).find("text").get(0).textContent=data;
			}
		//}
		
		that.oldContent=data;
		
		$(rep).find("text").attr("y", 0);
		$(rep).find("text").attr("y", rep.getBBox().y*(-1));
		
	});
	*/
}

SimpleText.drawPreview = function(previewContainer) {
	var style =
		'font-family: ' + this.getAttribute('font-family') + '; ' +
		'font-size: ' + this.getAttribute("font-size") + 'px; ' +
		'color: ' + this.getAttribute("font-color") + '; ' +
		'text-align: left; ' +
		'border: 1px solid #3E3E3E; ' +
		'border-radius: 5px;';
	
	var content = this.getContentAsString();
	
	if (content == this.translate(this.currentLanguage, 'No text yet!')) {
		content = "";
	}

	if (content) {
		content = content.replace(/"/g, "&quot;");
	}
	
	previewContainer.find('#showroom').attr('style', style).html(content);
}

SimpleText.drawContentPane = function(pane) {
	var content = this.getContentAsString();
	var placeholder = this.translate(this.currentLanguage, 'No text yet!');
	
	if (content == placeholder) {
		content = "";
	} else {
		placeholder = "";
	}

	if (content) {
		content = content.replace(/"/g, "&quot;");
	}
	
	pane.find('#simpleTextInput').attr('value', content).attr('placeholder', placeholder);
}

SimpleText.createRepresentation = function(parent) {
	
	if (!this.isVisible()) {
		return;
	}
	
	var rep = document.createElement('div');
	rep.setAttribute('id', this.getAttribute('id'));
	$(parent).append(rep);
	
	$(rep).append(
		'<div class="preview">' +
			'<table style="width: 100%; font-size: 16px; text-align: center">' +
				'<tr><td>Preview</td></tr>' +
				'<tr><td id="showroom"></td></tr>' +
			'</table>' +
		'</div>'
	);
	
	$(rep).append(
		'<div class="objectcontent">' +
			'<table style="width: 100%; font-size: 16px; text-align: center">' +
				'<tr><td>' +
					'<input id="simpleTextInput" type="text" class="input" name="textedit" value="" placeholder="" style="width: 100%; margin-top: 25px" />' +
				'</td></tr>' +
				'<tr><td>' +
					'<input id="simpleTextSave" class="inputButton" style="margin-top: 10px; margin-bottom: 10px" type="button" value="Save Text" />' +
				'</td></tr>' +
			'</table>' +
		'</div>'
	);
	
	var that = this;
	
	var changeText = function() {
		var value = $(rep).find('#simpleTextInput').val();
		if (that.intelligentRename) {
			that.intelligentRename(value);
		}
		that.setContent(value);
	}
	
	$(rep).find('#simpleTextInput').bind("keyup", function() {
		if (event.keyCode == 13) {
			changeText();
		}
	});
    $(rep).find('#simpleTextSave').bind('click', changeText);
	
	rep.dataObject = this;
	
	this.initGUI(rep);
	return rep;
	
	/*
	var rep = GUI.svg.group(parent,this.getAttribute('id'));
	
	GUI.svg.text(rep, 0, 0, "Text");

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));
	$(rep).css("cursor", "default");

	this.initGUI(rep);
	
	return rep;
	*/
}

SimpleText.buildFormForEditableContent = function() {
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
	var showingRow = $('<tr><td style="' + style + '">' + content.replace(/"/g, "&quot;") + '</td></tr>')
	var inputRow = $('<tr></tr>');
	var buttonRow = $('<tr></tr>');
	var inputCol = $('<td></td>');
	var buttonCol = $('<td></td>');
	var textInput = $('<input type="text" class="input" name="textedit" value="'+content.replace(/"/g, "&quot;")+'" placeholder="'+placeholder+'" style="width: 100%; margin-top: 25px" />');
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
	
	textInput.bind("keyup", function() {
		if (event.keyCode == 13) {
			changeText();
		}
	});
    submitButton.bind('click', changeText);
	
	return dom;
}



SimpleText.editText = function() {
	
	GUI.editText(this);
	
}

/**
 * Called when the colors of the appearence of an object are changed
 * @param {String} attribute attribute that was changed
 * @param {String} value new value of the attribute
 */
SimpleText.checkTransparency = function(attribute, value) {
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
	if (fontcolor === 'rgba(0, 0, 0, 0)' && linecolor === 'rgba(0, 0, 0, 0)') {
		return false;
	} else return true;
}
