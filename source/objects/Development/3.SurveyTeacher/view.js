/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/
SurveyTeacher.updateContent = function() {
	var rep=this.getRepresentation();
	var that = this;

	this.setAttribute("width", 400);
	this.setAttribute("height", 400);

	this.surveyBaseHtml = function(){
		var string = '<span class="moveArea"> MOVE HERE </span> <br>'+
  			'<div data-role="main" class="ui-content">'+
	  		'<div class="ui-content-statements">'+
		  	'<br>'+
		  	'<b>Zu beurteilende Aussagen: </b>'+
		  	'<br>';

		string += that.getStatements();
				
		string += '</div>'+'<br>'+'<div class="ui-content-specifications">';

		string += that.getSpecifications();
			
		return string +'</div></div>';
	}
	
	that.setHTML(that.surveyBaseHtml());	
}

// SurveyTeacher.updateHTMLString = function(text) {
// 	this.setAttribute('HTMLString', text);
// 	this.setHTML(text);
// }

SurveyTeacher.getSpecifications = function(){
	return	'<b>Eigenschaften: </b> <br>'+
	'<span style="margin-right: 30px">Schrittgröße:</span><span style="margin-left: 40px">'+this.getAttribute('stepping')+ '</span><br>'+
	'<span style="margin-right: 30px">Minimaler Wert:</span><span style="margin-left: 20px">'+this.getAttribute('minValue')+ '</span><br>'+
	'<span style="margin-right: 30px">Maximaler Wert:</span><span style="margin-left: 20px">'+this.getAttribute('maxValue')+ '</span>';
}


SurveyTeacher.getStatements = function(){
	var stringAttachment = '';
	var statements = this.getAttribute('statements');

	stringAttachment += '<ul>';
	for(var i = 0; i < statements.length; i++){
		stringAttachment += '<li>' + statements[i] + '</li>';
	}
	stringAttachment += '</ul>';

	return	stringAttachment;
}
