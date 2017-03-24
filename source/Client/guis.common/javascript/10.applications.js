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
 * @param  {JSON}   data The JSON data that is delivered from the server
 * @param  {Button} the button object 
 *
 */
GUI.generateHtmlfromJson = function(data, button){
    let fragments = data.fragments;
    let type = data.type;
    let title = data.title;
    let dialog_width = "auto";
    let buttons = {};

    //parses through the fragments defined in data.fragments to construct the content DOM-Objectfor the dialogue
    let onClick = function(){
        var newDiv = document.createElement('div');
        switch (type) {
            case "dialog":
                var content = [];
                var html = '';
                for(var frag in fragments){
                    var fragment = fragments[frag];
                    switch (fragment.type) {
                        case "text":
                            var newContent = document.createTextNode(fragment.text);
                            newDiv.appendChild(newContent);
                            break;

                        case "textarea":
                            var textAreaContainer = document.createElement('div');
                            var textArea = document.createElement('textarea');

                            if(fragment.label){
                                var labelTextarea = document.createElement("label");
                                labelTextarea.innerHTML = (""+ fragment.label +': <br>\n');
                                labelTextarea.style.fontWeight = "bold";
                                labelTextarea.style.span = "inline-block";
                                textAreaContainer.appendChild(labelTextarea);
                            }
                            textArea.style.width = "97.5%";
                            textArea.style.height = "300px";
                            textAreaContainer.appendChild(textArea);
                            newDiv.appendChild(textAreaContainer);
                            break;

                        case "input":
                            var textboxContainer = document.createElement('div');
                            var enclosingP = document.createElement('p');
                            var textbox = document.createElement('input');
                            textboxContainer.style.marginRight = "10px";
                            textbox.style.marginLeft = "10px"; 
                            textboxContainer.style.width = "97.5%"; 
                            textbox.style.float = "right";
                            textbox.type = 'text';
                            textbox.style.boxSizing = "border-box";
                            textbox.style.width = "60%";
                            if(fragment.label){
                                var label = document.createElement("label");
                                label.innerHTML = (""+ fragment.label +': ');
                                label.style.fontWeight = "bold";
                                label.style.span = "inline-block";
                                enclosingP.appendChild(label);
                            }
                            label.appendChild(textbox);
                            newDiv.appendChild(enclosingP);
                            break;

                        case "buttons":
                            for(let butt in fragment.buttons){
                                let button = fragment.buttons[butt]
                                buttons[button.buttonText] =  {func: GUI.gatherInputData, query:button.query};
                                //buttons[button.buttonText+'-query'] = button.query;
                            }
                            break;

                        case "arrange":
                            html = '';

                            break;

                        case "list":
                            var newList = document.createElement('div');
                            newList.id = "list-"+fragment;

                            newDiv.appendChild(newList);
                            var that = this;
                            if(fragment.query){
                                let query = fragment.query;
                                let listType = fragment.listType;

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
                                    innerHtml += "<br>"+fragment.dialogText+"<br>";
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

GUI.gatherInputData = function(dataset) {
    var query = dataset.query;
    var content = dataset.content;
    var inputs = content.getElementsByTagName('input');
    var selection = [];

    for (var i = 0; i < inputs.length; i++) {
        var box = inputs[i];
        var data = {};
        data.attribute = inputs[i].parentNode.textContent; 
        data.type = inputs[i].type;
        data.value = box.value;
        data.selected = box.checked;
        selection.push(data);
    }

    if(query == "send"){
        console.log(dataset);
        console.log(selection);
    }

    Modules.Dispatcher.query(query, {
        'userID': GUI.userid,
        'selection': selection
    });
}