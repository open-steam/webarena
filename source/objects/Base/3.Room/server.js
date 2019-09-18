/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2013
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');
var async = require('async');

theObject.evaluatePositionFor = function(object, data) {
	console.log("Evaluate position for called");
	var self=this

    if (object.isActive && object.isActive()) {
       
       //this is called when an application object has moved.
       
        var oldContext=object.getAttribute('context').toString();
       
        var inStructures=0;
        
        this.getInventoryAsync(function(allObjects){	
        
		   for (var i in allObjects) {
		            if (allObjects[i].isStructuring && allObjects[i].isStructuring()) {
		                inStructures+=allObjects[i].processPositioningData(object, data, self);
		        }
        	}
        
        	//if not one of the structures could process the object, it must be sitting on neural ground
        	console.log(inStructures);
        	if (!inStructures){
        		object.setAttribute('context','neutral');
        	}
        	
        	//those evluation functions removing attribute values shall only be called if the content has
        	//changed. If that is the case, only those evaluationFunctions of the current context are called.
        	var newContext=object.getAttribute('context').toString();
        
	        if (oldContext!=newContext){
	        	self.deleteRemoveEvaluations();
	        } else {
	        	self.performRemoveEvaluations(oldContext);
	        }
        	
        });
       
    }

}

theObject.removeEvaluationArray=[];

theObject.addRemoveEvaluations=function(evalFunction){
	this.removeEvaluationArray.push(evalFunction);
}

theObject.deleteRemoveEvaluations=function(){
	this.removeEvaluationArray=[];
}

theObject.performRemoveEvaluations=function(oldContext){
	for (var i in this.removeEvaluationArray){
		var evaluationFunction=this.removeEvaluationArray[i];
		if (evaluationFunction.context==oldContext){
			evaluationFunction();
		}
	}
	
	this.deleteRemoveEvaluations();
}



theObject.getStructuringObjects = function(cb){
	this.getInventoryAsync(function(allObjects){
		
		var filterFunction=function(item, callback){
			
			if (item.isStructuring && item.isStructuring()) {
				callback(true);
			} else {
				callback(false);
			}
		
			
		}
		
		async.filter(allObjects, filterFunction, function(results){
		    cb(results);
		});		
		
		
	});
}

theObject.getStructuringAttributes = function(cb,asObject){
	
	this.getStructuringObjects(function(objects){
		
		var temp={};
		
		for(var i in objects){
			var object=objects[i];
			
			var oAttributes=object.getStructuringAttributes();
			
			for (var j in oAttributes){
				temp[oAttributes[j]]=true;
			}	
		}
		
		if (asObject) return cb(temp);
		
		var attributes=[];
		
		for (var i in temp){
			attributes.push(i);
		}
		
		cb(attributes);
		
	});
	
}

theObject.getApplicationObjects = function(cb){
	this.getInventoryAsync(function(allObjects){
		
		var filterFunction=function(item, callback){
			
			if (item.isActive && item.isActive()) {
				callback(true);
			} else {
				callback(false);
			}
		
			
		}
		
		async.filter(allObjects, filterFunction, function(results){
		    cb(results);
		});		
		
		
	});
}

theObject.getActiveObjects=theObject.getApplicationObjects;

theObject.getInventoryAsync = function(cb){
    return Modules.ObjectManager.getObjects(this.id, this.context, cb);
}


theObject.hasObjectAsync=function(obj,trueCB,falseCB){
	
	this.getInventoryAsync(function(inventory){
		
		if (trueCB){
			for (var i in inventory){
				if (inventory[i].id==obj.id) return trueCB();
			}
			if (falseCB) falseCB();
		}
		
	});
}


theObject.createObject=function(type,callback){	
    return Modules.ObjectManager.createObject(this.id, type, false, false, this.context, callback);
}

/**
*	returns the objects which were deleted in the current room (special format for JSTree!)
*/
theObject.getDeletedObjects = function(cb){

	var that = this;
	
    Modules.ObjectManager.getObjects("trash", this.context, function(objects){
		
		var objectArray = [];
		
		for(var i = 0; i<objects.length; i++){
			var oldRoom = objects[i].getAttribute("oldRoomID");
			if(that.id == oldRoom){
		
				var id = objects[i].getAttribute('id');
				var type = objects[i].getAttribute('type');
				var name = objects[i].getAttribute('name');
			
				var node = {
					data : {
						title : name,
						icon : '/objectIcons/'+type
					},
					metadata : {
						id : id,
						name : name,
						type : type,
						inRoom : oldRoom
					}
				}
				objectArray.push(node);
			}
		}
		cb(objectArray);
	});
}

