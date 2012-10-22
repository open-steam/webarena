SharePoint.createRepresentation = function(){

    var rep;
    if(this.getAttribute("show_iframe")){
        rep = this.createRepresentationIFrame();
    } else {
        rep = this.createRepresentationIcon();
    }

    $(rep).attr("id", this.getAttribute('id'));
    this.initGUI(rep);

    return rep;
}

SharePoint.createRepresentationIFrame = function(){

    var rep = GUI.svg.other("foreignObject");
    var body = document.createElement("body");
    $(body).append("<iframe src='" + this.getAttribute("sharepoint_src") + "' width='500px' height='500px'></iframe> ");

    $(rep).append(body);

    return rep;
}

SharePoint.createRepresentationIcon = function(){
    var rep = GUI.svg.group(this.getAttribute('id'));
    var textVal;

    GUI.svg.image(rep, 0, 0, 64, 64, this.getFileIcon());


    if(this.getAttribute("sharepoint_src")){
        textVal = this.getAttribute("name");
        this.renderFilename(rep, textVal);
    }

    return rep;
}

SharePoint.renderFilename = function (rep, filename){
    var splitTextVal = splitSubstr(filename, 14);
    var cTexts = GUI.svg.createText();

    for(var i = 0, len = splitTextVal.length; i< len ; i++){
        cTexts.span(splitTextVal[i], {'y' : 78 + i * 14, 'x': 0});
    }
    var text = GUI.svg.text(rep, 0, 75, cTexts);
    $(text).attr("font-size", 12);
}

SharePoint.draw = function(){

    if(this.getAttribute("show_iframe")){
        console.log("draw");
        this.drawIFrame();
    } else {
        this.drawIcon();
    }
}

SharePoint.drawIFrame = function(){
    var rep=this.getRepresentation();

    this.setViewX(this.getAttribute('x'));
    this.setViewY(this.getAttribute('y'));
    this.setViewWidth(this.getAttribute('width'));
    this.setViewHeight(this.getAttribute('height'));
}

SharePoint.drawIcon = function(){
    var rep=this.getRepresentation();

    this.setViewX(this.getAttribute('x'));
    this.setViewY(this.getAttribute('y'));

    this.setViewWidth(64);
    this.setViewHeight(64);


    if(this.getAttribute("sharepoint_src")){
        $(rep).find("text").get(0).textContent = splitSubstr(this.getAttribute('name'), 12).join("\n");
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




    return "../../guis.common/images/fileicons/"+typeIcon+".png";
}

SharePoint.getViewBoundingBoxWidth = function() {
    if(this.getAttribute("show_iframe")){
        return this.getViewBoundingBoxWidthIFrame();
    } else {
        return this.getViewBoundingBoxWidthIcon();
    }
}

/* get the height of the objects bounding box */
SharePoint.getViewBoundingBoxHeight = function() {
    if(this.getAttribute("show_iframe")){
        return this.getViewBoundingBoxHeightIFrame()
    } else {
        return this.getViewBoundingBoxHeightIcon()
    }
}

SharePoint.getViewBoundingBoxWidthIcon = function() {
    return 64;
}

SharePoint.getViewBoundingBoxWidthIFrame = function() {
    return parseInt(this.getAttribute("width"));
}

SharePoint.getViewBoundingBoxHeightIcon = function() {
    return 64;
}

SharePoint.getViewBoundingBoxHeightIFrame = function() {
    return parseInt(this.getAttribute("height"));
}


SharePoint.renderLoadScreen  = function(target){
    var that = this;
    var dialogPage2 = $('' +
        '<div>' +
        '<h2> ' +that.translate(GUI.currentLanguage, "WAIT_DIALOG") +'  </h2>' +
        '<img src="objects/EasyDBImage/progress.gif">' +
        '</div>'
    );
    return dialogPage2;

}
