SharePoint.justCreated=function(){
    if (!this.getAttribute("hasContent")) {
        this.execute();
    }
}