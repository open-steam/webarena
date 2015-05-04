Table.showFormatDialog = function(selected) {
    var that = this;
    var dialog_buttons = {};
    dialog_buttons[that.translate(GUI.currentLanguage, "Speichere Anordnung von Zeilen und Spalten")] = function() {
        var data = {};
        data.x = $('#x-axis').attr('checked') == 'checked' ? that.getAttribute('x') : false;
        data.y = $('#y-axis').attr('checked') == 'checked' ? that.getAttribute('y') : false;
        data.width = $('#width').attr('checked') == 'checked' ? that.getAttribute('width') : false;
        data.height = $('#height').attr('checked') == 'checked' ? that.getAttribute('height') : false;
        if (document.getElementById("fillcolor") !== null)
            data.fillcolor = $('#fillcolor').attr('checked') == 'checked' ? that.getAttribute('fillcolor') : false;
        if (document.getElementById("linecolor") !== null)
            data.linecolor = $('#linecolor').attr('checked') == 'checked' ? that.getAttribute('linecolor') : false;
        if (document.getElementById("linesize") !== null)
            data.linesize = $('#linesize').attr('checked') == 'checked' ? that.getAttribute('linesize') : false; 
        
        GUI.updateInspector();
    };
    dialog_buttons[that.translate(GUI.currentLanguage, "Cancel")] = function() {
        return false;
    };
    var dialog_width = 400;
    var attributes = that.getAttributes();
    var content = [];
    var html = "";
    var text = "Dies ist ein wunderschöner Platzhalter!";
    content.push(text + "<br /> <br />");
    
    
    var attributesY = this.getAttribute("attributeY");
    html += '<ul id="sortable">';
    
    for(var i in attributesY){
      html += '<li class="ui-state-default">'+attributesY+'</li>';
    }
            
/*<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
</ul>*/
    
    /*html += ('<div id="positions" style="float:left;margin-right:50px">');
    html += '<div style="margin-bottom:3px">Objektposition:</div>';
    if (ObjectManager.latestFormatSelections.x) {
        html += ('<span><input id="x-axis" type="checkbox" checked="checked" /> ' + attributename + '</span> <br />');
    } else {
        html += ('<span><input id="x-axis" type="checkbox"/> ' + attributename + ' <br /></span>');
    }
    attributename = that.translate(GUI.currentLanguage, "y");
    if (ObjectManager.latestFormatSelections.y) {
        html += ('<input id="y-axis" type="checkbox" checked="checked" /> ' + attributename + ' <br />');
    } else {
        html += ('<input id="y-axis" type="checkbox"/> ' + attributename + ' <br />');
    }
    attributename = that.translate(GUI.currentLanguage, "width");
    if (ObjectManager.latestFormatSelections.width) {
        html += ('<input id="width" type="checkbox"  checked="checked" /> ' + attributename + ' <br />');
    } else {
        html += ('<input id="width" type="checkbox" /> ' + attributename + ' <br />');
    }
    attributename = that.translate(GUI.currentLanguage, "height");
    if (ObjectManager.latestFormatSelections.height) {
        html += ('<input id="height" type="checkbox" checked="checked" /> ' + attributename + ' <br />');
    } else {
        html += ('<input id="height" type="checkbox" /> ' + attributename + ' <br />');
    }
    html += ('</div>');
    html += ('<div id="graphicalAttributes">');
    html += '<div style="margin-bottom:3px">Objektdarstellung:</div>';
    attributename = that.translate(GUI.currentLanguage, "fillcolor");
    if (attributes["fillcolor"] && !attributes["fillcolor"].hidden) {
        if (ObjectManager.latestFormatSelections.fillcolor) {
            html += ('<span><input id="fillcolor" type="checkbox" checked="checked" /> ' + attributename + '</span> <br />');
        } else {
            html += ('<span><input id="fillcolor" type="checkbox"  /> ' + attributename + '</span> <br />');
        }
    }
    attributename = that.translate(GUI.currentLanguage, "linecolor");
    if (attributes["linecolor"] && !attributes["linecolor"].hidden) {
        if (ObjectManager.latestFormatSelections.linecolor) {
            html += ('<input id="linecolor" type="checkbox" checked="checked" /> ' + attributename + ' <br />');
        } else {
            html += ('<input id="linecolor" type="checkbox" /> ' + attributename + ' <br />');
        }
    }
    attributename = that.translate(GUI.currentLanguage, "linesize");
    if (attributes["linesize"] && !attributes["linesize"].hidden) {
        if (ObjectManager.latestFormatSelections.linesize) {
            html += ('<input id="linesize" type="checkbox" checked="checked" /> ' + attributename + ' <br />');
        } else {
            html += ('<input id="linesize" type="checkbox" /> ' + attributename + ' <br />');
        }
    }
    html += '</div>'; */

    content.push(html);


    var dialog = GUI.dialog(
            that.translate(GUI.currentLanguage, "Copy format attributes"),
            content,
            dialog_buttons,
            dialog_width,
            null
            );

}
/*
 * 
 * 
 * <ul id="sortable">
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
<li class="ui-state-default"></li>
</ul>
 */
