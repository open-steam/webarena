var Modules=require('../../server.js');
var SharePoint=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));


SharePoint.register=function(type){

    // Registering the object

    GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
    GeneralObject.register.call(this,type);

    this.registerAction('Open extern',function(){
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

    if(this.getAttribute("sharepoint_src") && !this.getAttribute("show_iframe")){
        this.switchState();


    }  else if(!this.getAttribute("sharepoint_src")) {
        var data = {
            roomID : that.getRoomID(),
            objectID: that.getID(),
            searchString: "Hund"
        }

        GUI.dialog(that.translate(GUI.currentLanguage, "FILE_SELECTION"), that.renderLoadScreen(".ui-dialog-content"), {
            "OK" : function(){
                var selectedUrl = $('.js-tree').jstree('get_selected').data('media_src');
                var selectedFilename = $('.js-tree').jstree('get_selected').data('filename');
                that.setAttribute("sharepoint_src", selectedUrl);
                that.setAttribute("name", selectedFilename);

                that.renderFilename(rep, selectedFilename );
                that.updateIcon();
            },
            "Cancel": function(){return false;}
        }, 500, {create : function(){
            Modules.Dispatcher.query('search', data ,function(tree){

                var renderedTree = $("<div class='js-tree'></div>").jstree({
                    json_data  : {
                        data  : tree
                    },
                    "plugins" : [ "themes", "json_data", "ui" ]
                }).bind("select_node.jstree", function (event, data) {
                        //console.log(data.rslt.obj.data("media_src"));
                });

                $('.ui-dialog-content').html(renderedTree);
            });

        }, height: 600}  ).on("dblclick", '.jstree-leaf', function(){
                $(':button:contains("OK")').click();
            })
    }

}


SharePoint.isResizable=function(){
    if(this.getAttribute('show_iframe'))   {
        return true;
    } else {
        return false;
    }
}

SharePoint.init=function(id){
    var r = GeneralObject.init.call(this, id);

    console.log(this.getAttribute('sharepoint_src'));
    return r;
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