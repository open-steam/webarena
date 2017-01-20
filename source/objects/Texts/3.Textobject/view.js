/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

Textobject.draw = function(external) {
    var ObjectsListOfRoom =ObjectManager.getObjects();
    var that=this;
    
    Object.keys(ObjectsListOfRoom).forEach(function(key) {
        if(key == that.id){
            GeneralObject.draw.call(that,external);
	
            //if (this.hasContent() == false || this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) {

            if (that.getAttribute("bigIcon")) {
                that.setViewWidth(64);
                that.setViewHeight(64);
            } else {
                that.setViewWidth(32);
                that.setViewHeight(32);
            }

            //}

            var rep = that.getRepresentation();

            if (that.getIconText()) {
                that.renderText(that.getIconText());
            } else {
                $(rep).find("text").remove();
            }

            if ($("#FileContentDialog_"+that.id).dialog( "isOpen" ) != true){
                $(rep).css("opacity", (that.getAttribute('opacity')/100));
            }

            if (!$(rep).hasClass("selected")) {
                var linecolor = that.getAttribute('linecolor');
                if(linecolor == "rgba(0, 0, 0, 0)"){
                    $(rep).find("rect").removeAttr("stroke");
                    $(rep).find("rect").removeAttr("stroke-width");
                }
                else{
                    $(rep).find("rect").attr("stroke", linecolor);
                    $(rep).find("rect").attr("stroke-width", that.getAttribute('linesize'));
                }
            }

            that.createPixelMap();
        }
        
    });

	
}

/* get the width of the objects bounding box */
Textobject.getViewBoundingBoxWidth = function() {
	//if (this.hasContent() == false || this.getAttribute("preview") == false) {
	if (this.getAttribute("bigIcon")) {
		return 64;
	} else return 32;
	//} else {
		//return GeneralObject.getViewBoundingBoxWidth.call(this);
	//}
}

/* get the height of the objects bounding box */
Textobject.getViewBoundingBoxHeight = function() {
	//if (this.hasContent() == false || this.getAttribute("preview") == false) {
	if (this.getAttribute("bigIcon")) {
		return 64;
	} else return 32;
	//} else {
		//return GeneralObject.getViewBoundingBoxHeight.call(this);
	//}
}

Textobject.getStatusIcon = function() {
		return this.getIconPath() + "/text";
}


Textobject.getIconText = function() {
    //if ((this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) && this.hasContent()) {
    return this.getAttribute("name");
    //} else return false;
}


Textobject.buildContentDialog = function(userAction){
		var that = this;
		var type = this.getAttribute("mimeType");

        var name = this.getAttribute("name");
        name = name.split(' ').join('_');
		$("body").first().append('<div id="FileContentDialog_'+this.id+'" title='+name+'></div>');
		$("#FileContentDialog_"+this.id).dialog({
			position: { my: "left top", at: "left top", of: $("#"+that.id).find("image")}
		});
		
		$("#FileContentDialog_"+this.id).parent().css("-webkit-box-shadow", "3px 3px 6px rgba(0, 0, 0, 0.5)");
		$("#FileContentDialog_"+this.id).parent().css("-moz-box-shadow", "3px 3px 6px rgba(0, 0, 0, 0.5)");
		$("#FileContentDialog_"+this.id).parent().css("box-shadow", "3px 3px 6px rgba(0, 0, 0, 0.5)");

		$("#FileContentDialog_"+this.id).append('<iframe id="iframeText" width="100%" height="99%" src="/guis.common/libraries/summernote/dist/index.html"></iframe>');
		$("#FileContentDialog_"+that.id).css("overflow", "hidden");
		that.openContentDialog(window.innerWidth*0.6, window.innerHeight);
	
		$("#FileContentDialog_"+this.id).on( "dialogbeforeclose", function(event, ui) {
			that.closeContentDialog();
		});
        
        //Event handler for the browser back function
        $(window).on('popstate', function(userAction) {
			//userAction must be a boolean so Jquerey-Events cant trigger this function
			if(userAction == true)
            	that.closeContentDialog();
            $("#FileContentDialog_"+this.id).dialog( "destroy" );
        });



}


Textobject.removeContentDialog = function(){
	if ($("#FileContentDialog_"+this.id).length != 0) {
		$("#FileContentDialog_"+this.id).parent().remove();
		$("#FileContentDialog_"+this.id).remove();
	}
}


