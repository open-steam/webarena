/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

CoordinateSystem.moveByTransform = function() {
    return true;
};

CoordinateSystem.draw = function(external) {
    //hole rep
    var rep = this.getRepresentation();

    var oldGroup = $("#" + this.getAttribute('id') + "-1");

    if (oldGroup) {
        oldGroup.remove();
    }
    var group = GUI.svg.group(rep, this.getAttribute('id') + "-1");

    var numbers = GUI.svg.group(group);
    var lineX = GUI.svg.line(group, 0, 0, 20, 20, {});

    var lineY = GUI.svg.line(group, 0, 0, 20, 20, {});

    $(lineX).addClass("line");
    $(lineY).addClass("line");
    $(numbers).addClass("numbers");

    var body = document.createElement("body");

//Create Units at the x axis
    var minX = this.getAttribute('minX');
    var maxX = this.getAttribute('maxX');
    var steppingX = this.getAttribute('steppingX');

    var numberOfStepsX = Math.floor(((maxX - minX) / steppingX) + 1);

    for (var i = 0; i < numberOfStepsX; i++) {
        var tempStep = GUI.svg.line(group, 0, 0, 20, 20, {});
        $(tempStep).addClass('line');

        var tempNumber = GUI.svg.createText();
        var tempNumberRep = GUI.svg.text(group, 0, 0, tempNumber);
        $(tempNumberRep).addClass('text');
    }
    //Create Units at the Y axis
    var minY = this.getAttribute('minY');
    var maxY = this.getAttribute('maxY');
    var steppingY = this.getAttribute('steppingY');

    var numberOfStepsY = Math.floor(((maxY - minY) / steppingY) + 1);

    for (var i = 0; i < numberOfStepsY; i++) {
        var tempStep = GUI.svg.line(group, 0, 0, 20, 20, {});
        $(tempStep).addClass('line');

        var tempNumber = GUI.svg.createText();
        var tempNumberRep = GUI.svg.text(group, 0, 0, tempNumber);
        $(tempNumberRep).addClass('text');
    }

    var tempNumber = GUI.svg.createText();
    var tempNumberRep = GUI.svg.text(group, 0, 0, tempNumber);
    $(tempNumberRep).addClass('text');

    rep.textX = GUI.svg.other(group, "foreignObject");
    var body = document.createElement("body");
    $(rep.textX).append(body);

    rep.textY = GUI.svg.other(group, "foreignObject");
    var body = document.createElement("body");
    $(rep.textY).append(body);

    //draw go
    GeneralObject.draw.call(this, external);

    //hole das Rechteck
    var rect = rep.getElementsByTagName('rect')[0];
    //hole die Linie
    var line = group.getElementsByTagName('line')[0];

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

    //Setze Darstellung der Linie
    $(line).attr("stroke", this.getAttribute('linecolor'));
    $(line).attr("stroke-width", 4);

    this.padding = 20;

    $(line).attr("x1", this.padding + this.padding + this.padding);
    $(line).attr("y1", this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding);

    this.setAttribute("startX", this.getAttribute('x') + this.padding + this.padding + this.padding);
    this.setAttribute("startY", this.getAttribute('y') + this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding);

    $(line).attr("x2", this.getAttribute('width') - this.padding - this.padding);
    $(line).attr("y2", this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding);

    var pixelStartX = this.padding + this.padding + this.padding;
    var pixelEndX = this.getAttribute('width') - this.padding - this.padding;

    //encapsulate this code into a function
    var minX = this.getAttribute('minX');
    var maxX = this.getAttribute('maxX');
    var steppingX = this.getAttribute('steppingX');

    var numberOfStepsX = Math.floor(((maxX - minX) / steppingX) + 1);

    var distancePerStepInPixel = Math.floor((pixelEndX - pixelStartX) / (numberOfStepsX - 1));
    this.setAttribute("distanceX", distancePerStepInPixel);

    var yCoordinate = this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding;

    var drawLineAt = pixelStartX;
    for (var i = 1; i <= numberOfStepsX; i++) {
        var currentStep = group.getElementsByTagName('line')[i];
        $(currentStep).attr("x1", drawLineAt);
        $(currentStep).attr("y1", yCoordinate + 5);
        $(currentStep).attr("x2", drawLineAt);
        $(currentStep).attr("y2", yCoordinate - 5);

        $(currentStep).attr("stroke", this.getAttribute('linecolor'));
        $(currentStep).attr("stroke-width", 3);

        var currentNumeration = minX + ((i - 1) * steppingX);
        var currentNumerationObject = group.getElementsByTagName("text")[i - 1];
        currentNumerationObject.textContent = currentNumeration.toString();
        $(currentNumerationObject).attr('x', drawLineAt - 3);
        $(currentNumerationObject).attr('y', yCoordinate + 18);
        $(currentNumerationObject).attr('font-size', 12);

        drawLineAt += distancePerStepInPixel;

    }
    //-------------------- y-axis

    var lineY = group.getElementsByTagName('line')[numberOfStepsX + 1];
    $(lineY).attr("x1", this.padding + this.padding + this.padding);
    $(lineY).attr("y1", this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding);

    $(lineY).attr("x2", this.padding + this.padding + this.padding);
    $(lineY).attr("y2", this.padding + this.padding + this.padding + this.padding);
    $(lineY).attr("stroke-width", "4");

    var pixelStart = this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding;
    var pixelEnd = this.padding + this.padding + this.padding + this.padding;

    var minY = this.getAttribute('minY');
    var maxY = this.getAttribute('maxY');
    var steppingY = this.getAttribute('steppingY');

    var numberOfSteps = Math.floor(((maxY - minY) / steppingY) + 1);
    var distancePerStepInPixel = Math.floor((pixelStart - pixelEnd) / (numberOfSteps - 1));
    this.setAttribute("distanceY", distancePerStepInPixel);

    var xCoordinate = this.padding + this.padding + this.padding
    var drawLineAt = pixelStart;

    for (var i = numberOfStepsX + 2; i < numberOfStepsX + numberOfSteps + 2; i++) {
        var currentStep = group.getElementsByTagName('line')[i];
        $(currentStep).attr("y1", drawLineAt);
        $(currentStep).attr("x1", xCoordinate + 5);
        $(currentStep).attr("y2", drawLineAt);
        $(currentStep).attr("x2", xCoordinate - 5);

        $(currentStep).attr("stroke", this.getAttribute('linecolor'));
        $(currentStep).attr("stroke-width", 3);


        var currentNumeration = minY + ((i - numberOfStepsX - 2) * steppingY);
        var currentNumerationObject = group.getElementsByTagName("text")[i - 1];
        currentNumerationObject.textContent = currentNumeration.toString();
        $(currentNumerationObject).attr('y', drawLineAt + 3);
        $(currentNumerationObject).attr('x', xCoordinate - 20);
        $(currentNumerationObject).attr('font-size', 12);

        drawLineAt -= distancePerStepInPixel;


    }
    var label = this.getAttribute('label');
    if (!label)
        label = '';

    //rep.text.innerHTML = '<table style="width:100%;"><tr><td style="padding-left:30px;height:' + this.getAttribute('height') + 'px;vertical-align:' + 'top' + ';text-align:' + 'left' + '">' + label + '</td></tr></table>';

    //Setze die Pfeilspitze
    var markerId = GUI.getSvgMarkerId("arrow", 'black', true);
    $(line).attr("marker-end", "url(#" + markerId + ")");

    var markerIdY = GUI.getSvgMarkerId("arrow", 'black', true);
    $(lineY).attr("marker-end", "url(#" + markerIdY + ")");

    //rep.text.innerHTML = '<table style="width:100%;"><tr><td style="height:' + 30 + 'px;vertical-align:' + this.getAttribute('vertical-align') + ';text-align:' + '40' + '">' + label + '</td></tr></table>';
    var labelX = this.getAttribute('labelX');
    if (!labelX)
        labelX = '';
    rep.textX.innerHTML = '<table style="width:100%;"><tr><td id="labelXID" style="padding-left:5px;padding-top:'+((this.getAttribute('height')/2)-40) +'px;height:' + this.getAttribute('height') + 'px;'+';text-align:' + 'right' + '">' + labelX + '</td></tr></table>';
    this.calculateLabelXDistance(this.getAttribute('labelX'));
    rep.textX.style.fontSize = this.getAttribute('font-size') + 'px';
    rep.textX.style.fontFamily = this.getAttribute('font-family');
    rep.textX.style.color = this.getAttribute('font-color');

    var labelY = this.getAttribute('labelY');
    if (!labelY)
        labelY = '';

    rep.textY.innerHTML = '<table style="width:100%;"><tr><td  style="padding-top:40px;padding-left:5px;height:' + this.getAttribute('height') + 'px;vertical-align:' + 'top' + ';text-align:' + 'left' + '">' + labelY + '</td></tr></table>';
    rep.textY.style.fontSize = this.getAttribute('font-size') + 'px';
    rep.textY.style.fontFamily = this.getAttribute('font-family');
    rep.textY.style.color = this.getAttribute('font-color');
    
    

}

