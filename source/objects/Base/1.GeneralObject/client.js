/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 *	 GeneralObject client component
 *
 */


GeneralObject.content = false;
GeneralObject.contentFetched = false;
GeneralObject.hasContent = false;
GeneralObject.normalOpacity = 1;

GeneralObject.setContent = function(content) {
    this.content = content;
    this.contentFetched = true;

    this.serverCall('setContent', content, this.afterSetContent);
}

/**
 * Call RPC-Method on server-side. Could be called like:
 *
 * this.serverCall("rpcMethod", arg1, arg2, arg3, ..., optionalCallback)
 * 
 * @param{...mixed} - 
 * 		remoteFnName : Name of the function that should be called
 * 		...args :  arbitrary number of arguments
 * 		callback: if the last element is a function, it is used as a callback. 
 */
GeneralObject.serverCall = function() {
    var args = Array.prototype.slice.call(arguments);
    var callback = false;

    //Look if last element is function 
    //don't use pop directly, because function
    //can be called without callback.
    var lastArg = args[args.length - 1];
    if (_.isFunction(lastArg)) {
        callback = lastArg;
        args.pop();
    }

    //check if all needed arguments are present
    //and of right type
    var remoteFnName = args.shift();

    if (remoteFnName === undefined)
        throw "Function name is missing.";
    if (remoteFnName && !_.isString(remoteFnName))
        throw "Function names can be strings only.";

    var remoteCall = {
        roomID: this.getRoomID(),
        objectID: this.getId(),
        fn: {
            name: remoteFnName,
            params: args
        }
    }

    if (callback)
        Modules.Dispatcher.query('serverCall', remoteCall, callback);
    else
        Modules.Dispatcher.query('serverCall', remoteCall);

}

GeneralObject.fetchContent = function(worker, forced) {

    if (this.contentURLOnly)
        return;

    if (!worker)
        worker = function(data) {
            //console.log(data);
        }

    if (this.contentFetched && forced !== true) {
        worker(this.content);
        return;
    }

    var that = this;
    //Do not use "this" in response functions as they do not refer to the object in there!

    var functionLoadedCallback = function(newContent) {
        that.content = newContent;
        that.contentFetched = true;
        worker(newContent);
        return;
    }

    this.serverCall('getContent', functionLoadedCallback);
}

GeneralObject.getContentAsString = function(callback) {
    if (callback === undefined) {
        if (!this.contentFetched) {
            alert('Synchronous content access before it has been fetched! Inform the programmer about this issue!');
            return false;
        }
        return GeneralObject.utf8.parse(this.content);
    } else {
        this.fetchContent(function(content) {
            callback(GeneralObject.utf8.parse(content));
        });
    }
}

GeneralObject.hasContent = function() {
    return this.getAttribute('hasContent');
}

GeneralObject.contentUpdated = function() {
    var that = this;
    this.contentFetched = false;
    this.fetchContent(function() {
        that.draw();
    }, true);
}


//triggered by non local change of values
GeneralObject.refresh = function() {

    //do not trigger a draw if the refreshed object is the room object
    if (this.id == this.getAttribute('inRoom'))
        return;

    if (this.moving)
        return;
    this.draw(true);
}


GeneralObject.getPreviewContentURL = function() {
    return "/getPreviewContent/" + this.getRoomID() + "/" + this.id + "/" + this.getAttribute('contentAge') + "/" + ObjectManager.userHash;
}

GeneralObject.getContentURL = function() {
    return "/getContent/" + this.getRoomID() + "/" + this.id + "/" + this.getAttribute('contentAge') + "/" + ObjectManager.userHash;
}

GeneralObject.create = function(attributes) {

    if (attributes === undefined) {
        var attributes = {
        };
    } else {

    }

    ObjectManager.createObject(this.type, attributes);

}

GeneralObject.removeRepresentation = function() {

    var rep = this.getRepresentation();

    this.deselect();

    $(rep).remove();

}


GeneralObject.getIconPath = function() {
    return "/objectIcons/" + this.getType();
}

GeneralObject.justCreated = function() {
    //react on client side if an object has just been created and needs further input
}

GeneralObject.getRoom = function() {
    return Modules.ObjectManager.getCurrentRoom();
}

GeneralObject.getCurrentUserName = function() {
    return Modules.ObjectManager.getUser().username;
}

/**
 *	determine if the object's bounding box intersects with the square x,y,width,height
 */
GeneralObject.boxIntersectsWith = function(otherx, othery, otherwidth, otherheight) {
    if (!this.isGraphical)
        return false;

    var thisx = this.getViewBoundingBoxX();
    var thisy = this.getViewBoundingBoxY();
    var thisw = this.getViewBoundingBoxWidth();
    var thish = this.getViewBoundingBoxHeight();

    if (otherx + otherwidth < thisx)
        return false;
    if (otherx > thisx + thisw)
        return false;
    if (othery + otherheight < thisy)
        return false;
    if (othery > thisy + thish)
        return false;

    return true;

}

