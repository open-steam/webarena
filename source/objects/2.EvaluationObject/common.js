/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var EvaluationObject=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

EvaluationObject.register('EvaluationObject');
EvaluationObject.category = 'Evaluations';
EvaluationObject.isCreatable=false;
EvaluationObject.isEvaluationObject=true;

module.exports=EvaluationObject;