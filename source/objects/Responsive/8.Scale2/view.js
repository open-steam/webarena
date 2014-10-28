/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

Scale2.moveByTransform = function() {
    return true;
};

Scale2.draw = function(external) {

    //hole rep
    var rep = this.getRepresentation();

    //draw go
    GeneralObject.draw.call(this, external);

    //hole das Rechteck
    var rect = rep.getElementsByTagName('rect')[0];
    //hole die Linie
    var line = rep.getElementsByTagName('line')[0];

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
    $(line).attr("stroke-width", 5);

    this.padding = 20;



    switch (this.getAttribute('orientation')) {

        //Linie laeuft links entlang
        case 'left':

            $(line).attr("x1", this.padding);
            $(line).attr("y1", this.getAttribute('height') - this.padding);

            $(line).attr("x2", this.padding);
            $(line).attr("y2", this.padding + this.padding);

            break;
            //...rechts
        case 'right':

            $(line).attr("x1", this.getAttribute('width') - this.padding);
            $(line).attr("y1", this.getAttribute('height') - this.padding);

            $(line).attr("x2", this.getAttribute('width') - this.padding);
            $(line).attr("y2", this.padding + this.padding);


            break;

            //oben
        case 'top':

            $(line).attr("x1", this.padding);
            $(line).attr("y1", this.padding);

            $(line).attr("x2", this.getAttribute('width') - this.padding - this.padding);
            $(line).attr("y2", this.padding);

            break;

            //unten
        default:

            $(line).attr("x1", this.padding);
            $(line).attr("y1", this.getAttribute('height') - this.padding);

            $(line).attr("x2", this.getAttribute('width') - this.padding - this.padding);
            $(line).attr("y2", this.getAttribute('height') - this.padding);

            var pixelStartX = this.padding;
            var pixelEndX = this.getAttribute('width') - this.padding - this.padding;

            //encapsulate this code into a function
            var minX = this.getAttribute('minX');
            var maxX = this.getAttribute('maxX');
            var steppingX = this.getAttribute('steppingX');

            var numberOfStepsX = Math.floor(((maxX - minX) / steppingX) + 1);

            var distancePerStepInPixel = (pixelEndX - pixelStartX) / (numberOfStepsX - 1);

            var yCoordinate = this.getAttribute('height') - this.padding;

            var drawLineAt = pixelStartX;
            for (var i = 1; i <= numberOfStepsX; i++) {
                var currentStep = rep.getElementsByTagName('line')[i];
                $(currentStep).attr("x1", drawLineAt);
                $(currentStep).attr("y1", yCoordinate + 5);
                $(currentStep).attr("x2", drawLineAt);
                $(currentStep).attr("y2", yCoordinate - 5);

                $(currentStep).attr("stroke", this.getAttribute('linecolor'));
                $(currentStep).attr("stroke-width", 3);


                drawLineAt += distancePerStepInPixel;

            }
            //-------------------- y-axis

            var lineY = rep.getElementsByTagName('line')[numberOfStepsX + 1];
            $(lineY).attr("x1", this.padding);
            $(lineY).attr("y1", this.getAttribute('height') - this.padding);

            $(lineY).attr("x2", this.padding);
            $(lineY).attr("y2", this.padding + this.padding);

            var pixelStartY = this.getAttribute('height') - this.padding;
            var pixelEndY = this.padding + this.padding;

            //encapsulate this code into a function
            var minY = this.getAttribute('minY');
            var maxY = this.getAttribute('maxY');
            var steppingY = this.getAttribute('steppingY');

            var numberOfStepsY = Math.floor(((maxY - minY) / steppingY) + 1);

            var distancePerStepInPixelY = (pixelEndY - pixelStartY) / (numberOfStepsY - 1);

            var xCoordinate = this.padding;

            drawLineAt = pixelStartY;
            for (var i = numberOfStepsX + 2; i < numberOfStepsX + numberOfStepsY + 2; i++) {
                var currentStep = rep.getElementsByTagName('line')[i];
                $(currentStep).attr("x1", xCoordinate + 5);
                $(currentStep).attr("y1", drawLineAt);
                $(currentStep).attr("x2", xCoordinate - 5);
                $(currentStep).attr("y2", drawLineAt);

                $(currentStep).attr("stroke", this.getAttribute('linecolor'));
                $(currentStep).attr("stroke-width", 3);


                drawLineAt += distancePerStepInPixelY;

            }
            break;

    }
    //Setze die Pfeilspitze
    var markerId = GUI.getSvgMarkerId("arrow", this.getAttribute("linecolor"), true);
    $(line).attr("marker-end", "url(#" + markerId + ")");

    var markerIdY = GUI.getSvgMarkerId("arrow", this.getAttribute("linecolor"), true);
    $(lineY).attr("marker-end", "url(#" + markerIdY + ")");

    //rep.text.innerHTML = '<table style="width:100%;"><tr><td style="height:' + 30 + 'px;vertical-align:' + this.getAttribute('vertical-align') + ';text-align:' + '40' + '">' + label + '</td></tr></table>';

    rep.text.style.fontSize = this.getAttribute('font-size') + 'px';
    rep.text.style.fontFamily = this.getAttribute('font-family');
    rep.text.style.color = this.getAttribute('font-color');

}

Scale2.createRepresentation = function(parent) {
    var rep = GUI.svg.group(parent, this.getAttribute('id'));

    rep.dataObject = this;

    var rect = GUI.svg.rect(rep,
            0, //x
            0, //y
            10, //width
            10 //height
            );

    var lineX = GUI.svg.line(rep, 0, 0, 20, 20, {});

    var lineY = GUI.svg.line(rep, 0, 0, 20, 20, {});

    var numbers = GUI.svg.group(rep);

    $(rect).addClass("rect");
    $(lineX).addClass("line");
    $(lineY).addClass("line");
    $(numbers).addClass("numbers");

    rep.text = GUI.svg.other(rep, "foreignObject");
    var body = document.createElement("body");
    $(rep.text).append(body);
//Create Units at the x axis
    var minX = this.getAttribute('minX');
    var maxX = this.getAttribute('maxX');
    var steppingX = this.getAttribute('steppingX');

    var numberOfStepsX = Math.floor(((maxX - minX) / steppingX) + 1);

    for (var i = 0; i < numberOfStepsX; i++) {
        var tempStep = GUI.svg.line(rep, 0, 0, 20, 20, {});
        $(tempStep).addClass('line');
    }
    //Create Units at the Y axis
    var minY = this.getAttribute('minY');
    var maxY = this.getAttribute('maxY');
    var steppingY = this.getAttribute('steppingY');

    var numberOfStepsY = Math.floor(((maxY - minY) / steppingY) + 1);

    for (var i = 0; i < numberOfStepsY; i++) {
        var tempStep = GUI.svg.line(rep, 0, 0, 20, 20, {});
        $(tempStep).addClass('line');
    }

    this.initGUI(rep);
    return rep;

}