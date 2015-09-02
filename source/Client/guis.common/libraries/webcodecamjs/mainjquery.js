/*!
 * WebCodeCamJS 1.7.0 javascript Bar-Qr code decoder 
 * Author: Tóth András
 * Web: http://atandrastoth.co.uk
 * email: atandrastoth@gmail.com
 * Licensed under the MIT license
 */
(function(undefined) {
    var scannerLaser = $(".scanner-laser"),
        play = $("#play"),
        scannedImg = $("#scanned-img"),
        scannedQR = $("#scanned-QR"),
        grabImg = $("#grab-img"),
        pause = $("#pause"),
        stop = $("#stop"),
        contrast = $("#contrast"),
        contrastValue = $("#contrast-value"),
        zoom = $("#zoom"),
        zoomValue = $("#zoom-value"),
        brightness = $("#brightness"),
        brightnessValue = $("#brightness-value"),
        threshold = $("#threshold"),
        thresholdValue = $("#threshold-value"),
        sharpness = $("#sharpness"),
        sharpnessValue = $("#sharpness-value"),
        grayscale = $("#grayscale"),
        grayscaleValue = $("#grayscale-value");
    var args = {
        autoBrightnessValue: 100,
        resultFunction: function(text, imgSrc) {
            [].forEach.call(scannerLaser, function(el) {
                $(el).fadeOut(300, function() {
                    $(el).fadeIn(300);
                });
            });
            scannedImg.attr('src', imgSrc);
            scannedQR.text(text);
        },
        getDevicesError: function(error) {
            var p, message = "Error detected with the following parameters:\n";
            for (p in error) {
                message += (p + ": " + error[p] + "\n");
            }
            alert(message);
        },
        getUserMediaError: function(error) {
            var p, message = "Error detected with the following parameters:\n";
            for (p in error) {
                message += (p + ": " + error[p] + "\n");
            }
            alert(message);
        },
        cameraError: function(error) {
            var p, message = "Error detected with the following parameters:\n";
            for (p in error) {
                message += (p + ": " + error[p] + "\n");
            }
            alert(message);
        },
        cameraSuccess: function() {
            grabImg.removeClass("disabled");
        }
    };
    var decoder = $("#webcodecam-canvas").WebCodeCamJQuery(args).data().plugin_WebCodeCamJQuery;
    decoder.buildSelectMenu("#camera-select");
    play.on("click", function() {
        scannedQR.text("Scanning ...");
        grabImg.removeClass("disabled");
        decoder.play();
    });
    grabImg.on("click", function() {
        scannedImg.attr("src", decoder.getLastImageSrc());
    });
    pause.on("click", function(event) {
        scannedQR.text("Paused");
        decoder.pause();
    });
    stop.on("click", function(event) {
        grabImg.addClass("disabled");
        scannedQR.text("Stopped");
        decoder.stop();
    });
    Page.changeZoom = function(a) {
        if (decoder.isInitialized()) {
            var value = typeof a !== "undefined" ? parseFloat(a.toPrecision(2)) : zoom.val() / 10;
            zoomValue.text(zoomValue.text().split(":")[0] + ": " + value.toString());
            decoder.options.zoom = value;
            if (typeof a != "undefined") {
                zoom.val(a * 10);
            }
        }
    };
    Page.changeContrast = function() {
        if (decoder.isInitialized()) {
            var value = contrast.val();
            contrastValue.text(contrastValue.text().split(":")[0] + ": " + value.toString());
            decoder.options.contrast = parseFloat(value);
        }
    };
    Page.changeBrightness = function() {
        if (decoder.isInitialized()) {
            var value = brightness.val();
            brightnessValue.text(brightnessValue.text().split(":")[0] + ": " + value.toString());
            decoder.options.brightness = parseFloat(value);
        }
    };
    Page.changeThreshold = function() {
        if (decoder.isInitialized()) {
            var value = threshold.val();
            thresholdValue.text(thresholdValue.text().split(":")[0] + ": " + value.toString());
            decoder.options.threshold = parseFloat(value);
        }
    };
    Page.changeSharpness = function() {
        if (decoder.isInitialized()) {
            var value = sharpness.prop("checked");
            if (value) {
                sharpnessValue.text(sharpnessValue.text().split(":")[0] + ": on");
                decoder.options.sharpness = [0, -1, 0, -1, 5, -1, 0, -1, 0];
            } else {
                sharpnessValue.text(sharpnessValue.text().split(":")[0] + ": off");
                decoder.options.sharpness = [];
            }
        }
    };
    Page.changeGrayscale = function() {
        if (decoder.isInitialized()) {
            var value = grayscale.prop("checked");
            if (value) {
                grayscaleValue.text(grayscaleValue.text().split(":")[0] + ": on");
                decoder.options.grayScale = true;
            } else {
                grayscaleValue.text(grayscaleValue.text().split(":")[0] + ": off");
                decoder.options.grayScale = false;
            }
        }
    };
    var getZomm = setInterval(function() {
        var a;
        try {
            a = decoder.getOptimalZoom();
        } catch (e) {
            a = 0;
        }
        if (!!a && a !== 0) {
            Page.changeZoom(a);
            clearInterval(getZomm);
        }
    }, 500);
    $('#camera-select').on('change', function() {
        if (decoder.isInitialized()) {
            decoder.stop().play();
        }
    });
}).call(window.Page = window.Page || {});