/**
 *	determine if the object or the object's bounding box intersects with another object's bounding box
 */
GeneralObject.intersectsWith = function(other) {
    var otherx = other.getViewBoundingBoxX();
    var othery = other.getViewBoundingBoxY();
    var otherw = other.getViewBoundingBoxWidth();
    var otherh = other.getViewBoundingBoxHeight();

    if (typeof this.objectIntersectsWith == 'function') {
        return this.objectIntersectsWith(otherx, othery, otherw, otherh);
    }
    else {
        return this.boxIntersectsWith(otherx, othery, otherw, otherh);
    }

}

GeneralObject.hasPixelAt = function(x, y) {

    //assume, that the GeneralObject is full of pixels.
    //override this if you can determine better, where there
    //object is nontransparent

    return this.boxIntersectsWith(x, y, 0, 0);
}

GeneralObject.boxContainsPoint = GeneralObject.hasPixelAt;

GeneralObject.getLinkedObjects = function() {
    var self = this;

    var getObject = function(id) {
        return ObjectManager.getObject(id);
    }

    var linkedObjects = this.getAttribute("link");

    var links = {};

    for (var i = 0; i < linkedObjects.length; i++) {

        var targetID = linkedObjects[i].destination;
        var target = getObject(targetID);

        links[targetID] = {
            object: target,
        }
    }

    return links;
}


/**
 *	Exit Dialog, the user can specify an internal target (object, room) or external target (URL)
 */
