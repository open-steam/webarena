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
    var oldGroup = $("#" + this.getAttribute('id') + "-1");


    var rows = this.getAttribute('Row');
    var columns = this.getAttribute('Column');

    var refresh = false;
    if (oldGroup) {
        var number = oldGroup.children("rect").length;
        if (number !== (rows + 1) * (columns + 1)) {
            refresh = true;
        }

    }
    if (refresh) {
        oldGroup.remove();
        var group = GUI.svg.group(rep, this.getAttribute('id') + "-1");




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

    var counter = 0;
    var textElementCounter = 0;
    var cellXPos = 0;
    var cellYPos = 0;

    var allRects = group.getElementsByTagName('rect');
    var LabelID = 1;

    for (var i = 0; i < rows.length + 1; i++) {
        for (var j = 0; j < columns.length + 1; j++) {
            var cell = allRects[counter];
            $(cell).attr('x', cellXPos);
            $(cell).attr('x', cellXPos);
            $(cell).attr('y', cellYPos);
            $(cell).attr('width', cellWidth);
            $(cell).attr('height', cellHeight);
            $(cell).attr("fill", this.getAttribute('fillcolor'));
            $(cell).attr("stroke", "black");
            $(cell).attr("stroke-width", this.getAttribute('linecolor'));
            if (i == 0 && j > 0) {
                var textcontent = columns[j - 1];
                var fontSize= 22;
                var currentTextElement = group.getElementsByTagName("text")[textElementCounter];
                currentTextElement.textContent = textcontent;
                $(currentTextElement).attr('font-size', fontSize);
                $(currentTextElement).attr('stroke', "black");
                $(currentTextElement).attr('stroke-width', 1);
                $(currentTextElement).attr('id', 'label'+LabelID);
                LabelID++;
                var textLength = currentTextElement.getComputedTextLength();
                while(cellWidth<textLength+10){
                    fontSize=fontSize-1;
                    $(currentTextElement).attr('font-size', fontSize);
                    textLength = currentTextElement.getComputedTextLength();
                }
                $(currentTextElement).attr('x', cellXPos + (cellWidth / 2) - (textLength / 2));
                $(currentTextElement).attr('y', cellYPos + (cellHeight / 2) + 5);
                textElementCounter++;

            } else if (i > 0 && j == 0) {
                var textcontent = rows[i - 1];
                var fontSize= 22;
                var currentTextElement = group.getElementsByTagName("text")[textElementCounter];
                currentTextElement.textContent = textcontent;
                $(currentTextElement).attr('font-size', fontSize);
                $(currentTextElement).attr('stroke', "black");
                $(currentTextElement).attr('stroke-width', 1);
                $(currentTextElement).attr('id', 'label'+LabelID);
                LabelID++;
                var textLength = currentTextElement.getComputedTextLength();
                while(cellWidth<textLength+10){
                    fontSize=fontSize-1;
                    $(currentTextElement).attr('font-size', fontSize);
                    textLength = currentTextElement.getComputedTextLength();
                }
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
    rep.rect = rect;

    this.initGUI(rep);
    return rep;

}
Table.setViewHeight = function(value) {


    var rep = this.getRepresentation();
    var group = $("#" + this.getAttribute("id") + "-1");
    if (group) {
        var rectangles = group.children(".rect");
        var rows = this.getAttribute('Row');
        var columns = this.getAttribute('Column');
        var cellHeight = value / (rows.length + 1);
        var i = 0;
        var textCounter = 0;
        var texts = group.children(".text");

        rectangles.each(function() {
            var row = Math.floor(i / (columns.length + 1));
            $(this).attr("height", cellHeight);
            $(this).attr("y", row * cellHeight);
            if (i > 0 && i <= (columns.length)) {
                $(texts[textCounter]).attr("y", (cellHeight / 2) + 5);
                textCounter++;
            } else if (i > (columns.length) && i % (columns.length + 1) === 0) {
                $(texts[textCounter]).attr("y", row * cellHeight + (cellHeight / 2) + 5);
                textCounter++;
            }
            i++;
        });
    }
    $(rep).attr("height", value);
    $(rep.rect).attr("height", value);
    $(rep.text).attr("height", value);
    var table = rep.text.getElementsByTagName('td')[0];

    if (table) {
        table.style.height = value + 'px';
        table.style.verticalAlign = this.getAttribute('vertical-align');

        GUI.adjustContent(this);

    }
}


Table.setViewWidth = function(value) {

    var rep = this.getRepresentation();
    var group = $("#" + this.getAttribute("id") + "-1");
    if (group) {
        var rectangles = group.children(".rect");
        var columns = this.getAttribute('Column');
        var cellWidth = value / (columns.length + 1);
        var i = 0;
        var textCounter = 0;
        var texts = group.children(".text");
        rectangles.each(function() {
            var column = i % (columns.length + 1);
            $(this).attr("width", cellWidth);
            $(this).attr("x", column * cellWidth);
            if (i > 0 && i <= (columns.length + 1)) {
                var textLength = texts[textCounter].getComputedTextLength();
                $(texts[textCounter]).attr("x", column * cellWidth + (cellWidth / 2) - (textLength / 2));
                textCounter++;
            } else if (i > (columns.length + 1) && column === 0) {
                var textLength = texts[textCounter].getComputedTextLength();
                $(texts[textCounter]).attr("x", (cellWidth / 2) - (textLength / 2));
                textCounter++;
            }
            i++;
        });






    }
    $(rep).attr("width", value);
    $(rep.rect).attr("width", value);
    $(rep.text).attr("width", value);
    var table = rep.text.getElementsByTagName('td')[0];

    if (table)
        table.style.textAlign = this.getAttribute('horizontal-align');

    GUI.adjustContent(this);
}

//find cell and open LabelDialog for changing name
 Table.editText= function(event){
     var objectX = this.getAttribute('x');
     var objectY = this.getAttribute('y');
     var objectWidth = this.getAttribute('width');
     var objectHeight = this.getAttribute('height');
     var rows = this.getAttribute('Row');
     var columns = this.getAttribute('Column');
     
     var cellWidth = objectWidth/(columns.length+1);
     var cellHeight = objectHeight/(rows.length+1);
    
     var labellist= null;
     var labelType =null;
     var counter=0;
     var LabelIdNumber=null;

     if((objectX+cellWidth)<event.clientX){
         // in oberster Zeile suchen (COLUMN)
         var labelFound=false;
         while(!labelFound){
             counter++;
             if(objectX+cellWidth*(counter+1)>= event.clientX ){
                 labelFound=true;
                 labellist=columns;
                 labelType='Column';
                 LabelIdNumber=counter;
             }
         }
         
     }else{
         // in erster Spalte suchen (ROW)
         var labelFound=false;
         while(!labelFound){
             counter++;
             if(objectY+cellHeight*(counter+1)>= event.clientY){
                 labelFound=true;
                 labellist=rows;
                 labelType='Row';
                 LabelIdNumber=columns.length+counter-1;
             }
         }
     }
     var positionMouse ={
         x: event.clientX,
         y: event.clientY
     };

     var rep = this.getRepresentation();
     var labelObject = $(rep).find('#label'+LabelIdNumber);
     this.showLabelDialog(labelObject,labellist,labelType,positionMouse,counter);
	
     GUI.inPlaceEditionObject = this.id;
     
 }
 
 /**
 * Called after hitting the Enter key during the inplace editing
 */
Table.saveChanges = function() {
    this.draw();
	if(this.inPlaceEditingMode){
	    this.inPlaceEditingMode = false;
		GUI.inPlaceEditingObject = false;
	}
	
}