CoordinateSystem.createRepresentation = function(parent) {
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

CoordinateSystem.setViewWidth = function(value) {
    this.padding = 20;
    var rep = this.getRepresentation();
    var group = $("#" + this.getAttribute("id") + "-1");
    if (group) {
        var lines = group.children("line");
        var texts = group.children("text");

        var line = lines[0];
        $(line).attr("x1", this.padding + this.padding + this.padding);

        this.setAttribute("startX", this.getAttribute('x') + this.padding + this.padding + this.padding);

        $(line).attr("x2", value - this.padding - this.padding);

        var pixelStartX = this.padding + this.padding + this.padding;
        var pixelEndX = value - this.padding - this.padding;

        //encapsulate this code into a function
        var minX = this.getAttribute('minX');
        var maxX = this.getAttribute('maxX');
        var steppingX = this.getAttribute('steppingX');

        var numberOfStepsX = Math.floor(((maxX - minX) / steppingX) + 1);

        var distancePerStepInPixel = Math.floor((pixelEndX - pixelStartX) / (numberOfStepsX - 1));
        this.setAttribute("distanceX", distancePerStepInPixel);

        var drawLineAt = pixelStartX;
        for (var i = 1; i <= numberOfStepsX; i++) {
            var currentStep = lines[i];
            $(currentStep).attr("x1", drawLineAt);
            $(currentStep).attr("x2", drawLineAt);
            $(currentStep).attr("stroke", this.getAttribute('linecolor'));
            $(currentStep).attr("stroke-width", 3);

            var currentNumeration = minX + ((i - 1) * steppingX);
            var currentNumerationObject = texts[i - 1];
            currentNumerationObject.textContent = currentNumeration.toString();
            $(currentNumerationObject).attr('x', drawLineAt - 3);
            $(currentNumerationObject).attr('font-size', 12);

            drawLineAt += distancePerStepInPixel;

        }
        //-------------------- y-axis

        var lineY = lines[numberOfStepsX + 1];
        $(lineY).attr("x1", this.padding + this.padding + this.padding);
        $(lineY).attr("x2", this.padding + this.padding + this.padding);
        $(lineY).attr("stroke-width", "4");

        var pixelStart = this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding;
        var pixelEnd = this.padding + this.padding + this.padding + this.padding;

        var minY = this.getAttribute('minY');
        var maxY = this.getAttribute('maxY');
        var steppingY = this.getAttribute('steppingY');

        var numberOfSteps = Math.floor(((maxY - minY) / steppingY) + 1);
        var distancePerStepInPixel = Math.floor((pixelStart - pixelEnd) / (numberOfSteps - 1));
        this.setAttribute("distanceY", distancePerStepInPixel);

        var xCoordinate = this.padding + this.padding + this.padding
        var drawLineAt = pixelStart;

        for (var i = numberOfStepsX + 2; i < numberOfStepsX + numberOfSteps + 2; i++) {
            var currentStep = lines[i];
            $(currentStep).attr("x1", xCoordinate + 5);
            $(currentStep).attr("x2", xCoordinate - 5);

            $(currentStep).attr("stroke", this.getAttribute('linecolor'));
            $(currentStep).attr("stroke-width", 3);


            var currentNumeration = minY + ((i - numberOfStepsX - 2) * steppingY);
            var currentNumerationObject = texts[i - 1];
            currentNumerationObject.textContent = currentNumeration.toString();
            $(currentNumerationObject).attr('x', xCoordinate - 20);
            $(currentNumerationObject).attr('font-size', 12);

            drawLineAt -= distancePerStepInPixel;


        }
        var label = this.getAttribute('label');
        if (!label)
            label = '';

        //rep.text.innerHTML = '<table style="width:100%;"><tr><td style="padding-left:30px;height:' + this.getAttribute('height') + 'px;vertical-align:' + 'top' + ';text-align:' + 'left' + '">' + label + '</td></tr></table>';

        //Setze die Pfeilspitze
        var markerId = GUI.getSvgMarkerId("arrow", 'black', true);
        $(line).attr("marker-end", "url(#" + markerId + ")");

        var markerIdY = GUI.getSvgMarkerId("arrow", 'black', true);
        $(lineY).attr("marker-end", "url(#" + markerIdY + ")");

        //rep.text.innerHTML = '<table style="width:100%;"><tr><td style="height:' + 30 + 'px;vertical-align:' + this.getAttribute('vertical-align') + ';text-align:' + '40' + '">' + label + '</td></tr></table>';
        var labelX = this.getAttribute('labelX');
        if (!labelX)
            labelX = '';
        rep.textX.innerHTML = '<table style="width:100%;"><tr><td style="height:' + this.getAttribute('height') + 'px;vertical-align:' + 'bottom' + ';text-align:' + 'right' + '">' + labelX + '</td></tr></table>';
        rep.textX.style.fontSize = this.getAttribute('font-size') + 'px';
        rep.textX.style.fontFamily = this.getAttribute('font-family');
        rep.textX.style.color = this.getAttribute('font-color');

        var labelY = this.getAttribute('labelY');
        if (!labelY)
            labelY = '';

        rep.textY.innerHTML = '<table style="width:100%;"><tr><td style="padding-left:30px;height:' + this.getAttribute('height') + 'px;vertical-align:' + 'top' + ';text-align:' + 'left' + '">' + labelY + '</td></tr></table>';
        rep.textY.style.fontSize = this.getAttribute('font-size') + 'px';
        rep.textY.style.fontFamily = this.getAttribute('font-family');
        rep.textY.style.color = this.getAttribute('font-color');
    }
    $(rep).attr("width", value);
    $(rep.rect).attr("width", value);
    $(rep.text).attr("width", value);
    var table = rep.text.getElementsByTagName('td')[0];

    if (table)
        table.style.textAlign = this.getAttribute('horizontal-align');

    GUI.adjustContent(this);
}

CoordinateSystem.setViewHeight = function(value) {
    this.padding = 20;
    var rep = this.getRepresentation();
    var group = $("#" + this.getAttribute("id") + "-1");
    if (group) {
        var lines = group.children("line");
        var texts = group.children("text");

        var line = lines[0];
        $(line).attr("y1", value - this.padding - this.padding - this.padding - this.padding);

        this.setAttribute("startY", this.getAttribute('y') + value - this.padding - this.padding - this.padding - this.padding);

        $(line).attr("y2", value - this.padding - this.padding - this.padding - this.padding);

        var pixelStartX = this.padding + this.padding + this.padding;
        var pixelEndX = this.getAttribute("width") - this.padding - this.padding;

        //encapsulate this code into a function
        var minX = this.getAttribute('minX');
        var maxX = this.getAttribute('maxX');
        var steppingX = this.getAttribute('steppingX');

        var numberOfStepsX = Math.floor(((maxX - minX) / steppingX) + 1);

        var distancePerStepInPixel = Math.floor((pixelEndX - pixelStartX) / (numberOfStepsX - 1));
        this.setAttribute("distanceX", distancePerStepInPixel);

        var yCoordinate = value - this.padding - this.padding - this.padding - this.padding;

        var drawLineAt = pixelStartX;
        for (var i = 1; i <= numberOfStepsX; i++) {
            var currentStep = lines[i];
            $(currentStep).attr("y1", yCoordinate + 5);
            $(currentStep).attr("y2", yCoordinate - 5);

            $(currentStep).attr("stroke", this.getAttribute('linecolor'));
            $(currentStep).attr("stroke-width", 3);

            var currentNumeration = minX + ((i - 1) * steppingX);
            var currentNumerationObject = texts[i - 1];
            currentNumerationObject.textContent = currentNumeration.toString();
            $(currentNumerationObject).attr('y', yCoordinate + 18);
            $(currentNumerationObject).attr('font-size', 12);

            drawLineAt += distancePerStepInPixel;

        }
        //-------------------- y-axis

        var lineY = lines[numberOfStepsX + 1];
        $(lineY).attr("y1", value - this.padding - this.padding - this.padding - this.padding);

        $(lineY).attr("y2", this.padding + this.padding + this.padding + this.padding);
        $(lineY).attr("stroke-width", "4");

        var pixelStart = value - this.padding - this.padding - this.padding - this.padding;
        var pixelEnd = this.padding + this.padding + this.padding + this.padding;

        var minY = this.getAttribute('minY');
        var maxY = this.getAttribute('maxY');
        var steppingY = this.getAttribute('steppingY');

        var numberOfSteps = Math.floor(((maxY - minY) / steppingY) + 1);
        var distancePerStepInPixel = Math.floor((pixelStart - pixelEnd) / (numberOfSteps - 1));
        this.setAttribute("distanceY", distancePerStepInPixel);

        var xCoordinate = this.padding + this.padding + this.padding
        var drawLineAt = pixelStart;

        for (var i = numberOfStepsX + 2; i < numberOfStepsX + numberOfSteps + 2; i++) {
            var currentStep = lines[i];
            $(currentStep).attr("y1", drawLineAt);
            $(currentStep).attr("y2", drawLineAt);

            $(currentStep).attr("stroke", this.getAttribute('linecolor'));
            $(currentStep).attr("stroke-width", 3);


            var currentNumeration = minY + ((i - numberOfStepsX - 2) * steppingY);
            var currentNumerationObject = texts[i - 1];
            currentNumerationObject.textContent = currentNumeration.toString();
            $(currentNumerationObject).attr('y', drawLineAt + 3);

            $(currentNumerationObject).attr('font-size', 12);

            drawLineAt -= distancePerStepInPixel;


        }
        var label = this.getAttribute('label');
        if (!label)
            label = '';

        //rep.text.innerHTML = '<table style="width:100%;"><tr><td style="padding-left:30px;height:' + this.getAttribute('height') + 'px;vertical-align:' + 'top' + ';text-align:' + 'left' + '">' + label + '</td></tr></table>';

        //Setze die Pfeilspitze
        var markerId = GUI.getSvgMarkerId("arrow", 'black', true);
        $(line).attr("marker-end", "url(#" + markerId + ")");

        var markerIdY = GUI.getSvgMarkerId("arrow", 'black', true);
        $(lineY).attr("marker-end", "url(#" + markerIdY + ")");

        //rep.text.innerHTML = '<table style="width:100%;"><tr><td style="height:' + 30 + 'px;vertical-align:' + this.getAttribute('vertical-align') + ';text-align:' + '40' + '">' + label + '</td></tr></table>';
        var labelX = this.getAttribute('labelX');
        if (!labelX)
            labelX = '';
        rep.textX.innerHTML = '<table style="width:100%;"><tr><td style="height:' + value + 'px;vertical-align:' + 'bottom' + ';text-align:' + 'right' + '">' + labelX + '</td></tr></table>';
        rep.textX.style.fontSize = this.getAttribute('font-size') + 'px';
        rep.textX.style.fontFamily = this.getAttribute('font-family');
        rep.textX.style.color = this.getAttribute('font-color');

        var labelY = this.getAttribute('labelY');
        if (!labelY)
            labelY = '';

        rep.textY.innerHTML = '<table style="width:100%;"><tr><td style="padding-left:30px;height:' + value + 'px;vertical-align:' + 'top' + ';text-align:' + 'left' + '">' + labelY + '</td></tr></table>';
        rep.textY.style.fontSize = this.getAttribute('font-size') + 'px';
        rep.textY.style.fontFamily = this.getAttribute('font-family');
        rep.textY.style.color = this.getAttribute('font-color');
    }
    $(rep).attr("height", value);
    $(rep.rect).attr("height", value);
    $(rep.text).attr("height", value);
    var table = rep.text.getElementsByTagName('td')[0];

    if (table)
        table.style.textAlign = this.getAttribute('horizontal-align');

    GUI.adjustContent(this);
}

CoordinateSystem.calculateLabelXDistance = function(labelX) {
    var width = $('#labelXID').width();
    $('#labelXID').css( "padding-left", this.getAttribute('width')-width-10);
}

