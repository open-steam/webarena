Table.getAbsoluteX = function(elm) {
    var x = 0;
    if (elm && typeof elm.offsetParent != "undefined") {
        while (elm && typeof elm.offsetLeft == "number") {
            x += elm.offsetLeft;
            elm = elm.offsetParent;
        }
    }
    return x;
}
Table.getAbsoluteY = function(elm) {
    var y = 0;
    if (elm && typeof elm.offsetParent != "undefined") {
        while (elm && typeof elm.offsetTop == "number") {
            y += elm.offsetTop;
            elm = elm.offsetParent;
        }
    }
    return y;
}
Table.insertElement = function(obj) {
    var insertHtml = '<li class="ui-state-default"><input type="text" value="' + 'Neue Zeile' + '"/><div onclick="$(this).parent().remove();" class="remove-item">X</div><div style="position:relative;left:-16px;top:-5px;" onclick="Table.insertElement(this);">+</div></li>';
    $($(insertHtml)).insertAfter($(obj).parent());
};
Table.createPluses = function(obj) {
    $(obj).append('<div onclick="Table.insertElement(this);">+</div>');
    $(obj).children('div').last().css('position', 'relative');
    $(obj).children('div').last().css('left', '-16px');
    $(obj).children('div').last().css('top', '-5px');
};
Table.insertFirst = function(obj){
    var insertHtml = '<li class="ui-state-default"><input type="text" value="' + 'Neue Zeile' + '"/><div onclick="$(this).parent().remove();" class="remove-item">X</div><div style="position:relative;left:-16px;top:-5px;" onclick="Table.insertElement(this);">+</div></li>';
    $("#sortable").prepend(insertHtml);
};

Table.showFormatDialog = function(selected) {
    var that = this;
    var dialog_buttons = {};
    dialog_buttons[that.translate(GUI.currentLanguage, "Speichere Anordnung von Zeilen und Spalten")] = function() {
        var yAttributes = $("#sortable").children();
        var yAttributeValues = [];
        $(yAttributes).each(function() {
            yAttributeValues.push($(this).children().attr("value"));
        });
        that.setAttribute("Row", yAttributeValues);
        var xAttributes = $("#sortable1").children();
        var xAttributeValues = [];
        $(xAttributes).each(function() {
            xAttributeValues.push($(this).children().attr("value"));
        });
        that.setAttribute("Column", xAttributeValues);
        GUI.updateInspector();
    };
    dialog_buttons[that.translate(GUI.currentLanguage, "Cancel")] = function() {
        return false;
    };
    var dialog_width = 800;
    var content = [];
    var html = "";
    var attributesX = that.getAttribute("Column");
    html += '<ul id="sortable1">';
    for (var j in attributesX) {
        html += '<li class="ui-state-default"><input type="text" value="' + attributesX[j] + '"/><div onclick="$(this).parent().remove();" class="remove-item">X</div></li>';
    }

    html += "</ul>";
    var attributesY = that.getAttribute("Row");
    html += '<div onclick="Table.insertFirst(this);"><span style="font-weight:bold;font-size:1.2em;position:relative;left:-5px;">+</span></div>'
    html += '<ul id="sortable">';
    for (var i in attributesY) {
        html += '<li class="ui-state-default"><input type="text" value="' + attributesY[i] + '"/><div onclick="$(this).parent().remove();" class="remove-item">X</div></li>';
    }


    html += "</ul>";
    var js = '$(document).ready(function(){$( "#sortable" ).sortable({axis:"y",placeholder:"ui-state-highlight"});$( "#sortable1" ).sortable({axis:"x",placeholder:"ui-state-highlight"});});';
    var js1 = '$("#sortable li").each(function () {Table.createPluses(this);});'
    html += '<script>' + js + js1 + '</script>';
    content.push(html);
    var dialog = GUI.dialog(
            that.translate(GUI.currentLanguage, "Adjust rows and columns"),
            content,
            dialog_buttons,
            dialog_width,
            null
            );
   
}
