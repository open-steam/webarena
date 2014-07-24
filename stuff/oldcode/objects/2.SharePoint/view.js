SharePoint.createRepresentation = function(parent){
    var rep;
    if(this.getAttribute("show_iframe")){
        rep = this.createRepresentationIFrame(parent);
    } else {
        rep = this.createRepresentationIcon(parent)
    }

    $(rep).attr("id", this.getAttribute('id'));

    rep.dataObject=this;
    this.initGUI(rep);

    return rep;


}

SharePoint.switchState = function(){
    var inIFrame = this.getAttribute("show_iframe");
    var that = this;

    this.setAttribute("show_iframe", !inIFrame);
    if(!inIFrame){
        this.setAttribute("width", 700);
        this.setAttribute("height", 800);
    } else {
        this.setAttribute("width", 64);
        this.setAttribute("height", 64)
    }

    $('#' + this.getAttribute('id')).remove();
    this.getRepresentation();
    this.deselect();
    $('.actionsheet').hide();
}

SharePoint.openWindow = function(){
    window.open(this.getAttribute("sharepoint_src"));
}

SharePoint.createRepresentationIFrame = function(parent){

    var that = this;
    var rep = GUI.svg.other(parent, "foreignObject");
    var body = document.createElement("body");

    $(body).append(
        "<div class='sharepoint-toolbar moveArea' >" +
            "<span class='minimize-button'></span>" +
            "<span class='open-extern-button'></span>" +
        "</div>")
    $(body).append("<div class='iframe-container'><iframe src='" + this.getAttribute("sharepoint_src") + "' width='" + (this.getAttribute('width')-8) + "px' height='" +  (this.getAttribute('height')-38)  +"px'></iframe> </div>");


    $(body).on("click", ".minimize-button", function(event){
        that.switchState();
    });

    $(body).on("click", ".open-extern-button", function(){
        that.openWindow();
        that.deselect();
    });

    $(rep).append(body);

    return rep;

}

SharePoint.createRepresentationIcon = function(parent){
    var rep = GUI.svg.group(parent,this.getAttribute('id'));
    var textVal;

    GUI.svg.image(rep, 0, 0, 64, 64, this.getFileIcon());

    var rect = GUI.svg.rect(rep, 0,0,10,10);
    $(rect).attr("fill", "transparent");
    $(rect).addClass("borderRect");
    $(rect).addClass("moveArea");

    if(this.getAttribute("sharepoint_src")){
        textVal = this.getAttribute("name");
        this.renderFilename(rep, textVal);
    }

    $(rep).find('image').addClass('moveArea');

    return rep;
}

SharePoint.renderFilename = function (rep, filename){

    IconObject.renderText.call(this, filename);

}

SharePoint.getFilename = function(){
    return this.getAttribute("name");
}

SharePoint.draw = function(){

    if(this.getAttribute("show_iframe")){
        this.drawIFrame();
    } else {
        this.drawIcon();
    }
    this.adjustControls();
}

SharePoint.drawIFrame = function(){
    var rep=this.getRepresentation();

    this.setViewX(this.getAttribute('x'));
    this.setViewY(this.getAttribute('y'));

    this.setViewWidth(this.getAttribute("width"));
    this.setViewHeight(this.getAttribute("height"));
}

SharePoint.drawIcon = function(){
    var rep=this.getRepresentation();

    this.setViewX(this.getAttribute('x'));
    this.setViewY(this.getAttribute('y'));

    this.setViewWidth(64);
    this.setViewHeight(64);

    if (!$(rep).hasClass("selected")) {
        $(rep).find("rect").attr("stroke", this.getAttribute('linecolor'));
        $(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
    }
}

SharePoint.updateIcon = function(){
    var rep = this.getRepresentation();
    $(rep).find('image').attr('href', this.getFileIcon());
}

SharePoint.getFileIcon = function(){

    var url = this.getAttribute("sharepoint_src");
    var typeIcon;
    try {

        if(url){
            var extension = url.split(".").pop();
            if(extension === "docx" || extension === "doc"){
                typeIcon = "word";
            } else if(extension === "pptx" || extension === "ppt"){
                typeIcon = "powerpoint";
            } else if(extension === "xls" || extension === "xlsx"){
                typeIcon = "excel";
            } else if(extension === "pdf"){
                typeIcon = "pdf";
            } else {
                typeIcon = "file";
            }

        } else {
            typeIcon = "upload";
        }
    } catch(e){
        typeIcon = "file";
    }




    return "../../guis.common/images/sharepoint/"+typeIcon+".png";
}

SharePoint.getViewBoundingBoxWidth = function() {
    if(this.getAttribute("show_iframe")){
        return this.getViewBoundingBoxWidthIFrame();
    } else {
        return this.getViewBoundingBoxWidthIcon();
    }
}

SharePoint.getViewBoundingBoxWidthIFrame = function(){
    return this.getAttribute("width");
}

SharePoint.getViewBoundingBoxWidthIcon = function(){
    return 64
}


/* get the height of the objects bounding box */
SharePoint.getViewBoundingBoxHeight = function() {
    if(this.getAttribute("show_iframe")){
        return this.getViewBoundingBoxHeightIFrame();
    } else {
        return this.getViewBoundingBoxHeightIcon();
    }
}

SharePoint.getViewBoundingBoxHeightIFrame = function(){
    return this.getAttribute("height") +20;
}

SharePoint.getViewBoundingBoxX = function() {
    return parseInt(this.getAttribute("x"));
}

/* get the y position of the objects bounding box (this is the top position of the object) */
SharePoint.getViewBoundingBoxY = function() {
    return parseInt(this.getAttribute("y"));
}

SharePoint.getViewBoundingBoxHeightIcon = function(){
    return 64
}


SharePoint.setViewHeight = function(value){

    GeneralObject.setViewHeight.call(this, value);

    var rep = this.getRepresentation();
    $(rep).find('iframe').attr('height', (value-38)+ "px");
    $(this.getRepresentation()).find("rect").attr("height", parseInt(value));
}

SharePoint.setViewWidth = function(value){

    GeneralObject.setViewWidth.call(this, value);

    var rep = this.getRepresentation();
    $(rep).find('iframe').attr('width', (value-8)+ "px");
    $(this.getRepresentation()).find("rect").attr("width", parseInt(value));
}

SharePoint.renderLoadScreen  = function(target){
    var that = this;
    var dialogPage2 = $('' +
        '<div class="easy-load-wrapper">' +
        '<h2> ' +that.translate(GUI.currentLanguage, "WAIT_DIALOG") +'  </h2>' +
        '<img src="/guis.common/images/progress.gif">' +
        '</div>'
    );
    return dialogPage2;

}
