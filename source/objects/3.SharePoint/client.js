SharePoint.justCreated=function(){
    console.log('test');
    if (!this.getAttribute("hasContent")) {
        this.execute();
    }
}