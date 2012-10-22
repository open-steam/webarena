var Modules=require('../../server.js');
var SharePoint=Object.create(Modules.ObjectManager.getPrototype('File'));


SharePoint.register=function(type){

    // Registering the object

    File=Modules.ObjectManager.getPrototype('File');
    File.register.call(this,type);

}

SharePoint.execute=function(){
    var that=this;
    var rep=this.getRepresentation();

    if(this.getAttribute("sharepoint_src")){
        window.open(this.getAttribute("sharepoint_src"), '_blank');
        window.focus();

    }  else {
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

SharePoint.register('SharePoint');
SharePoint.category='Files';
SharePoint.isCreatable=true;
SharePoint.moveByTransform = true;

SharePoint.restrictedMovingArea = false;

module.exports=SharePoint;