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
	
	this.drawDimensions(external);

	//$(rep).attr("fill", this.getAttribute('fillcolor'));
	
	if (!$(rep).hasClass("selected")) {
		$(rep).find("text").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("text").attr("stroke-width", this.getAttribute('linesize'));
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
}



SimpleText.createRepresentation = function(parent) {
	
	if (!this.isVisible()) {
		return;
	}
	var rep = GUI.svg.group(parent,this.getAttribute('id'));
	
	GUI.svg.text(rep, 0, 0, "Text");

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));
	$(rep).css("cursor", "default");

	this.initGUI(rep);
	
	return rep;
	
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
	if (fontcolor === 'transparent' && linecolor === 'transparent') {
		return false;
	} else return true;
}