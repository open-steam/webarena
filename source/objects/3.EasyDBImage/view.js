/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/



EasyDBImage.createRepresentation=function() {
    var rep = GUI.svg.group(this.getAttribute('id'));

    var rect = GUI.svg.rect(rep, 0,0,10,10);
    $(rect).attr("fill", "transparent");
    $(rect).addClass("borderRect");



    var imgUrl = this.getAttribute('remote_url') || "../../guis.common/images/imageNotFound.png";
    GUI.svg.image(rep, 0, 0, 100, 100, imgUrl);

    rep.dataObject=this;
    this.initGUI(rep);

    return rep;

}

EasyDBImage.draw = function(){
    var rep=this.getRepresentation();
    var that = this;
    var remoteUrl = this.getAttribute('remote_url')

    if(remoteUrl && $(rep).find('image').attr("href")!== remoteUrl){
        $(rep).find('image').attr("href", remoteUrl);

        var newImg = new Image();
        newImg.src = remoteUrl;
        $(newImg).one("load", function(){
            var newheight = newImg.height;
            var newwidth = newImg.width;

            that.setAttribute("width", newwidth);
            that.setAttribute("height", newheight);

            GeneralObject.draw.call(this);
        });
    } else {
        GeneralObject.draw.call(this);
    }

}

EasyDBImage.renderPagination = function(data){
    //var result = "<div class='paginator'></div>";
    var result = document.createElement('div');
    $(result).addClass('paginator');
    $(result).addClass('ui-helper-clearfix');
    var absRowCount = data[0]['cnt'];
    var rowsPerPage = 10;
    var pageCount = Math.ceil(absRowCount / rowsPerPage);

    var extraClass;
    for(var i = 0 ; i< pageCount; i++){

        if(i == 0){
            extraClass = "first";
        } else if(i == pageCount -1){
            extraClass = "last"
        } else{
            extraClass ="";
        }
        $(result).append(this.renderPaginatorButton(i, rowsPerPage * i, rowsPerPage, false, extraClass));
    }

    return result;
}

EasyDBImage.renderPaginatorButton = function(number, offset, limit, current, extraClass){

    //TODO: searchTerm
    var that=this;
    var data = {
        roomID : that.getRoomID(),
        objectID: that.getID(),
        searchString: that.searchTerm,
        offset: offset,
        limit: limit
    }

    //var button = "<div class='paginator-button'>" + number + "</div>";
    var button = document.createElement("div");
    $(button).addClass('paginator-button');
    if(extraClass) {$(button).addClass(extraClass);}
    $(button).html( number );


    $(button).on('click', function(){
        that.renderLoadScreen(".ui-dialog-content");
        Modules.Dispatcher.query('search', data ,function(searchResults){
            that.renderResultPage(searchResults, ".ui-dialog-content");
        });
    });
    $(button).on('click', function(){
        console.log($(this));
        $(".paginator .current").removeClass('current');
        $(this).addClass('current');

    })

    return (button);

}

EasyDBImage.renderLoadScreen  = function(target){
    var that = this;
    var dialogPage2 = $('' +
        '<div class="easy-load-wrapper">' +
        '<h2> ' +that.translate(GUI.currentLanguage, "WAIT_DIALOG") +'  </h2>' +
        '<img src="/guis.common/images/progress.gif">' +
        '</div>'
    );
    if($('.paginator').length !== 0){
        $(".easydb-result-wrapper").html(dialogPage2 );

    } else {
        return dialogPage2;

    }

}


EasyDBImage.renderResultPage = function(data, target){
    var renderedResults = this.renderResultTable(data);

    if($('.paginator').length !== 0){
        $(target + " .easydb-result-wrapper").replaceWith(renderedResults );

    } else {
        var renderedPaginator = this.renderPagination(data);
        $(target).html(renderedPaginator);
        $(target).append(renderedResults );
        $('.paginator-button').first().addClass('current');
    }
}

EasyDBImage.renderResultTable = function(data){
    var dialogPage2 = '';
    dialogPage2 += ""+
        "<div class='easydb-result-wrapper'>"+
        "<table>";
    $.each(data, function(index, imageInformation){
        dialogPage2 += ""+
            "<tr class='result-row' onclick='EasyDBImage.selectRow(event)' easydbdownloadurl='" + imageInformation.originalUrl +"'>" +
            "<td>" +
            "<img class='result-row-image' src='" + imageInformation.url + "'>" +
            "</td>" +
            "<td>" +
            "<table>" +
            "<tr>" +
            "<th>Titel" +
            "</th>" +
            "<td>" + imageInformation.titel +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<th>Künstler" +
            "</th>" +
            "<td>" + imageInformation.kuenstler +
            "</td>" +
            "</tr>" +
            "</table>" +
            "</td>" +
            "</tr>" ;
    });
    dialogPage2 += "</table></div>";



    return (dialogPage2);
}

EasyDBImage.selectRow = function(event){
    $('.selected-row').removeClass('selected-row');

    var selRow = $(event.target).closest('.result-row');
    $(selRow).addClass('selected-row');
}





