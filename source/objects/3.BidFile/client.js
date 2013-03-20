BidFile.filterObject = function(obj) {
	
	var allowedMimeTypes = [
		"image/jpeg",
		"image/png",
		"image/jpg",
	];
	
	var mimeType = obj.attributes.DOC_MIME_TYPE;
	
	if (allowedMimeTypes.indexOf(mimeType) > -1) {
		return true;
	}
	
	return false;
	
}

BidFile.selectFile = function(id, name) {

	var self = this;
	
	var data = {
		"roomID" : self.get('inRoom'),
		"objectID" : self.id,
		"bidObjectId" : id
	};
	
	Modules.Dispatcher.query('bidFile-setFile',data,function(res){
		self.dialog.dialog("close");
		self.setAttribute("name", name);
	});
	
}

BidFile.dialog = undefined;

BidFile.upload = function() {
	
	var self = this;
	
	
	var browse = function(location, title) {
		
		var pos = -1;
		for (var i in history) {
			if (history[i][0] == location) {
				pos = i;
			}
		}
		
		if (pos > -1) {
			/* element of history */
			history = history.slice(0, pos);
			
			browse(location);
			
		} else {
			if (location == undefined || location == "/") {
				history.push(["/","Home"]);
				location = undefined;
			} else {
				history.push([location, title]);
			}
		}
		
		content.find("tr").not(".bidFile-do_not_remove").remove(); //remove all rows
		
		var loc = "";
		for (var i in history) {
			var id = history[i][0];
			var title = history[i][1];
			if (i == history.length-1) {
				id = "current";
			}
			loc += ' / <span id="bidFile-history-'+id+'">'+title+'</span>';
		}
		
		content.find(".bidFile-location").html(loc);
		
		content.find(".bidFile-location").find("span").bind("click", function() {
			var linkId = $(this).attr("id");
			linkId = linkId.replace("bidFile-history-", "");
			if (linkId == "current") return;
			browse(linkId,$(this).html());
		});
		
		content.find(".bidFile-location").find("span").css("cursor", "pointer");

		var data = {
			"roomID" : self.get('inRoom'),
			"objectID" : self.id,
			"browseLocation" : location
		};
		
		Modules.Dispatcher.query('bidFile-browse',data,function(res){
			
			for (var i in res) {
				var obj = res[i];
				
				var id = obj.id;
				var name = obj.attributes.OBJ_NAME;
				var lastChanged = obj.attributes.OBJ_LAST_CHANGED;
				var type = obj.attributes.OBJ_TYPE;
				var mimeType = obj.attributes.DOC_MIME_TYPE;

				var date = new Date(lastChanged*1000);
				var min = date.getMinutes();
				if (min < 10) {
					min = 0+""+min;
				}
				lastChanged = date.getDate()+"."+(date.getMonth()+1)+"."+date.getFullYear()+", "+date.getHours()+":"+date.getMinutes()+" Uhr";


				var cls = "";
				var link = "none";
				var trClass = "bidFile-inactive"
				var openLink = '';

				if (type == undefined && obj.types.indexOf("OBJECT") > -1 && obj.types.indexOf("CONTAINER") > -1 && obj.types.indexOf("ROOM") > -1) {
					/* folder */
					cls = "bidFile-name";
					link = "folder-"+id;
					trClass = "";
					openLink = "";
				} else if (self.filterObject(obj)) {
					cls = "bidFile-name";
					link = "file-"+id;
					trClass = "";
					openLink = '<a href="'+Config.bidURL+'/explorer/Index/'+id+'/" target="_blank">'+self.translate(GUI.currentLanguage, "Show in bid")+'</a>';
				}

				content.find("tbody").append('<tr valign="middle" class="'+trClass+'"><td><img src="'+Config.bidURL+'/Rest/Misc/getMimeTypeImage/'+id+'" alt="" /></td><td class="'+cls+'" id="bidFile-'+link+'">'+name+'</td><td>'+lastChanged+'</td><td>'+openLink+'</td></tr>');
				
			}
			
			content.find(".bidFile-name").css("color", "#396d9c");
			content.find(".bidFile-name").css("cursor", "pointer");
			
			content.find(".bidFile-inactive").css("opacity", 0.5);
			
			content.find(".bidFile-name").bind("click", function() {
				
				var linkId = $(this).attr("id");
				
				if (linkId.indexOf('-folder-') > -1) {
					/* folder */
					
					linkId = linkId.replace("bidFile-folder-", "");
					browse(linkId, $(this).html());
					
				} else {
					/* file */
					
					linkId = linkId.replace("bidFile-file-", "");

					self.selectFile(linkId, $(this).html());
					
				}

				
			});
			
	    });
		
	}
	
	var content = $('<div><div class="bidFile-location-box">'+self.translate(GUI.currentLanguage, "Location")+': <span class="bidFile-location"></span></div><table border="0"><tbody><tr class="bidFile-do_not_remove"><th></th><th>'+self.translate(GUI.currentLanguage, "Name")+'</th><th>'+self.translate(GUI.currentLanguage, "Last change")+'</th><th></th></tr></tbody></table></div>');
	
	content.find("table").css("text-align", "left");
	content.find("table").css("width", "100%");
	content.find("table, div").css("font-size", "11px");
	content.find(".bidFile-location-box").css("margin-bottom", "5px");
	
	var buttons = {};
	buttons[self.translate(GUI.currentLanguage, "Close")] = function() {
		$(this).dialog("close");
	}
	
	self.dialog = GUI.dialog(self.translate(GUI.currentLanguage, "Select file"), content.get(0), buttons, 500);
	
	var history = [];
	browse();
	
}