GUI.initApplications = function(){  
    /*
    For the toolbar entries of the applications it is necessary to iterate through 
    the activated applications and then create the icons & functions according to their presets
     */
    let appData = Modules.ApplicationManager.getAppData();
    var self = this;
    for(var app in appData){
        if(appData[app]){
            var object = JSON.parse(appData[app]);
            if(object.hasGui){
                self.initApplicationToolbarElements(object.guiElements);      
            }
        }
    }
}

/**
 * Test function
 *
 */
GUI.warn = function(){
    alert("Warum drückst du mich?");
}

/**
 * Initializes all the toolbar elements
 *
 * @param  {Object} data The application-gui-data recieved from the server
 *
 */
GUI.initApplicationToolbarElements = function(data){
    let buttonName = data.buttonName;
    let icon = data.icon;

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

    GUI.generateHtmlfromJson(data, temp[buttonName]);
}

/**
 * Generates the client-side HTML based on the JSON-data coming from the server
 *
 * @param  {JSON} data The JSON data that is delivered from the server
 *
 */
GUI.generateHtmlfromJson = function(data, button){
    let fragments = data.fragments;
    let type = data.type;
    let title = data.title;
    let dialog_width = "auto";


    let onClick = function(){
        var newDiv = document.createElement('div');
        switch (type) {
            case "dialog":
                var buttons = {};
                var content = [];
                var html = '';
                for(var fragment in fragments){
                    switch (fragments[fragment].type) {
                        case "text":
                            var newContent = document.createTextNode(fragments[fragment].text);
                            newDiv.appendChild(newContent);
                            break;

                        case "input":
                            html = '';

                            break;

                        case "button":
                            buttons[fragments[fragment].buttonText] = GUI.fillList;
                            buttons[fragments[fragment].buttonText].query = fragments[fragment].query;
                            break;

                        case "arrange":
                            html = '';

                            break;

                        case "list":
                            console.log("generating list content");
                            var newList = document.createElement('div');
                            newList.id = "list-"+fragment;
                            console.log("list-"+fragment);

                            newDiv.appendChild(newList);
                            var that = this;
                            if(fragments[fragment].query){
                                let query = fragments[fragment].query;
                                let listType = fragments[fragment].listType;

                                function queryWithPromise(query, data){
                                    return new Promise(function(resolve, reject){
                                        Modules.Dispatcher.query(query, data, function(entries){
                                            if(entries){
                                                resolve(entries);
                                            }else{
                                                reject(error);
                                            }
                                        });
                                    });
                                }

                                var entries = queryWithPromise(query, {"userID": GUI.userid});
                                entries.then(function(entries){
                                    var innerHtml = '';
                                    innerHtml += "<br>"+fragments[fragment].dialogText+"<br>";
                                    for (var entry in entries) {
                                        console.log("generating entry");
                                            innerHtml += '<label>';
                                            innerHtml += '<input type="'+listType+'" name="objects" value=' + entries[entry] + '>';
                                            innerHtml += entries[entry];
                                            innerHtml += '</label><br>';
                                        }
                                    innerHtml += '<br>';

                                    var children = newDiv.getElementsByTagName('div');
                                    for(var i = 0; i< children.length;i++){
                                        if (children[i].getAttribute('id') == 'list-'+fragment){
                                            children[i].insertAdjacentHTML('afterend', innerHtml);
                                        }
                                    }
                                });
                            }else{
                                //Just list the list-elements given in the appdata
                            }
                            break;

                        case "input":

                            break;
                    }
                }
            buttons[GUI.translate("close")] = function() {
                //nothing
            }    
            GUI.dialog(title, newDiv, buttons, dialog_width); 
            break;   
        } 
    }         
    if (GUI.isTouchDevice) {
            //header:
            $(button).bind("touchstart", onClick);
        } else {
            //header:
            $(button).bind("mousedown", onClick);
        }
}

GUI.fillList = function(dataset) {
    var query = dataset.query;
    var content = dataset.content;
    var checkboxes = content.getElementsByTagName('input');
    var selection = [];

    for (var i = 0; i < checkboxes.length; i++) {
        var box = checkboxes[i];
        var data = {};
        data.value = box.value;
        data.selected = box.checked;
        selection.push(data);
    }

    Modules.Dispatcher.query(query, {
        'userID': GUI.userid,
        'selection': selection
    });
}