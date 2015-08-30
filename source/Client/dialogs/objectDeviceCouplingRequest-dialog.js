/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

"use strict";

function ObjectDeviceCouplingRequestDialog() {
    this.compiledTemplate = _.template($('script#coupling-request-dialog-template').html());
    this.dialog = null;

    var that = this;
    var onSave = function() {
        var object = $(that.dialog).find('input:text').val();

        if (object !== "") {
            var event = jQuery.Event('objectDevCoupling::request');
            event.payLoad = object.trim();
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

ObjectDeviceCouplingRequestDialog.prototype.show = function() {
    this.dialog = GUI.dialog(
        GUI.translate('object.device.couplingrequest.dialog.tittle'),
        this.content,
        this.buttons,
        350
    );
};

