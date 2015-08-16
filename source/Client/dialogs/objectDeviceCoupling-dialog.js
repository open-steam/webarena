/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

"use strict";

function ObjectDeviceCouplingDialog(objects, devices) {
    this.devices = devices;
    this.objects = objects;
    this.compiledTemplate = _.template($('script#coupling-dialog-template').html());
    this.buttons = {};
    this.dialog = null;

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
