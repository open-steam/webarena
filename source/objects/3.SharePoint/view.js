SharePoint.createRepresentation = function(){

    var rep = GUI.svg.group(this.getAttribute('id'));

    GUI.svg.image(rep, 0, 0, 32, 32, this.getFileIcon());

    var textVal;
    if(this.getAttribute("sharepoint_src")){
        textVal = this.getAttribute("name");
    } else {
        textVal = "";
    }
    var text = GUI.svg.text(rep, 0, 44, textVal);
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


    if(this.getAttribute("sharepoint_src")){
        $(rep).find("text").get(0).textContent = this.getAttribute('name');
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
