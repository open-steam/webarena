/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

"use strict";

function ObjectDeviceCouplingDialog(objects, devices) {
    this.devices = _.filter(devices, function(dev){ return _.isObject(dev); });
    this.objects = objects;
    this.compiledTemplate = _.template($('script#coupling-dialog-template').html());
    this.dialog = null;

    var that = this;
    var onSave = function() {
        var choices = $(that.dialog).find('input:checkbox:checked');

        if (choices.length > 0) {
            var event = jQuery.Event("objectDevCoupling::selections");
            event.payLoad = choices;
            $(that).trigger(event);

            return true;
        } else {
            return false;
        }
    };

    var onExit = function() {
        return true;
    };

    this.buttons = {
        "Couple": onSave,
        "Cancel": onExit
    };

    this.content = this.compiledTemplate({ devices : this.devices });
};

ObjectDeviceCouplingDialog.prototype.show = function() {
    this.dialog = GUI.dialog(
        GUI.translate('object.device.coupling.dialog.tittle'),
        this.content,
        this.buttons,
        500
    );
};
