"use strict";

/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012,2013
 *
 */


/**
 *	Each object type get its attribute manager. Attributes must be registred
 *   in the attribute manager before they can be set or got. This is necessary
 *   for GUIs to implement an object inspector as well as for channelling data
 *   access to the server.
 *
 *   Note: Data is stored in the static attributeData member. This assures that
 *   even when several instances of the same object exist (which is common on
 *   the server side), they all have the same attribute set they operate on.
 */
var AttributeManager = new function() {

    //actual attribute data is kept private, so it can only be maniplulated
    //by setter and getter functions.

    var attributeData = {};

    this.transactionId = false;
    //var transactionTimer = false; 
    this.transactionTimeout = 500;
    //this.transactionHistory = {};

    //setters and getter for attribute data. For conveiniance, object.set
    //and object.get can be used instead.

    //Notice: These functions set and get unfiltered data. It is not checked
    //if these data are within a specific range, of a certain type or even
    //exist at all. Changes made this way are not automatically distributed
    //to the server or other client. Use this.set only when you can be sure 
    //the data you are storing fits range and type and make sure you persist
    //your data afterwards. In the general case use setAttribute instead.

    this.set = function(id, key, value) {
        if (id == undefined || value == undefined) {
            console.log('undefined set', id, key, value);
            console.trace();
            return;
        }

        if (parseInt(key, 10) == key) {
            console.log('numberic key in set', id, key, value);
            console.trace();
            return;
        }

        if (!attributeData[id])
            attributeData[id] = this.proto.standardData || {};
        attributeData[id][key] = value;
    }

    this.get = function(id, key) {
        if (!attributeData[id])
            return undefined;
        if (!key)
            return attributeData[id];
        return attributeData[id][key];
    }

    //setAll is used, when an object is loaded and gets its primary data. The
    //loaded data is accepted as is without any further checks.

    this.setAll = function(id, data) {
        if (id == undefined) {
            console.log('undefined setAll', id, data);
            console.trace();
            return;
        }
        attributeData[id] = data;
    }

    this.toString = function() {
        return 'AttributeManager for ' + this.proto;
    }

};


/**
 *	init
 *	
 *	called when an object type is registred (see GeneralObject). During this
 *	project, each object type derives an Attributemanager whicht is herein
 *	bound to its prototype and gets an empty attribute array which is then
 *	again filled in the registration procress.
 **/
AttributeManager.init = function(proto) {

    this.proto = proto;
    this.attributes = {};

}

/**
 *	register an attribute for a prototype
 *
 *	data: 	type - 'text','number','color',...
 *			unit - '%','°',...
 *			min - integer
 *			max - integer
 *			standard
 *			setFunction(obj) - function
 *			getFunction - function
 *			checkFunction - function
 * 			changedFunction - function called when attribute has changed (from inside or outside)
 *			readonly - true, false
 *			hidden - true, false
 *			category - a block or tab this attribute should be displayed in
 *
 */
AttributeManager.registerAttribute = function(attribute, data) {

    if (!attribute)
        return;
    var manager = this;


    // fill in old properties, if the attribute has yet been registred.
    var oldData = this.attributes[attribute] || {};

    //if (oldData) console.log('Attribute '+attribute+' for '+this.proto+' type '+data.type+' has already been specified.');

    for (var key in oldData) {
        var oldValue = oldData[key];
        if (data[key] === undefined)
            data[key] = oldValue;
    }

    if (data.type === undefined)
        data.type = 'text';
    if (data.description == undefined && data.readable == undefined)
        data.description = attribute;
    if (data.readable !== undefined)
        data.description = data.readable;
    if (data.unit === undefined)
        data.unit = '';
    if (data.min === undefined)
        data.min = -50000;
    if (data.max === undefined)
        data.max = 50000;
    if (data.standard == undefined)
        data.standard = 0;
    if (data.category == undefined)
        data.category = 'Basic';


    data.setter = function(object, value) {

        if (value === undefined)
            value = data.standard;
        if (data.type == 'number' || data.type == 'fontsize') {
            value = parseInt(value, 10);
            if (isNaN(value))
                value = data.standard;
            if (value < data.min)
                value = data.min;
            if (value > data.max)
                value = data.max;
        }
        if (data.setFunction) {
            data.setFunction(object, value);
        }
        else {
            object.set(attribute, value);
        }
    }


    data.getter = function(object) {
        if (!data.getFunction) {
            var result = object.get(attribute);
        } else {
            var result = data.getFunction(object);
        }
        if (result === undefined) {
            result = data.standard;
        }

        if (data.type == 'number' && attribute != 'id') {
            result = parseInt(result, 10);
            if (isNaN(result))
                result = data.standard;
            if (result < data.min) {
                result = data.min;
            }

            if (result > data.max) {
                result = data.max;
            }

        }


        return result;
    }

    this.attributes[attribute] = data;

    return data;

}

