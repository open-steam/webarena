/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

    var Helper=new function(){
    	
    	
    	//public method
	    this.getCloneOfObject=function(oldObject) {
	        var tempClone = {};
	
	        if (typeof(oldObject) == "object")
	            for (prop in oldObject)
	                // for array use private method getCloneOfArray
	                if ((typeof(oldObject[prop]) == "object") &&
	                                (oldObject[prop]).__isArray)
	                    tempClone[prop] = this.getCloneOfArray(oldObject[prop]);
	                // for object make recursive call to getCloneOfObject
	                else if (typeof(oldObject[prop]) == "object")
	                    tempClone[prop] = this.getCloneOfObject(oldObject[prop]);
	                // normal (non-object type) members
	                else
	                    tempClone[prop] = oldObject[prop];
	
	        return tempClone;
	    }
	
	    //private method (to copy array of objects) - getCloneOfObject will use this internally
	    this.getCloneOfArray=function(oldArray) {
	        var tempClone = [];
	
	        for (var arrIndex = 0; arrIndex <= oldArray.length; arrIndex++)
	            if (typeof(oldArray[arrIndex]) == "object")
	                tempClone.push(this.getCloneOfObject(oldArray[arrIndex]));
	            else
	                tempClone.push(oldArray[arrIndex]);
	
	        return tempClone;
	    }   
    	
		/**
		 * assure - assure type security. 
		 *
		 * Test, if a variable is set. If the variable is undefined
		 * an exception is thrown. 
		 *
		 * If a datatype is provided, the variable is checked against 
		 * that type, forcing an exception in case of a wrong type.
		 *
		 * Name is used for debugging purposes
		 **/
		this.assure=function(variable,name,datatype){
	
			if (!name) name='';
	
			if (variable===undefined){
				throw 'missing variable '+name;
			}
			
			if (!datatype) return true;
			
			if (typeof variable!==datatype) {
				throw 'variable '+name+' is not of type '+datatype;
			}
			
			
		}
    	
	   	
	   	this.getRandom=function( min, max ) {
			if( min > max ) {
				return( -1 );
			}
			if( min == max ) {
				return( min );
			}
		 
		        return( min + parseInt( Math.random() * ( max-min+1 ) ) );
		}
		

		this.array_unique = function(arrayName) {
		      var newArray = new Array();
		      label:for(var i=0; i<arrayName.length;i++ ) {
		         for(var j=0; j<newArray.length;j++ ) {
		            if(newArray[j] == arrayName[i])
		               continue label;
		         }
		         newArray[newArray.length] = arrayName[i];
		      }
		      return newArray;
		   }
		
		   	
	}


module.exports=Helper;
