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

    $(rep).css("opacity", (this.getAttribute('opacity') / 100));

    if (!$(rep).hasClass("selected")) {
        var linecolor = this.getAttribute('linecolor');
        if (linecolor == "rgba(0, 0, 0, 0)") {
            $(rep).find("rect").removeAttr("stroke");
            $(rep).find("rect").removeAttr("stroke-width");
        }
        else {
            $(rep).find("rect").attr("stroke", linecolor);
            $(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
        }
    }

    var label = this.getAttribute('label');

    if (!label)
        label = '';
    $(rep).find("td").empty();
    $(rep).find("td").append(label);

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

    if (table)
        table.style.textAlign = this.getAttribute('horizontal-align');

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

    if (table) {
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

    $(rep).find("body").append('<table><tr><td></td></tr></table>');

    $(rep).find("table").css("width", "100%");
    $(rep).find("table").css("fontSize", this.getAttribute('font-size') + "px");
    $(rep).find("table").css("fontFamily", this.getAttribute('font-family'));
    $(rep).find("table").css("color", this.getAttribute('font-color'));
    $(rep).find("td").css("height", this.getAttribute('height') + "px");
    $(rep).find("td").css("vertical-align", this.getAttribute('vertical-align'));
    $(rep).find("td").css("text-align", this.getAttribute('horizontal-align'));

    rep.dataObject = this;

    $(rep).attr("id", this.getAttribute('id'));

    this.initGUI(rep);

    return rep;

}


/**
 * Called after a double click on the object, enables the inplace editing
 */
Rectangle.editText = function() {

    var rep = this.getRepresentation();

    $(rep).find("table").hide();

    $(rep).find("body").append('<textarea type="text">');

    $(rep).find("textarea").attr("name", "newContent");
    $(rep).find("textarea").val(this.getAttribute('label'));
    $(rep).find("textarea").css("width", (this.getAttribute("width") - 16) + "px");
    $(rep).find("textarea").css("height", (this.getAttribute("height") - 16) + "px");
    $(rep).find("textarea").css("font-size", this.getAttribute('font-size') + "px");
    $(rep).find("textarea").css("font-family", this.getAttribute('font-family'));
    $(rep).find("textarea").css("color", this.getAttribute('font-color'));
    $(rep).find("textarea").css("margin-left", "5px");
    $(rep).find("textarea").css("margin-top", "5px");

    $(rep).find("textarea").focus();

    this.input = true;
    GUI.input = this.id;

}


/**
 * Called after hitting the Enter key during the inplace editing
 */
Rectangle.saveChanges = function() {

    if (this.input) {
        var rep = this.getRepresentation();

        var newContent = $(rep).find("textarea").val()

        if (typeof newContent != 'undefined') {
            newContent = newContent.trim();
            this.setAttribute("label", newContent);
        }

        this.input = false;
        GUI.input = false;

        $(rep).find("textarea").remove();

        $(rep).find("table").show();

        this.draw();
    }
}