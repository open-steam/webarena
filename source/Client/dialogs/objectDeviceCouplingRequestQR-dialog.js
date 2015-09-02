/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval, University of Paderborn, 2015
 */

"use strict";

function ObjectDeviceCouplingRequestQRDialog() {
    this.compiledTemplate = _.template($('script#coupling-request-qr-dialog-template').html());
    this.dialog = null;
    this.buttons = {};

    this.content = this.compiledTemplate();
};

ObjectDeviceCouplingRequestQRDialog.prototype.show = function() {
    var that = this;
    that.dialog = GUI.dialog(
        GUI.translate('object.device.couplingrequest.dialog.tittle'),
        this.content,
        this.buttons,
        350
    );

    var txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent";
    //var scannedImg = document.querySelector('#scanned-img');
    //var grabImg    = document.querySelector('#grab-img');
    var scannedQR  = document.querySelector("#scanned-QR");

    var args = {
        beep: "/guis.common/audio/beep.mp3",
        DecodeBarCodeRate: null,
        autoBrightnessValue: 100,
        resultFunction: function(text, imgSrc) {
            //scannedImg.src = imgSrc;
            scannedQR[txt] = text;

            var event = jQuery.Event('objectDevCoupling::request');
            event.payLoad = text;
            $(that).trigger(event);

            window.setTimeout(function() {
                that.dialog.dialog( "close" );
            }, 300);
        },
        getDevicesError: function(error) {
            var p, message = "Error detected with the following parameters:\n";
            for (p in error) {
                message += p + ": " + error[p] + "\n";
            }
            alert(message);
        },
        getUserMediaError: function(error) {
            var p, message = "Error detected with the following parameters:\n";
            for (p in error) {
                message += p + ": " + error[p] + "\n";
            }
            alert(message);
        },
        cameraError: function(error) {
            var p, message = "Error detected with the following parameters:\n";
            for (p in error) {
                message += p + ": " + error[p] + "\n";
            }
            alert(message);
        },
        cameraSuccess: function() {
            //grabImg.classList.remove("disabled");
            scannedQR[txt] = "Scanning ...";
        }
    };

    var decoder = new WebCodeCamJS('#webcodecam-canvas');
    decoder.buildSelectMenu('#camera-select');
    decoder.init(args);

    document.querySelector('#camera-select').addEventListener('change', function() {
        if (decoder.isInitialized()) {
            decoder.stop().play();
        }
    });

    //grabImg.addEventListener("click", function() {
    //    if (!decoder.isInitialized()) {
    //        return;
    //    }
    //
    //    var src = decoder.getLastImageSrc();
    //    scannedImg.setAttribute("src", src);
    //}, false);

};

