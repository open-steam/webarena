GUI.initApplications = function(){  
    /*
    For the toolbar entries of the applications it is necessary to iterate through 
    the activated applications and then create the icons & functions according to their presets
     */
    let appData = Modules.ApplicationManager.getAppData();
    console.log(appData);
    var self = this;
    for(var app in appData){
        if(appData[app]){
            console.log(app + " has appData");
            if(appData[app].hasGui){
                console.log(app + " has GuiElements");
                console.log(appData[app].guiElements);
                self.initApplicationToolbarElements(appData[app].guiElements);      
            }
        }
    }
}


GUI.warn = function(){
    alert("Warum drückst du mich?");
}

GUI.initApplicationToolbarElements = function(data){
    console.log("DataSheet for Toolbar");
    console.log(data);
    let buttonName = data.buttonName;
    let icon = data.icon;
    let clickFunction = GUI[data.clickFunction];

    console.log(clickFunction);

    let temp = {};
    
    temp[buttonName] = document.createElement("img");
    $(temp[buttonName]).attr("src", "../../guis.common/images/"+icon+"_grey.png").attr("alt", "");
    $(temp[buttonName]).attr("width", "24").attr("height", "24");
    $(temp[buttonName]).attr("id", buttonName+"_button");
    $(temp[buttonName]).addClass("sidebar_button");
    $(temp[buttonName]).attr("title", GUI.translate(buttonName));
    $(temp[buttonName]).attr("src", "../../guis.common/images/"+icon+".png").attr("alt", "");
    numberOfIcons++;
    $("#header > .header_right").prepend(temp[buttonName]); //add header icon

    if (GUI.isTouchDevice) {
        //header:
        $(temp[buttonName]).bind("touchstart", clickFunction);
    } else {
        //header:
        $(temp[buttonName]).bind("mousedown", clickFunction);
    }
} 
