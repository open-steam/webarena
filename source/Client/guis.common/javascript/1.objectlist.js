"use strict";

GUI.initObjectList = function() {
    var types = [];
    
    $.each(ObjectManager.getTypes() , function(key, type) {
        if (types[type.category] != undefined) {
            return;
        }
        
        types[type.category] = true;
        
        var categoryID = type.category.replace(/\s/g, "");
        var typeText = document.createTextNode(GUI.translate(type.category));
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
                objectElement.appendChild(objectText);
                objectDiv.appendChild(objectElement);
                $(objectDiv).addClass("object");
                    
                $("#" + categoryID + "Container").append(objectDiv);
                
                $(objectDiv).bind("click", function() {
                    var attrHeader = document.createElement("div");
                    var objectPresenter = document.createElement("div");
                    var attrTable = GUI.buildAttributeTable(object);
                    objectPresenter.appendChild(attrTable);
                    
                    $("#objectview").prepend(document.createElement("div").appendChild(attrHeader));
                    $("#objectview > svg").css("width", $(window).width());
                    var rep = object.getRepresentation();
                    var offset = 10;
                    var x = ($(window).width())/2 - (parseFloat($(rep).attr("width")))/2;
                    var y = offset;
                    var group = GUI.mobileSVG.group();
                    $(group).attr("x", x);
                    $(group).attr("y", y);
                    $("#objectview > svg").css("height", parseFloat($(rep).attr("height")) + 2 * offset);
                    $(group).attr("transform", "translate(" + x + "," + y + ")");
                    $(group).append($(rep).children())
                    $("#objectview > svg").append(group);
                    
                    $("#objectview").append(objectPresenter);
                    
                    var header = document.createElement("div");
                    var objectName = document.createTextNode(object.getName());
                    header.appendChild(objectName);
                    $(header).addClass("header");
                    
                    $("body").prepend(header);
                    
                    var closeButton = document.createElement("div");
                    var buttonText = document.createTextNode("Ansicht schliessen");
                    closeButton.appendChild(buttonText);
                    $(closeButton).addClass("closeButton");
                    
                    $("body").append(closeButton);
                    
                    $(closeButton).bind("click", function() {
                        $("#objectview").fadeOut("slow");
                        $("#objectlist").fadeIn("slow");
                        $(objectPresenter).remove();
                        $(header).remove();
                        $(closeButton).remove();
                        $("#objectview > svg").remove(group);
                    });
                    
                    $("#objectlist").fadeOut("slow");
                    $("#objectview").fadeIn("slow");
                });
            }
        });
        
        $(typeDiv).bind("click", function() {
            $("#" + categoryID + "Container").slideToggle();
        });
        
        $("#" + categoryID + "Container").slideUp();
    });
}

GUI.buildAttributeTable = function(object) {
    var table = document.createElement("table");
    $(table).addClass("table");
    
    $.each(object.getAttributes(), function(key, attr) {
        if (attr.description == "name") {
            return true;
        }
        
        var attrDesc = document.createTextNode(object.translate(GUI.currentLanguage, attr.description));
        var attrVal = document.createTextNode(attr.value);
        var leftCell = document.createElement("td");
        $(leftCell).addClass("leftCell");
        var rightCell = document.createElement("td");
        $(rightCell).addClass("rightCell");
        var row = document.createElement("tr");
        $(row).addClass("row");
        
        leftCell.appendChild(attrDesc);
        rightCell.appendChild(attrVal);
        row.appendChild(leftCell);
        row.appendChild(rightCell);
        table.appendChild(row);
    });
    
    return table;
}