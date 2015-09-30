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
	
	var functionText = "x^2+10x";	
	var f = Calc.parseEquation(functionText, true);
	//if degree <=2 Scheitelpunkt middle of value table
	var xvalues;
	var vertex;
	var left_root;
	var right_root;
	if(true){
		vertex= Calc.getVertex(f,-100,100,0.001);
		left_root = Calc.getRoot(f, vertex-10, 100);
		right_root = Calc.getRoot(f, vertex+10, 100);
		if(left_root!=false && right_root!=false)
			xvalues = (Math.abs(left_root)+Math.abs(right_root))/10;
		else{			
			left_root = vertex-10;
			xvalues=2;
		}
		console.log(vertex+" "+left_root+" "+right_root+" "+xvalues);
	}
	console.log("scheitel und nullstelle");
	GUI.svg.rect(rep,0,0,160,30,{fill: 'grey'});
	GUI.svg.rect(rep,0,28,80,30,{fill: 'white'});
	GUI.svg.rect(rep,78,28,80,30,{fill: 'white'});
	for(var i=0; i<=10; i++){
		GUI.svg.use(rep,0,30+i*28,80,30,'#RowDef');
		GUI.svg.use(rep,78,30+i*28,80,30,'#RowDef');
	}
	
	GUI.svg.text(rep, 5,22,"f(x)="+f, {fontFamily: 'Verdana', fontSize: 10, fill: 'black', fontWeight: 'bold'});
	GUI.svg.text(rep, 5,50,"x", {fontFamily: 'Verdana', fontSize: 10, fill: 'black', fontWeight: 'bold'});
	GUI.svg.text(rep, 83,50,"f(x)", {fontFamily: 'Verdana', fontSize: 10, fill: 'black', fontWeight: 'bold'});
	
	for(var i=0;i<=9;i++){
		var x = left_root+xvalues*i;
		var y = Calc.roundToSignificantFigures(Parser.evaluate(f, {x : x}),10);
		if(i!=5){
			GUI.svg.text(rep, 5, 78+i*28, x.toString(), {fontFamily: 'Verdana', fontSize: 10, fill: 'black'});
			GUI.svg.text(rep, 83, 78+i*28, y.toString() , {fontFamily: 'Verdana', fontSize: 10, fill: 'black'});
		}
		else{
			GUI.svg.text(rep, 5, 78+i*28, x.toString(), {fontFamily: 'Verdana', fontSize: 10, fill: 'black',fontWeight: 'bold'});
			GUI.svg.text(rep, 83, 78+i*28, y.toString() , {fontFamily: 'Verdana', fontSize: 10, fill: 'black', fontWeight: 'bold'});
		}
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