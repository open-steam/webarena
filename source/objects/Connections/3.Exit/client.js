Exit.showDialog=function() {
	var that = this;

	var dialog_buttons = {};
			
	dialog_buttons[that.translate(GUI.currentLanguage, "create new Subroom")] = function(){ 
		
		var random=new Date().getTime()-1296055327011;
		
		that.setAttribute('destination', random);
		that.setAttribute("destinationObject", "choose");
		GUI.updateInspector();
	};
			
	dialog_buttons[that.translate(GUI.currentLanguage, "Cancel")] = function(){ return false; };
	
	dialog_buttons[that.translate(GUI.currentLanguage, "Okay")] = function(){
		
        var jstree_selected_item = $('.js-tree').jstree('get_selected');
		
		if (jstree_selected_item.data('type') === "Room") {
			that.setAttribute("destination", jstree_selected_item.data('id'));
			that.setAttribute("destinationObject", "choose");
		} else {
			that.setAttribute("destination", jstree_selected_item.data('inRoom'));
			that.setAttribute("destinationObject", jstree_selected_item.data('id'));
		}
			
		GUI.updateInspector();
    };
	
    var dialog_width = 600;
    var additional_dialog_options = {
    	create : function() {
            var renderedTree = $("<div class='js-tree objectBrowserTree'></div>").jstree({
                "json_data"  : {
                    "data"  : function(object, callback) {
                        if (object !== -1) {
                            var id = object.data("id");
                        } else {
                            var id = -1;
                        }
                        that.serverCall("browse", { "id" : id }, callback);
                    },
                    "ui" : {
                        "select_limit" : 1,
                    },
                    "progressive_render" : true
                },
                "plugins" : [ "themes", "json_data", "ui" ]
            }).bind("loaded.jstree", function () { 
                $('a > .jstree-icon').css({ 'background-size' : 'contain' }) 
            }).bind("open_node.jstree", function () { 
                $('a > .jstree-icon').css({ 'background-size' : 'contain' }) 
            });
		
            $('.ui-dialog-content').html(renderedTree);

            // bigger icons
            //$('<style>.objectBrowserTree a > ins {width: 36px; height: 36px;} .objectBrowserTree a { min-height:36px; line-height:36px; } </style>').appendTo("head");
        }, 
        height: 400
    } 

    var dialog = GUI.dialog(
    	that.translate(GUI.currentLanguage, "Object Selection"), 
        "",
        dialog_buttons, 
        dialog_width, 
        additional_dialog_options
    )
	
	$(':button:contains('+that.translate(GUI.currentLanguage, "Okay")+')').attr("disabled", true);
	
	$( ".ui-dialog-buttonpane" ).append('<input id="filterObjects" type="checkbox">'+that.translate(GUI.currentLanguage, "Show objects")+'<br>');
		
	if(that.getAttribute('filterObjects')){
		$('#filterObjects').prop('checked', false);
	}
	else{
		$('#filterObjects').prop('checked', true);
	}
	
	
	$('#filterObjects').click(function() {
        if ($(this).is(':checked')) {
            that.setAttribute('filterObjects',false);
			$(':button:contains('+that.translate(GUI.currentLanguage, "Cancel")+')').click();
			that.showDialog(); 
        }
		else{
			that.setAttribute('filterObjects',true);
			$(':button:contains('+that.translate(GUI.currentLanguage, "Cancel")+')').click();
			that.showDialog(); 
		}
    });

        
    dialog.on("dblclick", '.jstree-clicked', function() {
		$(':button:contains('+that.translate(GUI.currentLanguage, "Okay")+')').attr("disabled", false);
    	$(':button:contains('+that.translate(GUI.currentLanguage, "Okay")+')').click();
    });
	
	dialog.on("click", '.jstree-clicked', function() {
		$(':button:contains('+that.translate(GUI.currentLanguage, "Okay")+')').attr("disabled", false);
	});
	
}