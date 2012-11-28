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

    var dialogPage1 = $('' +
        '<div id="easydb-dialog">' +
            '<input id="search-title" class="maxWidth" placeholder="Titel">' +
            '<input id="search-artist" class="maxWidth" placeholder="Künstler">'+
            '<input id="search-location" class="maxWidth" placeholder="Standort">'+
            '<input id="search-presented-location" class="maxWidth" placeholder="Dargestellter Ort">'+
            '<input id="search-reference" class="maxWidth" placeholder="Abbildungsnachweis">'+
        '</div>'
    );


    GUI.dialog(that.translate(GUI.currentLanguage, "EASYDB_SEARCH_HEADER"), dialogPage1, {
        "OK": function () {

            var searchParams = {
               title :  $(dialogPage1).find("#search-title").val(),
               artist : $(dialogPage1).find("#search-artist").val(),
                location : $(dialogPage1).find("#search-location").val(),
                presentedLocation : $(dialogPage1).find("#search-presented-location").val(),
                reference : $(dialogPage1).find("#search-reference").val()
            };
            var data = {
                roomID : that.getRoomID(),
                objectID: that.getID(),
                searchParams: searchParams
            }

            GUI.dialog(that.translate(GUI.currentLanguage, "EASYDB_IMAGE_SELECTION"), that.renderLoadScreen('.ui-dialog-content'), {
                "OK" : function(){
                    //TODO: check if image selected
                    var pictureUrl = $('.selected-row').attr('easydbdownloadurl');
                    that.setAttribute('remote_url', pictureUrl);
                },
                "Cancel": function(){return false;}

            }, 500, {
                create : function(){
                    Modules.Dispatcher.query('search', data ,function(searchResults){
                        that.searchParams = searchParams;
                        that.renderResultPage(searchResults, ".ui-dialog-content");
                    });
                },
                height: 600
            }).on("dblclick", ".result-row", function(){
                    $(':button:contains("OK")').click();
                });
        },

        "Cancel": function () {
            return false;
        }
    }, 500, {height : 500}).keyup(function(e){
            if(e.keyCode ==13){
                $(':button:contains("OK")').click();
            }
        });
}

EasyDBImage.isResizable=function(){
    //if (this.getAttribute('remote_url') == false) return false;
    return true;
}

//TODO: changeimage action

EasyDBImage.register('EasyDBImage');
EasyDBImage.isCreatable=true;

EasyDBImage.restrictedMovingArea = false;

EasyDBImage.category='Images';



module.exports=EasyDBImage;

