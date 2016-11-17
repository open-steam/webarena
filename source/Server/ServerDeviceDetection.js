/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author R.Balaji, University of Paderborn, 2016
 *
 *    The ServerDeviceDetection class contains methods to perform server side detection techniques. It also includes the methods for finalizing the formfactor as well as assigning the final device classes.
 */
"use strict";

var Modules = false;
var async = require('async');

var ServerDeviceDetection = {};

ServerDeviceDetection.init = function (theModules) {
    Modules = theModules;
    var Dispatcher = Modules.Dispatcher;
}


/**
 *    Server Side Detection of user agent string.
 **/
ServerDeviceDetection.UserAgentParsing = function (userAgent) {

    console.log("   User agent string-  "+userAgent);

    if ((/iphone|ipod/gi.test(userAgent))) {
        console.log("Apple");
        ServerDeviceDetection.DeviceClass = "Smartphone";
        ServerDeviceDetection.KT = "V";
        ServerDeviceDetection.name = "Apple";
        ServerDeviceDetection.CVS = 2;
        ServerDeviceDetection.AS = 2;
    }
    else if ((/blackberry/gi.test(userAgent))) {
        console.log("BlackBerry");
        ServerDeviceDetection.FF = "Smartphone";
        ServerDeviceDetection.KT = "HW"; //"Hardware (HW)" == "OB- On-Board"
    }
    else if ((/iPad/gi.test(userAgent))) {
        //Tablet done ahead since Apple tablets might match 'Mobi' keyword.
        console.log("Tablet");
        ServerDeviceDetection.FF = "Tablet";
        ServerDeviceDetection.KT = "V";
        ServerDeviceDetection.name = "Apple";
        ServerDeviceDetection.CVS = 2;
        ServerDeviceDetection.AS = 2;
     }
    else if ((/mobi/gi.test(userAgent))) {
        console.log("Mobi");
        ServerDeviceDetection.FF = "Smartphone";
        ServerDeviceDetection.KT = "V";
    }
    else if ((/tablet|android|xoom|playbook|tablet|silk/gi.test(userAgent))) {
        //Tablet done ahead since Apple tablets might match 'Mobi' keyword.
        console.log("Tablet");
        ServerDeviceDetection.FF = "Tablet";
        ServerDeviceDetection.KT = "V";
    }
    else if ((/smarttv/gi.test(userAgent))) {
        console.log("Smarttv");
        ServerDeviceDetection.FF = "Smarttv";
        ServerDeviceDetection.KT = "V";
    }
    else {
        console.log("Desktop");
        ServerDeviceDetection.FF = "Desktop";
        ServerDeviceDetection.KT = "HW"; //"Hardware (HW)" == "OB- On-Board"
    }

    return ServerDeviceDetection;
}


/**
 *    Method to finalize the form factor of the device based on the inputs from the detections performed in both server side and client side.
 **/
ServerDeviceDetection.FinalizeFormFactor=function(ServersideFF,ClientsideFF){
    //normally v vil use own own DDR and UAProf too...but if server not match, we accept wurfl.io's decision.

    var finalFF={};
    if(ServersideFF==ClientsideFF)
    {
        console.log(" both detection matched in the FF parameter");
        finalFF=ServersideFF;
    }
    else {
        console.log(" both detection did not match the FF paraameter...overriding with the client side detected FF value");
        finalFF=ClientsideFF;
    }

    return finalFF;
}

/**
 *    Method to finalize the deviceClass of the devices based on the inputs from the detections performed in both server side and client side.
 **/
