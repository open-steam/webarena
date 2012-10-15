/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*    @author Viktor Koop
*
*/

Discussion.draw=function(){
    // representation
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

    var title = this.getAttribute('discussionTitle') || "TITLE";
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


Discussion.updateInnerHeight = function() {
    var rep=this.getRepresentation();
	
    $(rep).find("body").css("height", this.getAttribute('height')+"px");
    
	//TODO : calculate size with input instead of fixed 75px
    var hh = $(rep).find(".discussion-heading").height();
    var ih = $(rep).find(".discussion-input").height();

	$(rep).find(".discussion-text").css("height", (this.getAttribute('height')- hh - ih - 55)+"px");

}


Discussion.createRepresentation = function() {

    // wrapper
    var rep = GUI.svg.other("foreignObject");
    rep.dataObject=this;
    
    // content
    var body = document.createElement("body");
    $(body).append(
        $('<div class="discussion"><div class="discussion-heading"></div><div class="discussion-text"></div><input class="discussion-input"></div>')
    );


    var that = this;
    that.oldContent = new Array();


    this.fetchContentString(function(remoteContent){
        remoteContent = JSON.parse(remoteContent)
        if(remoteContent){
            that.oldContent = remoteContent;
        }
    });

    that.title = this.getAttribute("discussionTitle") || "TITLE";

    $(body).find("input").keyup(function (event) {
        if (event.keyCode == 13) { // enter
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

            //rep.dataObject.setContent($(this).parent().find('.discussion').html());

        }
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

Discussion.renderMessage = function(message){
    return "<div class='discussion-statement'><div class='discussion-statement-heading'><span class='message-author'>" + message.author +"</span><span class='message-timestamp'>(" + this.formatTimestamp(message.timestamp) +")</span></div> <p class='discussion-statement-text'> " + message.text +"</p></div>";
}

Discussion.formatTimestamp = function(time){
    return moment(time).format('DD.MM.YYYY HH:mm');
    return  //$.datepicker.formatDate('dd.mm.y', new Date(time));
}


Discussion.editText = function() {
    // representation
    var rep = this.getRepresentation();
    var that = this;

    //$(rep).find(".discussion-heading").html("<textarea rows='20' cols='20'> Test</textarea>");


    // dialog content
    var content = $('<div>').append(
        $('<span>').html('You can change the title below:')
        , $('<textarea>').attr('class', 'maxWidth').val(that.getAttribute("discussionTitle"))
    );
        
    // values
//    content.find('input').value($(rep).attr('title'));
    var that = this;
    
    // dispatch
    GUI.dialog('Edit Title', content, {
        "OK": function () {
            var title = $(content).find("textarea").val();
            that.setAttribute("discussionTitle", title);
        },
        "Cancel": function () {
            return false;
        }
    }, 300);
}

// override clickHandler for input field
Discussion.selectedClickHandler = function (event) {
    //GeneralObject.selectedClickHandler.call(this);
    $(this.getRepresentation()).find("input").focus();
    return true;
};

/* view setter */

Discussion.setViewHeight = function(value) {
    $(this.getRepresentation()).attr("height", parseInt(value));
    GUI.adjustContent(this);
    this.updateInnerHeight();
}


/* get the x position of the objects bounding box (this is the left position of the object) */
Discussion.getViewBoundingBoxX = function() {
    return parseInt(this.getAttribute("x"));
}

/* get the y position of the objects bounding box (this is the top position of the object) */
Discussion.getViewBoundingBoxY = function() {
    return parseInt(this.getAttribute("y"));
}

/* get the width of the objects bounding box */
Discussion.getViewBoundingBoxWidth = function() {
    return parseInt(this.getAttribute("width"));
}

/* get the height of the objects bounding box */
Discussion.getViewBoundingBoxHeight = function() {
    return parseInt(this.getAttribute("height"));	
}
