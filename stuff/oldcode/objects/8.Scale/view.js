/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

Scale.onMoveStart=function(){
	GUI.hideActionsheet();
	GUI.hideLinks(this);
	var rep=this.getRepresentation();
	$(rep).children(".numbers").remove();
}

Scale.onMoveEnd=function(){
	GUI.showLinks(this);
}

Scale.draw=function(external){

	var rep=this.getRepresentation();
	
	GeneralObject.draw.call(this, external);

	if (!$(rep).hasClass("selected")) {
		$(rep).children("line").attr("stroke", this.getAttribute('linecolor'));
	}
	
	$(rep).children("line").attr("stroke-width", this.getAttribute('linesize'));
	
	var begin={x:0,y:0};
	var end={x:0,y:0};

	if (this.getAttribute("direction") == 1) {
		end.x=this.getViewWidth();
		end.y=this.getViewHeight();
	} else if (this.getAttribute("direction") == 2) {
		begin.x=this.getViewWidth();
		end.y=this.getViewHeight();		
	} else if (this.getAttribute("direction") == 3) {
		begin.x=this.getViewWidth();
		begin.y=this.getViewHeight();	
	} else {
		begin.y=this.getViewHeight();
		end.x=this.getViewWidth();
	}
	
	$(rep).children(".numbers").remove();
	
	$(rep).children("line").attr("x1", begin.x);
	$(rep).children("line").attr("y1", begin.y);
	$(rep).children("line").attr("x2", end.x);
	$(rep).children("line").attr("y2", end.y);
	
	var numbers = GUI.svg.group(rep);
	$(numbers).addClass("numbers");
	
	//var beginText=GUI.svg.text(numbers, begin.x, begin.y+20, "Text");
	//var endText=GUI.svg.text(numbers, end.x, end.y+20, "Text");
	
	var startValue=this.getAttribute('min');
	var endValue=this.getAttribute('max');
	var stepping=this.getAttribute('stepping');
	var steps=(endValue-startValue)/stepping;
	
	var direction={x:0,y:0};
	
	direction.x=end.x-begin.x;
	direction.y=end.y-begin.y;
	
	for (var i=0;i<=steps;i+=1){
		var textX=begin.x+Math.round(i*direction.x/steps);
		var textY=begin.y+Math.round(i*direction.y/steps+20);
		GUI.svg.text(numbers, textX, textY, ''+(startValue+i*stepping));
	}
	
	
	$(rep).children("line.clickTarget").attr("stroke-width", 20);
	$(rep).children("line.clickTarget").attr("stroke", 'rgba(255,255,255,0)');
	
	if (this.getAttribute("markerStart")) {
		var markerId = GUI.getSvgMarkerId("arrow", this.getAttribute("linecolor"), false);
		$(rep).find("line.borderRect").attr("marker-start", "url(#"+markerId+")");
	} else {
		$(rep).find("line.borderRect").attr("marker-start", "");
	}
	
	if (this.getAttribute("markerEnd")) {
		var markerId = GUI.getSvgMarkerId("arrow", this.getAttribute("linecolor"), true);
		$(rep).find("line.borderRect").attr("marker-end", "url(#"+markerId+")");
	} else {
		$(rep).find("line.borderRect").attr("marker-end", "");
	}


}


Scale.createRepresentation = function(parent) {

	var rep = GUI.svg.group(parent,this.getAttribute('id'));

	var selectLine=GUI.svg.line(rep, 0, 0, 20, 20, {});
 	var line=GUI.svg.line(rep, 0, 0, 20, 20, {});
 	var numbers = GUI.svg.group(rep);

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));
	$(line).addClass("borderRect");
	$(numbers).addClass("numbers");
	$(selectLine).addClass("clickTarget");

	this.initGUI(rep);
	
	return rep;
	
}
