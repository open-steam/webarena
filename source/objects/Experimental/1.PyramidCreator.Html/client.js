/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

PyramidCreator.clientRegister = function (){

}

PyramidCreator.proceed = function (selection){
	this.serverCall('startPyramid',selection);
}