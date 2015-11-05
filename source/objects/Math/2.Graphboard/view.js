/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


var myPlot;
var rep;
var svg;
Graphboard.draw=function(external){
	var rep=this.getRepresentation();
	this.drawDimensions(external);
	
/*
* TODO: gedraw ohne refresh? hier immer die neuen graphen erzeugen? plot wird richtig eingefügt aber nicht sichtbar in der WA.
 */
//$(rep).find('body').find('g').append()
//	var color = "#000000";
//	var functions = 0;
//	var linkedObjects = this.getAttribute("link");
//	console.log(linkedObjects);
//    $.each(linkedObjects, function(index, value) {
//    	
//        var targetID = value.destination;
//        var target = ObjectManager.getObject(targetID);
//        if (!target) {
//            //console.log(objectID+' has missing linked objects');
//            return;
//        }
//        
//        if (target.type == "FunctionText") {
//        	color = "#000000";
//        	color = color.substr(0,1+functions)+"f"+color.substr((functions)+2);
//        	functions++;
//            myPlot.addPlot(target.getContentAsString(),FOOPLOT_TYPE_FUNCTION,{'color':color});
//            setTimeout(null, 3000);
//        }
//	});
//    
//	svg = myPlot.getSVGBody();
//	
//	console.log($(rep));
//	$(rep).find('body>svg').append(svg);
//	console.log($(rep));				
	
}

Graphboard.createRepresentation = function(parent) {
	
	rep = GUI.svg.group(parent, this.getAttribute('id'));
	rep.foreign = GUI.svg.other(rep,"foreignObject",{x: 0, y: 30, width: 500, height: 500});	
	
	rep.dataObject=this;
	
	var body = document.createElement("body");
	var div = document.createElement("div");
	div.id = 'plot-'+this.getAttribute('id');
	
	$(div).css('width','500px');
	$(div).css('height','500px');
		
	$(body).append(div);
	$(rep.foreign).append(body);
	
	/*
     * TODO: Punkte an charakteristischen Punkten zum bewegen und stauchen des graphen? erstmal nur für quadratische Funktionen
     * nicht an dieser stelle.
     */
//	var point = [];
//	var pointplot = '1,1';
//	var coordinates = pointplot.split(',');
//	point.push([coordinates[0], coordinates[1]]);
//	myPlot.addPlot(point, FOOPLOT_TYPE_POINTS, {'color':'#000' });
	
     
	myPlot = new Fooplot(document.getElementById('plot-'+this.getAttribute('id')));
	
	myPlot.xmin=Number(this.getAttribute('x-min'));
	myPlot.xmax=Number(this.getAttribute('x-max'));
	myPlot.ymin=Number(this.getAttribute('y-min'));
	myPlot.ymax=Number(this.getAttribute('y-max'));
	
	var color = "#000000";
	var linkedObjects = this.getAttribute("link");
    $.each(linkedObjects, function(index, value) {
    	
        var targetID = value.destination;
        var target = ObjectManager.getObject(targetID);
        if (!target) {
            //console.log(objectID+' has missing linked objects');
            return;
        }
        
        if (target.type == "FunctionText") {
        	color = target.getAttribute("font-color");
        	if(target.getAttribute("term")==undefined){
        		myPlot.addPlot("1".FOOPLOT_TYPE_FUNCTION,{'color':'#FFF000'});
        		console.log("fehler beim erkennen einer verknüpften funktion");
        	}
        	else
        		myPlot.addPlot(target.getAttribute("term"),FOOPLOT_TYPE_FUNCTION,{'color':color});
        }
	});
	
    /*
     * TODO: gedraw ohne refresh? nur rahmen erzeugen?
     */
//	svg = myPlot.getSVGFrame();
	svg = myPlot.getSVG();
	$(body).html(svg);
	
	
	rep.dataObject=this;
	

	this.initGUI(rep);
	
	return rep;
}

/**
 * Called when the colors of the appearence of an object are changed
 * @param {String} attribute attribute that was changed
 * @param {String} value new value of the attribute
 */
Graphboard.checkTransparency = function(attribute, value) {
	if (attribute === 'fillcolor') {
		var fillcolor = value;
	} else {
		var fillcolor = this.getAttribute('fillcolor');
	}
	if (attribute === 'font-color') {
		var fontcolor = value;
	} else {
		var fontcolor = this.getAttribute('font-color');
	}
	if (attribute === 'linecolor') {
		var linecolor = value;
	} else {
		var linecolor = this.getAttribute('linecolor');
	}
	if ((fillcolor === 'transparent' && linecolor === 'transparent' && fontcolor === 'transparent') || (fillcolor === 'transparent' && linecolor === 'transparent' && this.getContentAsString().trim() === '')) {
		return false;
	} else return true;
}


