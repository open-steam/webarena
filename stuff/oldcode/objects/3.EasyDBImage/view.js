/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

EasyDBImage.addControl = function(type, resizeFunction) {

    var timeout;
    var that = this;

    var timedFunction = function(){
        var data = {};

        var maxSideLength = Math.max(that.getViewWidth(), that.getViewHeight());

        var params =  {
            'id' : that.getAttribute('easydb_id'),
            'size' : maxSideLength + 100 
        }

        var callback = function (searchResults) {
            var old_url = that.getAttribute('remote_url')
            if(old_url !== searchResults){
                that.setAttribute('remote_url', searchResults);
                that.draw();
            }
        }
        this.serverCall("getUrls", params, callback);
    }

    var functionWrapper = function(){
        if (timeout){
            clearTimeout(timeout);
        }

        timeout = setTimeout(timedFunction, 3000);
        resizeFunction.apply(this, arguments);
    }

    GeneralObject.addControl.call(this, type, functionWrapper);
}

EasyDBImage.createRepresentation=function(parent) {
    var rep = GUI.svg.group(parent,this.getAttribute('id'));

    var rect = GUI.svg.rect(rep, 0,0,10,10);
    $(rect).attr("fill", "transparent");
    $(rect).addClass("borderRect");

    var imgUrl = this.getAttribute('remote_url') || "../../guis.common/images/imageNotFound.png";
    GUI.svg.image(rep, 0, 0, 100, 100, imgUrl);

    rep.dataObject=this;
    this.initGUI(rep);

    return rep;

}


EasyDBImage._checkAndUpdateImage = function(){
    var that = this;
    var remoteUrl = this.getAttribute('remote_url')
    var rep=this.getRepresentation();

    var imageHasChanged = (remoteUrl && $(rep).find('image').attr("href")!== remoteUrl);

    if(imageHasChanged){
        $(rep).find('image').attr("href", remoteUrl);
    }
}

EasyDBImage.draw = function(){
    this._checkAndUpdateImage();

    GeneralObject.draw.call(this);
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
        $(result).append(this.renderPaginatorButton(i+1, rowsPerPage * i, rowsPerPage, false, extraClass));
    }

    return result;
}

EasyDBImage.renderPaginatorButton = function(number, offset, limit, current, extraClass){

    var that=this;

    //var button = "<div class='paginator-button'>" + number + "</div>";
    var button = document.createElement("div");
    $(button).addClass('paginator-button');
    if(extraClass) {$(button).addClass(extraClass);}
    $(button).html( number );


    $(button).on('click', function(){
        that.renderLoadScreen(".ui-dialog-content");
        that.serverCall("search", that.searchParams, offset, limit, function(searchResults){
            that.renderResultPage(searchResults, ".ui-dialog-content");
        })
    });
    $(button).on('click', function(){
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

    var checkIfNull = function(toCheck){
        if(toCheck === null || toCheck === undefined){
            return "";
        } else return toCheck;
    }

    var dialogPage2 = '';
    dialogPage2 += ""+
        "<div class='easydb-result-wrapper'>"+
        "<table>";
    $.each(data, function(index, imageInformation){
        dialogPage2 += ""+
            "<tr class='result-row' onclick='EasyDBImage.selectRow(event)' easydbimageid='"+ imageInformation.easydbId+ "' " +
                        "easydbtitel='" + imageInformation.titel + "' " +
                        "easydbkuenstler='" + imageInformation.kuenstler + "' " +
            "easydbstandort='" + imageInformation.standort + "' " +
            "easydbdargestellter_ort='" + imageInformation.dargestellter_ort + "' " +
            "easydbdatierung='" + imageInformation.datierung + "' " +
            "easydbdownloadurl='" + imageInformation.originalUrl +"'>" +
            "<td>" +
            "<img class='result-row-image' src='" + imageInformation.url + "'>" +
            "</td>" +
            "<td>" +
            "<table>" +
            "<tr>" +
            "<th>Titel" +
            "</th>" +
            "<td>" + checkIfNull(imageInformation.titel) +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<th>Künstler" +
            "</th>" +
            "<td>" + checkIfNull(imageInformation.kuenstler) +
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





