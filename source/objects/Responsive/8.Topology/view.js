Topology.draw = function(external) {
    var rep = this.getRepresentation();

    GeneralObject.draw.call(this, external);

    $(rep).attr("fill", "white");

    if (!$(rep).hasClass("selected")) {
        $(rep).attr("stroke", "black");
        $(rep).attr("stroke-width", "5px");
    }

    /* var label = this.getAttribute('label');
     if (!label) */
    var label = '';

    rep.text.innerHTML = '<table style="width:100%;"><tr><td style="height:' +30 + 'px;vertical-align:' + this.getAttribute('vertical-align') + ';text-align:' + '40' + '">' + label + '</td></tr></table>';

    rep.text.style.fontSize = this.getAttribute('font-size') + 'px';
    rep.text.style.fontFamily = this.getAttribute('font-family');
    rep.text.style.color = this.getAttribute('font-color');
}
Topology.createRepresentation = function(parent) {
    var rep = GUI.svg.group(parent, this.getAttribute('id'));
    //In diesem Feld werde ich die Topologie erstellen
    rep.rect = GUI.svg.rect(rep,
            0, //x
            0, //y
            30, //width
            30 //height
            );
    rep.dataObject = this;
    rep.text = GUI.svg.other(rep, "foreignObject");

    var body = document.createElement("body");

    $(rep.text).append(body)

    $(rep).attr("id", this.getAttribute('id'));

    this.initGUI(rep);

    return rep;

    

} 