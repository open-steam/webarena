/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');
var EasyDBImage=Object.create(Modules.ObjectManager.getPrototype('ImageObject'));

EasyDBImage.execute=function(){
	
	var that=this;

    var dialogPage1 = $('<div>').append(
        $('<span>').html('Suchbegriff eingeben:')
        , $('<input>').attr('class', 'maxWidth')
    );


    GUI.dialog('Edit Title', dialogPage1, {
        "OK": function () {
            var searchTerm =  $(dialogPage1).find("input").val();
            var data = {
                roomID : that.getRoomID(),
                objectID: that.getID(),
                searchString: searchTerm
            }

            var dialogPage2 = $('' +
                '<div>' +
                    '<h2> Suchergebnisse werden geladen. </h2>' +
                    '<img src="objects/EasyDBImage/progress.gif">' +
                '</div>'
            );

            GUI.dialog('Select Image', that.renderLoadScreen('.ui-dialog-content'), {
                "OK" : function(){
                    //TODO: check if image selected
                    var pictureUrl = $('.selected-row').attr('easydbdownloadurl');
                    that.setAttribute('remote_url', pictureUrl);

                },
                "Cancel": function(){return false;}

            }, undefined, {
                create : function(){
                    Modules.Dispatcher.query('search', data ,function(searchResults){
                        that.searchTerm = searchTerm;
                        that.renderResultPage(searchResults, ".ui-dialog-content");
                    });
                }
            });


        },

        "Cancel": function () {
            return false;
        }
    }, 300);
}

EasyDBImage.isResizable=function(){
    if (this.getAttribute('remote_url') == false) return false;
    return GeneralObject.isResizable.call(this);
}

//TODO: changeimage action

EasyDBImage.register('EasyDBImage');
EasyDBImage.isCreatable=true;

EasyDBImage.category='Images';

EasyDBImage.isProportional=function(){
    return false;
}

module.exports=EasyDBImage;