ServerDeviceDetection.FinalizeDeviceClass = function (finalFormFactor, deviceCapabilities) {

 var deviceClass = {};
 switch (finalFormFactor) {

     case "Smartphone":
         var deviceClassSmartphone = {DN: "M", TS: true, CVS: 2, AS: 2, KT: "V", SP: {min: 320, max: 640}, SI: 7};

         //Check Priority 1 parameters
         if ((deviceClassSmartphone.DN == deviceCapabilities.DN) && (deviceCapabilities.TS === true)) {
             deviceClass = "Smartphone";
             break;
         } //Check Priority 2 parameters
         else if ((deviceClassSmartphone.CVS == deviceCapabilities.CVS) && (deviceClassSmartphone.AS == deviceCapabilities.AS)) {
             deviceClass = "Smartphone";
             break;
         } //Check Priority 3 parameters
         else if ((deviceClassSmartphone.KT == deviceCapabilities.KT) ||( (deviceCapabilities.SP > deviceClassSmartphone.SP.min) && (deviceCapabilities.SP < deviceClassSmartphone.SP.max) && (deviceCapabilities.SI < deviceClassSmartphone.SI))) {
             deviceClass = "Smartphone";
             break;
         } //Fix deviceClass as Desktop
         else {
         console.log("  default case of the ServerDeviceDetection.FinalizeDeviceClass() case-Smartphone");
         deviceClass = "Desktop";
        }
         break;

 case "Tablet":
     var deviceClassTablet = {DN: "M",TS: true,CVS: 2,AS: 2,KT: "V",SP: {min: 641, max: 1024},SI: {min: 7, max: 11.5}};

     //Check Priority 1 parameters
     if ((deviceClassTablet.DN == deviceCapabilities.DN) && (deviceCapabilities.TS === true)) {
         deviceClass = "Tablet";
         break;
     } //Check Priority 2 parameters
     else if ((deviceClassTablet.CVS == deviceCapabilities.CVS) && (deviceClassTablet.AS == deviceCapabilities.AS)) {
         deviceClass = "Tablet";
         break;
     } //Check Priority 3 parameters
     else if ((deviceClassTablet.KT == deviceCapabilities.KT) ||( (deviceCapabilities.SP > deviceClassTablet.SP.min) && (deviceCapabilities.SP < deviceClassTablet.SP.max) && (deviceCapabilities.SI > deviceClassTablet.SI.min) && (deviceCapabilities.SI < deviceClassTablet.SI.max))) {
         deviceClass = "Tablet";
         break;
     } //Fix deviceClass as Desktop
     else {
         console.log("  default case of the ServerDeviceDetection.FinalizeDeviceClass() case-Tablet");
         deviceClass = "Desktop";
     }
     break;

 case "Smarttv":
         var deviceClassSmarttv = {DN: "S",TS: false,CVS: 1,AS: 1,KT: "V",SP:{min: 1921},SI: {min: 11.6}};

         //Check Priority 1 parameters
         if ((deviceClassSmarttv.DN == deviceCapabilities.DN) && (deviceCapabilities.TS === false )) {
             deviceClass = "Smarttv";
             break;
         } //Check Priority 2 parameters
         else if ((deviceClassSmarttv.CVS == deviceCapabilities.CVS) && (deviceClassSmarttv.AS == deviceCapabilities.AS)) {
             deviceClass = "Smarttv";
             break;
         } //Check Priority 3 parameters
         else if ((deviceClassSmarttv.KT == deviceCapabilities.KT) ||( (deviceCapabilities.SP > deviceClassSmarttv.SP.min) && (deviceCapabilities.SI > deviceClassSmarttv.SI.min))) {
             deviceClass = "Smarttv";
             break;
         } //Fix deviceClass as Desktop
         else {
             console.log("  default case of the ServerDeviceDetection.FinalizeDeviceClass() case-Smarttv");
             deviceClass = "Desktop";
         }
         break;

     case "Desktop":
     //Can be Desktop or Laptop deviceClass.
     //Apple Desktops and laptops will both be classified as Desktop as , Macbooks dont support WebRTC.

     if ((deviceCapabilities.CVS > 0) || (deviceCapabilities.AS > 0) ) {
         deviceClass = "Laptop";
     }
     else {
         console.log("  default case of the ServerDeviceDetection.FinalizeDeviceClass() case-Desktop");
         deviceClass = "Desktop";
     }
     break;

     default:
         deviceClass= "Desktop";
         break;
 }

 return deviceClass;
 }

module.exports = ServerDeviceDetection;