/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author R.Balaji, University of Paderborn, 2016
 *
 *    The DeviceDecision class recommends the best choice amongst user's  currently logged-in devices based on the device capabilities and device class priorities, for the requested task on the current object.
 */

"use strict";

var Modules = false;
var async = require('async');

var DeviceDecision = {};

DeviceDecision.init = function (theModules) {
    Modules = theModules;
    var Dispatcher = Modules.Dispatcher;
}

/**
 *    This method realizes the assignment rules, priority assignment tables and the tie-breaking mechanisms for selecting the best capable device (for the object action) currently under the pocession of the user.
 **/
DeviceDecision.recommendedDevice = function (contextPassed, sourceDeviceContexts, callback) {

    console.log("DeviceDecision---evaluating object action---" + sourceDeviceContexts.action);
    var connections = Modules.UserManager.getConnections();
    var isRecommend = false;
    //Variable to count the concurrently logged in devices of the user.
    var devicesCurrentlyLoggedInCount = 0;

    //Variable to hold device details of concurrent logins of the user.
    var DevicesCurrentlyLoggedIn = {};
    DevicesCurrentlyLoggedIn.details = new Array();
    var startDevice={};


    for (var i in connections) {
        var data = connections[i];

        if (!connections[i].user.username) continue;

        if (connections[i].user.username == contextPassed.user.username) {
            //Concurrently logged in device details
            console.log(connections[i].user.username);
            console.log(JSON.stringify(connections[i].device));
            DevicesCurrentlyLoggedIn.details[devicesCurrentlyLoggedInCount] = connections[i].device;
            DevicesCurrentlyLoggedIn.details[devicesCurrentlyLoggedInCount].deviceClassPriority = 0;

            //To identify the source device which initiated the object action in the first place.
            if ((connections[i].device.deviceClass == contextPassed.device.deviceClass) && (connections[i].device.name == contextPassed.device.name )) {
                console.log("Object action Start device details -.name-" + connections[i].device.name);
                startDevice.deviceClass=connections[i].device.deviceClass;
                startDevice.name=connections[i].device.name;
            }

            devicesCurrentlyLoggedInCount++;
        }

    }

    switch (sourceDeviceContexts.action) {

        case "EditText":

            console.log(" Processing device assignment evaluation for the action--EditText");

            //Variables for lower priority devices and invalid devices.
            var lowerPriority = 2000;
            var incapabilityPriority=3000;


            console.log(" Initial order of devices with current user logged in---");
            for (var initialOrder = 0; initialOrder < devicesCurrentlyLoggedInCount; initialOrder++) {
                console.log("  DevicesCurrentlyLoggedIn.details array values----" + JSON.stringify(DevicesCurrentlyLoggedIn.details[initialOrder]));
            }

            //Tie Breaking Property in question---deviceKeyboardType
            //Reorder  DevicesCurrentlyLoggedIn based on Laptop > Desktop > Tablet > SmartPhone > Smarttv

            //Assign new property---priority ---1 to x   where 1>>x
            for (var deviceRef = 0; deviceRef < devicesCurrentlyLoggedInCount; deviceRef++) {
                var temporaryDeviceObject = JSON.parse(JSON.stringify(DevicesCurrentlyLoggedIn.details[deviceRef]));


                switch (temporaryDeviceObject.deviceClass) {

                    case "Laptop":
                        if (DevicesCurrentlyLoggedIn.details[deviceRef].KT == "HW") {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = 1;

                        }
                        else {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = lowerPriority;
                            lowerPriority++;
                        }
                        break;
                    case "Desktop":
                        if (DevicesCurrentlyLoggedIn.details[deviceRef].KT == "HW") {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = 2;

                        }
                        else {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = lowerPriority;
                            lowerPriority++;
                        }
                        break;
                    case "Tablet":
                        if (DevicesCurrentlyLoggedIn.details[deviceRef].KT == "HW") {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = 3;

                        }
                        else {
                            //lower priority
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = lowerPriority;
                            lowerPriority++;
                        }
                        break;
                    case "Smartphone":
                        if (DevicesCurrentlyLoggedIn.details[deviceRef].KT == "HW") {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = 4;
                        }
                        else {
                            //lower priority
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = lowerPriority;
                            lowerPriority++;
                        }
                        break;
                    case "Smarttv":
                        if (DevicesCurrentlyLoggedIn.details[deviceRef].KT == "HW") {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = 5;

                        }
                        else {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = lowerPriority;
                            lowerPriority++;
                        }
                        break;
                }

                //Check for devices totally incapable of the action
                if (DevicesCurrentlyLoggedIn.details[deviceRef].KT == null) {
                    DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = incapabilityPriority;
                    incapabilityPriority++;
                }

            }

            //sort 'DevicesCurrentlyLoggedIn' based on 'deviceClassPriority' to reorder 'DevicesCurrentlyLoggedIn' based on the device assignment rules.
            DevicesCurrentlyLoggedIn.details.sort(function (device1,device2) {
                return parseFloat((device1.deviceClassPriority) - parseFloat(device2.deviceClassPriority));
            });


            console.log(" Device priority order after priority assignment process and sorting---");
            for (var finalOrder = 0; finalOrder < devicesCurrentlyLoggedInCount; finalOrder++) {
                console.log("  DevicesCurrentlyLoggedIn.details array values----" + JSON.stringify(DevicesCurrentlyLoggedIn.details[finalOrder]));
            }

            //Now check if current device itself is best option or if recommendations need to be made
            var priorityOneDeviceClass = DevicesCurrentlyLoggedIn.details[0].deviceClass;
            var priorityOneDeviceName = DevicesCurrentlyLoggedIn.details[0].name;
            if ( (priorityOneDeviceClass !== contextPassed.device.deviceClass) && (priorityOneDeviceName !== contextPassed.device.name)) {
                console.log("Current device is not best option.");
                isRecommend = true;
            }
            else {
                //Raise event to continue action in current device.
                for (var i in connections) {
                    if ((connections[i].device.deviceClass == contextPassed.device.deviceClass) && (connections[i].device.name == contextPassed.device.name )) {

                        var SocketServer = Modules.SocketServer;
                        console.log("Current device is the best for the required object action.");
                        SocketServer.sendToSocket(connections[i].socket, 'UseCurrentDevice',
                            {
                                'Device': DevicesCurrentlyLoggedIn.details[0],
                                'roomID': sourceDeviceContexts.roomID,
                                'objectID': sourceDeviceContexts.objectID,
                                'actionName': sourceDeviceContexts.action
                            });
                    }
                }
            }

            if (isRecommend) {
                //Raise events to shift current device.
                console.log(" Change to device --  " + DevicesCurrentlyLoggedIn.details[0].deviceClass);

                for (var i in connections) {
                    if ((connections[i].device.deviceClass == contextPassed.device.deviceClass) && (connections[i].device.name == contextPassed.device.name )) {
                        if ((contextPassed.device.CVS == null) || (contextPassed.device.deviceClass == "Desktop")) {
                            //Case 8 -Start device is not suited---must shift.
                            console.log("Triggering device control shift request socketevent--CASE 8");

                            var SocketServer = Modules.SocketServer;
                            SocketServer.sendToSocket(connections[i].socket, 'Case8DeviceIncapability',
                                {
                                    'CurrentDeviceName': connections[i].device.name,
                                    'CurrentDeviceDeviceClass': connections[i].device.deviceClass,
                                    'Reason': "Base Device Incapable",
                                    'actionName':sourceDeviceContexts.action,
                                    'sourceDevice':startDevice
                                });

                        }


                        console.log("Triggering device control shift request socketevent");
                        var SocketServer = Modules.SocketServer;
                        SocketServer.sendToSocket(connections[i].socket, 'RequestSwitchRecommendation',
                            {
                                'Device': DevicesCurrentlyLoggedIn.details[0],
                                'roomID': sourceDeviceContexts.roomID,
                                'objectID': sourceDeviceContexts.objectID,
                                'actionName':sourceDeviceContexts.action,
                                'sourceDevice':startDevice

                            });
                    }
                }
            }
            break;


        case "Make Selfie":

            console.log(" Processing device assignment evaluation for the action--Make Selfie");

            //Variables for invalid devices.
             var incapabilityPriority=3000;

            if ((devicesCurrentlyLoggedInCount == 1) && (!(contextPassed.device.deviceClass == "Smartphone")) && (!(contextPassed.device.deviceClass == "Tablet")) && (!(contextPassed.device.deviceClass == "Laptop")) && (!(contextPassed.device.deviceClass == "Smarttv"))) {
                //Case 7 -Start device is not suited and no other devices present of current user. Action cant be performed.
                console.log("Triggering socketevent--CASE 7");
                var deviceClassRequired = new Array("Smartphone", "Tablet", "Laptop", "Smarttv");
                var SocketServer = Modules.SocketServer;
                SocketServer.sendToSocket(connections[i].socket, 'Case7DeviceIncapability',
                    {
                        'CurrentDevice': DevicesCurrentlyLoggedIn.details[0],
                        'DeviceClassList': deviceClassRequired
                    });
                break;
            }

            console.log(" Initial order of devices with current user logged in---");
            for (var initialOrder = 0; initialOrder < devicesCurrentlyLoggedInCount; initialOrder++) {
                console.log("  DevicesCurrentlyLoggedIn.details array values----" + JSON.stringify(DevicesCurrentlyLoggedIn.details[initialOrder]));
            }

            //TBP-Tie Breaking Property- CVS (Camera/Video Stream count)
            //Reorder  DevicesCurrentlyLoggedIn based on Smartphone> Tablet > Laptop > Smarttv
            //Assign new property---priority ---1 to x   where 1>>x
            for (var deviceRef = 0; deviceRef < devicesCurrentlyLoggedInCount; deviceRef++) {
                var temporaryDeviceObject = JSON.parse(JSON.stringify(DevicesCurrentlyLoggedIn.details[deviceRef]));
                DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = {};

                switch (temporaryDeviceObject.deviceClass) {
                    case "Smartphone":
                        if (DevicesCurrentlyLoggedIn.details[deviceRef].CVS > 1) {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = 1;
                        }
                        else {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = incapabilityPriority;
                            incapabilityPriority++;
                        }
                        break;

                    case "Tablet":
                        if (DevicesCurrentlyLoggedIn.details[deviceRef].CVS > 1) {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = 2;
                        }
                        else {
                            //else discard device
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = incapabilityPriority;
                            incapabilityPriority++;
                        }
                        break;

                    case "Laptop":
                        if (DevicesCurrentlyLoggedIn.details[deviceRef].CVS > 0) {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = 3;

                        }
                        else {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = incapabilityPriority;
                            incapabilityPriority++;
                        }
                        break;
                    case "Desktop":
                        DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = incapabilityPriority;
                        incapabilityPriority++;
                        // console.log(" in tempObj.formfactor switch ----case DESKTOP---priority= "+DevicesCurrentlyLoggedIn.details[a].priority);
                        break;
                    case "Smarttv":
                        if (DevicesCurrentlyLoggedIn.details[deviceRef].CVS > 0) {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = 4;
                        }
                        else {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = incapabilityPriority;
                            incapabilityPriority++;
                        }
                        break;
                }
                //Check for devices totally incapable of the action
                if (DevicesCurrentlyLoggedIn.details[deviceRef].CVS == null) {
                    DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = incapabilityPriority;
                    incapabilityPriority++;
                }
            }

            //sort 'DevicesCurrentlyLoggedIn' based on 'deviceClassPriority' to reorder 'DevicesCurrentlyLoggedIn' based on the device assignment rules.
            DevicesCurrentlyLoggedIn.details.sort(function (device1,device2) {
                return parseFloat((device1.deviceClassPriority) - parseFloat(device2.deviceClassPriority));
            });

            console.log(" After priority and sort of devices---");
            for (var finalOrder = 0; finalOrder < devicesCurrentlyLoggedInCount; finalOrder++) {
                console.log("  DevicesCurrentlyLoggedIn.details array values----" + JSON.stringify(DevicesCurrentlyLoggedIn.details[finalOrder]));
            }

            //Now check if current Device itself is best option or if recommendations need to be made
            var priorityOneDeviceClass = DevicesCurrentlyLoggedIn.details[0].deviceClass;
            var priorityOneDeviceName = DevicesCurrentlyLoggedIn.details[0].name;
            if ( (priorityOneDeviceClass !== contextPassed.device.deviceClass) && (priorityOneDeviceName !== contextPassed.device.name)) {
                console.log("Current device is not the best option");
                isRecommend = true;
            }
            else {
                //Raise events to shift current device.
                for (var i in connections) {
                    if ((connections[i].device.deviceClass == contextPassed.device.deviceClass) && (connections[i].device.name == contextPassed.device.name )) {

                        var SocketServer = Modules.SocketServer;
                        console.log("Current device is the best for the required object action.");
                        SocketServer.sendToSocket(connections[i].socket, 'UseCurrentDevice',
                            {
                                'Device': DevicesCurrentlyLoggedIn.details[0],
                                'roomID': sourceDeviceContexts.roomID,
                                'objectID': sourceDeviceContexts.objectID,
                                'actionName': sourceDeviceContexts.action
                            });
                    }
                }
            }

            if (isRecommend) {
                //Raise events to shift current device.
                console.log(" Change device to --  " + DevicesCurrentlyLoggedIn.details[0].deviceClass);

                for (var i in connections) {
                    if ((connections[i].device.deviceClass = contextPassed.device.deviceClass) && (connections[i].device.name == contextPassed.device.name )) {
                        if ((contextPassed.device.CVS == null) || (contextPassed.device.deviceClass == "Desktop")) {
                            //Case 8 -Start device is not suited---must shift.
                            console.log("Triggering device control shift request socketevent--CASE 8");
                            var SocketServer = Modules.SocketServer;
                            SocketServer.sendToSocket(connections[i].socket, 'Case8DeviceIncapability',
                                {
                                    'CurrentDeviceName': connections[i].device.name,
                                    'CurrentDeviceDeviceClass': connections[i].device.deviceClass,
                                    'Reason': "Base Device Incapable",
                                    'actionName': sourceDeviceContexts.action
                                });

                        }

                        console.log("Triggering device control shift request socketevent");
                        var SocketServer = Modules.SocketServer;
                        SocketServer.sendToSocket(connections[i].socket, 'RequestSwitchRecommendation',
                            {
                                'Device': DevicesCurrentlyLoggedIn.details[0],
                                'roomID': sourceDeviceContexts.roomID,
                                'objectID': sourceDeviceContexts.objectID,
                                'actionName': sourceDeviceContexts.action,
                                'sourceDevice':startDevice

                           });
                    }
                }


            }
            break;


        case "Take Picture":

            console.log("   INSIDE TAKE PICTURE");
            //Variables for invalid devices.
            var incapabilityPriority=3000;

            if ((devicesCurrentlyLoggedInCount == 1) && (!(contextPassed.device.deviceClass == "Smartphone")) && (!(contextPassed.device.deviceClass == "Tablet"))) {
                //Case 7 -Start device is not suited and no other devices present of current user. Action cant be performed.
                console.log("Triggering socketevent--CASE 7");
                var deviceClassRequired = new Array("Smartphone", "Tablet");
                var SocketServer = Modules.SocketServer;
                SocketServer.sendToSocket(connections[i].socket, 'Case7DeviceIncapability',
                    {
                        'CurrentDevice': DevicesCurrentlyLoggedIn.details[0],
                        'DeviceClassList': deviceClassRequired
                    });
                break;
            }

            console.log(" Initial order of devices with current user logged in---");
            for (var initialOrder = 0; initialOrder < devicesCurrentlyLoggedInCount; initialOrder++) {
                console.log("  DevicesCurrentlyLoggedIn.details array values----" + JSON.stringify(DevicesCurrentlyLoggedIn.details[initialOrder]));
            }

            //TBP-Tie Breaking Property- CVS (Camera/Video Stream count)
            //Reorder DevicesCurrentlyLoggedIn based on SmartPhone > Tablet
            //Assign new property---priority ---1 to x   where 1>>x
            for (var deviceRef = 0; deviceRef < devicesCurrentlyLoggedInCount; deviceRef++) {
                var temporaryDeviceObject = JSON.parse(JSON.stringify(DevicesCurrentlyLoggedIn.details[deviceRef]));

                switch (temporaryDeviceObject.deviceClass) {
                    case "Smartphone":
                        if (DevicesCurrentlyLoggedIn.details[deviceRef].CVS >= 1) {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = 1;
                        }
                        else {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = incapabilityPriority;
                            incapabilityPriority++;
                        }
                        break;

                    case "Tablet":
                        if (DevicesCurrentlyLoggedIn.details[deviceRef].CVS >= 1) {
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = 2;
                        }
                        else {
                            //else discard device
                            DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = incapabilityPriority;
                            incapabilityPriority++;
                        }
                        break;
                    case "Laptop":
                        DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = incapabilityPriority;
                        incapabilityPriority++;
                        break;

                    case "Desktop":
                        DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority =  incapabilityPriority;
                        incapabilityPriority++;
                        break;

                    case "Smarttv":
                        DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority =  incapabilityPriority;
                        incapabilityPriority++;
                        break;

                }
                //Check for devices totally incapable of the action.
                if (DevicesCurrentlyLoggedIn.details[deviceRef].CVS == null) {
                    DevicesCurrentlyLoggedIn.details[deviceRef].deviceClassPriority = incapabilityPriority;
                    incapabilityPriority++;
                }
            }

            //sort 'DevicesCurrentlyLoggedIn' based on 'deviceClassPriority' to reorder 'DevicesCurrentlyLoggedIn' based on the device assignment rules.
            DevicesCurrentlyLoggedIn.details.sort(function (device1, device2) {
                return parseFloat((device1.deviceClassPriority) - parseFloat(device2.deviceClassPriority));
            });


            console.log(" After priority and sort of devices---");
            for (var finalOrder  = 0; finalOrder  < devicesCurrentlyLoggedInCount; finalOrder ++) {
                console.log("  DevicesCurrentlyLoggedIn.details array values----" + JSON.stringify(DevicesCurrentlyLoggedIn.details[finalOrder]));
            }

            //Now check if current Device itself is best option or if recommendations need to be made
            var priorityOneDeviceClass = DevicesCurrentlyLoggedIn.details[0].deviceClass;
            var priorityOneDeviceName = DevicesCurrentlyLoggedIn.details[0].name;
            if ( (priorityOneDeviceClass !== contextPassed.device.deviceClass) && (priorityOneDeviceName !== contextPassed.device.name)) {
                console.log("Current device is not the best option");
                isRecommend = true;
            }
            else {

                for (var i in connections) {
                    if ((connections[i].device.deviceClass == contextPassed.device.deviceClass) && (connections[i].device.name == contextPassed.device.name )) {

                        var SocketServer = Modules.SocketServer;
                        console.log("Current device is the best for the required object action.");
                        SocketServer.sendToSocket(connections[i].socket, 'UseCurrentDevice',
                            {
                                'Device': DevicesCurrentlyLoggedIn.details[0],
                                'roomID': sourceDeviceContexts.roomID,
                                'objectID': sourceDeviceContexts.objectID,
                                'actionName': sourceDeviceContexts.action
                            });
                    }
                }
            }

            if (isRecommend) {
                //Raise events to shift current device.
                console.log(" Change device to --  " + DevicesCurrentlyLoggedIn.details[0].deviceClass);

                for (var i in connections) {
                    if ((connections[i].device.deviceClass == contextPassed.device.deviceClass) && (connections[i].device.name == contextPassed.device.name )) {
                        if ((contextPassed.device.CVS == null) || ( (contextPassed.device.CVS == 1) && ( (contextPassed.device.deviceClass == "Laptop") || (contextPassed.device.deviceClass == "Smarttv")) )) {
                            //Case 8 -Start device is not suited---must shift.
                            console.log("Triggering device control shift request socketevent--CASE 8");
                            var SocketServer = Modules.SocketServer;
                            SocketServer.sendToSocket(connections[i].socket, 'Case8DeviceIncapability',
                                {
                                    'CurrentDeviceName': connections[i].device.name,
                                    'CurrentDeviceDeviceClass': connections[i].device.deviceClass,
                                    'Reason': "Base Device Incapable",
                                    'actionName':sourceDeviceContexts.action
                                });

                        }

                        console.log("Triggering device control shift request socketevent");
                        var SocketServer = Modules.SocketServer;
                        SocketServer.sendToSocket(connections[i].socket, 'RequestSwitchRecommendation',
                            {
                                'Device': DevicesCurrentlyLoggedIn.details[0],
                                'roomID': sourceDeviceContexts.roomID,
                                'objectID': sourceDeviceContexts.objectID,
                                'actionName':sourceDeviceContexts.action,
                                'sourceDevice':startDevice

                            });
                    }
                }
            }

            break;


        default:
            console.log("  default case of the DeviceDecision.recommendedDevice()");
            break;
    }

    return true;
}


module.exports = DeviceDecision;
