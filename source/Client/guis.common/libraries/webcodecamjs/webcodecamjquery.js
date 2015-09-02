/*!
 * WebCodeCamJQuery 1.7.0 jQuery plugin Bar code and QR code decoder 
 * Author: Tóth András
 * Web: http://atandrastoth.co.uk
 * email: atandrastoth@gmail.com
 * Licensed under the MIT license
 */
;
(function($, window, document, undefined) {
    'use strict';
    var pluginName = 'WebCodeCamJQuery';
    var mediaDevices = navigator.mediaDevices || ((navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
        getUserMedia: function(c) {
            return new Promise(function(y, n) {
                (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(navigator, c, y, n);
            });
        },
        enumerateDevices: function(c) {
            return new Promise(function(c, y, n) {
                (MediaStreamTrack.getSources).call(navigator, c, y, n);
            });
        }
    } : null);
    HTMLVideoElement.prototype.streamSrc = ('srcObject' in HTMLVideoElement.prototype) ? function(stream) {
        this.srcObject = !!stream ? stream : null;
    } : function(stream) {
        this.src = !!stream ? (window.URL || window.webkitURL).createObjectURL(stream) : new String();
    };
    var Self, display, videoSelect, lastImageSrc, con, beepSound, w, h,
        DecodeWorker = new Worker('/guis.common/libraries/webcodecamjs/DecoderWorker.js'),
        video = $('<video muted autoplay></video>')[0],
        flipped = false,
        isStreaming = false,
        delayBool = false,
        initialized = false,
        localStream = null,
        defaults = {
            decodeQRCodeRate: 5,
            decodeBarCodeRate: 5,
            frameRate: 15,
            width: 320,
            height: 240,
            constraints: {
                video: {
                    mandatory: {
                        maxWidth: 1280,
                        maxHeight: 720
                    },
                    optional: [{
                        sourceId: true
                    }]
                },
                audio: false
            },
            flipVertical: false,
            flipHorizontal: false,
            zoom: -1,
            beep: 'audio/beep.mp3',
            brightness: 0,
            autoBrightnessValue: false,
            grayScale: false,
            contrast: 0,
            threshold: 0,
            sharpness: [],
            resultFunction: function(resText, lastImageSrc) {
                console.log(resText);
            },
            cameraSuccess: function(stream) {
                console.log('cameraSuccess');
            },
            canPlayFunction: function() {
                console.log('canPlayFunction');
            },
            getDevicesError: function(error) {
                console.log(error);
            },
            getUserMediaError: function(error) {
                console.log(error);
            },
            cameraError: function(error) {
                console.log(error);
            }
        };

    function Plugin(element, options) {
        Self = this;
        this.element = element;
        display = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        return this;
    }

    function init() {
        con = display.getContext('2d');
        w = Self.options.width;
        h = Self.options.height;
        var constraints = changeConstraints();
        try {
            mediaDevices.getUserMedia(constraints).then(cameraSuccess).catch(function(error) {
                Self.options.cameraError(error);
                return false;
            });
        } catch (error) {
            Self.options.getUserMediaError(error);
            return false;
        }
        return true;
    }

    function play() {
        if (!localStream) {
            init();
        }
        delayBool = true;
        video.play();
        setTimeout(function() {
            delayBool = false;
            if (Self.options.decodeBarCodeRate) {
                tryParseBarCode();
            }
            if (Self.options.decodeQRCodeRate) {
                tryParseQRCode();
            }
        }, 2E3);
    }

    function stop() {
        con.clearRect(0, 0, w, h);
        delayBool = true;
        video.pause();
        video.streamSrc(null);
        try {
            localStream.stop();
        } catch (e) {
            localStream.active = false;
            localStream.enabled = false;
        }
        localStream = null;
    }

    function pause() {
        delayBool = true;
        video.pause();
    }

    function cameraSuccess(stream) {
        localStream = stream;
        video.streamSrc(stream);
        video.play();
        Self.options.cameraSuccess(stream);
    }

    function cameraError(error) {
        Self.options.cameraError(error);
    }

    function setEventListeners() {
        $(video).on('canplay', function(e) {
            if (!isStreaming) {
                if (video.videoWidth > 0) {
                    h = video.videoHeight / (video.videoWidth / w);
                }
                $(display).attr('width', w);
                $(display).attr('height', h);
                if (Self.options.flipHorizontal) {
                    con.scale(-1, 1);
                    con.translate(-w, 0);
                }
                if (Self.options.flipVertical) {
                    con.scale(1, -1);
                    con.translate(0, -h);
                }
                isStreaming = true;
                if (Self.options.decodeQRCodeRate || Self.options.decodeBarCodeRate) {
                    delay();
                }
            }
        });
        $(video).on('play', function() {
            setInterval(function() {
                if (video.paused || video.ended) {
                    return;
                }
                var z = Self.options.zoom;
                if (z < 0) {
                    z = optimalZoom();
                }
                con.drawImage(video, (w * z - w) / -2, (h * z - h) / -2, w * z, h * z);
                var imageData = con.getImageData(0, 0, w, h);
                if (Self.options.grayScale) {
                    imageData = grayScale(imageData);
                }
                if (Self.options.brightness !== 0 || Self.options.autoBrightnessValue) {
                    imageData = brightness(imageData, Self.options.brightness);
                }
                if (Self.options.contrast !== 0) {
                    imageData = contrast(imageData, Self.options.contrast);
                }
                if (Self.options.threshold !== 0) {
                    imageData = threshold(imageData, Self.options.threshold);
                }
                if (Self.options.sharpness.length !== 0) {
                    imageData = convolute(imageData, Self.options.sharpness);
                }
                con.putImageData(imageData, 0, 0);
            }, 1E3 / Self.options.frameRate);
        });
    }

    function setCallBack() {
        DecodeWorker.onmessage = function(e) {
            if (delayBool || video.paused) {
                return;
            }
            if (e.data.success && e.data.result[0].length > 1 && e.data.result[0].indexOf('undefined') == -1) {
                beepSound.play();
                delayBool = true;
                delay();
                setTimeout(function() {
                    Self.options.resultFunction(e.data.result[0], lastImageSrc);
                }, 0);
            } else {
                if (e.data.finished && Self.options.decodeBarCodeRate) {
                    flipped = !flipped;
                    setTimeout(tryParseBarCode, 1E3 / Self.options.decodeBarCodeRate);
                }
            }
        };
        qrcode.callback = function(a) {
            if (delayBool || video.paused) {
                return;
            }
            beepSound.play();
            delayBool = true;
            delay();
            setTimeout(function() {
                Self.options.resultFunction(a, lastImageSrc);
            }, 0);
        };
    }

    function tryParseBarCode() {
        var flipMode = flipped === true ? 'flip' : 'normal';
        lastImageSrc = display.toDataURL();
        DecodeWorker.postMessage({
            ImageData: con.getImageData(0, 0, w, h).data,
            Width: w,
            Height: h,
            cmd: flipMode,
            DecodeNr: 1,
            LowLight: false
        });
    }

    function tryParseQRCode() {
        try {
            lastImageSrc = display.toDataURL();
            qrcode.decode();
        } catch (e) {
            if (!delayBool) {
                setTimeout(tryParseQRCode, 1E3 / Self.options.decodeQRCodeRate);
            }
        }
    }

    function delay() {
        setTimeout(play, 500, true);
    }

    function optimalZoom() {
        return video.videoHeight / h;
    }

    function getImageLightness() {
        var pixels = con.getImageData(0, 0, w, h),
            d = pixels.data,
            colorSum = 0,
            r, g, b, avg;
        for (var x = 0, len = d.length; x < len; x += 4) {
            r = d[x];
            g = d[x + 1];
            b = d[x + 2];
            avg = Math.floor((r + g + b) / 3);
            colorSum += avg;
        }
        return Math.floor(colorSum / (w * h));
    }

    function brightness(pixels, adjustment) {
        adjustment = adjustment === 0 && Self.options.autoBrightnessValue ? Self.options.autoBrightnessValue - getImageLightness() : adjustment;
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            d[i] += adjustment;
            d[i + 1] += adjustment;
            d[i + 2] += adjustment;
        }
        return pixels;
    }

    function grayScale(pixels) {
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i],
                g = d[i + 1],
                b = d[i + 2],
                v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            d[i] = d[i + 1] = d[i + 2] = v;
        }
        return pixels;
    }

    function contrast(pixels, cont) {
        var d = pixels.data,
            average;
        for (var i = 0; i < d.length; i += 4) {
            cont = 10,
                average = Math.round((d[i] + d[i + 1] + d[i + 2]) / 3);
            if (average > 127) {
                d[i] += d[i] / average * cont;
                d[i + 1] += d[i + 1] / average * cont;
                d[i + 2] += d[i + 2] / average * cont;
            } else {
                d[i] -= d[i] / average * cont;
                d[i + 1] -= d[i + 1] / average * cont;
                d[i + 2] -= d[i + 2] / average * cont;
            }
        }
        return pixels;
    }

    function threshold(pixels, thres) {
        var average, d = pixels.data;
        for (var i = 0, len = w * h * 4; i < len; i += 4) {
            average = d[i] + d[i + 1] + d[i + 2];
            if (average < thres) {
                d[i] = d[i + 1] = d[i + 2] = 0;
            } else {
                d[i] = d[i + 1] = d[i + 2] = 255;
            }
            d[i + 3] = 255;
        }
        return pixels;
    }

    function convolute(pixels, weights, opaque) {
        var sw = pixels.width,
            sh = pixels.height,
            w = sw,
            h = sh,
            side = Math.round(Math.sqrt(weights.length)),
            halfSide = Math.floor(side / 2),
            src = pixels.data,
            tmpCanvas = document.createElement('canvas'),
            tmpCtx = tmpCanvas.getContext('2d'),
            output = tmpCtx.createImageData(w, h),
            dst = output.data,
            alphaFac = opaque ? 1 : 0;
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var sy = y,
                    sx = x,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0,
                    dstOff = (y * w + x) * 4;
                for (var cy = 0; cy < side; cy++) {
                    for (var cx = 0; cx < side; cx++) {
                        var scy = sy + cy - halfSide,
                            scx = sx + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            var srcOff = (scy * sw + scx) * 4,
                                wt = weights[cy * side + cx];
                            r += src[srcOff] * wt;
                            g += src[srcOff + 1] * wt;
                            b += src[srcOff + 2] * wt;
                            a += src[srcOff + 3] * wt;
                        }
                    }
                }
                dst[dstOff] = r;
                dst[dstOff + 1] = g;
                dst[dstOff + 2] = b;
                dst[dstOff + 3] = a + alphaFac * (255 - a);
            }
        }
        return output;
    }

    function buildSelectMenu(selectorVideo) {
        videoSelect = $(selectorVideo);
        videoSelect.html('');
        try {
            if (mediaDevices && mediaDevices.enumerateDevices) {
                mediaDevices.enumerateDevices().then(function(devices) {
                    devices.forEach(function(device) {
                        gotSources(device);
                    });
                    videoSelect.children('option:first').prop('selected', true);
                }).catch(function(error) {
                    Self.options.getDevicesError(error);
                });
            } else if (mediaDevices && !mediaDevices.enumerateDevices) {
                $('<option value="true">On</option>').appendTo(videoSelect);
                Self.options.getDevicesError(new NotSupportError('enumerateDevices Or getSources is Not supported'));
            } else {
                throw new NotSupportError('getUserMedia is Not supported');
            }
        } catch (error) {
            Self.options.getDevicesError(error);
        }
    }

    function gotSources(device) {
        if (device.kind === 'video' || device.kind === 'videoinput') {
            var face = (!device.facing || device.facing === '') ? 'unknown' : device.facing;
            var text = device.label || 'Camera '.concat(videoSelect.children().length + 1, ' (facing: ' + face + ')');
            $('<option value="' + (device.id || device.deviceId) + '">' + text + '</option>').appendTo(videoSelect);
        }
    }

    function changeConstraints() {
        var constraints = $.parseJSON(JSON.stringify(Self.options.constraints));
        if (videoSelect && videoSelect.children().length !== 0) {
            switch (videoSelect.val().toString()) {
                case 'true':
                    constraints.video.optional = [{
                        sourceId: true
                    }];
                    break;
                case 'false':
                    constraints.video = false;
                    break;
                default:
                    constraints.video.optional = [{
                        sourceId: videoSelect.val()
                    }];
                    break;
            }
        }
        constraints.audio = false;
        return constraints;
    }

    function NotSupportError(message) {
        this.name = 'NotSupportError';
        this.message = (message || '');
    }
    NotSupportError.prototype = Error.prototype;
    $.extend(Plugin.prototype, {
        init: function() {
            if (!initialized) {
                if (!display || display.tagName.toLowerCase() !== 'canvas') {
                    console.log('Element type must be canvas!');
                    alert('Element type must be canvas!');
                    return false;
                }
                qrcode.sourceCanvas = display;
                initialized = true;
                setEventListeners();
                if (this.options.decodeQRCodeRate || this.options.decodeBarCodeRate) {
                    setCallBack();
                }
                beepSound = new Audio(this.options.beep);
            }
            return this;
        },
        play: function() {
            this.init();
            play();
            return this;
        },
        stop: function() {
            stop();
            return this;
        },
        pause: function() {
            pause();
            return this;
        },
        buildSelectMenu: function(selector) {
            buildSelectMenu(selector);
            return this;
        },
        getOptimalZoom: function() {
            return optimalZoom();
        },
        getLastImageSrc: function() {
            return display.toDataURL();
        },
        isInitialized: function() {
            return initialized;
        }
    });
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    }
})(jQuery, window, document);