"use strict";

var ObjectList = {};

ObjectList.initialized = false;

ObjectList.settings = {
    visible: true,
    openedCategory: null
}

ObjectList.init = function() {
	if (!ObjectList.initialized) {
		ObjectManager.registerOnObjectRemoveListener(ObjectList.onObjectRemove);
		$("#objectview").hide();
	}
	var keys = [];
    var types = {};
	
	/* Get the objects which are accessible on the mobile phone. */
	$.each(ObjectManager.getObjects(), function(key, object) {
        // Check if the object type is accessible on a mobile phone.
		if (object.onMobile && object.getAttribute('onMobile')) {
			
			if (object.category != undefined) {
				if (types[object.category] == undefined) {
                    types[object.category] = [];
					keys.push(object.category);
                }
                
                // Add the object to the list.
                types[object.category].push(object);
			}
		}
	});
	
	keys.sort();
    
    // Display all categories which are accessible on mobile phone.
	for (var i = 0; i < keys.length; ++i) {
		var objects = types[keys[i]];
		
		objects.sort(function(obj1, obj2) {
			if (obj1.getName() < obj2.getName()) {
				return -1;
			} else if (obj1.getName() > obj2.getName()) {
				return 1;
			}
			
			return 0;
		});
		
        var categoryID = objects[0].category.replace(/\s/g, "");
        ObjectList.buildObjectContainer(objects[0].category, categoryID)
        
        if (objects.length > 0) {
            /* Fetch all objects of the category and build an entry for each. */
            $.each(objects, function(key, object) {
                ObjectList.buildObjectEntry(object, categoryID);
            });
        }
    }
    
    // Generate accordion widget from jquery ui.
	if (!ObjectList.initialized) {
		$(function() {
			$("#objectlist").accordion({
				collapsible: true,
				active: false,
				autoHeight: false,
				heightStyle: "content"
			});
		});
	} else {
		$(function() {
			$("#objectlist").accordion({
				collapsible: true,
				active: true,
				autoHeight: false,
				heightStyle: "content"
			});
		});
	}
    
    ObjectList.initialized = true;
}

ObjectList.onObjectRemove = function(object) {
    $("#" + object.getId() + "ID").remove();
    if (ObjectView.settings.visible == true && GUI.currentObject == object) {
        object.isSelectedOnMobile = false;
		GUI.currentObject.draw();
		ObjectView.settings.visible = false;
		ObjectList.settings.visible = true;
		$("#objectview").fadeOut("slow");
		$("#objectlist").fadeIn("slow");
		$(".objectcontent").remove();
		$(".header").remove();
    }
}

ObjectList.update = function(object, key, newValue, local) {
	// Do we already have this object in our list?
    if ($("#" + object.getId() + "ID").length > 0) {
        $("#" + object.getId() + "ID").remove();
        // Is it still accessible on mobile?
        if (object.getAttribute('onMobile')) {
            // Rebuild this entry.
            ObjectList.buildObjectEntry(object, object.getCategory().replace(/\s/g, ""));
        }
    } else if (object.getAttribute('onMobile')) {
        // Is the new object accessible on mobile?
        if (ObjectList.initialized) {
			$("#objectlist").accordion("destroy").empty();
			ObjectList.init();
        }
    }
}

ObjectList.buildObjectContainer = function(category, categoryID) {
    /* Build an object container for the category. */
    // Create the header for the category.
    var categoryName = document.createTextNode(GUI.translate(category));
    var containerHeader = document.createElement("h3");
    containerHeader.setAttribute("id", categoryID);
    containerHeader.appendChild(categoryName);
    
    // Create the container which holds the objects of the category.
    var contentContainer = document.createElement("div");
    contentContainer.setAttribute("id", categoryID + "Container");
    
    // Append the new object container to the object list. */
    $("#objectlist").append(containerHeader);
    $("#objectlist").append(contentContainer);
}

ObjectList.buildObjectEntry = function(object, categoryID) {
    // Add this object to the list.
    var objectName = document.createTextNode(object.getName());
    var objectElement = document.createElement("p");
    var table = document.createElement("table");
    var row = document.createElement("tr");
    var left = document.createElement("td");
    var right = document.createElement("td");
    var objectDiv = document.createElement("div");
    objectElement.appendChild(objectName);
    table.setAttribute("style", "width: 100%");
    right.setAttribute("style", "width: 32px");
    $(table).append(row);
    $(row).append(left);
    $(row).append(right);
    $(left).append(objectElement);
    objectDiv.appendChild(table);
    objectDiv.setAttribute("id", object.getId() + "ID");
    $(objectDiv).addClass("object");
    
    // Create a button for object deletion.
    var deleteButton = document.createElement("img");
    deleteButton.setAttribute("src", "../../guis/mobilephone/images/deleteObject.png");
    deleteButton.setAttribute("class", "deleteObject");
    $(right).append(deleteButton);
    
    $(deleteButton).bind("click", function(event) {
		ObjectList.deleteObject(object);
		event.stopImmediatePropagation();
    });
     
    $("#" + categoryID + "Container").append(objectDiv);
    
    // If the user touch the object, it will show the object with its
    // details.
    if (object.getType() == "Subroom") {
        // Simply change the current room.
        $(objectDiv).bind('click', function () {
            //object.execute(false);
			object.follow(object.getAttribute("open in"));
        });
    } else {
        // Switch to the view of the object.
        $(objectDiv).bind('click', function () {
            ObjectView.build(object);
            ObjectList.settings.visible = false;
            ObjectView.settings.visible = true;
            window.scrollTo(0, 0);
            $("#objectlist").fadeOut("slow");
            $("#objectview").fadeIn("slow");
        });
    }
}

ObjectList.deleteObject = function(webarenaObject) {

	var dialog = confirm(GUI.translate('Do you really want to delete the object?'));
	if (dialog){
		webarenaObject.deleteIt();
		window.location.reload();
	} 
	
}
