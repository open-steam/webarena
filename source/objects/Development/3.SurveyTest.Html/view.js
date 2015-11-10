/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

SurveyTest.updateContent = function() {
	var self = this;
	var minValue = -5;
	var maxValue = 5;
	var mean = (maxValue+minValue)/2;

	var rep=this.getRepresentation();

	this.setAttribute("width", 400);
	this.setAttribute("height", 400);

	this.getContentAsString(function(text){
		if(text!=self.oldContent || !text){
			if (text == "") {
				$(rep).find("body").html(
					'<span class=\"moveArea\" style=\"background-color:lightblue; text-align: center;\">Hier verschieben</span> <br><br>'+
					'<div data-role=\"main\" class=\"ui-content\">'+
					    'Bewerten Sie die folgenden Aussagen auf einer Skala von'+ minValue +' bis '+ maxValue +'\n'+
					    '<br><br>'+
					    '<form method=\"post\" action=\"#\">'+
					    	'Diese Aussage ist super. <br>'+
					    	'<input type=\"range\" name=\"slider1\" id=\"points1\" oninput=\"display1.value = slider1.value\" value=\"'+ mean +'\" min=\"'+minValue+'\" max=\"'+maxValue+'\">'+
					    	'Punkte: <output name=\"display1\">'+mean+'</output>'+
					    	'<br>'+
					    	'Diese Aussage ist okay. <br>'+
					    	'<input type=\"range\" name=\"slider2\" id=\"points2\" oninput=\"display2.value = slider2.value\" value=\"'+ mean +'\" min=\"'+minValue+'\" max=\"'+maxValue+'\">'+
					    	'Punkte: <output name=\"display2\">'+mean+'</output>'+
					    	'<br>'+
					    	'Diese Aussage ist schlecht. <br>'+
					    	'<input type=\"range\" name=\"slider3\" id=\"points3\" oninput=\"display3.value = slider3.value\" value=\"'+ mean +'\" min=\"'+minValue+'\" max=\"'+maxValue+'\">'+
					    	'Punkte: <output name=\"display3\">'+mean+'</output>'+
					    	'<br>'+
					    	'<input type=\"submit\" data-inline=\"true\" value=\"Ergebnis absenden\">'+
					    '</form>'+
					'</div>'
  				);
			} else {
				$(rep).find("body").html(text);
			}
		}
		
		self.oldContent=text;
		
	});
	
}