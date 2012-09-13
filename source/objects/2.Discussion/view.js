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



    // set properties
    this.setViewX(this.getAttribute('x'));
    this.setViewY(this.getAttribute('y'));
    this.setViewWidth(this.getAttribute('width'));
    this.setViewHeight(this.getAttribute('height'));

    // draw outer line
    var linesize = this.getAttribute('linesize')+0;
	
    if (linesize > 0) {  // draw line
        $(rep).find("body>div").css("border-color", this.getAttribute('linecolor'));
        $(rep).find("body>div").css("border-width", this.getAttribute('linesize'));
        $(rep).find("body>div").css("padding", "5px");
    } else {  // no line
        $(rep).find("body>div").css("border-color", "none");
        $(rep).find("body>div").css("border-width", "0px");
        $(rep).find("body>div").css("padding", "0px");
		
    }



    // apply properties
    $(rep).find("body>div").css("background-color", this.getAttribute('fillcolor'));
    $(rep).find("body").css("font-size", this.getAttribute('font-size'));
    $(rep).find("body").css("font-family", this.getAttribute('font-family'));
    $(rep).find("body").css("color", this.getAttribute('font-color'));	
    $(rep).attr("layer", this.getAttribute('layer'));
	
	console.log(this.getAttribute('discussionText'));

    // update content
    if (this.oldContent !== this.getAttribute('discussionText')) {   //content has changed
        console.log('test');
        var text = '';
        var messageArray = this.getAttribute('discussionText');
        for (var i = 0; i < messageArray.length; ++i){
            text += this.renderMessage(messageArray[i]);
        }
        text = text.replace(/[\r\n]+/g, "<br />");

        $(rep).find(".discussion").html(text);
        this.oldContent=messageArray;
    }
	


	
}


Discussion.updateInnerHeight = function() {
    var rep=this.getRepresentation();
	
    $(rep).find("body").css("height", this.getAttribute('height')+"px");
    
	//TODO : calculate size with input instead of fixed 75px
	$(rep).find("body>div").css("height", (this.getAttribute('height')-75)+"px");

}


Discussion.createRepresentation = function() {

    // wrapper
    var rep = GUI.svg.other("foreignObject");

	
    rep.dataObject=this;
    
    // content
    var body = document.createElement("body");
    $(body).append(
        $('<h1>')
        , $('<div>').attr('class', 'scrollWrapper discussion')
        , $('<input>')
    );


    var that = this;
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
            console.log(message);

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
    return "<p>" + message.author +" (" + message.timestamp +"): " + message.text +"</p>";
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
    
    // dispatch
    GUI.dialog('Edit Title', content, {
        "OK": function () {
            Discussion.title = $(content).find("input").val();
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
