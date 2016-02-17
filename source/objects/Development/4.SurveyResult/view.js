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
    var min = this.getAttribute('minValue');
    var max = this.getAttribute('maxValue');
    var stepping = this.getAttribute('stepping');
    var scaleLength = this.getAttribute('maxValue') - this.getAttribute('minValue') + 1;
    var surveyLength = this.getAttribute('surveyLength');

    //hole rep
    var rep = this.getRepresentation();
    var oldGroup = $("#" + this.getAttribute('id') + "-1");
    var oldResultGroup =$("#"+this.getAttribute('id')+"-2");
    var oldScalesGroupArray = Array(surveyLength);
   
   for(var i = 0; i < oldScalesGroupArray.length; i++){
        var index = 4+i;
        oldScalesGroupArray[i] = $('#'+this.getAttribute('id')+'-'+index);
   }

    if (oldGroup)
        oldGroup.remove();
    if (oldResultGroup)
        oldResultGroup.remove();

    for(var i = 0; i < oldScalesGroupArray.length; i++){
        if(oldScalesGroupArray[i])
            oldScalesGroupArray[i].remove();
    }

    var group = GUI.svg.group(rep, this.getAttribute('id') + "-1");
    var numbers = GUI.svg.group(group);
    var resultGroup = GUI.svg.group(rep, this.getAttribute('id')+"-2");
    var scalesGroupArray = Array(surveyLength);

    for(var i = 0; i < scalesGroupArray.length; i++){
        var index = 4+i;
        scalesGroupArray[i] = GUI.svg.group(rep, this.getAttribute('id')+"-"+index);
    }

    GUI.svg.group(rep, this.getAttribute('id')+"-3");
    this.createResultCircles(resultGroup);
    this.createScales(scalesGroupArray);


    GeneralObject.draw.call(this, external);
    

    //hole das Rechteck
    var rect = rep.getElementsByTagName('rect')[0];
    //hole die Linie
    var lines = rep.getElementsByTagName('line');
    
    //hole die Ergebnisspunkte
    var resultCircleArray = rep.getElementsByTagName('circle');

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

    var offset = 80;
    this.offset = 80;

    if (this.getAttribute('direction') === 'horizontal') { 
        for(var i = 0; i < surveyLength; i++){
            var line = scalesGroupArray[i].getElementsByTagName('line')[0];
            this.drawHorizontalLine(offset, i, line, scalesGroupArray[i], min, max, stepping, rep);
        }
        this.drawCircleArrayHorizontal(resultCircleArray);
    } else {
        for(var i = 0; i < surveyLength; i++){
            var line = scalesGroupArray[i].getElementsByTagName('line')[0];
            this.drawVerticalLine(offset, i, line, scalesGroupArray[i], min, max, stepping, rep);
        }
        this.drawCircleArrayVertical(resultCircleArray);
    }

    rep.text.style.fontSize = this.getAttribute('font-size') + 'px';
    rep.text.style.fontFamily = this.getAttribute('font-family');
    rep.text.style.color = this.getAttribute('font-color');
}

SurveyResult.drawCircleArrayHorizontal = function(circleArray){
    var statementNumber = 0;
    var scaleLength = this.getAttribute('maxValue') - this.getAttribute('minValue') + 1;
    for(var i = 0; i < circleArray.length; i++){
        if(i%scaleLength == 0){
            statementNumber++;
        }
        this.drawCircleHorizontal(circleArray[i], i, statementNumber);
    }
}

SurveyResult.drawCircleArrayVertical = function(circleArray){
    var statementNumber = 0;
    var scaleLength = this.getAttribute('maxValue') - this.getAttribute('minValue') + 1 ;
        for(var i = 0; i < circleArray.length; i++){
        if(i%scaleLength == 0){
            statementNumber++;
        }
        this.drawCircleVertical(circleArray[i], i, statementNumber);
    }
}

SurveyResult.drawCircleHorizontal = function(circle, step, statementNumber){
    //Typecasting necessary
    var posX = Number(circle.getAttribute('cx'));
    var posY = Number(circle.getAttribute('cy'));
    var radius = Number(circle.getAttribute('r'));
    var scaleLength = this.getAttribute('maxValue') - this.getAttribute('minValue') + 1;

    circle.setAttribute('cx', posX + this.offset + (this.getAttribute('distanceX')*(step%scaleLength)));
    circle.setAttribute('cy', posY + (this.offset*statementNumber));
    circle.setAttribute('r', radius);
}