GeneralObject.showExitDialog = function() {
    var that = this;

    var dialog_buttons = {};

    dialog_buttons[that.translate(GUI.currentLanguage, "Create new Subroom")] = function() {

        var random = new Date().getTime() - 1296055327011;

        that.setAttribute('destination', random);
        that.setAttribute("destinationObject", "choose");
        GUI.updateInspector();
    };

    dialog_buttons[that.translate(GUI.currentLanguage, "Cancel")] = function() {
        return false;
    };

    dialog_buttons[that.translate(GUI.currentLanguage, "Okay")] = function() {
	
		var active = $('#tabs').tabs('option', 'active');
		var tab = $("#tabs ul>li a").eq(active).attr("href");
	
		var jstree_selected_item = $('.js-tree').jstree('get_selected');
		
		var textareaInput = $('#external_URL').val();
		
		if(jstree_selected_item.length == 0 & textareaInput == ""){
			alert(that.translate(GUI.currentLanguage, "Please select a destination or enter a URL"));
			setTimeout(function(){ that.showExitDialog() }, 10);
		}
		if(jstree_selected_item.length == 0 & textareaInput != ""){
			HandleTextareaInput(textareaInput);
		}
		if(jstree_selected_item.length != 0 & textareaInput == ""){
			HandleTreeInput(jstree_selected_item);
		}
		if(jstree_selected_item.length != 0 & textareaInput != ""){
			if(tab == "#tabs-1"){ //two inputs, decide which tab is open
				HandleTreeInput(jstree_selected_item);
			}
			else{
				HandleTextareaInput(textareaInput);
			}
		}
	};
	
	function HandleTextareaInput(textareaInput){
	
		if(textareaInput.indexOf("http://www.") != 0){
			alert(that.translate(GUI.currentLanguage, "Please enter a valid URL"));
			setTimeout(function(){ that.showExitDialog() }, 10);
		}
		else{
			that.setAttribute("destination", textareaInput);
			that.setAttribute("destinationObject", "choose");
			
			GUI.updateInspector();
		}
	
	}
	
	function HandleTreeInput(jstree_selected_item){
		
		if (jstree_selected_item.data('type') === "Room") {
			that.setAttribute("destination", jstree_selected_item.data('id'));
			that.setAttribute("destinationObject", "choose");
		} else {
			that.setAttribute("destination", jstree_selected_item.data('inRoom'));
			that.setAttribute("destinationObject", jstree_selected_item.data('id'));
		}

		GUI.updateInspector();
	}
		
    var dialog_width = 600;
    var additional_dialog_options = {
        create: function() {
            var renderedTree = $("<div class='js-tree objectBrowserTree'></div>").jstree({
                "json_data": {
                    "data": function(object, callback) {
                        if (object !== -1) {
                            var roomId = object.data("id");
							that.serverCall("getRoomInventory", {"id": roomId}, callback);
                        } else {
							Modules.Dispatcher.query('roomlist',null, function(rooms){
								var roomArray = new Array();
								for(var i = 0; i<rooms.length; i++){
									var node = {
										data : {
											title : rooms[i],
											icon : '/objectIcons/Subroom'
										},
										metadata : {
											id : rooms[i],
											name : rooms[i],
											type : 'Room'
										}
									}
									if(!that.getAttribute('filterObjects')){
										node.state = 'closed';
									}
									roomArray.push(node);
								}
								callback(roomArray);
							});
                        }
                    },
                    "ui": {
                        "select_limit": 1,
                    },
                    "progressive_render": true
                },
                "plugins": ["themes", "json_data", "ui"]
            }).bind("loaded.jstree", function() {
                $('a > .jstree-icon').css({'background-size': 'contain'})
            }).bind("open_node.jstree", function() {
                $('a > .jstree-icon').css({'background-size': 'contain'})
            });
			
			$('.ui-dialog-content').html('<div id="tabs">'+
				'<ul>'+
				'<li><a id="internal_Tab" href="#tabs-1">'+that.translate(GUI.currentLanguage, "Internal")+' (Webarena)</a></li>'+
				'<li><a id="external_Tab" href="#tabs-2">'+that.translate(GUI.currentLanguage, "External")+' (URL)</a></li>'+
				'</ul>'+
				'<div id="tabs-1" style="height:250px">'+
				'</div>'+
				'<div id="tabs-2" style="height:250px">'+
				'</div>'+
				'</div>');
				
			$('#tabs-1').html(renderedTree);
			$('#tabs-2').html('<textarea id="external_URL" rows="4" cols="72" placeholder="http://www.example.com"></textarea>');
			
			$(function() {
				$( "#tabs" ).tabs();
			});
			
			$('#internal_Tab').click(function() {
				$('#checkboxLabel').show();
				$(':button:contains(' + that.translate(GUI.currentLanguage, "Create new Subroom") + ')').show();
			});
			
			$('#external_Tab').click(function() {
				$('#checkboxLabel').hide();
				$(':button:contains(' + that.translate(GUI.currentLanguage, "Create new Subroom") + ')').hide();
			});
	
            // bigger icons
            //$('<style>.objectBrowserTree a > ins {width: 36px; height: 36px;} .objectBrowserTree a { min-height:36px; line-height:36px; } </style>').appendTo("head");
        },
        height: 400
    }

    var dialog = GUI.dialog(
            that.translate(GUI.currentLanguage, "Target Selection"),
            "",
            dialog_buttons,
            dialog_width,
            additional_dialog_options
            )

    //$(':button:contains(' + that.translate(GUI.currentLanguage, "Okay") + ')').attr("disabled", true);

	$(".ui-dialog-buttonpane").append('<label id="checkboxLabel" class="checkbox-label"><input id="filterObjects" type="checkbox">'+that.translate(GUI.currentLanguage, "Show objects")+'</label>');
	
	$('#checkboxLabel').css("position", "absolute");
	$('#checkboxLabel').css("bottom", "20px");
	$('#checkboxLabel').css("left", "35px");
	$('#filterObjects').css("position", "relative");
	$('#filterObjects').css("vertical-align", "middle");
	$('#filterObjects').css("bottom", "1px");

    if (that.getAttribute('filterObjects')) {
        $('#filterObjects').prop('checked', false);
    }
    else {
        $('#filterObjects').prop('checked', true);
    }


    $('#filterObjects').click(function() {
        if ($(this).is(':checked')) {
            that.setAttribute('filterObjects', false);
            $(':button:contains(' + that.translate(GUI.currentLanguage, "Cancel") + ')').click();
            that.showExitDialog();
        }
        else {
            that.setAttribute('filterObjects', true);
            $(':button:contains(' + that.translate(GUI.currentLanguage, "Cancel") + ')').click();
            that.showExitDialog();
        }
    });


    dialog.on("dblclick", '.jstree-clicked', function() {
        //$(':button:contains(' + that.translate(GUI.currentLanguage, "Okay") + ')').attr("disabled", false);
        $(':button:contains(' + that.translate(GUI.currentLanguage, "Okay") + ')').click();
    });

    dialog.on("click", '.jstree-clicked', function() {
        //$(':button:contains(' + that.translate(GUI.currentLanguage, "Okay") + ')').attr("disabled", false);
    });

}


/**
 *	Format Dialog, the user can select which of the format attributes of the current object are used for another object
 */
