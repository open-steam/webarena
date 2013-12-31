StatusLight.execute = function(){
    var that = this;

    var content = "<div>asdf</div>"

    var dialog = GUI.dialog(
        that.translate(GUI.currentLanguage, "Prceeding_Milestones"),
        content
    );
}

StatusLight.createRepresentation = function (parent) {

    var rep = GUI.svg.group(parent, this.getAttribute('id'));
    var rect = GUI.svg.rect(rep, 0, 0, 10, 10);
    var circleRed = GUI.svg.circle(rep, 0, 0, 10);
    var circleYellow = GUI.svg.circle(rep, 0, 100, 10);
    var circleGreen = GUI.svg.circle(rep, 0, 200, 10);

    $(rep).attr("transform", "translate(0,0)");
    $(rep).attr("id", this.getAttribute('id'));
    rep.dataObject = this;
    this.initGUI(rep);

    this.getContentFromApplication("kokoa", function(data){
        console.log("GOT RESPONSE");
        console.log(data);
    });

    return rep;

}

StatusLight.draw = function (external) {

    var rep = this.getRepresentation();
    var rect = $(rep).find("rect");


    rect.attr("fill", this.getAttribute('fillcolor'));
    GeneralObject.draw.call(this, external);
}

/**
 * Have to be overwritten because we want to set the position by transforming the svg group.
 *
 * @param value
 */
StatusLight.setViewX = function (value) {
    var transformation = $(this.getRepresentation()).attr("transform");
    var newTrans = transformation.replace(/(\d)+(?=,)/, value);

    $(this.getRepresentation()).attr("transform", newTrans);

    GeneralObject.setViewX.call(this, value);

}

/**
 * Have to be overwritten because we want to set the position by transforming the svg group.
 *
 * @param value
 */
StatusLight.setViewY = function (value) {
    var transformation = $(this.getRepresentation()).attr("transform");
    var newTrans = transformation.replace(/(\d)+(?=\))/, value);

    $(this.getRepresentation()).attr("transform", newTrans);

    GeneralObject.setViewY.call(this, value);
}

StatusLight.setViewWidth = function (value) {

    $(this.getRepresentation()).find("rect").attr("width", parseInt(value));
    GeneralObject.setViewWidth.call(this, value);

}

StatusLight.setViewHeight = function (value) {

    $(this.getRepresentation()).find("rect").attr("height", parseInt(value));
    GeneralObject.setViewHeight.call(this, value);

}