/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

Scale.moveByTransform = function() {
    return true;
};

Scale.draw = function(external) {

     console.log();


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
    //$(line).attr("stroke", this.getAttribute('linecolor'));
    $(line).attr("stroke", "rbg(0,0,0)");
    $(line).attr("stroke-width", 5);

    this.padding = 20;

    var min = this.getAttribute('min');
    var max = this.getAttribute('max');
    var stepping = this.getAttribute('stepping');


    /*    switch (this.getAttribute('orientation')) {
     
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
     */
    if (this.getAttribute('direction') === 'horizontal') {
        $(line).attr("x1", this.padding);
        $(line).attr("y1", this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding);
        this.setAttribute("startX", this.getAttribute("x") + this.padding);
        this.setAttribute("startY", this.getAttribute("y") + this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding);
        

        $(line).attr("x2", this.getAttribute('width') - this.padding - this.padding);
        $(line).attr("y2", this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding);

        var pixelStart = this.padding;
        var pixelEnd = this.getAttribute('width') - this.padding - this.padding;
        var numberOfSteps = rep.getElementsByTagName('line').length - 1;
        var distancePerStepInPixel = Math.floor((pixelEnd - pixelStart) / (numberOfSteps - 1));
        this.setAttribute("distanceX", distancePerStepInPixel);

        var yCoordinate = this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding;

        var drawLineAt = pixelStart;
        for (var i = 1; i < rep.getElementsByTagName('line').length; i++) {
            var currentStep = rep.getElementsByTagName('line')[i];
            $(currentStep).attr("x1", drawLineAt);
            $(currentStep).attr("y1", yCoordinate + 5);
            $(currentStep).attr("x2", drawLineAt);
            $(currentStep).attr("y2", yCoordinate - 5);

            $(currentStep).attr("stroke", this.getAttribute('linecolor'));
            $(currentStep).attr("stroke-width", 3);



            var currentNumeration = min + ((i - 1) * stepping);
            var currentNumerationObject = rep.getElementsByTagName("text")[i - 1];
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
    } else {
        $(line).attr("x1", this.padding + this.padding + this.padding);
        $(line).attr("y1", this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding);
        this.setAttribute("startX", this.getAttribute("x") + this.padding);
        this.setAttribute("startY", this.getAttribute("y") + this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding);
        
        $(line).attr("x2", this.padding + this.padding + this.padding);
        $(line).attr("y2", this.padding + this.padding + this.padding + this.padding);

        var pixelStart = this.getAttribute('height') - this.padding - this.padding - this.padding - this.padding;
        var pixelEnd = this.padding + this.padding + this.padding + this.padding;

        var numberOfSteps = rep.getElementsByTagName('line').length - 1;
        var distancePerStepInPixel = Math.floor((pixelStart - pixelEnd) / (numberOfSteps - 1));
        this.setAttribute("distanceY", distancePerStepInPixel);

        var xCoordinate = this.padding + this.padding + this.padding
        var drawLineAt = pixelStart;

        for (var i = 1; i < rep.getElementsByTagName('line').length; i++) {
            var currentStep = rep.getElementsByTagName('line')[i];
            $(currentStep).attr("y1", drawLineAt);
            $(currentStep).attr("x1", xCoordinate + 5);
            $(currentStep).attr("y2", drawLineAt);
            $(currentStep).attr("x2", xCoordinate - 5);

            $(currentStep).attr("stroke", this.getAttribute('linecolor'));
            $(currentStep).attr("stroke-width", 3);


            var currentNumeration = min + ((i - 1) * stepping);
            var currentNumerationObject = rep.getElementsByTagName("text")[i - 1];
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
    //          break;

//    }
    //Setze die Pfeilspitze
    var markerId = GUI.getSvgMarkerId("arrow", this.getAttribute("linecolor"), true);
    $(line).attr("marker-end", "url(#" + markerId + ")");


    rep.text.style.fontSize = this.getAttribute('font-size') + 'px';
    rep.text.style.fontFamily = this.getAttribute('font-family');
    rep.text.style.color = this.getAttribute('font-color');

}

Scale.createRepresentation = function(parent) {
    var rep = GUI.svg.group(parent, this.getAttribute('id'));

    rep.dataObject = this;

    var rect = GUI.svg.rect(rep,
            0, //x
            0, //y
            10, //width
            10 //height
            );

    var line = GUI.svg.line(rep, 0, 0, 20, 20, {});

    var numbers = GUI.svg.group(rep);

    $(rect).addClass("rect");
    $(line).addClass("line");
    $(numbers).addClass("numbers");

    rep.text = GUI.svg.other(rep, "foreignObject");
    var body = document.createElement("body");
    $(rep.text).append(body);

    var min = this.getAttribute('min');
    var max = this.getAttribute('max');
    var stepping = this.getAttribute('stepping');

    var numberOfSteps = Math.floor(((max - min) / stepping) + 1);

    for (var i = 0; i < numberOfSteps; i++) {
        var tempStep = GUI.svg.line(rep, 0, 0, 20, 20, {});
        $(tempStep).addClass('line');

        var tempNumber = GUI.svg.createText();
        var tempNumberRep = GUI.svg.text(rep, 0, 0, tempNumber);
        $(tempNumberRep).addClass('text');
    }



    this.initGUI(rep);
    return rep;

}