GeneralObject.showFormatDialog = function(selected) {
    var that = this;
    var dialog_buttons = {};
    dialog_buttons[that.translate(GUI.currentLanguage, "Copy selected format attributes")] = function() {
        var data = {};
        data.x = $('#x-axis').attr('checked') == 'checked' ? that.getAttribute('x') : false;
        data.y = $('#y-axis').attr('checked') == 'checked' ? that.getAttribute('y') : false;
        data.width = $('#width').attr('checked') == 'checked' ? that.getAttribute('width') : false;
        data.height = $('#height').attr('checked') == 'checked' ? that.getAttribute('height') : false;
        if (document.getElementById("fillcolor") !== null)
            data.fillcolor = $('#fillcolor').attr('checked') == 'checked' ? that.getAttribute('fillcolor') : false;
        if (document.getElementById("linecolor") !== null)
            data.linecolor = $('#linecolor').attr('checked') == 'checked' ? that.getAttribute('linecolor') : false;
        if (document.getElementById("linesize") !== null)
            data.linesize = $('#linesize').attr('checked') == 'checked' ? that.getAttribute('linesize') : false;

        ObjectManager.latestFormatSelections = {};
        for (var i in selected) {
            if (selected[i].id !== that.id) {
                for (var d in data) {
                    if (data[d]) {
                        selected[i].setAttribute(d, data[d]);
                        ObjectManager.latestFormatSelections[d] = true;
                    }
                }
            }
        }

        //ObjectManager.copyFormatAttributes(data, room);

        //Todo: Übertrage die Formatierungseinstellungen
        GUI.updateInspector();
    };
    dialog_buttons[that.translate(GUI.currentLanguage, "Cancel")] = function() {
        return false;
    };
    var dialog_width = 400;
    var attributes = that.getAttributes();
    var content = [];
    var html = "";
    var text = "An dieser Stelle kann bestimmt werden, welche Eigenschaften des selektierten Objektes auf die übrigen markierten Objekte übertragen werden."
    content.push(text + "<br /> <br />");
    if (ObjectManager.latestFormatSelections === undefined)
        ObjectManager.latestFormatSelections = {};

    var attributename = that.translate(GUI.currentLanguage, "x");
    
    html += ('<div id="positions" style="float:left;margin-right:50px">');
    html += '<div style="margin-bottom:3px">Objektposition:</div>';
    if (ObjectManager.latestFormatSelections.x) {
        html += ('<span><input id="x-axis" type="checkbox" checked="checked" /> ' + attributename + '</span> <br />');
    } else {
        html += ('<span><input id="x-axis" type="checkbox"/> ' + attributename + ' <br /></span>');
    }
    attributename = that.translate(GUI.currentLanguage, "y");
    if (ObjectManager.latestFormatSelections.y) {
        html += ('<input id="y-axis" type="checkbox" checked="checked" /> ' + attributename + ' <br />');
    } else {
        html += ('<input id="y-axis" type="checkbox"/> ' + attributename + ' <br />');
    }
    attributename = that.translate(GUI.currentLanguage, "width");
    if (ObjectManager.latestFormatSelections.width) {
        html += ('<input id="width" type="checkbox"  checked="checked" /> ' + attributename + ' <br />');
    } else {
        html += ('<input id="width" type="checkbox" /> ' + attributename + ' <br />');
    }
    attributename = that.translate(GUI.currentLanguage, "height");
    if (ObjectManager.latestFormatSelections.height) {
        html += ('<input id="height" type="checkbox" checked="checked" /> ' + attributename + ' <br />');
    } else {
        html += ('<input id="height" type="checkbox" /> ' + attributename + ' <br />');
    }
    html += ('</div>');
    html += ('<div id="graphicalAttributes">');
    html += '<div style="margin-bottom:3px">Objektdarstellung:</div>';
    attributename = that.translate(GUI.currentLanguage, "fillcolor");
    if (attributes["fillcolor"] && !attributes["fillcolor"].hidden) {
        if (ObjectManager.latestFormatSelections.fillcolor) {
            html += ('<span><input id="fillcolor" type="checkbox" checked="checked" /> ' + attributename + '</span> <br />');
        } else {
            html += ('<span><input id="fillcolor" type="checkbox"  /> ' + attributename + '</span> <br />');
        }
    }
    attributename = that.translate(GUI.currentLanguage, "linecolor");
    if (attributes["linecolor"] && !attributes["linecolor"].hidden) {
        if (ObjectManager.latestFormatSelections.linecolor) {
            html += ('<input id="linecolor" type="checkbox" checked="checked" /> ' + attributename + ' <br />');
        } else {
            html += ('<input id="linecolor" type="checkbox" /> ' + attributename + ' <br />');
        }
    }
    attributename = that.translate(GUI.currentLanguage, "linesize");
    if (attributes["linesize"] && !attributes["linesize"].hidden) {
        if (ObjectManager.latestFormatSelections.linesize) {
            html += ('<input id="linesize" type="checkbox" checked="checked" /> ' + attributename + ' <br />');
        } else {
            html += ('<input id="linesize" type="checkbox" /> ' + attributename + ' <br />');
        }
    }
    html += '</div>';

    content.push(html);


    var dialog = GUI.dialog(
            that.translate(GUI.currentLanguage, "Copy format attributes"),
            content,
            dialog_buttons,
            dialog_width,
            null
            );

}