Textobject.openContentDialog = function(w, h){
	var that = this;
	
	$("#FileContentDialog_"+this.id).dialog( "option", "position", {my: "left top", at: "left top", of: $("#"+this.id).find("image")});
	$("#FileContentDialog_"+this.id).dialog("open");
	$("#FileContentDialog_"+this.id).parent().css("width", "64px");
	$("#FileContentDialog_"+this.id).parent().css("height", "64px");	
	
	if(w){
		this.naturalWidth = w;
        localStorage['naturalWidth_'+this.id]=w;
	}else{
        this.naturalWidth=localStorage['naturalWidth_'+this.id];
    }
    
	if(h){
		this.naturalHeight = h;
        localStorage['naturalHeight_'+this.id]=h;
	}else{
        this.naturalHeight=localStorage['naturalHeight_'+this.id];
    }
	
	var aspectRatio = this.naturalWidth/this.naturalHeight;
	var maxWidth;
	var maxHeight = window.innerHeight-160;
	
	if(GUI.sidebar.open){
		maxWidth = window.innerWidth-350;
	}
	else{
		maxWidth = window.innerWidth-120;
	}
	
	var dialogWidth = this.naturalWidth;
	var dialogHeight = this.naturalHeight;
	
	//resize dialog if window ist too small
	if(dialogWidth > maxWidth){
		var dialogWidth = maxWidth;
		var dialogHeight = maxWidth/aspectRatio;
	}
	if(dialogHeight > maxHeight){
		var dialogHeight = maxHeight;
		var dialogWidth = maxHeight*aspectRatio;
	}
	
	var pdf_top;
	var pdf_left;
	if(localStorage['top_'+this.id] == "undefined" || localStorage['top_'+this.id] == "undefined"){
		pdf_top = ($(window).scrollTop()+70)+"px";
		pdf_left =($(window).scrollLeft()+50)+"px";
	}else{
		pdf_top = localStorage['top_'+this.id];
		pdf_left = localStorage['left_'+this.id];
	}
	
	$("#FileContentDialog_"+this.id).parent().animate({
		width: dialogWidth+"px",
		height: (dialogHeight+40)+"px",
		top: ($(window).scrollTop()+70)+"px",
		left: ($(window).scrollLeft()+50)+"px"
	}, 1000);
	
	$("#FileContentDialog_"+this.id).animate({
		height: dialogHeight+"px"
	}, 1000);
	
	$("#"+this.id).css("opacity", 0.3);
	
	setTimeout(function(){
		$(document.getElementById("FileContentDialog_"+that.id)).find('iframe').contents().find('#noteData').html(that.getAttribute("editorText"));
	}, 1500);

}

Textobject.mergeContent = function(){
	
	var newStr = $(document.getElementById("FileContentDialog_"+this.id)).find('iframe').contents().find('#noteData').html();
	
	newStr = newStr.replace('&nbsp;',' ');
	
	if (!newStr) {
		alert('Achtung! Die Abfrage des Editorinhalts ergab einen leeren String! Solltet ihr das nicht beabsichtigt haben, ist hier ein Fehler aufgeteten! Bitte unbedingt melden und dazu sagen, wie es dazu gekommen ist! Der alte Text bleibt erhalten!');
		return;
	}
	
	if (newStr=="<p><br></p>" || newStr=="<p></p>"){
		alert('Achtung! Der Text ist leer! Solltet ihr das nicht beabsichtigt haben, ist hier ein Fehler aufgeteten! Bitte unbedingt melden und dazu sagen, wie es dazu gekommen ist! Der alte Text bleibt erhalten!');
		return;		
	}
	
	
	this.setAttribute("editorText",newStr);
}

Textobject.closeContentDialog = function(){
	var that = this;
	this.mergeContent();
	
	localStorage['naturalWidth_'+this.id]=$("#FileContentDialog_"+this.id).width();
	localStorage['naturalHeight_'+this.id]=$("#FileContentDialog_"+this.id).height();
	localStorage['top_'+this.id] = $("#FileContentDialog_"+this.id).position().top;
	localStorage['left_'+this.id] = $("#FileContentDialog_"+this.id).position().left;
	
	$("#FileContentDialog_"+this.id).parent().animate({
		width: "64px",
		height: "64px",
		top: (that.getAttribute("y")+30)+"px",
		left: that.getAttribute("x")+"px"
	}, 1000, function() {
		that.draw();
		that.deleteContentDialog();
	});

	
}
Textobject.deleteContentDialog = function(){
	$("#FileContentDialog_"+this.id).remove();
};