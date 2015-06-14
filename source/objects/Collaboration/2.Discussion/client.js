Discussion.formatTimestamp = function(time){
    return moment(time).format('DD.MM.YYYY HH:mm');
}

Discussion.deleteStatement = function(timestamp){
    var newArr = _.filter(this.messageArray,
        function(message){return message.timestamp !== timestamp});

    this.setContent(JSON.stringify(newArr));
}

Discussion.fetchDiscussion = function(rep) {
    if (!rep) rep = this.getRepresentation();
    
    var that = this;
    var remoteContent = this.getContentAsString();

    if (remoteContent !== "") remoteContent = JSON.parse(remoteContent);

    that.messageArray = remoteContent;

    // update content
    if (that.oldContent !== remoteContent) {   //content has changed
        var messageArray = remoteContent;

        var text = _.reduce(messageArray, function(memo, message) {
            return memo + that.renderMessage(message);
        }, "")

        $(rep).find(".discussion-text").html(text);

        that.oldContent=messageArray;

        that.enableInlineEditors();
    }
}

Discussion.contentUpdated = function(){
    var that = this;
    this.fetchContent(function(){
        that.fetchDiscussion();
    }, true);

}