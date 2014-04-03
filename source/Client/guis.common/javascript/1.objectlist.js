"use strict";

GUI.objectListSettings = {
    visible: true,
    openedCategories: []
}

GUI.initObjectList = function() {
    ObjectManager.registerOnObjectRemoveListener(this.onObjectRemove);
    $("#objectview").hide();
    var types = [];
    
    // Display all categories which are accessible on mobile phone.
    $.each(ObjectManager.getTypes() , function(key, type) {
        if (!type.onMobile || types[type.category] != undefined) {
            // The type isn't accessible on a mobile phone
            // or we have already added this category.
            return;
        }
        
        // Mark as added.
        types[type.category] = true;
        
        // Build an object list for the specified category.
        var categoryID = type.category.replace(/\s/g, "");
        var typeText = document.createTextNode(GUI.translate(type.category));
        var typeElement = document.createElement("p");
        var typeDiv = document.createElement("div");
        typeDiv.setAttribute("id", categoryID);
        typeElement.appendChild(typeText);
        typeDiv.appendChild(typeElement);
        $(typeDiv).addClass("category");
        
        $("#objectlist").append(typeDiv);
        
        // This container will hold each object of the specified category.
        var objectContainer = document.createElement("div");
        objectContainer.setAttribute("id", categoryID + "Container");
        
        $("#objectlist").append(objectContainer);
        
        // Fetch all objects of the specified category.
        $.each(ObjectManager.getObjects(), function(key, object) {
            if (!object.onMobile || object.getCategory() != type.category) {
                // Like continue in a for loop.
                return true;
            }
            
            // Add this object to the list.
            var objectText = document.createTextNode(object.getName());
            var objectElement = document.createElement("p");
            var objectDiv = document.createElement("div");
            objectElement.appendChild(objectText);
            objectDiv.appendChild(objectElement);
            objectDiv.setAttribute("id", object.getId() + "ID");
            $(objectDiv).addClass("object");
             
            $("#" + categoryID + "Container").append(objectDiv);
            
            // If the user touch the object, it will show the object with its
            // details.
            $(objectDiv).bind('click', function () {
                GUI.buildObjectView(object);
            });
        });
        
        // Display the objects of the type if the user touches the category.
        if (GUI.isTouchDevice) {
            $(typeDiv).bind("touchstart", function() {
                $("#" + categoryID + "Container").slideToggle();
            });
        } else {
            $(typeDiv).bind("click", function() {
                $("#" + categoryID + "Container").slideToggle();
            });
        }
        
        // Close all categories on startup.
        $("#" + categoryID + "Container").slideUp();
    });
}

GUI.onObjectRemove = function(object) {
    $("#" + object.getId() + "ID").remove();
}

GUI.updateObjectList = function(object, key, newValue, local) {
    // Do not update if the object list isn't visible.
    if (!GUI.objectListSettings.visible) {
        return;
    }
    
    if ($("#" + object.getId() + "ID").length > 0) {
        return;
    }
    GUI.addObjectToObjectList(object, object.category);
    
    
    //$("#objectlist").empty();
    //GUI.initObjectList();
}

GUI.addObjectToObjectList = function(object, category) {
    if (!object.onMobile || object.getCategory() != category) {
        // Like continue in a for loop.
        return true;
    }
    
    // Add this object to the list.
    var objectText = document.createTextNode(object.getName());
    var objectElement = document.createElement("p");
    var objectDiv = document.createElement("div");
    objectElement.appendChild(objectText);
    objectDiv.appendChild(objectElement);
    objectDiv.setAttribute("id", object.getId() + "ID");
    $(objectDiv).addClass("object");
    
    // Get the container for the category of the specified object.
    var categoryID = object.getCategory().replace(/\s/g, "");
    $("#" + categoryID + "Container").append(objectDiv);
    
    // If the user touch the object, it will show the object with its
    // details.
    $(objectDiv).bind('click', function () {
        GUI.buildObjectView(object);
    });
}

GUI.updateContainer = function(category) {
    var categoryID = category.replace(/\s/g, "");
    $("#" + categoryID + "Container").empty();
    
    // Fetch all objects of the specified category.
    $.each(ObjectManager.getObjects(), function(key, object) {
        if (!object.onMobile || object.getCategory() != category) {
            // Like continue in a for loop.
            return true;
        }
        
        // Add this object to the list.
        var objectText = document.createTextNode(object.getName());
        var objectElement = document.createElement("p");
        var objectDiv = document.createElement("div");
        objectElement.appendChild(objectText);
        objectDiv.appendChild(objectElement);
        $(objectDiv).addClass("object");
         
        $("#" + categoryID + "Container").append(objectDiv);
        
        // If the user touch the object, it will show the object with its
        // details.
        $(objectDiv).bind('click', function () {
            GUI.buildObjectView(object);
        });
    });
}