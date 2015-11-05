/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

Valuetable.draw=function(external){
	
	var rep=this.getRepresentation();
	
	this.drawDimensions(external);

	if (!$(rep).hasClass("webarena_ghost")) {
		if (this.getAttribute("visible") || this.selected) {
			$(rep).css("visibility", "visible");
		} else {
			$(rep).css("visibility", "hidden");
		}
	}

	var that=this;
	
		
	this.adjustControls();
	
}



Valuetable.createRepresentation = function(parent) {
	
	var rep = GUI.svg.group(parent,this.getAttribute('id'));
	
	var functionText = "x^2";
	var erstes = true;
	var color;
	var linkedObjects = this.getAttribute("link");
	$.each(linkedObjects, function(index, value) {
        var targetID = value.destination;
        var target = ObjectManager.getObject(targetID);
        if (!target) {
            //console.log(objectID+' has missing linked objects');
            return;
        }
        if (target.type == "FunctionText" && erstes) {
        	functionText = target.getAttribute("term");
        	color = target.getAttribute("font-color");
        	erstes = false;
        }
	});
	
	var f = Calc.parseEquation(functionText, true);
	var vertex;
		vertex= Calc.getVertex(f,-100,100,0.001);
	
	GUI.svg.rect(rep,0,0,160,30,{fill: 'grey'});
	GUI.svg.rect(rep,0,28,80,30,{fill: 'white'});
	GUI.svg.rect(rep,78,28,80,30,{fill: 'white'});
	
	//tabellengröße aus Object-Attributen ermitteln
	var start =0;
	var interval = Number(this.getAttribute("interval"));
	var highlighted = this.getAttribute('highlighted X-Value');
	var noHighlight= true;
	if(!Number.isNaN(highlighted)){
		highlighted= Number(highlighted);
		noHighlight =false;
	}
	
	while(start>this.getAttribute("x-min")){
		start= start-interval;
	}
	var end = 0;
	while(end<this.getAttribute("x-max")){
		end = end+interval;
	}
	
	//Tabellenpositionen definieren
	var pos= 0;
	
	for(var i=start;i<=end+1;i=i+interval){
		GUI.svg.use(rep,0,30+pos*28,80,30,'#RowDef');
		GUI.svg.use(rep,78,30+pos*28,80,30,'#RowDef');
		pos++;
	}
	if(highlighted < start || highlighted > end){
		pos++;
		GUI.svg.use(rep,0,30+pos*28,80,30,'#RowDef');
		GUI.svg.use(rep,78,30+pos*28,80,30,'#RowDef');
	}
	//Überschriften definieren
	GUI.svg.text(rep, 5,22,"f(x)="+f, {fontFamily: 'Verdana', fontSize: 10, fill: 'black', fontWeight: 'bold'});
	GUI.svg.text(rep, 5,50,"x", {fontFamily: 'Verdana', fontSize: 10, fill: 'black', fontWeight: 'bold'});
	GUI.svg.text(rep, 83,50,"f(x)", {fontFamily: 'Verdana', fontSize: 10, fill: 'black', fontWeight: 'bold'});
	
	
	/*Tabelle mit Werten gemäß Funktion und Object-Attributen füllen
	 */
	
	//Positionscounter für die SVG-Elemente
	pos=0;
	
	//extra wert gemäß Attribute "highlighted X-Value" einfügen falls vor dem bestimmten interval
	if(highlighted < start && !noHighlight){
		var x = Calc.roundToSignificantFigures(highlighted,4);
		var y = Calc.roundToSignificantFigures(Parser.evaluate(f, {x : x}),4);
		
		if(color == "#000000" || "black" || "rgb(0, 0, 0)")
			color = "rgb(255, 0, 0)";
		else
			color = "rgb(0, 0, 0)";
		GUI.svg.text(rep, 5, 78, x.toString(), {fontFamily: 'Verdana', fontSize: 10, fill: color,fontWeight: 'bold'});
		GUI.svg.text(rep, 83, 78, y.toString() , {fontFamily: 'Verdana', fontSize: 10, fill: color, fontWeight: 'bold'});
		
		pos++;
	}
	
	for(var i=start;i<=end;i=i+interval){
		var x = Calc.roundToSignificantFigures(i,4);
		var y = Calc.roundToSignificantFigures(Parser.evaluate(f, {x : x}),4);
		if(vertex != x){
			
			GUI.svg.text(rep, 5, 78+pos*28, x.toString(), {fontFamily: 'Verdana', fontSize: 10, fill: color});
			GUI.svg.text(rep, 83, 78+pos*28, y.toString() , {fontFamily: 'Verdana', fontSize: 10, fill: color});
		}
		else{
			GUI.svg.text(rep, 5, 78+pos*28, x.toString(), {fontFamily: 'Verdana', fontSize: 10, fill: color,fontWeight: 'bold'});
			GUI.svg.text(rep, 83, 78+pos*28, y.toString() , {fontFamily: 'Verdana', fontSize: 10, fill: color, fontWeight: 'bold'});
		}
		pos++;
		
		
		if(vertex > x && vertex < Calc.roundToSignificantFigures(i+1,4))
		{	
			x = Calc.roundToSignificantFigures(vertex,4);
			y = Calc.roundToSignificantFigures(Parser.evaluate(f, {x : x}),4);
			
			GUI.svg.text(rep, 5, 78+pos*28, x.toString(), {fontFamily: 'Verdana', fontSize: 10, fill: color,fontWeight: 'bold'});
			GUI.svg.text(rep, 83, 78+pos*28, y.toString() , {fontFamily: 'Verdana', fontSize: 10, fill: color, fontWeight: 'bold'});
			pos++;
			end++;
		}
		if(highlighted > x && highlighted < Calc.roundToSignificantFigures(i+1,4) && highlighted!=vertex && !noHighlight){
			x = Calc.roundToSignificantFigures(highlighted,4);
			y = Calc.roundToSignificantFigures(Parser.evaluate(f, {x : x}),4);
			
			GUI.svg.text(rep, 5, 78+pos*28, x.toString(), {fontFamily: 'Verdana', fontSize: 10, fill: color,fontWeight: 'bold'});
			GUI.svg.text(rep, 83, 78+pos*28, y.toString() , {fontFamily: 'Verdana', fontSize: 10, fill: color, fontWeight: 'bold'});
			pos++;
			end++;
		}
		
	}
	if(highlighted > end && !noHighlight){
		var x = Calc.roundToSignificantFigures(highlighted,4);
		var y = Calc.roundToSignificantFigures(Parser.evaluate(f, {x : x}),4);
		if(color == "#000000" || "black" || "rgb(0, 0, 0)")
			color = "rgb(255, 0, 0)";
		else
			color = "rgb(0, 0, 0)";
		GUI.svg.text(rep, 5, 78+pos*28, x.toString(), {fontFamily: 'Verdana', fontSize: 10, fill: color,fontWeight: 'bold'});
		GUI.svg.text(rep, 83, 78+pos*28, y.toString() , {fontFamily: 'Verdana', fontSize: 10, fill: color, fontWeight: 'bold'});
	}
	
	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));
	$(rep).css("cursor", "default");

	this.initGUI(rep);
	
	return rep;
	
}

/* get the y position of the objects bounding box (this is the top position of the object) */
Valuetable.getViewBoundingBoxY = function() {
	return this.getViewY();
}

/* get the height of the objects bounding box */
Valuetable.getViewBoundingBoxHeight = function() {
	var rep = this.getRepresentation();
	return this.getRepresentation().getBBox().height; //<--TODO: this value is too high
}

/**
 * Called when the colors of the appearence of an object are changed
 * @param {String} attribute attribute that was changed
 * @param {String} value new value of the attribute
 */
Valuetable.checkTransparency = function(attribute, value) {
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
	if (fontcolor === 'transparent' && linecolor === 'transparent') {
		return false;
	} else return true;
}