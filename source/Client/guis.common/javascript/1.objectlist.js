"use strict";

GUI.initObjectList = function() {
    var types = [];
    
    $.each(ObjectManager.getTypes() , function(key, type) {
        if (types[type.category] != undefined) {
            return;
        }
        
        types[type.category] = true;
        
        var categoryID = type.category.replace(/\s/g, "");
        var typeText = document.createTextNode(type.category);
        var typeElement = document.createElement("p");
        var typeDiv = document.createElement("div");
        typeDiv.setAttribute("id", categoryID);
        typeElement.appendChild(typeText);
        typeDiv.appendChild(typeElement);
        $(typeDiv).addClass("category");
        
        $("#objectlist").append(typeDiv);
        
        var objectContainer = document.createElement("div");
        objectContainer.setAttribute("id", categoryID + "Container");
        
        $("#objectlist").append(objectContainer);
        
        $.each(ObjectManager.getObjects(), function(key, object) {
            if (object.getCategory() == type.category) {
                var objectText = document.createTextNode(object.getName());
                var objectElement = document.createElement("p");
                var objectDiv = document.createElement("div");
                //objectDiv.setAttribute("id", object.getId());
                objectElement.appendChild(objectText);
                objectDiv.appendChild(objectElement);
                $(objectDiv).addClass("object");
                    
                $("#" + categoryID + "Container").append(objectDiv);
                
                $(objectDiv).bind("click", function() {
                    var objectPresenter = document.createElement("div");
                    
                    $.each(object.getAttributes(), function(key, attr) {
                        if (!attr.readonly) {
                            var attrName = document.createTextNode(attr.description + ": " + attr.value);
                            var attrElement = document.createElement("p");
                            attrElement.appendChild(attrName);
                            objectPresenter.appendChild(attrElement);
                        }
                    });
                    
                    $("#objectview").append(objectPresenter);
                    
                    $("#objectview").bind("click", function() {
                        $("#objectview").slideUp("slow");
                        $("#objectlist").fadeIn("slow");
                        $(objectPresenter).remove();
                    });
                    
                    $("#objectlist").fadeOut("slow");
                    $("#objectview").slideDown("slow");
                });
            }
        });
        
        $(typeDiv).bind("click", function() {
            $("#" + categoryID + "Container").slideToggle();
        });
    });
}