theObject.getDeletedObjects.public = true;

theObject.getRecentChanges = function(data, cb){

	var history = Modules.ObjectManager.history.getHistoryEntries();
	
	var arr = [];
	
	for(var i in history){
		var entry = history[i].changeSet[0];
		if(entry.roomID == data.roomID){
			entry.user = history[i].userId;
	
			var date = new Date(parseInt(i));
			var day = date.getDate();
			var year = date.getFullYear();
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var month = date.getMonth()+1;
			
			if(minutes < 10){
				minutes = '0'+minutes;
			}
			
			entry.date = day+'.'+month+'.'+year+', '+hours+':'+minutes;

			arr.push(entry);
		}
	}
	
	cb(arr);
	
}

/**
 * repositionObjects
 *
 * moves all active objects to their position according to the background structure
 *
 */
theObject.repositionObjects = function(object) {
	var that = this;
	this.getInventoryAsync(function(inventory){
		
		   //first determine, which objects are structuring objects and which ones are application (or active) objects
	
		    var structures = [];
		    var activeObjects = [];
		
	        for (var i in inventory) {
	            if (inventory[i].isStructuring && inventory[i].isStructuring()) {
	                structures.push(inventory[i]);
	            } else if (inventory[i].isActive && inventory[i].isActive()) {
	                activeObjects.push(inventory[i]);
	            }
	        }
	        
	        //if an object has been passed to this function, only care about it and leave
	        //the others alone.
	        
	        if (object) {
	        	activeObjects = [];
	        	activeObjects.push(object);
	        }
            //now we try to place every active object
            		
		    for (var index in activeObjects) {
		    	
		    	var ao = activeObjects[index];
		    	var aoWidth = ao.getAttribute("width");
		        var aoHeight = ao.getAttribute("height");
		        var aoX = ao.getAttribute("x");
		        var aoY = ao.getAttribute("y");
		    	
		        //determine, which structuring objects have the current active object and
		        //which don't. We have to care about both!
		        
		        var structuresHavingObject = [];
		        var structuresNotHavingObject = [];
		        
		        for (var i in structures) {
		        	
		        	if (structures[i].isInContext(ao)){  // Check if the structure even cares about the context
		        										 // the application object is in. If this is not the case
		        										 // if has to be distracted by it either way.
		        	
			        	var howToHandle=structures[i].howToHandle(ao);
			        	
			        	switch (howToHandle){
			        		case 'attract': structuresHavingObject.push(structures[i]); break;
			        		case 'distract': structuresNotHavingObject.push(structures[i]); break;
			        	}
		        	} else {
		        		structuresNotHavingObject.push(structures[i]);
		        	}
		        	
		        }
				
		        // now building paths
		        // the activeObject will later be placed within these paths
		        // if there is no structure to be found which can position the activeObject
		        // the whole room or at least 1024x768 pixels are used 
				//TODO: Maybe use the current "active area" of the room, instead of 1024x768 to prevent weird behavior
		        var solution;
		        if (structuresHavingObject.length === 0) {
		            var xStructMax = 0;
		            var yStructMax = 0;
		            for (var s in structures) {
		                var xTemp = structures[s].getAttribute("x") + structures[s].getAttribute("width");
		                var yTemp = structures[s].getAttribute("y") + structures[s].getAttribute("height");
		
		                if (xStructMax < xTemp) {xStructMax = xTemp;}
		                if (yStructMax < yTemp) {yStructMax = yTemp;}
		            }
		
		            var x1 = 0;
		            var x2 = xStructMax < 1024 ? 1024 : xStructMax;
		            var y1 = 0;
		            var y2 = yStructMax < 768 ? 768 : yStructMax;
		
		            solution = [[{X: x1, Y: y1}, {X: x2, Y: y1}, {X: x2, Y: y2}, {X: x1, Y: y2}]]
		        } else {
		        	
		        	if (!structuresHavingObject[0].getPlacementArea){
		        		
		        		console.log("ERROR: "+structuresHavingObject[0]+" has no getPlacementArea function");
		        		
		        	}
		            solution = structuresHavingObject[0].getPlacementArea(ao);
		            
		            
		            for (var i = 1; i < structuresHavingObject.length; i++) {
			            var tempPositions = structuresHavingObject[i].getPlacementArea(ao);
			            var cpr = new Modules.Clipper.Clipper();
			            cpr.AddPaths(solution, Modules.Clipper.PolyType.ptSubject, true);
			            cpr.AddPaths(tempPositions, Modules.Clipper.PolyType.ptClip, true);
			            //ctIntersection: 0, ctUnion: 1, ctDifference: 2, ctXor: 3//
			            var solution_paths = new Modules.Clipper.Paths();
			            var succeeded = cpr.Execute(0, solution_paths, 0, 0);
			            solution = solution_paths;
			
			        }
		
		        }
		
		
		        // now those structures that can not position the object are taken into account
		        // they must be subtracted from the are which would be a valid position for the object.
		        
		        for (var i = 0; i < structuresNotHavingObject.length; i++) {
		        	
		            var tempPositions = structuresNotHavingObject[i].getDisplacementArea(ao);
		            var cpr = new Modules.Clipper.Clipper();
		
		            cpr.AddPaths(solution, Modules.Clipper.PolyType.ptSubject, true);
		            cpr.AddPaths(tempPositions, Modules.Clipper.PolyType.ptClip, true);
		
		            //ctIntersection: 0, ctUnion: 1, ctDifference: 2, ctXor: 3//
		            var solution_paths = new Modules.Clipper.Paths();
		
		            var succeeded = cpr.Execute(Modules.Clipper.ClipType.ctDifference, solution_paths, 0, 0);
		            solution = solution_paths;
		
		        }
		
		        // now we try to position the activeObject
		        
		        if (solution.length === 0) {
		        	
		        	// if the solution set is empty, we have a conflicting structure. In this case, no positioning is possible
		        	// TODO: conflict handling
		        	
		            ao.setAttribute("linecolor", "rgb(204,0,0)");
		            ao.setAttribute("linesize", "5");
		            console.log('Conflicting structure!');
		            
		        } else {
		            ao.setAttribute("linecolor", "transparent");
		            var minX = Number.MAX_VALUE;
		            var maxX = 0;
		            var minY = Number.MAX_VALUE;
		            var maxY = 0;
		
		            // let's look if the current position is okay. In this case, nothing has to be done.
					
		            var currentPositionInPolygon = true;
		            var currentPosition = new Modules.Clipper.IntPoint(aoX, aoY);
		            for (var i in solution) {
		            	//CAREFUL: i is a string! type conversion necessary, therefore == instead of ===
		                var inpoly = Modules.Clipper.Clipper.PointInPolygon(currentPosition, solution[i]);
		                if ((i == 0 && inpoly === 0) || (i > 0 && inpoly !== 0)) {
		                    currentPositionInPolygon = false;
		                    break;
		                }
		            }
		            
		            // if the current position is not okay, find a new one and set it there.
		            //TODO: Sometimes this causes weird behaviour and the object "jumps around"
		            //in the room while it is in correct position

		            if (!currentPositionInPolygon) {
		                for (var j in solution[0]) {
		                    if (solution[0][j].X < minX) {
		                        minX = solution[0][j].X;
		                    }
		                    if (solution[0][j].X > maxX) {
		                        maxX = solution[0][j].X;
		                    }
		                    if (solution[0][j].Y < minY) {
		                        minY = solution[0][j].Y;
		                    }
		                    if (solution[0][j].Y > maxY) {
		                        maxY = solution[0][j].Y;
		                    }
		                }
		
		                if ((maxX - minX) > aoWidth) {
		                    maxX -= aoWidth;
		                }
		                if ((maxY - minY) > aoHeight) {
		                    maxY -= aoHeight;
		                }
		
		                var inPolyFlag = false;
		                var counter = 0;
		                var randomX;
		                var randomY;
		                
		                // TODO: to something better than random here. maxXY and minXY are already 
		                // within the bounds of either the room (atm 1024x768) or the structure. 
						// console.log(that.getViewBoundingBoxHeight());
						// console.log(that.getViewBoundingBoxWidth());

						/**
						 * Idea for a solution:
						 * Instead of looking for a random position that is okay, check whether the 
						 * top/bottom or left/right side of the object is extending over the edge of
						 * the structure or viewport. Then move it along the X- or Y-axis depending on
						 * the cases. 
						 *
						 * 


								                        +---------+
								                        |    |    |
								                        |    v    |
								               +--------+         +-------+
								               |        +---------+       |
								               |                          |
								       +----------+                    +----------+
								       |          |                    |          |
								       | +----->  |                    |  <----+  |
								       |          |                    |          |
								       |          |                    |          |
								       +----------+                    +----------+
								               |                          |
								               |        +---------+       |
								               +--------+         +-------+
								                        |    ^    |
								                        |    |    |
								                        |    |    |
								                        +---------+
		                */
		                while (!inPolyFlag && counter < 1000) {
		                    var randomX = Math.floor(minX + (Math.random() * (maxX - minX)));
		                    var randomY = Math.floor(minY + (Math.random() * (maxY - minY)));
		                    var pt = new Modules.Clipper.IntPoint(randomX, randomY);
		                    var inPolyFlagHelper = true;
		                    for (var i in solution) {
		                    //CAREFUL: i is a string! type conversion necessary, therefore == instead of ===
		                        var inpoly = Modules.Clipper.Clipper.PointInPolygon(pt, solution[i]);
		                        if ((i == 0 && inpoly === 0) || (i > 0 && inpoly !== 0)) {
		                            inPolyFlagHelper = false;
		                            break;
		                        }
		                    }
		                    counter++;
		                    inPolyFlag = inPolyFlagHelper;
		                }
		                ao.setAttribute("x", randomX, false, true);
		                ao.setAttribute("y", randomY, false, true);
		                ao.setAttribute("linecolor", "transparent");
		            	ao.setAttribute("linesize", "0");
		            }
		        }
		    }
		
		
		
	});


}

