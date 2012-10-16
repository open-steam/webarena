SharePoint.createRepresentation = function(){

    var rep = GUI.svg.group(this.getAttribute('id'));
    var textVal, splitTextVal, text, cTexts;

    GUI.svg.image(rep, 0, 0, 64, 64, this.getFileIcon());


    if(this.getAttribute("sharepoint_src")){
        textVal = this.getAttribute("name");

        splitTextVal = splitSubstr(textVal, 14);
    } else {
        splitTextVal = new Array();
    }

    cTexts = GUI.svg.createText();

    for(var i = 0, len = splitTextVal.length; i< len ; i++){
        cTexts.span(splitTextVal[i], {'y' : 78 + i * 14, 'x': 0});
    }
    text = GUI.svg.text(rep, 0, 75, cTexts);


    $(text).attr("font-size", 12);
    $(rep).attr("id", this.getAttribute('id'));

    rep.dataObject=this;
    this.initGUI(rep);

    return rep;

}

SharePoint.draw = function(){

    var rep=this.getRepresentation();

    this.setViewX(this.getAttribute('x'));
    this.setViewY(this.getAttribute('y'));

    this.setViewWidth(64);
    this.setViewHeight(64);


    if(this.getAttribute("sharepoint_src")){
        //$(rep).find("text").get(0).textContent = splitSubstr(this.getAttribute('name'), 12).join("\n");
    }


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
    return 64;
}

/* get the height of the objects bounding box */
SharePoint.getViewBoundingBoxHeight = function() {
    return 64;
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
