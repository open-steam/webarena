//currently not in use
/*Table.getAbsoluteX = function(elm) {
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
} */
Table.insertElement = function(obj) {
    var insertHtml = '<li class="ui-state-default"><input class="input-row-column" type="text" value="' + 'Neue Zeile' + '"/><img src="../../guis.common/images/dragarea.png" /><div onclick="$(this).parent().remove();" class="remove-item">X</div><div style="position:relative;left:-16px;top:-5px;" onclick="Table.insertElement(this);">+</div></li>';
    $($(insertHtml)).insertAfter($(obj).parent());
};
Table.insertElementColumn = function(obj) {
    var insertHtml = '<li class="ui-state-default"><input class="input-row-column" type="text" value="' + 'Neue Spalte' + '"/><img src="../../guis.common/images/dragarea.png" /><div onclick="$(this).parent().remove();" class="remove-item">X</div><div style="position:relative;left:-16px;top:-5px;" onclick="Table.insertElementColumn(this);">+</div></li>';
    $($(insertHtml)).insertAfter($(obj).parent());
};
Table.createPluses = function(obj) {
    $(obj).append('<div onclick="Table.insertElement(this);">+</div>');
    $(obj).children('div').last().css('position', 'relative');
    $(obj).children('div').last().css('left', '-16px');
    $(obj).children('div').last().css('top', '-5px');
};
Table.createPlusesColumn = function(obj) {
    $(obj).append('<div onclick="Table.insertElementColumn(this);">+</div>');
    $(obj).children('div').last().css('position', 'relative');
    $(obj).children('div').last().css('left', '-16px');
    $(obj).children('div').last().css('top', '-5px');
};
Table.insertFirstRow = function(obj) {
    var insertHtml = '<li class="ui-state-default"><input class="input-row-column" type="text" value="' + 'Neue Zeile' + '"/><img src="../../guis.common/images/dragarea.png" /><div onclick="$(this).parent().remove();" class="remove-item">X</div><div style="position:relative;left:-16px;top:-5px;" onclick="Table.insertElement(this);">+</div></li>';
    $("#sortable").prepend(insertHtml);
};
Table.insertFirstColumn = function(obj) {
    var insertHtml = '<li class="ui-state-default"><input class="input-row-column" type="text" value="' + 'Neue Spalte' + '"/><img src="../../guis.common/images/dragarea.png" /><div onclick="$(this).parent().remove();" class="remove-item">X</div><div style="position:relative;left:-16px;top:-5px;" onclick="Table.insertElementColumn(this);">+</div></li>';
    $("#sortable1").prepend(insertHtml);
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
    var dialog_width = 560;
    var content = [];
    var html = "";
    
    html += '<div id="sort-headline">In diesem Dialog kann die Reihenfolge von Zeilen und Spalten der Tabelle angepasst werden.'
    html += ' Dazu kann das gewünschte Elemente Ziehen von Symbol <span id="drag-icon-headline"><img src="../../guis.common/images/dragarea.png"></span> an die gewünschte Stelle per Drag & Drop bewegt werden.';
    html += ' Außerdem können durch Betätigung der Schaltflächen + bzw. X Zeilen und Spalten hinzugefügt bzw. entfernt werden.' 
    html += '</div>'


    var attributesY = that.getAttribute("Row");
    html += '<div id="sortableDiv"><h2>Zeilen:</h2><div onclick="Table.insertFirstRow(this);"><span style="font-weight:bold;font-size:1.2em;position:relative;left:-5px;">+</span></div>';
    html += '<ul id="sortable">';
    for (var i in attributesY) {
        html += '<li class="ui-state-default"><input class="input-row-column" type="text" value="' + attributesY[i] + '"/><img src="../../guis.common/images/dragarea.png" /><div onclick="$(this).parent().remove();" class="remove-item">X</div></li>';
    }


    html += "</ul></div>";

    var attributesX = that.getAttribute("Column");
    html += '<div id="sortable1Div"><h2>Spalten:</h2><div onclick="Table.insertFirstColumn(this);"><span style="font-weight:bold;font-size:1.2em;position:relative;left:-5px;">+</span></div>';
    html += '<ul id="sortable1">';
    for (var j in attributesX) {
        html += '<li class="ui-state-default"><input class="input-row-column" type="text" value="' + attributesX[j] + '"/><img src="../../guis.common/images/dragarea.png" /><div onclick="$(this).parent().remove();" class="remove-item">X</div></li>';
    }
    html += "</ul></div>";


    var js = '$(document).ready(function(){$( "#sortable" ).sortable({axis:"y",placeholder:"ui-state-highlight"});$( "#sortable1" ).sortable({axis:"y",placeholder:"ui-state-highlight"});});';
    var js1 = '$("#sortable li").each(function () {Table.createPluses(this);});'
    var js2 = '$("#sortable1 li").each(function () {Table.createPlusesColumn(this);});'
    html += '<script>' + js + js1 + js2 + '</script>';
    content.push(html);
    var dialog = GUI.dialog(
            that.translate(GUI.currentLanguage, "Adjust rows and columns"),
            content,
            dialog_buttons,
            dialog_width,
            null
            );

}