theObject.modeChanged = function(value){
	
	var self=this;
	
    if ((value)=='foreground'){
    	
    	this.updateContexts(function(contexts){
    		
    		//go through all applicationObjects and see if their contexts is still valid.
    		//set it to neutral if it is not valid any more
    		
    		self.getActiveObjects(function(activeObjects){
    			
    			for (var i in activeObjects){
    				var object=activeObjects[i];
    				
    				var context=object.getAttribute('context');
    				
    				if (context=='neutral') continue;
    				
    				var contextOK=false;
    				
    				for (var j in contexts){
    					if (context==contexts[j].toString()){
    						contextOK=true;
    						break;
    					}
    				}
    				
    				if (!contextOK){
    					
    					object.setAttribute('context','neutral');
    					
    				}
    				
    			}
    			
    		});
    		
    		self.repositionObjects();
    	});
    	
    }
}

/*
*  updateContexts
*
*  looks at the structuring objects in the current room and automatically
*  determines a rooms evaluation contexts. Those are saved to the context
*  attribute of the room. The result is also given back to a callback function
*  which should care about updating the context attributes of the active
*  objects and/or trigger a repositioning.
*/
theObject.updateContexts = function(callback){
	
	var self=this;
	
	//this method automatically determines a rooms contexts 
	
		
	//first get structuring attributes from all structuring objects
	
	this.getStructuringObjects(function(structuringObjects){
		
		var attributes={};
		var attributeOverlaps={};
		
		//attributes later contains all attributes whicht are used for structuring
		//attributeOverlaps later contains attributes of overlapping
		//structuring objects as well as of objects which by themselves structure according
		//to more than one attribute.
		
		for (var i in structuringObjects){
			var structuring=structuringObjects[i];
			
			//getting all structuring attributes for every structuring object
			var attrs=structuring.getStructuringAttributes();
			
			for (var j=0;j<attrs.length;j++){
				attributes[attrs[j]]=true; //filling the attributes array
				
				//care about objects with more than one structuring attribute
				
				for (var k=j+1;k<attrs.length;k++){
					if (!attributeOverlaps[attrs[j]]) attributeOverlaps[attrs[j]]=[];	
					attributeOverlaps[attrs[j]].push(attrs[k]);
				}
				
			}		
				
		}	
		
		//the getOverlapping function determines all overlapping structuring objects for a given
		//object. is used in async.map down below.
		var getOverlapping=function(item, callback){
			
			item.getOverlappingObjectsAsync(function(overlapping){
				
				var overlappingStructures=[];
				
				for (var m in overlapping){
					if (overlapping[m].isStructuring()){
						overlappingStructures.push(overlapping[m]);
					}
				}
				
				callback(null,overlappingStructures);
			});
		}
		
		//processOverlappingStructures gets a set of overlapping structures, joins their attribute
		//sets and at the ent calls the callback function
		var processOverlappingStructures=function(err, results){
		    
		    //result is an array of those object which overlap those structures in structuringObjects
		    //the two arrays have the same indices (result of a mapping function down below)
		    
		    for (var k in structuringObjects){
		    	var structuringObject=structuringObjects[k];
		    	var overlappings=results[k];
		        
		        for (var l in overlappings){
		        	
		        	var overlapping=overlappings[l];
		        	
		        	//determine the structuring attributes for each pair of overlapping structures
			    	
			    	var structuringAttrs=structuringObject.getStructuringAttributes();
			    	var overlappingAttrs=overlapping.getStructuringAttributes();
			    	
			    	//fill the attributeOverlaps array with the respective attribtue pairs
			    	
			    	for (var o in structuringAttrs){
			    		for (var p in overlappingAttrs){
			    			if (!attributeOverlaps[structuringAttrs[o]]) attributeOverlaps[structuringAttrs[o]]=[];	
			    			attributeOverlaps[structuringAttrs[o]].push(overlappingAttrs[p]);
			    		}
			    	}
		    	
		        }
			
		    }
		    
		    //attributeOverlaps now contains the necessary information for clustering attributes which together form a context
		    
		    
		    var clusters=[];
		    
		    //the clustering starts by making every structuring attribute its own cluster.
		    
		    for (var element in attributes){
		    	var cluster=[];
		    	cluster.push(element);
		    	clusters.push(cluster);
		    }
		    
		    //joinClustersContaining joins those clusters containing attributes a1 and a2
		    //this is done for all pairs derived from attributeOverlaps (below this function)
		    var joinClustersContaining=function(a1,a2){
		    	
				var outClusters=[];
				var a1Cluster=false;
				var a2Cluster=false;
				
				//try to find a1 and a2 in the current clusters
				for (var i in clusters){
					var cluster=clusters[i];
					var a1Found=false;
					var a2Found=false;
					
					//if either a1 or a2 have been found, save them into variables for later joining
					for(var j in cluster){
						if (cluster[j]==a1) {a1Found=true; a1Cluster=cluster;}
						if (cluster[j]==a2) {a2Found=true; a2Cluster=cluster;} 
					}
					
					//if neither a1 nor a2 is in the current cluster, it remains unchanged
					//(meaning it is pushed to the output array as it is).
					if (!a1Found && !a2Found) outClusters.push(cluster);					
				}
				
				//at this point a1Cluster and a2Cluster are the clusters containing a1 and a2.
				//now they are joined and the resulting new cluster is added to the clusters result
				
				var newClusterTemp={};
				var newCluster=[];
				
				for (var i in a1Cluster){var att=a1Cluster[i];newClusterTemp[att]=true;}
				for (var i in a2Cluster){var att=a2Cluster[i];newClusterTemp[att]=true;}
				
				for (var att in newClusterTemp){newCluster.push(att);}
				
				outClusters.push(newCluster);
				
				clusters=outClusters;
		    	
		    }
		    
		    //join every attribute combination in attributeOverlays
		    for (var a1 in attributeOverlaps){
		    	for (var x in attributeOverlaps[a1]){
		    		var a2=attributeOverlaps[a1][x];
		    		
		    		joinClustersContaining(a1,a2);
		    		
		    	}
		    }
		    
		    //save the new clusters to the contexts attribute on the room object
		    self.setAttribute('contexts',clusters);
		    
		    //save on every structuringObject, which context it is part of
		    for (var i in structuringObjects){
		
				var structuring=structuringObjects[i];
				
				//we need one of the structuring attributes
				var attribute=structuring.getStructuringAttributes()[0];
				
				for (var j in clusters){
					var context=clusters[j];
					var found=false;
					
					for (var k in context){
						if (context[k]==attribute){
							found=true;
							break;
						}
					}
					
					if (found){
						//console.log(structuring+' is in '+context);
						structuring.setAttribute('context',context);
						break;
					}
					
				}
		    }
		    
		    //call the callback
		    if (callback) callback(clusters);
		    
		}
		
		//async magic.
		//
		//this means: take all the structuringObjects, get the overlapping structuring objects for each of them and
		//then process the resulting overlapping structures.
		async.map(structuringObjects, getOverlapping, processOverlappingStructures);
		
	});
	
}
	
theObject.getRecentChanges.public = true;	


theObject.clearTrash=function(callback){
    var currentRoom = this.context.room.id;
    var that = this;
    Modules.ObjectManager.getObjects("trash",this.context,function(inventory){
        var objectArray = new Array();
		for(var i = 0; i<inventory.length; i++){
			var oldRoom = inventory[i].getAttribute("oldRoomID");
            if(currentRoom == oldRoom){
                var objectID = inventory[i].id;
                var removeObject = Modules.ObjectManager.getObject("trash", objectID, that.context);
                Modules.ObjectManager.remove(removeObject);
            }
		}
        callback();
    });
}
theObject.clearTrash.public = true;
	
module.exports=theObject;