var saveDelays = {};

/**
 *	set an attribute to a value on a specified object
 */
AttributeManager.setAttribute = function(object, attribute, value, forced, noevaluation) {
    if (attribute == 'position') {
        this.setAttribute(object, 'x', value.x, forced);
        this.setAttribute(object, 'y', value.y, forced);
        return true;
    }
    var that = this;

    if (object.ObjectManager.isServer && !noevaluation) {

        if (attribute == 'x' || attribute == 'y' || attribute == 'width' || attribute == 'height') {
            object.evaluatePosition(attribute, value, object.getAttribute(attribute));
        }
    }

    // do nothing, if value has not changed
    if (object.get(attribute) === value) {
        if (attribute === "structures") {
            console.log(attribute);
            console.log(object.get(attribute));
            console.log(value);
            console.log("hier drin?")
            console.log(object.getAttribute("structures"));
        }
        return false;
    }

    // get the object's setter function. If the attribute is not registred,
    // create a setter function which directly sets the attribute to the
    // specified value
    var setter = false;

    if (this.attributes[attribute]) {
        setter = this.attributes[attribute].setter;
    } else {
        setter = function(object, value) {
            object.set(attribute, value);
        };
    }

    // check if the attribute is read only
    if (this.attributes[attribute] && this.attributes[attribute].readonly) {
        console.log('Attribute ' + attribute + ' is read only for ' + this.proto);
        if (attribute == 'id') {
            console.log('TRIED TO SET ID');
            console.trace();
        }
        return undefined;
    }

    // call the setter function
    setter(object, value);


    // persist the results

    if (object.ObjectManager.isServer) {
        object.persist();
    } else {

        var identifier = object.id + '#' + attribute;

        if (saveDelays[identifier]) {
            window.clearTimeout(saveDelays[identifier]);
            delete(saveDelays[identifier]);
        }

        if (window.transactionTimer) {
            window.clearTimeout(window.transactionTimer);
        }


        if (!this.transactionId) {
            that.transactionId = new Date().getTime();
        } else {
            window.transactionTimer = window.setTimeout(function() {
                //calculate new transactionId
                //TODO: isn't safe - concurrent users may result in same timestamp
                that.transactionId = new Date().getTime();
            }, this.transactionTimeout);
        }



        //this timer is the delay in which changes on the same object are discarded
        var theTimer = 200;

        if (forced) {
            object.serverCall('setAttribute', attribute, value, false, {
                'transactionId': that.transactionId,
                'userId': GUI.userid
            })
        } else {
            saveDelays[identifier] = window.setTimeout(function() {
                object.serverCall('setAttribute', attribute, value, false, {
                    'transactionId': that.transactionId,
                    'userId': GUI.userid
                })
            }, theTimer);
        }

    }

    if (object.ObjectManager.attributeChanged)
        object.ObjectManager.attributeChanged(object, attribute, this.getAttribute(object, attribute), true);

    return true;
}

/**
 *	get an attribute of a specified object
 */
AttributeManager.getAttribute = function(object, attribute, noevaluation) {

    //on unregistred attributes directly return their value
    if (this.attributes[attribute] == undefined) {
        return object.get(attribute);
    }

    var getter = this.attributes[attribute].getter;


    // call the getter function

    return getter(object);
}

/**
 *	get a full attribute set of an object
 *	with getter functions and evaluations
 */
AttributeManager.getAttributeSet = function(object) {

    var result = {};

    for (var key in object.get()) {
        result[key] = AttributeManager.getAttribute(object, key);
    }

    return result;
}


AttributeManager.hasAttribute = function(object, attribute) {
    return (this.attributes[attribute] != undefined);
}

/**
 *	get the attributes (e.g. for GUI)
 *
 *	returns only registred attribute data, not their contents or unregistred attributes
 */
AttributeManager.getAttributes = function() {
    return this.attributes;
}

module.exports = AttributeManager;