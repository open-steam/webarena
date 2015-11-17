/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 *     GeneralObject view component
 *
 */

/**
 * Checks if an objects is moved by transform
 * @returns {bool} True if moved by transform
 */
GeneralObject.moveByTransform = function() {
    return false;
}

/**
 * True if the object has a special area where it can be moved
 */
GeneralObject.restrictedMovingArea = false;


/**
 * Updates the representation using the attributes
 * @param {bool} external True if triggered externally (and not by the object itself)
 */
GeneralObject.draw = function(external) {

    if (!this.isGraphical)
        return;

    var rep = this.getRepresentation();

    this.setViewWidth(this.getAttribute('width'));
    this.setViewHeight(this.getAttribute('height'));

    this.drawPosition(external);

    $(rep).attr("layer", this.getAttribute('layer'));

    if (!$(rep).hasClass("webarena_ghost")) {

        if (this.selected) {
            $(rep).css("visibility", "visible");
        } else {

            if (this.getAttribute("visible")) {

                if (external) {
                    if ($(rep).css("visibility") == "hidden") {
                        /* fade in */
                        $(rep).css("opacity", 0);
                        $(rep).css("visibility", "visible");
                        $(rep).animate({
                            "opacity": 1
                        }, {queue: false, duration: 500});
                    }
                } else {
                    $(rep).css("visibility", "visible");
                }

            } else {

                if (external) {
                    if ($(rep).css("visibility") == "visible") {
                        /* fade out */
                        $(rep).css("opacity", 1);
                        $(rep).animate({
                            "opacity": 0
                        }, {queue: false,
                            complete: function() {
                                $(rep).css("visibility", "hidden");
                            }
                        });
                    }
                } else {
                    $(rep).css("visibility", "hidden");
                }

            }

        }


    }

    this.adjustControls();

}

/**
 * Updates the position of the representation
 * @param {bool} external True if triggered externally (and not by the object itself)
 */
GeneralObject.drawPosition = function(external) {

    /* animations can be prevented using the objects function "startNoAnimationTimer" and the clients global function "GUI.startNoAnimationTimer" */
    if (external === true && !this.selected && this.noAnimation == undefined && GUI.noAnimation == undefined) {
        /* set position animated when not called locally */
...
