/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2011
 *    @author Viktor Koop
 *
 */
Discussion.drawEmbedded = function () {

    var rep = this.getRepresentation();
    rep.dataObject = this;

    // set properties
    this.setViewX(this.getAttribute('x'));
    this.setViewY(this.getAttribute('y'));
    this.setViewWidth(this.getAttribute('width'));
    this.setViewHeight(this.getAttribute('height'));

    // draw outer line
    var linesize = this.getAttribute('linesize') || 0;

    if (linesize > 0) {  // draw line
        $(rep).find(".discussion-text").css("border-color", this.getAttribute('linecolor'));
        $(rep).find(".discussion-text").css("border-width", this.getAttribute('linesize'));
        $(rep).find(".discussion-text").css("padding", "5px");
    } else {  // no line
        $(rep).find(".discussion-text").css("border-color", "none");
        $(rep).find(".discussion-text").css("border-width", "0px");
        $(rep).find(".discussion-text").css("padding", "0px");
    }

    // apply properties
    $(rep).find(".discussion-text").css("background-color", this.getAttribute('fillcolor'));
    $(rep).find("body").css("font-size", this.getAttribute('font-size'));
    $(rep).find("body").css("font-family", this.getAttribute('font-family'));
    $(rep).find("body").css("color", this.getAttribute('font-color'));
    $(rep).attr("layer", this.getAttribute('layer'));

    var that = this;

    this.bindAdminControlls();
}

Discussion.updateHeading = function(newHeading){
    var rep = this.getRepresentation();
    $(rep).find(".discussion-heading").html(newHeading);
}

Discussion.drawIcon = function () {
    var rep = this.getRepresentation();

    this.setViewX(this.getAttribute('x'));
    this.setViewY(this.getAttribute('y'));

    this.setViewWidth(this.getAttribute('width'));
    this.setViewHeight(this.getAttribute('height'));

    $(rep).find(".discussion-blob").css("background-color", this.getAttribute('fillcolor'));
    $(rep).find(".discussion-blob").css("font-size", this.getAttribute('font-size'));
    $(rep).find(".discussion-blob").css("font-family", this.getAttribute('font-family'));
    $(rep).find(".discussion-blob").css("color", this.getAttribute('font-color'));

    $(rep).attr("layer", this.getAttribute('layer'));
}

Discussion.draw = function (external) {

    //GeneralObject.draw.call(this,external);

    var embedded = this.getAttribute("show_embedded");
    if (embedded) {
        this.drawEmbedded();
    } else {
        this.drawIcon();
    }
    this.adjustControls();
}

Discussion.bindAdminControlls = function () {
    var rep = this.getRepresentation();
    var that = this;
    $(rep).find(".statement-delete").click(function () {
        var deleteId = ($(this).parent('.discussion-statement').attr("data-message-id"))

        that.deleteStatement(deleteId);
    })

    $(rep).find(".statement-edit").click(function () {
        $(this).siblings(".discussion-statement-text").trigger("discussion-statement-edit")
    });
}

Discussion.enableInlineEditors = function () {
    var rep = this.getRepresentation();
    var that = this;

    var saveFunction = function (value, settings) {
        var deleteId = ($(this).parent('.discussion-statement').attr("data-message-id"))
        var changedArr = new Array();
        for (var i = 0; i < that.oldContent.length; ++i) {
            if (that.oldContent[i].timestamp !== deleteId) {
                changedArr.push(that.oldContent[i])
            } else {
                var message = that.oldContent[i];
                message.text = htmlEncode(value);
                changedArr.push(message);
            }
        }
        that.setContent(JSON.stringify(changedArr));
    };


    $(rep).find('.discussion-statement-text').editable(saveFunction, {
        type: "autogrow",
        submit: 'Speichern',
        cancel: 'Abbrechen',
        placeholderHTML5: 'Diskussions-Titel',
        autogrow: {
            lineHeight: 16,
            maxHeight: 512
        },
        event: "discussion-statement-edit",
        data: function (string) {
            return htmlDecode($.trim(string))
        },
        onedit: function () {
            $(this).parent().addClass('active-editing')
        },
        onreset: function () {
            $(this).parent().removeClass('active-editing')
        },
        onsubmit: function () {
            $(this).parent().removeClass('active-editing')
        }
    });
}

Discussion.switchStateView = function(){
    $('#' + this.getAttribute('id')).remove();
    this.getRepresentation();
    this.deselect()
}


Discussion.switchState = function () {
    var embedded = this.getAttribute("show_embedded") || false;
    this.setAttribute("show_embedded", !embedded);

    if (!embedded) {
        this.setAttribute("width", 400);
        this.setAttribute("height", 500);

    } else {
        this.setAttribute("width", 64 * 2.5);
        this.setAttribute("height", 64 * 1.5)
    }
    this.switchStateView();
}


