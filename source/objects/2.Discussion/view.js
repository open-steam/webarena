/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*    @author Viktor Koop
*
*/

Discussion.draw=function(){
    console.log("DRAW");

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

    console.log('new');
	console.log(this.getAttribute('discussionText'));
    console.log('old');
    console.log(this.oldContent);

    var title = this.getAttribute('discussionTitle') || "TITLE";
    $(rep).find(".discussion-heading").html(title);


    // update content
    if (this.oldContent !== this.getAttribute('discussionText')) {   //content has changed
        console.log('test');
        var text = '';
        var messageArray = this.getAttribute('discussionText');
        for (var i = 0; i < messageArray.length; ++i){
            text += this.renderMessage(messageArray[i]);
        }
        text = text.replace(/[\r\n]+/g, "<br />");

        $(rep).find(".discussion-text").html(text);
        this.oldContent=messageArray;
    }
	


	
}


Discussion.updateInnerHeight = function() {
    var rep=this.getRepresentation();
	
    $(rep).find("body").css("height", this.getAttribute('height')+"px");
    
	//TODO : calculate size with input instead of fixed 75px
	$(rep).find(".discussion-text").css("height", (this.getAttribute('height')-150)+"px");

}


Discussion.createRepresentation = function() {
    console.log("CREATE");

    // wrapper
    var rep = GUI.svg.other("foreignObject");
    rep.dataObject=this;
    
    // content
    var body = document.createElement("body");
    $(body).append(
        $('<div class="discussion"><h1 class="discussion-heading"></h1><div class="discussion-text"></div><input class="discussion-input"></div>')
    );


    var that = this;
    that.content = this.getAttribute("discussionText") || new Array();
    that.title = this.getAttribute("discussionTitle") || "TITLE";

    //$(body).find(".discussion").html(this.getAttribute("discussionText"));

    // events
    $(body).find("input").keyup(function (event) {
        if (event.keyCode == 13) { // enter
            var value = $(this).val();


            var message = {};
            message.author = GUI.username;
            message.timestamp = new Date();
            message.text = value;

            that.content.push(message);
            console.log(that.content);

            //$(this).parent().find('.discussion').append(that.renderMessage(message));
            $(this).val('');

            that.setAttribute("discussionText", that.content);

            //rep.dataObject.setContent($(this).parent().find('.discussion').html());

        }
    });


    
    // add content to wrapper
    $(rep).append(body);

    /*var that=this;
    this.fetchContentString(function(text){

        if(text!=that.oldContent){
            text = text.replace(/[\r\n]+/g, "<br />");
            $(rep).find(".discussion").html(text);
        }

        that.oldContent=text;
        console.log('test123');

    });*/

    // push to gui
    $(rep).attr("id", this.getAttribute('id'));
    this.initGUI(rep);
	
    return rep;
}

Discussion.renderMessage = function(message){
    return "<div class='discussion-statement'><div class='discussion-statement-heading'><span class='message-author'>" + message.author +"</span><span class='message-timestamp'>(" + this.formatTimestamp(message.timestamp) +")</span></div> <p class='discussion-statement-text'> " + message.text +"</p></div>";
}

Discussion.formatTimestamp = function(time){

    return $.datepicker.formatDate('dd.mm.y', new Date(time));
}


Discussion.editText = function() {
    // representation
    var rep = this.getRepresentation();
    
    // dialog content
    var content = $('<div>').append(
        $('<span>').html('You can change the title below:')
        , $('<input>').attr('class', 'maxWidth')
    );
        
    // values
//    content.find('input').value($(rep).attr('title'));
    var that = this;
    
    // dispatch
    GUI.dialog('Edit Title', content, {
        "OK": function () {
            var title = $(content).find("input").val();
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
