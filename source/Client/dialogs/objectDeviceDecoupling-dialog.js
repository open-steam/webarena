/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

"use strict";

function ObjectDeviceDeCouplingDialog(devices) {
    this.devices = devices;
    this.compiledTemplate = _.template($('script#decoupling-dialog-template').html());
    this.dialog = null;

    var that = this;
    var onSave = function() {
        var choices = $(that.dialog).find('input:checkbox:checked');

        if (choices.length > 0) {
            var event = jQuery.Event("objectDevDecoupling::selections");
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
        "Decouple": onSave,
        "Cancel": onExit
    };

    this.content = this.compiledTemplate({ devices : this.devices });
};

ObjectDeviceDeCouplingDialog.prototype.show = function() {
    this.dialog = GUI.dialog(
        GUI.translate('object.device.decoupling.dialog.tittle'),
        this.content,
        this.buttons,
        350
    );
};
