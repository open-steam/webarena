/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

"use strict";

var PyramidDiscussion=Object.create(require('./Application.js'));
var async=require('async');
var objectList={};
var Modules={};

PyramidDiscussion.init=function(name,theModules){
	this.name=name;
	Modules=theModules;
}

PyramidDiscussion.startPyramid=function(object,selection){
	console.log('startPyramid '+object+' ',selection);
	
	object.setAttribute('x',10);
	object.setAttribute('y',150);
	
	this.initRoom=object.getRoom();
	
	var self=this;
	
	//create the teacher room
	
	this.initRoom.createObject('Subroom',function(error,subroomObject){
		
		
		subroomObject.getDestinationRoom(function(teacherRoom){
			
			subroomObject.setAttribute('name','Pyramiden-Lehrersicht');
			subroomObject.setAttribute('x',10);
			subroomObject.setAttribute('y',10);
			self.teacherRoom=teacherRoom;
			
			
			self.participantRooms={};
			var subroomObjects=[];
			
			//create participant rooms
			async.each(selection, function(entry,callback){
				
				if (entry.selected){
					
					self.initRoom.createObject('Subroom',function(error,subroomObject){
				
				
						subroomObject.getDestinationRoom(function(participantRoom){
							
							subroomObject.setAttribute('name',entry.value);
							self.participantRooms[entry.value]=participantRoom;
							subroomObjects.push(subroomObject);
							callback(null);
							
						});
						
					});
					
					
				} else {
					callback(null);
				}
				
			}, function(err){
			    // if any of the saves produced an error, err would equal that error
			    
			    for (var i in subroomObjects){
			    	var subroomObject=subroomObjects[i];
			    	i=i*1.0;
			    	subroomObject.setAttribute('x',((1+i)*100)+10);
					subroomObject.setAttribute('y',10);
			    }
			    
				Modules.ApplicationManager.sendUserToRoom(object.context.originalUser,self.teacherRoom);
				
				
				
				//create first level elements
				
				var stones={};
				stones[1]=[];
				var level=1;
				
				async.each(selection, function(entry,callback){
					
					
					if (true||entry.selected){
					
    					var index=(selection.indexOf(entry));
						
						//TODO here: Send others in their rooms
						
						self.teacherRoom.createObject('Rectangle',function(error,stone){
							stone.setAttribute('width',300);
							stone.setAttribute('height',150);
							stone.setAttribute('x',10);
							stone.setAttribute('y',10+(index*1.0)*165);
							stone.setAttribute('users',entry.value);
							
							stones[1].push(stone);
							
							callback(null);
						});
						
					}
					
					
				}, function (err){
					
					//whilst(test, fn, callback)
					
					var test=function(){return stones[level].length>1;}
					
					var nextLevel=function(callback){
						var parentLevel=level;
						level++;
						stones[level]=[];
						
						var amount=stones[parentLevel].length/2;
						console.log('Level '+level+' amount '+amount);
						
						var counter=0;
						async.whilst(function(){return counter<amount},
						function (callback){

							if (counter*level+3==stones[parentLevel].length){
								
								self.teacherRoom.createObject('Rectangle',function(error,stone){
									console.log(counter*level,counter*level+1,counter*level+2);
									
									var top=stones[parentLevel][counter*level].getAttribute('y');
									var bottom=stones[parentLevel][counter*level+2].getAttribute('y')+stones[parentLevel][counter*level+2].getAttribute('height');
									
									console.log('top '+top+' bottom '+bottom);
									
									counter+=2;
									
									stone.setAttribute('width',300);
									stone.setAttribute('height',bottom-top);
									stone.setAttribute('x',(level-1)*310.0+10);
									stone.setAttribute('y',top);
									stone.setAttribute('users',stones[parentLevel][counter*level].getAttribute('users')
														  +'_'+stones[parentLevel][counter*level+1].getAttribute('users')
														  +'_'+stones[parentLevel][counter*level+2].getAttribute('users'));
									
									stones[level].push(stone);
									
									return callback(null);
								});								
								
							} else {
								self.teacherRoom.createObject('Rectangle',function(error,stone){
									console.log(counter*level,counter*level+1);
									
									var top=stones[parentLevel][counter*level].getAttribute('y');
									var bottom=stones[parentLevel][counter*level+1].getAttribute('y')+stones[parentLevel][counter*level+1].getAttribute('height');
									
									console.log('top '+top+' bottom '+bottom);
									
									counter+=1;
									
									stone.setAttribute('width',300);
									stone.setAttribute('height',bottom-top);
									stone.setAttribute('x',(level-1)*310.0+10);
									stone.setAttribute('y',top);
									stone.setAttribute('users',stones[parentLevel][counter*level].getAttribute('users')
														  +'_'+stones[parentLevel][counter*level+1].getAttribute('users'));
									
									stones[level].push(stone);
									
									return callback(null);
								});
							}
							
							
						}, function(err){
							
							callback(null);
							
						})
						
						
						
					}
					
					async.whilst(test,nextLevel,function(err){
						//hier müsste die pyramide fertig sein.
					});
					
				});
				
				
			    
			});			
			
			
			
		});
		
	});
	
	
	//remove all pyramid-objects in this room
	//create new pyramid objects here
	//send every participant into his own room
	//copy every first level text to the participants rooms
}


PyramidDiscussion.onPyramidStoneReadyChanged=function(object,value){
	//save the changed state
	//if "both" children are ready, copy the next level to the participants rooms
}

module.exports=PyramidDiscussion;