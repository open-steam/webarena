Exit.showDialog=function() {
	var that = this;

	var dialog_buttons = {
    	"Cancel" : function(){ return false; },
        "OK" : function(){
         	var jstree_selected_item = $('.js-tree').jstree('get_selected');

            that.setAttribute("name", jstree_selected_item.data('name'));
            if (jstree_selected_item.data('type') === "Room") {
                that.setAttribute("destination", jstree_selected_item.data('id'), true);
                that.setAttribute("destinationObject", "", true);
            } else {
                that.setAttribute("destination", jstree_selected_item.data('inRoom'), true);
                that.setAttribute("destinationObject", jstree_selected_item.data('id'), true);
            }
        }

    };
    var dialog_width = 500;
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
        height: 600
    } 

    var dialog = GUI.dialog(
    	that.translate(GUI.currentLanguage, "Object Selection"), 
        "",
        dialog_buttons, 
        dialog_width, 
        additional_dialog_options
    )
        
    dialog.on("dblclick", '.jstree-leaf', function() {
    	$(':button:contains("OK")').click();
    });
}