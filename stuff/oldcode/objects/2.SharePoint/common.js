var Modules=require('../../server.js');
var SharePoint=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));


SharePoint.register=function(type){

    // Registering the object

    GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
    GeneralObject.register.call(this,type);

    this.registerAction('Extern öffnen',function(){
        var selected = ObjectManager.getSelected();
        for (var i in selected) {
            var obj = selected[i];

            obj.openWindow();
        }
    },false);
}

SharePoint.execute=function(){
    var that=this;
    var rep=this.getRepresentation();

    var is_shown_in_iframe = this.getAttribute("show_iframe") || false;
    var src_is_set = Boolean(this.getAttribute("sharepoint_src"));

    if(src_is_set && !is_shown_in_iframe){
        this.switchState();
    }  else if(!src_is_set) {


        var dialog_buttons = {
            "Cancel": function(){return false;},
                "OK" : function(){
                    var jstree_selected_item = $('.js-tree').jstree('get_selected');
                    var selectedUrl = jstree_selected_item.data('media_src');
                    var selectedFilename = jstree_selected_item.data('filename');
                    that.setAttribute("sharepoint_src", selectedUrl);
                    that.setAttribute("name", selectedFilename);
                    that.setAttribute("bigIcon", true);

                    that.renderFilename(rep, selectedFilename );
                    that.updateIcon();
                }

        };
        var dialog_width = 500;
        var additional_dialog_options = {
            create : function(){
                var resCallback = function(tree){

                    var renderedTree = $("<div class='js-tree'></div>").jstree({
                        json_data  : {
                            data  : tree
                        },
                        "plugins" : [ "themes", "json_data", "ui" ]
                    });
                    $('.ui-dialog-content').html(renderedTree);
                };
                that.serverCall("browse", {}, resCallback);

            }, 
            height: 600
        } 

        var dialog = GUI.dialog(
            that.translate(GUI.currentLanguage, "FILE_SELECTION"), 
            that.renderLoadScreen(".ui-dialog-content"), 
            dialog_buttons, 
            dialog_width, 
            additional_dialog_options
        )
        
        dialog.on("dblclick", '.jstree-leaf', function(){
            $(':button:contains("OK")').click();
        });
    }

}


SharePoint.isResizable=function(){
    return (!!this.getAttribute('show_iframe'));
}

SharePoint.init=function(id){
    return GeneralObject.init.call(this, id);
}

SharePoint.register('SharePoint');
SharePoint.category='Files';
SharePoint.isCreatable=true;
SharePoint.moveByTransform = function(){
    if(this.getAttribute("show_iframe")){
        return false;
    } else {
        return true;
    }
}

SharePoint.restrictedMovingArea = true;

module.exports=SharePoint;