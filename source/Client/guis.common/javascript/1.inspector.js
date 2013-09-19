"use strict";

/* inspector */

/**
 * This method gets overwritten by the specific GUI
 */
GUI.updateInspector = function() {
	//overwritten	
}

/**
 * Get inspectors content and provide it to the given inspector object
 * @param {InspectorObject} inspector The inspector object (e.g. jquery.jDesktopInspector)
 */
GUI.setupInspectorContent = function(inspector) {
	
	/* get all selected webarena objects */
	var selectedObjects = ObjectManager.getSelected();

	if (selectedObjects.length > 0) {
	 
	 	var objects = selectedObjects;
	
		if (selectedObjects.length == 1) {
			GUI.currentInspectorObject = selectedObjects[0];
		} else {
			GUI.currentInspectorObject = false;
		}
	
	} else {
		/* if no objects are selected the current room is shown in the inspector */
		var objects = [ObjectManager.currentRoom['left']]; 
		GUI.currentInspectorObject = ObjectManager.currentRoom['left'];
	}

	var object = objects[0]; //needed for translations
	
	/* reset the inspector */
	inspector.reset();

	

	var categories = {};
	

	/* get attributes for all selected objects */
	$.each(objects, function(index, object) {
		
		if (!object) return;
		
		$.each(object.getAttributes(), function(attribute, info) {

			if (info.hidden) return;

			if (categories[info.category] == undefined) {
				categories[info.category] = {};
			}

			if (categories[info.category][attribute] == undefined) {
				/* add new attribute */
				categories[info.category][attribute] = info;
				categories[info.category][attribute].objectCounter = 1;
				categories[info.category][attribute].multipleValues = false;
			} else {
				categories[info.category][attribute].objectCounter++;
				/* attribute exists */
				if (info.value == categories[info.category][attribute].value) {
					/* same value --> fine :) */
				} else {
					/* different values --> display that attribute has multiple values for selected objects */
					categories[info.category][attribute].multipleValues = true;
				}
			}

		});
		
	});
	
	
	/* get categories for all selected objects */
	$.each(categories, function(category, attributes) {
		
		$.each(attributes, function(attributeName, attribute) {
			
			if (attribute.objectCounter < selectedObjects.length) {
				/* this attribute does not apply to all selected objects --> delete it */
				delete(categories[category][attributeName]);
			}
			
		});
		
	});
	
	
	/* delete categories without attributes */
	$.each(categories, function(category, attributes) {
		
		var counter = 0;
		
		$.each(attributes, function(attributeName, attribute) {
			
			counter++;
			
		});
		
		if (counter == 0) {
			delete(categories[category]);
		}
		
	});


	GUI.inspectorElementsSetter = {};

	/* provide information to inspector object */
	$.each(categories, function(category, elements) {
	
		var page = inspector.addPage(GUI.translate(category)); 
		var section = page.addSection();
		
		$.each(elements, function(attribute, info) {
		
			var element = section.addElement(object.translate('de',info.description));
		
			if (info.readonly) {
				
				if (info.multipleValues) {
					element.setValue(GUI.translate("multiple values"));
				} else {
					element.setValue(object.translate('de',info.value)+" "+object.translate('de',info.unit));
				}
				
				element.setInactive();
				
			} else {
				
				/* map to inspector widgets for different types of attributes */
				
				if (info.type == "number") {
					
					var widget = element.addWidget("number");

					widget.setValue(info.value);
					widget.setMin(info.min);
					widget.setMax(info.max);
					
					widget.setMultipleValues(info.multipleValues);
					
					GUI.inspectorElementsSetter[attribute] = widget.setValue;
					
				} else if (info.type == "color") {
					
					var widget = element.addWidget("color");
					widget.setColor(info.value);
					
					widget.setMultipleValues(info.multipleValues);
					
					GUI.inspectorElementsSetter[attribute] = widget.setColor;
					
				} else if (info.type == "font") {
					
					var widget = element.addWidget("font");
					widget.setFont(info.value);
					
					widget.setMultipleValues(info.multipleValues);
					
					GUI.inspectorElementsSetter[attribute] = widget.setFont;
					
				} else if (info.type == "fontsize") {

					var widget = element.addWidget("number");

					widget.setValue(info.value);
					widget.setMin(info.min);

					widget.setMultipleValues(info.multipleValues);
					
					GUI.inspectorElementsSetter[attribute] = widget.setValue;
		
				} else if (info.type == "boolean") {

					var widget = element.addWidget("boolean");

					widget.setMultipleValues(info.multipleValues);

					widget.setValue(info.value);
					
					GUI.inspectorElementsSetter[attribute] = widget.setValue;
					
				} else if (info.type == "text") {

						var widget = element.addWidget("text");

						widget.setValue(info.value);

						widget.setMultipleValues(info.multipleValues);

						GUI.inspectorElementsSetter[attribute] = widget.setValue;

				} else if (info.type == "list") {

					var widget = element.addWidget("list");

					widget.setValue(info.value);

					widget.setMultipleValues(info.multipleValues);

					GUI.inspectorElementsSetter[attribute] = widget.setValue;

				} else if (info.type == "selection") {
					
					var widget = element.addWidget("selection");

					widget.setOptions(info.options);
					widget.setValue(info.value);
					
					widget.setMultipleValues(info.multipleValues);
					
					GUI.inspectorElementsSetter[attribute] = widget.setValue;
					
				} else if (info.type == "object_id") {
					
					if (!info.multipleValues) {
					
					var widget = element.addWidget("objectid");

					widget.setValue(info.value);
					widget.setOwnObjectId(object.id);
					
					GUI.inspectorElementsSetter[attribute] = widget.setValue;
					
					} else {
						widget = false; //multiple values not implemented for objectId
					}
	
				/* NOT NEEDED!?
				} else if (info.type == "point") {
					
					var widget = element.addWidget("point");

					widget.setValue(info.value);
					
					widget.setMultipleValues(info.multipleValues);
				*/
				/* NOT NEEDED!?
				} else if (info.type == "plaintext") {
					
					var widget = element.addWidget("plaintext");

					widget.setValue(info.value);
				*/
				
				} else if (info.type == "metadata"){
					element.setValue(info.value);
					element.setInactive();
					
					$(element.getDOM()).children("div").css({
						"overflow": "hidden",
						"display": "block",
						"width": "210px",
						"float" : "none",
						"text-align": "left"
					}).attr("title", info.value);
					$(element.getDOM()).find("br").remove();
					
					var widget = false;
					
					GUI.inspectorElementsSetter[attribute] = element.setValue;
				}else {
			
					element.setValue(info.value);
					element.setInactive();
					
					$(element.getDOM()).children("div").css({
						"overflow": "hidden",
						"display": "block",
						"height": "18px",
						"width": "110px"

					}).attr("title", info.value);
					
					var widget = false;
					
					GUI.inspectorElementsSetter[attribute] = element.setValue;
			
				}
				
				if (widget) {
				
					/* define a function called when a widgets content changes */
					widget.onChange(function(value) {
					
						$.each(objects, function(index, object) {
							
							/* use attributes check function to check if an value change is allowed */
							if (info.checkFunction) {
								/* check new value */
								var checkResult = info.checkFunction(object, value);
								if (checkResult !== true && checkResult !== undefined) {
									GUI.error(GUI.translate("unable to set value"), checkResult, object, false);
									GUI.updateInspector();
									return;
								}
							}
							
							object.setAttribute(attribute, value);
							
							
						});
					
					});
				
				}
				
			}

		});
		
	});
	
}


/**
 * ?
 */
GUI.initInspectorAttributeUpdate = function() {
	
	Modules.ObjectManager.registerAttributeChangedFunction(function(object,key,value) {
	
		if (!GUI.currentInspectorObject) return false; //multiple objects selected
	
		if (GUI.currentInspectorObject.id == object.id) {
	
			if (GUI.inspectorElementsSetter[key]) GUI.inspectorElementsSetter[key](value);
		
		}
		
	});
	
}