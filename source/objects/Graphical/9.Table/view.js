/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

Table.moveByTransform = function() {
    return true;
};

Table.draw = function(external) {

    //hole rep
    var rep = this.getRepresentation();
    var oldGroups = rep.getElementsByTagName('g');
    if(oldGroups.length > 0){
        $(oldGroups).each(function(){this.remove();});
    }
    var group = GUI.svg.group(rep, this.getAttribute('id') + "-1");
    
    
     
    var rows = this.getAttribute('Row');
    var columns = this.getAttribute('Column');

    if (rows.length !== 0 && columns.length !== 0) {
        var cellNumber = (rows.length + 1) * (columns.length + 1);
    } else {
        cellNumber = 0;
    }
    for (var i = 0; i < cellNumber; i++) {
        var tempCell = GUI.svg.rect(group,
                0, //x
                0, //y
                10, //width
                10 //height
                );
        $(tempCell).addClass("rect");

    }
    for (var i = 0; i < rows.length; i++) {
        var rowHead = GUI.svg.createText();
        var rowHeadRep = GUI.svg.text(group, 0, 0, rowHead);
        $(rowHeadRep).addClass('text');
    }
    for (var i = 0; i < columns.length; i++) {
        var columnHead = GUI.svg.createText();
        var columnHeadRep = GUI.svg.text(group, 0, 0, columnHead);
        $(columnHeadRep).addClass('text');
    }
    //draw go
    GeneralObject.draw.call(this, external);

    //hole das Rechteck
    var rect = rep.getElementsByTagName('rect')[0];

    //Fuellfarbe des Rechtsecks ist durchsichtig
    $(rect).attr("fill", this.getAttribute('fillcolor'));

    //Wenn die Topologie nciht selektiert ist, male Border
    if (!$(rect).hasClass("selected")) {
        $(rect).attr("stroke", this.getAttribute('linecolor'));
        $(rect).attr("stroke-width", this.getAttribute('linesize'));
    }

    //Setze Dimensionen des Rechtecks
    $(rect).attr('width', this.getAttribute('width'));
    $(rect).attr('height', this.getAttribute('height'));


    this.padding = 20;

    //var direction = this.getAttribute('direction');
    //var distance = this.getAttribute('distance');

    rep.text.style.fontSize = this.getAttribute('font-size') + 'px';
    rep.text.style.fontFamily = this.getAttribute('font-family');
    rep.text.style.color = this.getAttribute('font-color');

    var structureWidth = this.getAttribute('width');
    var structureHeigth = this.getAttribute('height');
    var rows = this.getAttribute('Row');
    var columns = this.getAttribute('Column');

    //Determine cell dimensions

    var cellWidth = structureWidth / (columns.length + 1);
    var cellHeight = structureHeigth / (rows.length + 1);

    var counter = 1;
    var textElementCounter = 0;
    var cellXPos = 0;
    var cellYPos = 0;

    var allRects = group.getElementsByTagName('rect');

    for (var i = 0; i < rows.length + 1; i++) {
        for (var j = 0; j < columns.length + 1; j++) {
            var cell = allRects[counter];
            $(cell).attr('x', cellXPos);
            $(cell).attr('y', cellYPos);
            $(cell).attr('width', cellWidth);
            $(cell).attr('height', cellHeight);
            $(cell).attr("fill", this.getAttribute('fillcolor'));
            $(cell).attr("stroke", "black");
            $(cell).attr("stroke-width", this.getAttribute('linecolor'));
            if (i == 0 && j > 0) {
                var textcontent = columns[j - 1];
                var currentTextElement = group.getElementsByTagName("text")[textElementCounter];
                currentTextElement.textContent = textcontent;
                //$(currentTextElement).attr('x', cellXPos + 5);
                //$(currentTextElement).attr('y', cellYPos + 5);
                $(currentTextElement).attr('font-size', 22);
                $(currentTextElement).attr('stroke', "black");
                $(currentTextElement).attr('stroke-width', 1);
                var textLength = currentTextElement.getComputedTextLength();
                $(currentTextElement).attr('x', cellXPos + (cellWidth / 2) - (textLength / 2));
                $(currentTextElement).attr('y', cellYPos + (cellHeight / 2) + 5);
                textElementCounter++;

            } else if (i > 0 && j == 0) {
                var textcontent = rows[i - 1];
                var currentTextElement = group.getElementsByTagName("text")[textElementCounter];
                currentTextElement.textContent = textcontent;
                $(currentTextElement).attr('font-size', 22);
                $(currentTextElement).attr('stroke', "black");
                $(currentTextElement).attr('stroke-width', 1);
                var textLength = currentTextElement.getComputedTextLength();
                $(currentTextElement).attr('x', cellXPos + (cellWidth / 2) - (textLength / 2));
                $(currentTextElement).attr('y', cellYPos + (cellHeight / 2) + 5);

                textElementCounter++;
            }
            counter++;
            cellXPos += cellWidth;


        }
        cellXPos = 0;
        cellYPos += cellHeight;
    }
    GUI.adjustContent(this);

}

Table.createRepresentation = function(parent) {
    var rep = GUI.svg.group(parent, this.getAttribute('id'));

    rep.dataObject = this;

    var rect = GUI.svg.rect(rep,
            0, //x
            0, //y
            10, //width
            10 //height
            );


    $(rect).addClass("rect");

    rep.text = GUI.svg.other(rep, "foreignObject");
    var body = document.createElement("body");
    $(rep.text).append(body);

    
    this.initGUI(rep);
    return rep;

}