Discussion.createRepresentationEmbedded = function () {
    var that = this;

    // wrapper
    var rep = GUI.svg.other("foreignObject");
    rep.dataObject = this;

    var heading = this.getAttribute("discussionTitle") || "Bitte klicken Sie hier, um den Text zu ändern."

    // content
    var body = document.createElement("body");
    $(body).append(
        $('<div class="discussion">' +
            '<div class="embedded-toolbar moveArea">' +
            '<span class="minimize-button"></span>' +
            '</div>' +
            '<div class="discussion-content">' +
            '<div class="discussion-heading">' + heading +
            '</div><div class="discussion-text"></div>' +
            '</div>'+
            '<input class="discussion-input" placeholder=Texteingabe>' +
            '</div>')
    );

    that.oldContent = new Array();

    that.title = this.getAttribute("discussionTitle") || "TITLE";

    $(body).find("input").keyup(function (event) {
        if (event.keyCode == 13 && $(this).val() != "") { // enter
            var value = $(this).val();

            var message = {};
            message.author = GUI.username;
            message.timestamp = new Date();
            message.text = htmlEscape(value);

            if (!that.oldContent) {
                that.oldContent = new Array();
            }
            that.oldContent.push(message);

            $(this).val('');

            that.setContent(JSON.stringify(that.oldContent));
            $(body).find(".discussion-text").animate(
                { scrollTop: $(body).find(".discussion-text").prop("scrollHeight")}, 3000
            );
        }
    });

    $(body).on("click", ".discussion-input", function () {
        $(this).focus();
    });

    $(body).on("click", ".minimize-button", function () {
        that.switchState();
    });


    // add content to wrapper
    $(rep).append(body);

    // push to gui
    $(rep).attr("id", this.getAttribute('id'));
    this.initGUI(rep);
    this.draw();

    setTimeout(function () {
        $(body).find(".discussion-text").animate(
            { scrollTop: $(body).find(".discussion-text").prop("scrollHeight")}, 0
        );
    }, 1000);

    this.fetchDiscussion(rep);

    return rep;
}

Discussion.createRepresentationIcon = function () {

    //var rep = GUI.svg.group(this.getAttribute('id'));
    var rep = GUI.svg.other("foreignObject");

    var body = document.createElement("body");
    var title = this.getAttribute('discussionTitle') || "Nicht gesetzt.";

    $(body).append("<div class='discussion-blob moveArea triangle-border'><div class='wrapped-text moveArea'>" + title + "</div></div>");

    $(rep).append(body);
    $(rep).attr("id", this.getAttribute('id'));
    $(rep).find('.wrapped-text').dotdotdot();

    return rep;

}

Discussion.getFileIcon = function () {
    return "../../guis.common/images/discussion.png";
}


Discussion.createRepresentation = function () {
    var embedded = this.getAttribute("show_embedded");
    var rep;
    if (embedded) {
        rep = this.createRepresentationEmbedded();
    } else {
        rep = this.createRepresentationIcon();
    }

    return rep;
}

Discussion.renderMessage = function (message) {
    var text = message.text

    var additionalClasses = (message.author === GUI.username) ? "discussion-statement-deletable" : "";

    return "" +
        "<div class='discussion-statement " + additionalClasses + "' data-message-id='" + message.timestamp + "'>" +
        "<div class='discussion-statement-heading'>" +
        "<span class='message-author'>" + message.author + "</span>" +
        "<span class='message-timestamp'>(" + this.formatTimestamp(message.timestamp) + ")</span>" +
        "</div> " +
        "<p class='discussion-statement-text'> " + text + "</p>" +

        "<div class='statement-delete'>löschen</div>" +
        "<div class='statement-edit'>bearbeiten</div>" +
        "</div>";
}

/* view setter */
Discussion.setViewHeight = function (value) {
    GeneralObject.setViewHeight.call(this, value);
    $(this.getRepresentation()).attr("height", parseInt(value));
    this.updateInnerHeight(parseInt(value));
}

Discussion.updateInnerHeight = function (value) {
    var embedded = this.getAttribute("show_embedded");

    if (embedded) {
        this.updateInnerHeightEmbedded(value);
    } else {
        this.updateInnerHeightIcon(value);
    }
}

Discussion.updateInnerHeightEmbedded = function (value) {
    var rep = this.getRepresentation();

    $(rep).find("body").css("height", value + "px");
    $(rep).find(".discussion").css("height", value + "px");

    //TODO : calculate size with input instead of fixed 75px
    var ih = $(rep).find(".discussion-input").height();

    $(rep).find(".discussion-content").css("height", (value  - ih - 60) + "px");
}

Discussion.updateInnerHeightIcon = function (value) {
    var rep = this.getRepresentation();

    $(rep).find("body").css("height", value + "px");

    $(rep).find(".wrapped-text").css("height", (value - 47) + "px");
    $(rep).find(".wrapped-text").dotdotdot();
}

Discussion.representationCreated = function () {
    GeneralObject.representationCreated.call(this);
    var that = this;

    var saveFunction = function (value, settings) {
        value = htmlEncode(value)
        that.setAttribute("discussionTitle", value);

        return(value);
    }

    var rep = this.getRepresentation();
    $(rep).find('.discussion-heading').editable(saveFunction, {
        type: "autogrow",
        submit: 'Speichern',
        placeholderHTML5: 'Diskussions-Titel',
        cancel: "Abbrechen",

        data: function () {
            var headingText = that.getAttribute('discussionTitle') || '';
            return htmlDecode(headingText)
        },

        autogrow: {
            lineHeight: 16,
            maxHeight: 512
        }
    });
}
