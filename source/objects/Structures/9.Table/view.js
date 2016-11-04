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
			if (i==0 || j==0)
				$(cell).attr("fill", this.getAttribute('headercolor'));
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
                currentTextElement.elementType='Column';
                currentTextElement.elementNumber=j-1;
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
                currentTextElement.elementType='Row';
                currentTextElement.elementNumber=i-1;
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
    
    GUI.adjustContent(this);


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

    GUI.adjustContent(this);
}

//find cell and open LabelDialog for changing name
 Table.editText= function(event){
     
     var positionMouse ={
         x: event.clientX,
         y: event.clientY
     };
     
     var clickedElement=event.target;
     
     if (clickedElement.elementType) this.showLabelDialog(clickedElement,positionMouse);
	     
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
