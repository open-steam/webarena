/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/
SurveyResult.moveByTransform = function(){
    return true;
}

SurveyResult.draw = function(external) {
    //hole rep
    var rep = this.getRepresentation();
    var oldGroup = $("#" + this.getAttribute('id') + "-1");
    var oldResultGroup =$("#"+this.getAttribute('id')+"-2");

    if (oldGroup)
        oldGroup.remove();
    if (oldResultGroup)
        oldResultGroup.remove();

    var group = GUI.svg.group(rep, this.getAttribute('id') + "-1");
    var line = GUI.svg.line(group, 0, 0, 20, 20, {});
    var numbers = GUI.svg.group(group);
    var resultGroup = GUI.svg.group(rep, this.getAttribute('id')+"-2");

    $(line).addClass("line");
    $(numbers).addClass("numbers");

    var min = this.getAttribute('min');
    var max = this.getAttribute('max');
    var stepping = this.getAttribute('stepping');

    var numberOfSteps = Math.floor(((max - min) / stepping) + 1);

    for (var i = 0; i < numberOfSteps; i++) {
        var tempStep = GUI.svg.line(group, 0, 0, 20, 20, {});
        $(tempStep).addClass('line');

        var tempNumber = GUI.svg.createText();
        var tempNumberRep = GUI.svg.text(group, 0, 0, tempNumber);
        $(tempNumberRep).addClass('text');
    }

     //init result circles
    GUI.svg.circle(resultGroup, 10, 20, 3, {});
    GUI.svg.circle(resultGroup, 100, 200,3, {});
    GUI.svg.circle(resultGroup, 70, 30, 3, {});
    GUI.svg.circle(resultGroup, 100, 150,3, {});
    GUI.svg.circle(resultGroup, 88, 46, 3, {});

    GeneralObject.draw.call(this, external);
    

    //hole das Rechteck
    var rect = rep.getElementsByTagName('rect')[0];
    //hole die Linie
    var line = group.getElementsByTagName('line')[0];
    //hole die Ergebnisspunkte
    var resultCircleArray = resultGroup.getElementsByTagName('circle');

    //Fuellfarbe des Rechtsecks ist durchsichtig
    $(rect).attr("fill", this.getAttribute('fillcolor'));

    //Wenn die Topologie nicht selektiert ist, male Border
    if (!$(rect).hasClass("selected")) {
        $(rect).attr("stroke", this.getAttribute('linecolor'));
        $(rect).attr("stroke-width", this.getAttribute('linesize'));
    }

    //Setze Dimensionen des Rechtecks
    $(rect).attr('width', this.getAttribute('width'));
    $(rect).attr('height', this.getAttribute('height'));

    //Setze Darstellung der Linie

    $(line).attr("stroke", "rbg(0,0,0)");
    $(line).attr("stroke-width", 1);

    this.padding = 20;

    var min = this.getAttribute('min');
    var max = this.getAttribute('max');
    var stepping = this.getAttribute('stepping');

    var surveyLength = 3; //TODO: get this value from SurveyTest Object
    var yOffset = this.getAttribute('height')/100 * 80 / surveyLength;
    var xOffset = this.getAttribute('width')/100 * 80 / surveyLength;

    if (this.getAttribute('direction') === 'horizontal') {
        this.drawHorizontalLine(yOffset , line, group, min, max, stepping, rep);    
        this.drawCircleArrayHorizontal(resultCircleArray);
    } else {
        this.drawVerticalLine(xOffset, line, group, min, max, stepping, rep);
        this.drawCircleArrayVertical(resultCircleArray);
    }

    rep.text.style.fontSize = this.getAttribute('font-size') + 'px';
    rep.text.style.fontFamily = this.getAttribute('font-family');
    rep.text.style.color = this.getAttribute('font-color');
}

SurveyResult.drawCircleArrayHorizontal = function(circleArray){
    for(var i = 0; i < circleArray.length; i++){
        this.drawCircleHorizontal(circleArray[i]);
    }
}

SurveyResult.drawCircleArrayVertical = function(circleArray){
    for(var i = 0; i < circleArray.length; i++){
        this.drawCircleVertical(circleArray[i]);
    }
}

SurveyResult.drawCircleHorizontal = function(circle){
    //Typecasting necessary
    var posX = Number(circle.getAttribute('cx'));
    var posY = Number(circle.getAttribute('cy'));
    var radius = Number(circle.getAttribute('r'));

    circle.setAttribute('cx', posX + (this.padding*3));
    circle.setAttribute('cy', posY + (this.padding*3));
    circle.setAttribute('r', radius);
}

SurveyResult.drawCircleVertical = function(circle){
    //Typecasting necessary
    var posX = Number(circle.getAttribute('cx'));
    var posY = Number(circle.getAttribute('cy'));
    var radius = Number(circle.getAttribute('r'));    

    circle.setAttribute('cx', posY + (this.padding*3));
    circle.setAttribute('cy', this.getAttribute('height') - posX - (this.padding*3));
    circle.setAttribute('r', radius);
}

