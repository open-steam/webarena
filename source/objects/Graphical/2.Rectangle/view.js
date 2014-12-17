/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2011
 *
 */

Rectangle.draw = function(external) {
    var rep = this.getRepresentation();
    
    GeneralObject.draw.call(this, external);

    $(rep).attr("fill", this.getAttribute('fillcolor'));

    if (!$(rep).hasClass("selected")) {
        $(rep).find("rect").attr("stroke", this.getAttribute('linecolor'));
        $(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
    }

    var label = this.getAttribute('label');
	
    if(!label) label = '';

    rep.text.innerHTML = '<table style="width:100%;"><tr><td style="height:' + this.getAttribute('height') + 'px;vertical-align:' + this.getAttribute('vertical-align') + ';text-align:' + this.getAttribute('horizontal-align') + '">' + label + '</td></tr></table>';

    rep.text.style.fontSize = this.getAttribute('font-size') + 'px';
    rep.text.style.fontFamily = this.getAttribute('font-family');
    rep.text.style.color = this.getAttribute('font-color');
	
}


/**
 * Sets the objects width
 * @param {int} value The new width
 */
Rectangle.setViewWidth = function(value) {
    var rep = this.getRepresentation();
    $(rep).attr("width", value);
    $(rep.rect).attr("width", value);
    $(rep.text).attr("width", value);
    var table = rep.text.getElementsByTagName('td')[0];

    if(table) table.style.textAlign = this.getAttribute('horizontal-align');

    GUI.adjustContent(this);
}


/**
 * Sets the objects height
 * @param {int} value The new height
 */
Rectangle.setViewHeight = function(value) {
    var rep = this.getRepresentation();
    $(rep).attr("height", value);
    $(rep.rect).attr("height", value);
    $(rep.text).attr("height", value);
    var table = rep.text.getElementsByTagName('td')[0];

    if(table){
        table.style.height = value + 'px';
        table.style.verticalAlign = this.getAttribute('vertical-align');
    }

    GUI.adjustContent(this);
}


Rectangle.createRepresentation = function(parent) {

    var rep = GUI.svg.group(parent, this.getAttribute('id'));

    rep.rect = GUI.svg.rect(rep,
            0, //x
            0, //y
            10, //width
            10 //height
            );

    rep.text = GUI.svg.other(rep, "foreignObject");

    var body = document.createElement("body");

    $(rep.text).append(body);

    rep.dataObject = this;

    $(rep).attr("id", this.getAttribute('id'));

    this.initGUI(rep);

    return rep;

}


/**
 * Called after a double click on the object, enables the inplace editing
 */
Rectangle.editText = function(){

	var rep = this.getRepresentation();
	
	var table = rep.text.getElementsByTagName('td')[0];
	
	table.innerHTML='<textarea type="text" name="newContent" style="font-size: '+this.getAttribute('font-size')+'px; font-family: '+this.getAttribute('font-family')+'; color: '+this.getAttribute('font-color')+';">';
	
	$(rep).find("textarea").val(this.getAttribute('label'));
	$(rep).find("textarea").css("width", "90%");
	$(rep).find("textarea").css("height", "90%");
	
	this.input = true;
	
	var self = this;
	
	$(document).bind("keyup", function(event) {
		
		if (event.keyCode == 13) self.saveChanges();
		
	});

}


/**
 * Called after hitting the Enter key during the inplace editing
 */
Rectangle.saveChanges = function() {

	if(this.input){
		var rep = this.getRepresentation();
	
		var newContent = $(rep).find("textarea").val()
	
		if(typeof newContent != 'undefined'){ 
			newContent = newContent.trim();
			this.setAttribute("label", newContent);
		}
	
		this.input = false;

		$(rep).find("textarea").remove();
	
		this.draw();	
	}
}