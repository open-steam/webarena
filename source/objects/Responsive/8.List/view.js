/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

List.moveByTransform = function() {
    return true;
};

List.draw = function(external) {

    var rep = this.getRepresentation();

    GeneralObject.draw.call(this, external);

    var rect = rep.getElementsByTagName('rect')[0];

    $(rect).attr("fill", this.getAttribute('fillcolor'));

    if (!$(rect).hasClass("selected")) {
        $(rect).attr("stroke", this.getAttribute('linecolor'));
        $(rect).attr("stroke-width", this.getAttribute('linesize'));
    }

    $(rect).attr('width', this.getAttribute('width'));
    $(rect).attr('height', this.getAttribute('height'));
    this.padding = 20;

    rep.text.style.fontSize = this.getAttribute('font-size') + 'px';
    rep.text.style.fontFamily = this.getAttribute('font-family');
    rep.text.style.color = this.getAttribute('font-color');
}

List.createRepresentation = function(parent) {
    var rep = GUI.svg.group(parent, this.getAttribute('id'));

    rep.dataObject = this;

    var rect = GUI.svg.rect(rep,
            0, //x
            0, //y
            10, //width
            10 //height
            );


    $(rect).addClass("rect");

    rep.text = GUI.svg.other(rep, "foreignObject");
    var body = document.createElement("body");
    $(rep.text).append(body);
    rep.rect = rect;

    this.initGUI(rep);
    return rep;

}