SurveyResult.drawVerticalLine = function(offset,line, group, min, max, stepping, rep){
    var xCoordinate = offset;
    var yCoordinate = this.padding*3;

    $(line).attr("x1", xCoordinate);
    $(line).attr("y1", this.getAttribute('height') - yCoordinate );
    this.setAttribute("startX", this.getAttribute("x") + this.padding*3);
    this.setAttribute("startY", this.getAttribute("y") + this.getAttribute('height') - this.padding*3 );

    $(line).attr("x2", offset);
    $(line).attr("y2", this.padding*3);

    var pixelStart = this.getAttribute('height') - this.padding*3;
    var pixelEnd =  this.padding*3;

    var numberOfSteps = group.getElementsByTagName('line').length - 1;
    var distancePerStepInPixel = Math.floor((pixelStart - pixelEnd) / (numberOfSteps - 1));
    this.setAttribute("distanceY", distancePerStepInPixel);
    
    var drawLineAt = pixelStart;

    for (var i = 1; i < group.getElementsByTagName('line').length; i++) {
        var currentStep = group.getElementsByTagName('line')[i];
        $(currentStep).attr("y1", drawLineAt);
        $(currentStep).attr("x1", xCoordinate + 5);
        $(currentStep).attr("y2", drawLineAt);
        $(currentStep).attr("x2", xCoordinate - 5);

        $(currentStep).attr("stroke", this.getAttribute('linecolor'));
        $(currentStep).attr("stroke-width", 1);


        var currentNumeration = min + ((i - 1) * stepping);
        var currentNumerationObject = group.getElementsByTagName("text")[i - 1];
        currentNumerationObject.textContent = currentNumeration.toString();
        $(currentNumerationObject).attr('y', drawLineAt + 3);
        $(currentNumerationObject).attr('x', xCoordinate - 36);
        $(currentNumerationObject).attr('font-size', 12);

        drawLineAt -= distancePerStepInPixel;
    }

    var label = this.getAttribute('label');
    if (!label)
        label = '';

    rep.text.innerHTML = '<table style="width:100%;"><tr><td style="padding-left:30px;height:' + this.getAttribute('height') + 'px;vertical-align:' + 'top' + ';text-align:' + 'left' + '">' + label + '</td></tr></table>';

}

SurveyResult.drawHorizontalLine = function(offset, line, group, min, max, stepping, rep){
        var xCoordinate = this.padding *3;
        var yCoordinate = offset;

        $(line).attr("x1", xCoordinate);
        $(line).attr("y1", yCoordinate);
        this.setAttribute("startX", this.getAttribute("x") + this.padding*3);
        this.setAttribute("startY", this.getAttribute("y") + this.getAttribute('height') - this.padding*3);


        $(line).attr("x2", this.getAttribute('width') - xCoordinate);
        $(line).attr("y2", yCoordinate);

        var pixelStart = this.padding*3;
        var pixelEnd = this.getAttribute('width') - this.padding*3;
        var numberOfSteps = group.getElementsByTagName('line').length - 1;
        var distancePerStepInPixel = Math.floor((pixelEnd - pixelStart) / (numberOfSteps - 1));
        this.setAttribute("distanceX", distancePerStepInPixel);


        var drawLineAt = pixelStart;
        for (var i = 1; i < group.getElementsByTagName('line').length; i++) {
            var currentStep = group.getElementsByTagName('line')[i];
            $(currentStep).attr("x1", drawLineAt);
            $(currentStep).attr("y1", yCoordinate + 5);
            $(currentStep).attr("x2", drawLineAt);
            $(currentStep).attr("y2", yCoordinate - 5);

            $(currentStep).attr("stroke", this.getAttribute('linecolor'));
            $(currentStep).attr("stroke-width", 1);

            var currentNumeration = min + ((i - 1) * stepping);
            var currentNumerationObject = group.getElementsByTagName("text")[i - 1];
            currentNumerationObject.textContent = currentNumeration.toString();
            $(currentNumerationObject).attr('x', drawLineAt - 3);
            $(currentNumerationObject).attr('y', yCoordinate + 18);
            $(currentNumerationObject).attr('font-size', 12);

            drawLineAt += distancePerStepInPixel;
        }
        var label = this.getAttribute('label');
        if (!label)
            label = '';

        rep.text.innerHTML = '<table style="width:100%;"><tr><td style="height:' + this.getAttribute('height') + 'px;vertical-align:' + 'bottom' + ';text-align:' + 'right' + '">' + label + '</td></tr></table>';

}

SurveyResult.createRepresentation = function(parent) {
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
    this.setAttribute("height",330);
    this.setAttribute("width",330);
    return rep;
}

/**
 * Sets the objects width
 * @param {int} value The new width
 */
SurveyResult.setViewWidth = function(value) {

    var rep = this.getRepresentation();
    $(rep).attr("width", value);
    $(rep.rect).attr("width", value);
    $(rep.text).attr("width", value);
    var table = rep.text.getElementsByTagName('td')[0];

    if (table)
        table.style.textAlign = this.getAttribute('horizontal-align');

    GUI.adjustContent(this);
}


/**
 * Sets the objects height
 * @param {int} value The new height
 */
SurveyResult.setViewHeight = function(value) {
    var rep = this.getRepresentation();
    $(rep).attr("height", value);
    $(rep.rect).attr("height", value);
    $(rep.text).attr("height", value);
    var table = rep.text.getElementsByTagName('td')[0];

    if (table) {
        table.style.height = value + 'px';
        table.style.verticalAlign = this.getAttribute('vertical-align');
    }

    GUI.adjustContent(this);
}

/**
 * Called after hitting the Enter key during the inplace editing
 */
SurveyResult.saveChanges = function() {

    if (this.input) {
        var rep = this.getRepresentation();

        var newContent = $(rep).find("textarea").val()

        if (typeof newContent != 'undefined') {
            newContent = newContent.trim();
            this.setAttribute("label", newContent);
        }

        this.input = false;
        GUI.input = false;

        $(rep).find("textarea").remove();

        $(rep).find("table").show();

        this.draw();
    }
}
