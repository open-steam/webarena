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

Table.clientRegister=function(){
	
	Table.parent.clientRegister.call(this);
    
    this.registerAction('Zeilen und Spalten anpassen', function(lastClicked) {
        var selected = ObjectManager.getSelected();
        lastClicked.showFormatDialog(selected);

    });
}

Table.insertElement = function(obj) {
    var insertHtml = '<li class="ui-state-default"><input class="input-row-column" type="text" value="' + 'Neue Zeile' + '"/><span class="drag-item"><img src="../../guis.common/images/dragarea.png" /></span><div onclick="$(this).parent().remove();" class="remove-item">X</div><div style="position:relative;left:-20px;top:-8px;font-size:1.2em;" onclick="Table.insertElement(this);">+</div></li>';
    $($(insertHtml)).insertAfter($(obj).parent());
};
Table.insertElementColumn = function(obj) {
    var insertHtml = '<li class="ui-state-default"><input class="input-row-column" type="text" value="' + 'Neue Spalte' + '"/><span class="drag-item"><img src="../../guis.common/images/dragarea.png" /></span><div onclick="$(this).parent().remove();" class="remove-item">X</div><div style="position:relative;left:-20px;top:-8px;font-size:1.2em;" onclick="Table.insertElementColumn(this);">+</div></li>';
    $($(insertHtml)).insertAfter($(obj).parent());
};
Table.createPluses = function(obj) {
    $(obj).append('<div onclick="Table.insertElement(this);">+</div>');
    $(obj).children('div').last().css('position', 'relative');
    $(obj).children('div').last().css('left', '-20px');
    $(obj).children('div').last().css('top', '-8px');
    $(obj).children('div').last().css('font-size', '1.2em');
};
Table.createPlusesColumn = function(obj) {
    $(obj).append('<div onclick="Table.insertElementColumn(this);">+</div>');
    $(obj).children('div').last().css('position', 'relative');
    $(obj).children('div').last().css('left', '-20px');
    $(obj).children('div').last().css('top', '-8px');
    $(obj).children('div').last().css('font-size', '1.2em');
};
Table.insertFirstRow = function(obj) {
    var insertHtml = '<li class="ui-state-default"><input class="input-row-column" type="text" value="' + 'Neue Zeile' + '"/><img src="../../guis.common/images/dragarea.png" /><div onclick="$(this).parent().remove();" class="remove-item">X</div><div style="position:relative;left:-20px;top:-8px;font-size:1.2em;" onclick="Table.insertElement(this);">+</div></li>';
    $("#sortable").prepend(insertHtml);
};
Table.insertFirstColumn = function(obj) {
    var insertHtml = '<li class="ui-state-default"><input class="input-row-column" type="text" value="' + 'Neue Spalte' + '"/><img src="../../guis.common/images/dragarea.png" /><div onclick="$(this).parent().remove();" class="remove-item">X</div><div style="position:relative;left:-20px;top:-8px;font-size:1.2em;" onclick="Table.insertElementColumn(this);">+</div></li>';
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

    html += '<div id="sort-headline">'
    html += ' Das gewünschte Elemente kann durch Ziehen von Symbol <span id="drag-icon-headline"><img src="../../guis.common/images/dragarea.png"></span> an die gewünschte Stelle per Drag & Drop bewegt werden.';
    html += ' Durch Betätigung der Schaltflächen + bzw. X Zeilen und Spalten hinzugefügt bzw. entfernt werden.'
    html += '</div>'


    var attributesY = that.getAttribute("Row");
    html += '<div id="sortableDiv"><h2>Zeilen:</h2><div class="sortable-inner"><div onclick="Table.insertFirstRow(this);"><span style="font-weight:bold;font-size:1.44em;position:relative;left:-9px;top:5px;">+</span></div>';
    html += '<ul id="sortable" style="width:235px">';
    for (var i in attributesY) {
        html += '<li class="ui-state-default"><input class="input-row-column" type="text" value="' + attributesY[i] + '"/><span class="drag-item"><img src="../../guis.common/images/dragarea.png" /></span><div onclick="$(this).parent().remove();" class="remove-item">X</div></li>';
    }


    html += "</ul></div></div>";

    var attributesX = that.getAttribute("Column");
    html += '<div id="sortable1Div"><h2>Spalten:</h2><div class="sortable-inner"><div onclick="Table.insertFirstColumn(this);"><span style="font-weight:bold;font-size:1.44em;position:relative;left:-9px;top:5px;">+</span></div>';
    html += '<ul id="sortable1" style="width:235px;">';
    for (var j in attributesX) {
        html += '<li class="ui-state-default"><input class="input-row-column" type="text" value="' + attributesX[j] + '"/><span class="drag-item"><img src="../../guis.common/images/dragarea.png" /></span><div onclick="$(this).parent().remove();" class="remove-item">X</div></li>';
    }
    html += "</ul></div></div>";


    var js = '$(document).ready(function(){$( "#sortable" ).sortable({axis:"y",placeholder:"ui-state-highlight"});$( "#sortable1" ).sortable({axis:"y",placeholder:"ui-state-highlight"});});';
    var js1 = '$("#sortable li").each(function () {Table.createPluses(this);});'
    var js2 = '$("#sortable1 li").each(function () {Table.createPlusesColumn(this);});'
    html += '<script>' + js + js1 + js2 + '</script>';
    content.push(html);
    var dialog = GUI.dialog(
            that.translate(GUI.currentLanguage, "Zeilen und Spalten anpassen"),
            content,
            dialog_buttons,
            dialog_width,
            null
            );

}