SurveyResult.drawCircleVertical = function(circle, step, statementNumber){
    //Typecasting necessary
    var posX = Number(circle.getAttribute('cx'));
    var posY = Number(circle.getAttribute('cy'));
    var radius = Number(circle.getAttribute('r'));    
    var scaleLength = this.getAttribute('maxValue') - this.getAttribute('minValue') + 1;


    circle.setAttribute('cx', posY + (this.offset*statementNumber));
    circle.setAttribute('cy', this.getAttribute('height') - posY - this.offset - (this.getAttribute('distanceY')*(step%scaleLength)));
    circle.setAttribute('r', radius);
}

SurveyResult.drawVerticalLine = function(offset, argumentNumber, line, group, min, max, stepping, rep){
    var xCoordinate = offset*(argumentNumber+1);
    var yCoordinate = offset;

    $(line).attr("x1", xCoordinate);
    $(line).attr("y1", this.getAttribute('height') - yCoordinate );
    this.setAttribute("startX", this.getAttribute("x") + offset);
    this.setAttribute("startY", this.getAttribute("y") + this.getAttribute('height') - offset);

    $(line).attr("x2", offset);
    $(line).attr("y2", offset);

    var pixelStart = this.getAttribute('height') - offset;
    var pixelEnd =  offset;

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

SurveyResult.drawHorizontalLine = function(offset, argumentNumber, line, group, min, max, stepping, rep){
        var xCoordinate = offset;
        var yCoordinate = offset*(1+argumentNumber);

        $(line).attr("x1", xCoordinate);
        $(line).attr("y1", yCoordinate);
        this.setAttribute("startX", this.getAttribute("x") + offset);
        this.setAttribute("startY", this.getAttribute("y") + this.getAttribute('height') - offset);


        $(line).attr("x2", this.getAttribute('width') - xCoordinate);
        $(line).attr("y2", yCoordinate);

        var pixelStart = offset;
        var pixelEnd = this.getAttribute('width') - offset;
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

SurveyResult.createScales = function(groupArray){
    var surveyLength = this.getAttribute('surveyLength');
    var scaleLength = this.getAttribute('maxValue') - this.getAttribute('minValue') +1;

    for(var i = 0; i < groupArray.length; i++){
        var line = GUI.svg.line(groupArray[i], 0,0,20,20,{});
        var numbers = GUI.svg.group(groupArray[i]); 
        $(line).addClass('line');
        $(numbers).addClass('numbers');

        var min = this.getAttribute('minValue');
        var max = this.getAttribute('maxValue');
        var stepping = this.getAttribute('stepping');

        var numberOfSteps = Math.floor(((max - min) / stepping) + 1);

        for (var j = 0; j < numberOfSteps; j++) {
            var tempStep = GUI.svg.line(groupArray[i], 0, 0, 20, 20, {});
            $(tempStep).addClass('line');

            var tempNumber = GUI.svg.createText();
            var tempNumberRep = GUI.svg.text(groupArray[i], 0, 0, tempNumber);
            $(tempNumberRep).addClass('text');
        }

        line = groupArray[i].getElementsByTagName('line')[0];
         //Setze Darstellung der Linie
        $(line).attr("stroke", "rbg(0,0,0)");
        $(line).attr("stroke-width", 1);
    }
}


SurveyResult.createResultCircles = function(group){
    var surveyLength = this.getAttribute('surveyLength');
    var scaleLength = this.getAttribute('maxValue') - this.getAttribute('minValue') + 1;

    for(var i = 0; i < surveyLength; i++){
        for(var j = 0; j < scaleLength; j++){
            GUI.svg.circle(group, 1,1,1,5);
        }
    }
}

// SurveyResult.createScaleLines = function(group){
//     for(var i = 0; i <= this.getAttribute('surveyLength'); i++){
//          GUI.svg.line(group, 0, 0, 20, 20, {});
//     }
// }

// SurveyResult.drawScales = function(rep, group, line){
//     var surveyLength = this.getAttribute('surveyLength');

//     for(var i = 1; i <= surveyLength; i++){
//         if (this.getAttribute('direction') === 'horizontal') {
//             this.drawHorizontalLine(this.offset, i, line, group, this.getAttribute('minValue'), this.getAttribute('maxValue'), this.getAttribute('stepping'), rep)
//         }else{
//             this.drawVerticalLine(this.offset, i, line,group, this.getAttribute('minValue'), this.getAttribute('maxValue'), this.getAttribute('stepping'), rep)
//         }
//     }
// }

SurveyResult.createRepresentation = function(parent) {
    var rep = GUI.svg.group(parent, this.getAttribute('id'));
    rep.dataObject = this;
    //Preparing result-array for incoming results
    this.initResultArray();

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
    this.setAttribute("height",200 + 80*this.getAttribute('surveyLength'));
    this.setAttribute("width", 200 + 80*(this.getAttribute('maxValue')-this.getAttribute('minValue')));
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
