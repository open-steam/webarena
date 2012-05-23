/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
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

    // update content
    if (this.oldContent!=this.getContentAsString()) {   //content has changed
        var text = this.getContentAsString();
        text = text.replace(/[\r\n]+/g, "<br />");
        // TODO Mike check path
        $(rep).find("body>div>div").html(text);
    }
	
    this.oldContent=this.getContentAsString();
}


Discussion.updateInnerHeight = function() {
    var rep=this.getRepresentation();
	
    $(rep).find("body").css("height", this.getAttribute('height')+"px");
    $(rep).find("body>div").css("height", this.getAttribute('height')+"px");
}


Discussion.createRepresentation = function() {
    
    // wrapper
    rep = GUI.svg.other("foreignObject");
    rep.dataObject=this;
    
    // content
    var body = document.createElement("body");
    $(body).append(
        $('<h1>')
        , $('<div>').attr('class', 'scrollWrapper discussion')
        , $('<input>')
    );
   
    // events
    $(body).find("input").keyup(function (event) {
        if (event.keyCode == 13) { // enter
            var value = $(this).val();
            $(this).parent().find('.discussion').append('<p>' + value + '</p>');
            $(this).val('');
        }
    });
    
    // add content to wrapper
    $(rep).append(body);

    // push to gui
    $(rep).attr("id", this.getAttribute('id'));
    this.initGUI(rep);
	
    return rep;
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
    //$(this.getRepresentation()).find("input").focus();
    return true;
};

/* view setter */

Discussion.setViewHeight = function(value) {
    $(this.getRepresentation()).attr("height", parseInt(value));
    GUI.adjustContent(this);
    this.updateInnerHeight();
}


/* get the x position of the objects bounding box (this is the left position of the object) */
GeneralObject.getViewBoundingBoxX = function() {
    return parseInt(this.getAttribute("x"));
}

/* get the y position of the objects bounding box (this is the top position of the object) */
GeneralObject.getViewBoundingBoxY = function() {
    return parseInt(this.getAttribute("y"));
}

/* get the width of the objects bounding box */
GeneralObject.getViewBoundingBoxWidth = function() {
    return parseInt(this.getAttribute("width"));
}

/* get the height of the objects bounding box */
GeneralObject.getViewBoundingBoxHeight = function() {
    return parseInt(this.getAttribute("height"));	
}
