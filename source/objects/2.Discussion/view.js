/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*    @author Viktor Koop
*
*/

Discussion.switchState = function(){
    var embedded = this.getAttribute("show_embedded");

    this.setAttribute("show_embedded", !embedded);
    if(!embedded){
        this.setAttribute("width", 700);
        this.setAttribute("height", 800);
    } else {
        this.setAttribute("width", 64*2.5);
        this.setAttribute("height", 64*1.5)
    }

    $('#' + this.getAttribute('id')).remove();
    this.getRepresentation();
}

Discussion.drawEmbedded = function(){
    var rep=this.getRepresentation();
    rep.dataObject=this;


    // set properties
    this.setViewX(this.getAttribute('x'));
    this.setViewY(this.getAttribute('y'));
    this.setViewWidth(this.getAttribute('width'));
    this.setViewHeight(this.getAttribute('height'));

    // draw outer line
    var linesize = this.getAttribute('linesize')+0;

    if (linesize > 0) {  // draw line
        $(rep).find(".discussion-text").css("border-color", this.getAttribute('linecolor'));
        $(rep).find(".discussion-text").css("border-width", this.getAttribute('linesize'));
        $(rep).find(".discussion-text").css("padding", "5px");
    } else {  // no line
        $(rep).find(".discussion-text").css("border-color", "none");
        $(rep).find(".discussion-text").css("border-width", "0px");
        $(rep).find(".discussion-text").css("padding", "0px");

    }



    // apply properties
    $(rep).find(".discussion-text").css("background-color", this.getAttribute('fillcolor'));
    $(rep).find("body").css("font-size", this.getAttribute('font-size'));
    $(rep).find("body").css("font-family", this.getAttribute('font-family'));
    $(rep).find("body").css("color", this.getAttribute('font-color'));
    $(rep).attr("layer", this.getAttribute('layer'));

    var title = this.getAttribute('discussionTitle') || "Bitte hier klicken, um das Thema zu ändern.";
    $(rep).find(".discussion-heading").html(title);
    var that = this;

    this.fetchContentString(function(remoteContent){

        if(remoteContent !== ""){
            remoteContent = JSON.parse(remoteContent);
        }

        // update content
        if (that.oldContent !== remoteContent) {   //content has changed

            var text = '';
            var messageArray = remoteContent;
            for (var i = 0; i < messageArray.length; ++i){
                text += that.renderMessage(messageArray[i]);
            }
            text = text.replace(/[\r\n]+/g, "<br />");

            $(rep).find(".discussion-text").html(text);
            that.oldContent=messageArray;
        }
    });
}

Discussion.drawIcon = function(){
    var rep=this.getRepresentation();

    this.setViewX(this.getAttribute('x'));
    this.setViewY(this.getAttribute('y'));

    this.setViewWidth(this.getAttribute('width'));
    this.setViewHeight(this.getAttribute('height'));
}

Discussion.draw=function(){
    var embedded = this.getAttribute("show_embedded");
    if(embedded){
        this.drawEmbedded();
    } else {
        this.drawIcon();
    }
}




Discussion.createRepresentationEmbedded = function(){
    var that = this;

    // wrapper
    var rep = GUI.svg.other("foreignObject");
    rep.dataObject=this;

    // content
    var body = document.createElement("body");
    $(body).append(
        $('<div class="discussion"><div class="embedded-toolbar moveArea"><span class="minimize-button"></span></div><div class="discussion-heading"></div><div class="discussion-text"></div><input class="discussion-input"></div>')
    );



    that.oldContent = new Array();


    this.fetchContentString(function(remoteContent){
        if(remoteContent){
            remoteContent = JSON.parse(remoteContent)
            if(remoteContent){
                that.oldContent = remoteContent;
            }
        }

    });

    that.title = this.getAttribute("discussionTitle") || "TITLE";

    $(body).find("input").keyup(function (event) {
        if (event.keyCode == 13 && $(this).val()!= "") { // enter
            var value = $(this).val();

            var message = {};
            message.author = GUI.username;
            message.timestamp = new Date();
            message.text = value;

            if(!that.oldContent){
                that.oldContent = new Array();
            }
            that.oldContent.push(message);

            $(this).val('');

            that.setContent(JSON.stringify(that.oldContent));
            $(body).find(".discussion-text").animate(
                { scrollTop : $(body).find(".discussion-text").prop("scrollHeight")}, 3000
            );
        }
    });

    $(body).on("click", ".discussion-text, .moveArea, .discussion-input", function(){
        if(!that.selected){
            that.select();
        }
    });

    $(body).on("click", ".minimize-button", function(){
        that.switchState();
    });

    // add content to wrapper
    $(rep).append(body);

    // push to gui
    $(rep).attr("id", this.getAttribute('id'));
    this.initGUI(rep);
    this.draw();

    setTimeout(function(){
        $(body).find(".discussion-text").animate(
            { scrollTop : $(body).find(".discussion-text").prop("scrollHeight")}, 0
        );
    }, 1000);

    return rep;
}

