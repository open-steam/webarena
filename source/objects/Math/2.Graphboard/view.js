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
	
	var that=this;
	this.getContentAsString(function(data){
		if(data!=that.oldContent){
			if ((!data && !that.oldContent) || data == "") {
				$(rep).find("text").get(0).textContent='';
			} else {
				$(rep).find("text").get(0).textContent=data;
			}
		}
		
		that.oldContent=data;	
		console.log(data);
	});
}

Graphboard.createRepresentation = function(parent) {
	
	rep = GUI.svg.group(parent, this.getAttribute('id'));
	rep.foreign = GUI.svg.other(rep,"foreignObject",{x: 0, y: 30, width: 500, height: 500});	
	
	
	var body = document.createElement("body");
	var div = document.createElement("div");
	div.id = 'plot-'+this.getAttribute('id');
	
	$(div).css('width','500px');
	$(div).css('height','500px');
		
	$(body).append(div);
	$(rep.foreign).append(body);
	
	myPlot = new Fooplot(document.getElementById('plot-'+this.getAttribute('id')));
//	var point = [];
//	var pointplot = '1,1';
//	var coordinates = pointplot.split(',');
//	point.push([coordinates[0], coordinates[1]]);
//	myPlot.addPlot(point, FOOPLOT_TYPE_POINTS, {'color':'#000' });
	var color = "#000000";
	var functions = 0;
	var linkedObjects = this.getAttribute("link");
    $.each(linkedObjects, function(index, value) {
        var targetID = value.destination;
        var target = ObjectManager.getObject(targetID);
        if (!target) {
            //console.log(objectID+' has missing linked objects');
            return;
        }
        
        if (target.type == "FunctionText") {
        	color = "#000000";
        	color = color.substr(0,1+functions)+"f"+color.substr((functions)+2);
        	functions++;
        	console.log(target);
            myPlot.addPlot(target.getContentAsString(),FOOPLOT_TYPE_FUNCTION,{'color':color});
            setTimeout(null, 3000);
        }
    });
	
	
	myPlot.xmin=-20;
	myPlot.xmax=20;
	myPlot.ymin=-20;
	myPlot.ymax=20;
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

///**
// * Called after a double click on the text, enables the inplace editing
// */
//Graphboard.editText = function(){
//	rep.input.innerHTML='<input type="text" name="newContent" value="'+this.oldContent+'" style="font-size: '+this.getAttribute('font-size')+'px; font-family: '+this.getAttribute('font-family')+'; color: '+this.getAttribute('font-color')+'; width: '+(rep.text.getBoundingClientRect().width+15)+'px; height: '+(rep.text.getBoundingClientRect().height)+'px;">';
//	
//	$(rep).find("foreignObject").attr("height", rep.text.getBoundingClientRect().height+10);
//	
//	$(rep).find("foreignObject").attr("width", rep.text.getBoundingClientRect().width+60);
//	$(rep).find("text").hide();
//	
//	$(rep).find("input").focus();
//	
//	this.input = true;
//	GUI.input = this.id;
//	
//	var self = this;
//	this.draw();
//}
