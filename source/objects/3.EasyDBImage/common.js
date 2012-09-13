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
    var urls = new Array(
        'http://tier-bilder.net/data/media/2/Hund-4e652b5ca95bf.jpg',
        'http://tier-bilder.net/data/media/2/Hund-4e652b5ca95bf.jpg',
        'http://tier-bilder.net/data/media/2/Hund-4e652b5ca95bf.jpg');
     var dialogPage2 = "<div>";
    console.log(urls.length);
    $.each(urls, function(index, url){
        dialogPage2 += "<img style='float: left;' src='" + url + "'>";
    });
        //dialogPage2 += "<img src='" + urls[j] + "'>";

    dialogPage2 += "</div>";

    var dialogPage1 = $('<div>').append(
        $('<span>').html('Suchbegriff eingeben:')
        , $('<input>').attr('class', 'maxWidth')
    );

    GUI.dialog('Edit Title', dialogPage1, {
        "OK": function () {
            var searchTerm =  $(dialogPage1).find("input").val();

            GUI.dialog('Select Image', dialogPage2, {
                "OK" : function(){},
                "Cancel": function(){return false;}
            })
        },
        "Cancel": function () {
            return false;
        }
    }, 300);
	
	//GUI.uploadFile(this,this.translate(GUI.currentLanguage, "please select an image"));
	// <-- this is the right place to select an easyDB image =)

}

//TODO: changeimage action

EasyDBImage.register('EasyDBImage');
EasyDBImage.isCreatable=true;

EasyDBImage.category='Images';

module.exports=EasyDBImage;