Discussion.createRepresentationIcon = function(){

    //var rep = GUI.svg.group(this.getAttribute('id'));
    var rep = GUI.svg.other("foreignObject");

    var body = document.createElement("body");
    $(body).append("<div class='discussion-blob moveArea triangle-border'><div class='wrapped-text'>" + this.getAttribute('discussionTitle') + "</div></div>");

    $(rep).append(body);
    $(rep).attr("id", this.getAttribute('id'));
    $(rep).find('.wrapped-text').dotdotdot();

    //GUI.svg.image(rep, 0, 0, 64, 64, this.getFileIcon());
    //$(rep).find('image').addClass('moveArea');

    return rep;

}

Discussion.getFileIcon = function(){
    return "../../guis.common/images/discussion.png";
}


Discussion.createRepresentation = function() {
    var embedded = this.getAttribute("show_embedded");
    var rep;
    if(embedded){
        rep = this.createRepresentationEmbedded();
    } else {
        rep = this.createRepresentationIcon();
    }

    return rep;

}

Discussion.renderMessage = function(message){
    return "<div class='discussion-statement'><div class='discussion-statement-heading'><span class='message-author'>" + message.author +"</span><span class='message-timestamp'>(" + this.formatTimestamp(message.timestamp) +")</span></div> <p class='discussion-statement-text'> " + message.text +"</p></div>";
}

Discussion.formatTimestamp = function(time){
    return moment(time).format('DD.MM.YYYY HH:mm');
}


/* view setter */
Discussion.setViewHeight = function(value) {
    GeneralObject.setViewHeight.call(this, value);
    $(this.getRepresentation()).attr("height", parseInt(value));
    this.updateInnerHeight(parseInt(value));


}

Discussion.updateInnerHeight = function(value) {
    var embedded = this.getAttribute("show_embedded");

    if(embedded){
        this.updateInnerHeightEmbedded(value);
    } else {
        this.updateInnerHeightIcon(value);
    }
}

Discussion.updateInnerHeightEmbedded = function(value){
    console.log('test');
    var rep=this.getRepresentation();


    $(rep).find("body").css("height", value+"px");

    //TODO : calculate size with input instead of fixed 75px
    var hh = $(rep).find(".discussion-heading").height();
    var ih = $(rep).find(".discussion-input").height();

    $(rep).find(".discussion-text").css("height", (value- hh - ih - 90)+"px");


}

Discussion.updateInnerHeightIcon = function(value){
    console.log('test2');
    var rep=this.getRepresentation();

    $(rep).find("body").css("height", value+"px");
    $(rep).find(".wrapped-text").css("height", (value - 50) + "px");
    $(rep).find(".wrapped-text").dotdotdot();


}


/* get the x position of the objects bounding box (this is the left position of the object) */
Discussion.getViewBoundingBoxX = function() {
    return parseInt(this.getAttribute("x"));
}

/* get the y position of the objects bounding box (this is the top position of the object) */
Discussion.getViewBoundingBoxY = function() {
    return parseInt(this.getAttribute("y"));
}

Discussion.representationCreated = function() {
    GeneralObject.representationCreated.call(this);
    var that = this;

    var rep = this.getRepresentation();
    $(rep).find('.discussion-heading').editable(function(value, settings) {
        that.setAttribute("discussionTitle", value);


        return(value);
    }, {
        type      : "autogrow",
        submit    : 'Speichern',
        autogrow : {
            lineHeight : 16,
            maxHeight  : 512
        }
    });

}
