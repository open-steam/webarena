ProcessLog.fetchLog = function (rep) {
    if (!rep)rep = this.getRepresentation();
    var that = this;

    var remoteContent = this.getContentAsString();

    var parsedContent = JSON.parse(remoteContent);

    var compiled = _.template($("script#process-log-entry-template").html())
    var html = compiled({
        logEntries: (parsedContent.entries).reverse()
    });

    $(rep).find("body>.processlog").html(html);
}


ProcessLog.contentUpdated = function () {
    console.log("update...");
    var that = this;
    this.fetchContent(function () {
        that.fetchLog();
    }, true);

}