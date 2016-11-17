/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author R.Balaji, University of Paderborn, 2016
 *
 *    The client side detection class description and object creation.
 */


"use strict";

/**
 * Object encapsulating the client side detected device properties.
 */
var ClientDeviceDetection = {};


localStorage.clear();  ///CHANGE THIS DURING LIVE TEST--------------CHECK THIS AND UPDATE

//Checks if current device capabilities were previously detected and stored for quick reference as local storage.
if (localStorage["DeviceIdentified"]) {

    var DeviceDataRetrieved = localStorage.getItem('DeviceIdentified');

    //DeviceDetails.name=JSON.parse(DeviceDataRetrieved.name);
    //DeviceDetails.formfactor=JSON.parse(DeviceDataRetrieved.form_factor);
    ClientDeviceDetection=JSON.parse(DeviceDataRetrieved);
    ClientDeviceDetection.isRetrieved=true;
//--------CHECK THIS AND UPDATE
    alert("retrieved device details"+DeviceDetails.name+DeviceDetails.formfactor+DeviceDetails.ismobile+DeviceDetails.istouch);
}
else {
    //Set up a flag to perform both client and server side device capabilities detection.
    ClientDeviceDetection.isRetrieved=false;
   
    //Check to determine if device supports touch events and thus determine the  'TS-Touch Screen' parameter.
    ClientDeviceDetection.TS =!!('ontouchstart' in window || (navigator.msMaxTouchPoints>1) || (navigator.MaxTouchPoints>1)   );

}