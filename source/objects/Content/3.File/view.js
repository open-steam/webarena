/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

WAFile.draw = function(external) {
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
WAFile.getViewBoundingBoxWidth = function() {
	//if (this.hasContent() == false || this.getAttribute("preview") == false) {
	if (this.getAttribute("bigIcon")) {
		return 64;
	} else return 32;
	//} else {
		//return GeneralObject.getViewBoundingBoxWidth.call(this);
	//}
}

/* get the height of the objects bounding box */
WAFile.getViewBoundingBoxHeight = function() {
	//if (this.hasContent() == false || this.getAttribute("preview") == false) {
	if (this.getAttribute("bigIcon")) {
		return 64;
	} else return 32;
	//} else {
		//return GeneralObject.getViewBoundingBoxHeight.call(this);
	//}
}

WAFile.getStatusIcon = function() {
	if (this.hasContent() == false) {
		return this.getIconPath() + "/upload";
	} else { //if (this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) {	
		var typeIcon = "file";
		var mimeType = this.getAttribute("mimeType");
	
		if (mimeType) {
			if (mimeType.indexOf('image') != -1) typeIcon = "image";
			if (mimeType.indexOf('msexcel') != -1 || mimeType.indexOf('ms-excel') != -1 || mimeType.indexOf('officedocument.spreadsheetml') != -1) typeIcon = "excel";
			if (mimeType == 'application/zip') typeIcon = "archive";
			if (mimeType == 'application/pdf') typeIcon = "pdf";
			if (mimeType == 'application/x-pdf') typeIcon = 'pdf';
			if (mimeType.indexOf('mspowerpoint') != -1 || mimeType.indexOf('ms-powerpoint') != -1 || mimeType.indexOf('officedocument.presentationml') != -1) typeIcon = "powerpoint";
			if (mimeType.indexOf('text') != -1) typeIcon = "text";
			if (mimeType.indexOf('msword') != -1 || mimeType.indexOf('ms-word') != -1 || mimeType.indexOf('officedocument.wordprocessingml') != -1) typeIcon = "word";
		}

		return this.getIconPath() + "/" + typeIcon;
	} 
	/*
	else {
		return this.getPreviewContentURL();
	}
	*/
}


WAFile.getIconText = function() {
    //if ((this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) && this.hasContent()) {
    return this.getAttribute("name");
    //} else return false;
}


WAFile.buildContentDialog = function(){
	
	var that = this;
	var type = this.getAttribute("mimeType");
	
	if ($("#FileContentDialog_"+this.id).length == 0) {
        var name = this.getAttribute("name");
        name = name.split(' ').join('_');
		$("body").first().append('<div id="FileContentDialog_'+this.id+'" title='+name+'></div>');
		$("#FileContentDialog_"+this.id).dialog({
			position: { my: "left top", at: "left top", of: $("#"+that.id).find("image")}
		});
		
		$("#FileContentDialog_"+this.id).parent().css("-webkit-box-shadow", "3px 3px 6px rgba(0, 0, 0, 0.5)");
		$("#FileContentDialog_"+this.id).parent().css("-moz-box-shadow", "3px 3px 6px rgba(0, 0, 0, 0.5)");
		$("#FileContentDialog_"+this.id).parent().css("box-shadow", "3px 3px 6px rgba(0, 0, 0, 0.5)");
		
		if(type.indexOf("image") > -1){
			$("#FileContentDialog_"+this.id).append('<image width="100%" src="'+this.getPreviewContentURL()+'"></image>');
			var img = $("#FileContentDialog_"+this.id).find("img")[0];
			$(img).on("load", function(){
				$("#FileContentDialog_"+that.id).dialog("option","resizable", false);
				$("#FileContentDialog_"+that.id).parent().resizable({ 
					handles: 'n,e,s,w,se,sw,ne,nw', 
					aspectRatio: true 
				});
				
				var w = $(img).context.naturalWidth;
				var h = $(img).context.naturalHeight;
                
				that.openContentDialog(w, h);
			});
		}
		if(type.indexOf("text") > -1){
			this.serverCall('getContent', function(arr){
				var result = "";
				for(var i = 0; i < arr.length; i++) {
					result += String.fromCharCode(arr[i]); 
				}
				$("#FileContentDialog_"+that.id).append('<p>'+result+'</p>');
				that.openContentDialog(window.innerWidth*0.3, window.innerHeight/2);
			});
		}
		if(type.indexOf("pdf") > -1){
			$("#FileContentDialog_"+this.id).append('<iframe id="iframePDF" width="100%" height="99%" src="'+this.getContentURL()+'"></iframe>');
			$("#FileContentDialog_"+that.id).css("overflow", "hidden");
			that.openContentDialog(window.innerWidth*0.7, window.innerHeight);
		}
	
		$("#FileContentDialog_"+this.id).on( "dialogbeforeclose", function(event, ui) {
			that.closeContentDialog();
		});
        
        //Event handler for the browser back function
        $(window).on('popstate', function() {
            console.log('in back handler');
            that.closeContentDialog();
            $("#FileContentDialog_"+this.id).dialog( "destroy" );
        });
	
	}
	else{
		this.openContentDialog();
	}
}


WAFile.removeContentDialog = function(){
	if ($("#FileContentDialog_"+this.id).length != 0) {
		$("#FileContentDialog_"+this.id).parent().remove();
		$("#FileContentDialog_"+this.id).remove();
	}
}


WAFile.openContentDialog = function(w, h){
	
	var that = this;
	
	$("#FileContentDialog_"+this.id).dialog( "option", "position", {my: "left top", at: "left top", of: $("#"+this.id).find("image")});
	$("#FileContentDialog_"+this.id).dialog("open");
	$("#FileContentDialog_"+this.id).parent().css("width", "64px");
	$("#FileContentDialog_"+this.id).parent().css("height", "64px");	
	
	if(w){
		this.naturalWidth = w;
        localStorage['naturalWidth']=w;
	}else{
        this.naturalWidth=localStorage['naturalWidth'];
    }
    
	if(h){
		this.naturalHeight = h;
        localStorage['naturalHeight']=h;
	}else{
        this.naturalHeight=localStorage['naturalHeight'];
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

	$("#FileContentDialog_"+this.id).parent().animate({
		width: dialogWidth+"px",
		height: (dialogHeight+40)+"px",
		top: ($(window).scrollTop()+70)+"px",
		left: ($(window).scrollLeft()+50)+"px"
	}, 1000);
	
	$("#FileContentDialog_"+this.id).animate({
		height: dialogHeight+"px"
	}, 1000);
	
	$("#"+this.id).css("opacity", 0.3)
	
}


WAFile.closeContentDialog = function(){

	var that = this;
    
	$("#FileContentDialog_"+this.id).parent().animate({
		width: "64px",
		height: "64px",
		top: (that.getAttribute("y")+30)+"px",
		left: that.getAttribute("x")+"px"
	}, 1000, function() {
		that.draw();
	});
	
}