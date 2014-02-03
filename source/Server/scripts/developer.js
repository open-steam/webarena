/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');
var fs=require('fs');

var enter=String.fromCharCode(10);

var temp=[];
var tempLog=[];

var thisScript={}

thisScript.export='';

thisScript.run=function(url){
	
	if (!Modules.Config.debugMode){
		this.export='';
		return;
	}
	
	this.url=url;
	
	var result='<h1>Things to do</h1><table>';
	
	temp=[];
	
	traverse('./');
	var oldfilename='';
	
	for (var i=0;i<temp.length;i++){
		var entry=temp[i];
		
		var show=(entry.filename==oldfilename)?'':entry.filename;
		
		result+='<tr><td>'+show+'</td><td>'+entry.lineNr+'</td><td>'+entry.line+'</td><td>'+entry.context+'</td></tr>';
		
		oldfilename=entry.filename;
	}
	
	result+='</table>';
	
    result+='<h1>Console outputs</h1><table>';
	
	temp=[];
	
	traverseLog('./');
	var oldfilename='';
	
	for (var i=0;i<tempLog.length;i++){
		var entry=tempLog[i];
		
		var show=(entry.filename==oldfilename)?'':entry.filename;
		
		result+='<tr><td>'+show+'</td><td>'+entry.lineNr+'</td><td>'+entry.line+'</td><td>'+entry.context+'</td></tr>';
		
		oldfilename=entry.filename;
	}
	
	result+='</table>';
	
	this.export=result;
	
}

module.exports=thisScript;

function traverse(folder){
	try{
		files=fs.readdirSync(folder);
		
		files.forEach(function(filename){
			
			if (filename.search('svn')!=-1) return;
			if (filename.search('libraries')!=-1) return;
			
			filename=folder+filename;
			
			if (filename.search('.js')!=-1) {
				
				var contents = fs.readFileSync(filename, 'utf8');
				
				contents=contents.split(enter);
				var context='';
				
				for(var i=0; i<contents.length;i++){
					
					var line=contents[i];
					var lineNr=i+1;
					
					if (line.search('=function')!=-1) {
						context=line;
					};
					
					
					if (line.search('TODO')==-1) continue;
					
					temp.push({'filename':filename,'lineNr':lineNr,'line':line,'context':context});
					
				}
				
			}
			
			traverse(filename+'/');
		});
	} catch (e) {}
}

function traverseLog(folder){
	try{
		files=fs.readdirSync(folder);
		
		files.forEach(function(filename){
			
			if (filename.search('svn')!=-1) return;
			if (filename.search('libraries')!=-1) return;
			
			filename=folder+filename;
			
			if (filename.search('.js')!=-1) {
				
				var contents = fs.readFileSync(filename, 'utf8');
				
				contents=contents.split(enter);
				var context='';
				
				for(var i=0; i<contents.length;i++){
					
					var line=contents[i];
					var lineNr=i+1;
					
					if (line.search('=function')!=-1) {
						context=line;
					};
					
					
					if (line.search('console.log')==-1) continue;
					
					tempLog.push({'filename':filename,'lineNr':lineNr,'line':line,'context':context});
					
				}
				
			}
			
			traverseLog(filename+'/');
		});
	} catch (e) {}
}