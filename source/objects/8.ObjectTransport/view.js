ObjectTransport.createRepresentation = function (parent) {

    var rep = GUI.svg.group(parent, this.getAttribute('id'));
    var iconCode = this.getIconText();
    var rect = GUI.svg.rect(rep, 0, 0, 10, 10);
    var text = GUI.svg.text(rep, 30, 70, iconCode, {'font-size': 60});

    $(text).attr("class", "font-icon half-transparent");
    $(rep).attr("transform", "translate(0,0)");
    $(rep).attr("id", this.getAttribute('id'));
    rep.dataObject = this;
    this.initGUI(rep);
    return rep;

}

ObjectTransport.getIconText = function () {
    return this.getAttribute("cut") ? "\uf0c4" : "\uf0c5";
}

ObjectTransport.draw = function (external) {

    var rep = this.getRepresentation();
    var rect = $(rep).find("rect");
    var icon = $(rep).find(".font-icon");

    icon.text(this.getIconText());
    rect.attr("fill", this.getAttribute('fillcolor'));
    GeneralObject.draw.call(this, external);
}

ObjectTransport.setViewX = function (value) {
    var transformation = $(this.getRepresentation()).attr("transform");
    var newTrans = transformation.replace(/(\d)+(?=,)/, value);

    $(this.getRepresentation()).attr("transform", newTrans);

    GeneralObject.setViewX.call(this, value);

}

ObjectTransport.setViewY = function (value) {
    var transformation = $(this.getRepresentation()).attr("transform");
    var newTrans = transformation.replace(/(\d)+(?=\))/, value);

    $(this.getRepresentation()).attr("transform", newTrans);

    GeneralObject.setViewY.call(this, value);
}

ObjectTransport.setViewWidth = function (value) {

    $(this.getRepresentation()).find("rect").attr("width", parseInt(value));
    GeneralObject.setViewWidth.call(this, value);

}

ObjectTransport.setViewHeight = function (value) {

    $(this.getRepresentation()).find("rect").attr("height", parseInt(value));
    GeneralObject.setViewHeight.call(this, value);

}

ObjectTransport.showActivationMarker = function () {
    var rep = this.getRepresentation();
    $(rep).find(".font-icon").removeClass("half-transparent")
}

ObjectTransport.hideActivationMarker = function () {
    var rep = this.getRepresentation();
    $(rep).find(".font-icon").addClass("half-transparent");
}

ObjectTransport.representationCreated = function () {
    GeneralObject.representationCreated.call(this);
    var that = this;
    var rep = this.getRepresentation();
    var intersectMode = false;
    var rect = $("rect");

    $("body").on("moveObject.wa", function (e) {
        if (e.objectId !== that.getID()) {
            var movedObject = ObjectManager.getObject(e.objectId);

            //new intersection
            if (that.intersectsWith(movedObject) && !intersectMode) {
                intersectMode = true;
                that.showActivationMarker();
            }
            //not intersecting anymore
            else if (!that.intersectsWith(movedObject) && intersectMode) {
                intersectMode = false;
                that.hideActivationMarker();
            }
        }

    });

    $("body").on("moveend.wa", function (e) {
        if (e.objectId !== that.getID()) {
            var movedObject = ObjectManager.getObject(e.objectId);

            //execute copy/cut - if intersecting on mouse/touch release
            if (that.intersectsWith(movedObject)) {
                var selected = ObjectManager.getSelected();
                _(selected).each(function (elem) {
                    if (elem !== that) {
                        that.serverCall("copyOrCut", elem.getID());
                    }
                })
            }

            that.hideActivationMarker();
            intersectMode = false;
        }
    })
}