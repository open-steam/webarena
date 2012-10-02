/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

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

EasyDBImage.renderPagination = function(data){
    //var result = "<div class='paginator'></div>";
    var result = document.createElement('div');
    $(result).addClass('paginator');
    $(result).addClass('ui-helper-clearfix');
    var absRowCount = data[0]['cnt'];
    var rowsPerPage = 10;
    var pageCount = Math.ceil(absRowCount / rowsPerPage);


    for(var i = 0 ; i< pageCount; i++){
        //$(dialogPage2).append(this.renderPaginatorButton(i));
        //result += (this.renderPaginatorButton(i));
        $(result).append(this.renderPaginatorButton(i, rowsPerPage * i, rowsPerPage, false));
    }

    return result;
}

EasyDBImage.renderPaginatorButton = function(number, offset, limit, current){
    console.log(number);
    //TODO: searchTerm
    var that=this;
    var data = {
        roomID : that.getRoomID(),
        objectID: that.getID(),
        searchString: "hund",
        offset: offset,
        limit: limit
    }

    //var button = "<div class='paginator-button'>" + number + "</div>";
    var button = document.createElement("div");
    $(button).addClass('paginator-button');
    $(button).html( number );


    $(button).on('click', function(){
        console.log('click2');
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

EasyDBImage.createRepresentation=function() {

    var rep = GUI.svg.image(10, 10, 10, 10, this.getAttribute('remote_url'));

    rep.dataObject=this;

    $(rep).attr("id", this.getAttribute('id'));

    this.initGUI(rep);

    return rep;

}


EasyDBImage.updateImage=function(){

    var rep=this.getRepresentation();

    if (this.hasContent() == false) {

        GeneralObject.draw.call(this);

        $(rep).attr("href", "../../guis.common/images/imageNotFound.png");

        this.setViewWidth(128);
        this.setViewHeight(101);

    } else {

        GeneralObject.draw.call(this);

        $(rep).attr("href", this.getAttribute('remote_url'));

    }

}