var jPopoverWidget = function(type, el, valueBox, popover, title) {
	
	/* number widget */
	this.number = function() {
		var self = this;
		
		this.setMultipleValues = function(multipleValues) {
			if (multipleValues) {
				self.setValue('');
				widget.valueBox.children("input").attr("placeholder", GUI.translate('multiple values'));
			}
		}
		
		this.getValue = function() {
			return widget.valueBox.children("input").attr("value");
		}
		
		this.setValue = function(value) {
			widget.valueBox.children("input").attr("value", value);
		}
		
		this.setMin = function(min) {
			widget.valueBox.children("input").attr("min", min);
		}
		
		this.setMax = function(max) {
			widget.valueBox.children("input").attr("max", max);
		}
		
		widget.valueBox.html('<input type="number" />');
		
		widget.valueBox.children("input").bind("change", function() {
			if ($(this).val() == "") return;
			self.callChange();
		});
		
		widget.valueBox.children("input").bind("mouseup", function() {
			if ($(this).val() == "") return;
			self.callChange();
		});
		
	}
	
	
	
	/* text widget */
	this.text = function() {
		var self = this;
		
		this.setMultipleValues = function(multipleValues) {
			if (multipleValues) {
				self.setValue('');
				widget.valueBox.children("input").attr("placeholder", GUI.translate('multiple values'));
			}
		}
		
		this.getValue = function() {
			return widget.valueBox.children("input").attr("value");
		}
		
		this.setValue = function(value) {
			widget.valueBox.children("input").attr("value", value);
		}
		
		widget.valueBox.html('<input type="text" />');
		
		widget.valueBox.children("input").bind("change", function() {
			if ($(this).val() == "") return;
			self.callChange();
		});
		
	}
	
	
	/* boolean widget */
	this.boolean = function() {
		var self = this;
		self.multipleValues = false;
		
		this.setMultipleValues = function(multipleValues) {
			
			self.multipleValues = multipleValues;
			
			if (self.multipleValues) {
			
				widget.valueBox.children("input").unbind("change");
				widget.valueBox.html("");

				widget.valueBox.html('<select size="1"><option value="0">'+GUI.translate('multiple values')+'</option><option value="1">'+GUI.translate('all')+'</option><option value="2">'+GUI.translate('none')+'</option></select>');
				widget.valueBox.children("select").bind("change", function() {
					self.callChange();
				});
			
			}
			
		}
		
		this.getValue = function() {
			
			if (!self.multipleValues) {
				return (widget.valueBox.children("input").attr("checked") == "checked");
			} else {
				var val = widget.valueBox.find("option:selected").attr("value");
				if (val == 1) {
					return true;
				}
				if (val == 2) {
					return false;
				}
			}
			
		}
		
		this.setValue = function(value) {

			if (self.multipleValues) return;

			if (value) {
				widget.valueBox.children("input").attr("checked", true);
			} else {
				widget.valueBox.children("input").attr("checked", false);
			}
			
		}
		
		
		widget.valueBox.html('<input type="checkbox" value="1" />');
		widget.valueBox.children("input").bind("change", function() {
			self.callChange();
		});
		
		
	}
	
	
	
	/* point widget */
	this.point = function() {
		var self = this;
		
		this.getValue = function() {
			return widget.valueBox.children("input[name=x]").val()+';'+widget.valueBox.children("input[name=y]").val();
		}
		
		this.setValue = function(value) {
			var parts = value.split(";");
			widget.valueBox.children("input[name=x]").val(parts[0]);
			widget.valueBox.children("input[name=y]").val(parts[1]);
		}
		
		widget.valueBox.html('X: <input type="number" class="jDesktopInspectorWidget_point_input" name="x" /> Y: <input type="number" class="jDesktopInspectorWidget_point_input" name="y" />');
		
		widget.valueBox.children("input").bind("change", function() {
			self.callChange();
		});
		
	}
	
	
	/* plaintext widget */
	this.plaintext = function() {
		var self = this;
		
		this.getValue = function() {
			return $(textarea).val();
		}
		
		this.setValue = function(value) {
			$(textarea).html(value);
		}
		
		var dialog = document.createElement("div");
		$(dialog).attr("title", GUI.translate("plaintext"));
		
		var textarea = document.createElement("textarea");
		$(textarea).css("width", "425px").css("height", "300px");
		
		$(dialog).append(textarea);
		
		var formButtons = {};
		formButtons[GUI.translate("save")] = function() {
			self.callChange();
			$(this).dialog("close");
		}
		
		widget.valueBox.html('<input type="submit" value="'+GUI.translate("change text")+'" />');
		
		widget.valueBox.children("input").bind("click", function() {
			
			$(dialog).dialog({
				modal: true,
				resizable: true,
				buttons: formButtons,
				width: 450
			});
			
		});
		
	}
	
	
	/* objectid widget */
	this.objectid = function() {
		var self = this;
		
		this.getValue = function() {
			
			var ret = false;
			
			$(dialog).find("tr").each(function() {
				if ($(this).find("input").attr("checked") == "checked") {
					ret = $(this).attr("id");
				}
			});
			
			if (ret) {
				return ret;
			}
			
			if ($(dialog).find("#selectId_input").attr("checked") == "checked") {
				return $(dialog).find("#selectId_objectid").val();
			}
			
			return "";
			
		}
		
		this.setValue = function(value) {

			var set = false;

			$(dialog).find("tr").each(function() {
				if ($(this).attr("id") == value) {
					$(this).find("input").attr("checked", true);
					set = true;
				}
			});
			
			if (set) return;
			
			if (value == "") {
				$(dialog).find("#selectId_none").attr("checked", true);
				return;
			}
			
			$(dialog).find("#selectId_input").attr("checked", true);
			$(dialog).find("#selectId_objectid").val(value);
			
		}
		
		this.setOwnObjectId = function(id) {
			self.ownObjectId = id;
		}
		
		var dialog = document.createElement("div");
		$(dialog).attr("title", GUI.translate("select object id"));
		
		var dialogHtml = '';
		
		dialogHtml += '<table class="jDesktopInspectorWidget_objectid_table" width="100%"><tr><th>'+GUI.translate("Name")+'</th><th>'+GUI.translate("Type")+'</th><th>'+GUI.translate("Object id")+'</th></tr>';
		
		$.each(ObjectManager.getObjects(), function(key, object) {
		
			dialogHtml += '<tr id="'+object.data.id+'"><td><input type="radio" name="selectId" value="'+object.data.id+'" /> '+object.data.name+'</td><td>'+object.translate(GUI.currentLanguage, object.data.type)+'</td><td>'+object.data.id+'</td></tr>';
			
		});
		
		dialogHtml += '</table>';
		
		dialogHtml += '<input type="radio" name="selectId" id="selectId_input" value="input" /> <label for="selectId_input">'+GUI.translate("following object id")+':</label> <input type="text" id="selectId_objectid" name="objectid" value="" /><br />';
		
		dialogHtml += '<input type="radio" name="selectId" id="selectId_none" value="" /> <label for="selectId_none">'+GUI.translate("no object id")+'</label>';
		
		$(dialog).append(dialogHtml);
		
		$(dialog).find("tr").bind("click", function(x) {
			$(this).find("input").attr("checked", "checked");
		});
		
		$(dialog).find("input[name=objectid]").bind("focus", function() {
			$(dialog).find("input[value=input]").attr("checked", "checked");
		});
		
		
		var formButtons = {};
		formButtons[GUI.translate("save")] = function() {
			self.callChange();
			$(this).dialog("close");
		}
		
		widget.valueBox.html('<input type="submit" value="'+GUI.translate("select object id")+'" />');
		
		widget.valueBox.children("input").bind("click", function() {
			
			$(dialog).dialog({
				modal: true,
				resizable: true,
				buttons: formButtons,
				width: 450,
				height: 400
			});
			
		});
			
	}
	
	
	
	/* selection widget */
	this.selection = function() {
		var self = this;
		
		this.getValue = function() {
			
			return widget.valueBox.find("option:selected").attr("value");
			
		}
		
		this.setValue = function(value) {

			widget.valueBox.find("option[value="+value+"]").attr("selected", "selected");
			
		}
		
		this.setOptions = function(options) {
			
			var newHtml = '<select size="1">';
			
			$.each(options, function(key, value) {
			
				newHtml += '<option value="'+value+'">'+value+'</option>';
				
			});
			
			newHtml += '</select>';
			
			widget.valueBox.html(newHtml);
			
			widget.valueBox.children("select").bind("change", function() {
				self.callChange();
			});
			
		}
		
	}
	
	
	/* fontsize widget */
	this.fontsize = function() {
		var self = this;
		
		var min = 1;
		
		this.getValue = function() {
			var val = $(sizeInfo).html();
			return parseInt(val);
		}
		
		this.setValue = function(value) {
			if (value < min) return;
			$(sizeInfo).html(value);
		}
		
		this.setMin = function(m) {
			min = m;
		}
		
		var upArrow = document.createElement("div");
		$(upArrow).addClass("jPopoverWidget_fontsize_button").addClass("jPopoverWidget_fontsize_up");
		$(upArrow).html('<div></div>');

		upArrow.addEventListener("touchstart", function() {
			
			$(upArrow).click();
			event.preventDefault();
			
		}, false);
		
		$(upArrow).bind("click", function(event) {
			
			var newValue = Math.ceil(self.getValue()*1.2);

			self.setValue(newValue);
			self.callChange();
			
		});
		
		var downArrow = document.createElement("div");
		$(downArrow).addClass("jPopoverWidget_fontsize_button").addClass("jPopoverWidget_fontsize_down");
		$(downArrow).html('<div></div>');

		downArrow.addEventListener("touchstart", function(event) {

			$(downArrow).click();
			event.preventDefault();
			
		}, false);
		
		$(downArrow).bind("click", function(event) {
		
			var newValue = Math.floor(self.getValue()/1.2);

			self.setValue(newValue);
			self.callChange();
			
		});
		
		var sizeInfo = document.createElement("div");
		$(sizeInfo).addClass("jPopoverWidget_fontsize_preview");
		$(sizeInfo).html("1");
		
		widget.valueBox.append(sizeInfo);
		widget.valueBox.append(upArrow);
		widget.valueBox.append(downArrow);
		
		widget.valueBox.children("input").bind("change", function() {
			self.callChange();
		});
		
	}
	
	
	
	/* color picker widget */
	this.color = function() {
		var self = this;
		
		this.setMultipleValues = function(multipleValues) {
			if (multipleValues) {
				self.setColor("hsl(0,0%,100%)");
			}
		}
		
		this.getValue = function() {
			return widget.valueBox.children("div").css("background-color");
		}

		this.setColor = function(color) {

			if (color == "transparent" || color == "rgba(0, 0, 0, 0)") {
				widget.valueBox.children("div").css("background-image", "url(../../guis.common/images/transparent.jpg)");
				widget.valueBox.children("div").css("background-color", "transparent");
			} else {
				widget.valueBox.children("div").css("background-image", "");
				widget.valueBox.children("div").css("background-color", color);
			}
			
		}
		
		widget.valueBox.html('<div class="jPopoverWidget_color_preview"></div>');
		widget.valueBox.children("div").bind("click", function() {
			self.showSelectPage();
		});
		
		
		this.showSelectPage = function() {
			
			var page = popover.addSpecialPage();
			var section = page.addSection(title);
			
			var element = section.addElement();
			
			
			
				var hues=[51,213,2,80,267,193,27];  // Word's colors

				var selector='<table style="margin:auto; width: 100%">';
				selector+='<tr>';
				selector+='<td colspan="6" style="text-align:center;height:20px;margin:4px;background-color:transparent;background-image:url(../../guis.common/images/transparent.jpg); border: 1px solid #CCCCCC">transparent</td>';
				selector+='</tr>';

				for (var i in hues){
					var hue=hues[i];
					selector+='<tr>';
					for (var l=20;l<=95;l+=15){
						var h=hue;
						var s=(l/2+15);
						selector+='<td style="width:16.666%;height:20px;margin:4px;background-color:hsl('+h+','+s+'%,'+l+'%)">&nbsp;</td>';
					}
					selector+='</tr>';
				}

				selector+='<tr>';
				for (var l=0;l<=50;l+=10){
					var h=hue;
					var s=0;
					selector+='<td style="width:16.666%;height:20px;margin:4px;background-color:hsl('+h+','+s+'%,'+l+'%)">&nbsp;</td>';
				}
				selector+='</tr>';

				selector+='<tr>';
				for (var l=50;l<=100;l+=10){
					var h=hue;
					var s=0;
					selector+='<td style="width:16.666%;height:20px;margin:4px;background-color:hsl('+h+','+s+'%,'+l+'%)">&nbsp;</td>';
				}
				selector+='</tr>';
				selector+='</table>';


				element.setHtml(selector);


			$(element.getDOM()).find("table").find("td").click(function(event) {

				self.setColor($(this).css("background-color"));
				self.callChange();
				page.remove();

			});
				
			
			
			page.show();
			
		}
		
		
	}
	
	
	
	
	/* font picker widget */
	this.font = function() {
		var self = this;

		var font = undefined;
		
		this.getValue = function() {
			return widget.valueBox.children("div").css("font-family").replace("'", "").replace("'", "");
		}

		this.setFont = function(f) {

			font = f;
			
			if (f == "multipleValues") {
				widget.valueBox.children("div").css("font-family", "inherit").html(GUI.translate('multiple values'));
				return;
			}
			
			widget.valueBox.children("div").css("font-family", font).html(font);
			
		}

		this.setMultipleValues = function(multipleValues) {
			if (multipleValues) {
				self.setFont("multipleValues");
			}
		}

		widget.valueBox.html('<div class="jPopoverWidget_font_preview"></div>');
		widget.valueBox.children("div").bind("click", function() {
			self.showSelectPage();
		});
		
		if (font == undefined) {
			widget.valueBox.children("div").css("font-family", "").html("Standard");
		} else {
			widget.valueBox.children("div").css("font-family", font).html(font);
		}
		
		this.showSelectPage = function() {
			
			var page = popover.addSpecialPage();
			var section = page.addSection(title);
			
			this.addFont(page, section, "Arial");
			this.addFont(page, section, "Comic Sans MS");
			this.addFont(page, section, "Times New Roman");
			this.addFont(page, section, "Trebuchet MS");
			this.addFont(page, section, "Verdana");
			this.addFont(page, section, "Courier");
			this.addFont(page, section, "Marker Felt");
			
			page.show();
			
		}
		
		
		this.addFont = function(page, section, font) {
			
			var element = section.addElement(font);
			$(element.getDOM()).css("font-family", font);
			$(element.getDOM()).click(function(event) {

				self.setFont($(this).css("font-family").replace("'", "").replace("'", ""));
				self.callChange();
				page.remove();

			});
			
		}
		
		
	}
	
	
	
	

	
	
	
	
	this.el = el;
	this.valueBox = valueBox;
	
	this.onChange = undefined;
	
	var widget = this;
	var popover = popover;
	var title = title;
	
	if (this[type] == undefined) {
		console.error("jPopover: no widget with type '"+type+"' found");
		return false;
	}
	
	var newWidget = new this[type]();
	
	newWidget.onChange = function(callback) {
		widget.onChange = callback;
	}
	
	newWidget.callChange = function() {
		if (widget.onChange != undefined) {
			widget.onChange(newWidget.getValue());
		}
	}
	
	return newWidget;
	
}


var jPopoverManager = new function() {
	
	var self = this;
	
	this.list = [];
	
	this.add = function(popup) {
		this.list.push(popup);
	}
	
	this.hideAll = function() {
		
		$.each(this.list, function(key, object) { 

			object.hide();
			
		});
		
	}
	
	this.getActivePopover = function() {
		
		var found = undefined;
		
		$.each(this.list, function(key, object) { 

			if (object.visible) {
				found = object;
				return;
			}
			
		});

		return found;
		
	}
	
}

$(function() {

	$("#content").bind("mousedown", function() {
		jPopoverManager.hideAll();
	});
	
	$("#content").get(0).addEventListener("touchstart", function() {
		jPopoverManager.hideAll();
	}, false);
	
});




(function( $ ){
	
	// Default configuration properties
	var defaults = {
		positionOffsetX : 3,
		positionOffsetY : 33,
		arrowOffsetRight : 54,
		minWidth : 300,
		onOpen : undefined,
		onClose : undefined,
		onSetup : undefined
	};
	


	
	
	/**
	 * The jPopover object.
	 *
	 * @constructor
	 * @class jPopover
	 * @param e {HTMLElement} The element
	 * @param o {Object} A set of key/value pairs to set as configuration properties.
	 */
  	$.jPopover = function(e, o) {
	
		this.options = $.extend({}, defaults, o || {});

		this.target = e;
		
		this.el = undefined;
		this.visible = true;

		this.pages = {};
		this.pageIdCounter = 0;
		this.currentPage = 0;
		this.prevPage = 0;
	
		this.title = ""; //title for single page popover
	
		
		/* used to reference object in context where "this" is already in use */
		var self = this;
	
		
		/* initial setup */
		this.setup = function() {
			
			jPopoverManager.add(this);

			this.el = document.createElement('div');
			$(this.el).addClass("jPopover");
			$("body").append(this.el);

			this.hide(true);

			$(this.el).html('<div class="jPopover_arrow"></div><div class="jPopover_arrow_border_inner"></div><div class="jPopover_arrow_border"></div><div class="jPopover_arrow_shadow"></div><div class="jPopover_header"><div class="jPopover_navigation"></div></div><div class="jPopover_content"><div class="jPopover_content_inner"></div></div>');

			var clickHandler = function(event) {
				event.preventDefault();
				event.stopPropagation();
				self.toggle();
			}
			
			if (GUI.isTouchDevice) {

				$(this.el).find("div.jPopover_arrow").get(0).addEventListener("touchstart", clickHandler, false);
				$(this.target).get(0).addEventListener("touchstart", clickHandler, false);
				
			} else {
				
				$(this.el).find("div.jPopover_arrow").click(clickHandler);
				$(this.target).bind("mousedown", clickHandler);
				
			}
			
			self.callEvent("onSetup");

		};
		

	
		this.hide = function(noAnimation) {

			if (!this.visible) return;
			
			$(self.target).removeClass("active");
			
			self.callEvent("onClose");

			if (noAnimation == undefined) {

				$(self.el).css("opacity", 1);

				$(self.el).animate({
					opacity: 0,
					useTranslate3d : true
				}, 400, function() {
					$(self.el).hide();
				});

			} else {
				$(self.el).hide();
			}

			this.visible = false;

		}

		this.show = function() {

			if (this.visible) return;
			
			$(self.target).addClass("active");
			
			self.callEvent("onOpen");
			
			this.buildGUI();

			jPopoverManager.hideAll();

			$(self.el).show();

			$(self.el).css("opacity", 0);

			$(self.el).animate({
				opacity: 1,
				useTranslate3d : true
			}, 100);

			this.visible = true;

			this.changePage(0, true);
			
		}

		this.toggle = function() {

			if (this.visible) {
				this.hide();
			} else {
				this.show();
			}

		}


		
		this.resizePage = function() {

			/* resize popup */
			$(self.el).find("div.jPopover_content").animate({
				height : $(self.el).find("div.jPopover_page_"+self.currentPage).outerHeight()+10,
				useTranslate3d : true
			}, 200);
			
		}


		this.changePage = function(pageId, noAnimation) {

			$(self.el).find("div.jPopover_navigation").children("div").removeClass("jPopover_navigation_active");

			$(self.el).find("div.jPopover_navigation").children("div.jPopover_navigation_"+pageId).addClass("jPopover_navigation_active");

			var nextPage = $(self.el).find("div.jPopover_page_"+pageId);


			$(self.el).find("div.jPopover_content_inner").children("div").hide();

			$(nextPage).show();
			
			
			if (noAnimation == undefined) {

				/* resize popup */
				$(self.el).find("div.jPopover_content").animate({
					height : nextPage.outerHeight()+10,
					useTranslate3d : true
				}, 200, function() {
					//nextPage.show();
				});

			} else {
				/* no animation */

				/* resize popup */
				$(self.el).find("div.jPopover_content").css("height", nextPage.outerHeight()+10);

			}

			self.prevPage = self.currentPage;
			self.currentPage = pageId;

		}
		
		
		this.changeToPrevPage = function() {
			this.changePage(this.prevPage);
		}



		this.addSpecialPage = function() {
			
			var pageId = self.pageIdCounter;
			self.pageIdCounter++;

			var newPage = document.createElement("div");
			$(newPage).addClass("jPopover_page");
			$(newPage).addClass("jPopover_page_"+pageId);

			$(this.el).find("div.jPopover_content_inner").append(newPage);

			return new function() {
				
				this.addSection = function(title) {
					return self.addSection(newPage, title);
				}
				
				this.show = function() {
					var page = this;
					
					self.changePage(pageId);
					
					/* change navigation */
					$(self.el).find("div.jPopover_navigation").hide();
					
					var newNavigation = document.createElement("div");
					$(newNavigation).addClass("jPopover_navigation");
					$(newNavigation).addClass("jPopover_navigation_temp");
					
					var newNavigationElement = document.createElement("div");
					$(newNavigationElement).addClass("jPopover_navigation_0");
					$(newNavigationElement).html("Zurück");
					$(newNavigationElement).bind("click", function() {
						page.remove();
					});
					
					$(newNavigation).append(newNavigationElement);
					
					$(self.el).find("div.jPopover_header").append(newNavigation);
					
				}
				
				this.remove = function() {
					$(newPage).remove();
					self.changeToPrevPage();
					$(self.el).find("div.jPopover_navigation_temp").remove();
					$(self.el).find("div.jPopover_navigation").show();
				}
				
			};
			
		}



		this.addPage = function(title) {

			self.title = title;

			var pageId = self.pageIdCounter;
			self.pageIdCounter++;

			var newNavigationElement = document.createElement("div");
			$(newNavigationElement).html(title);
			$(newNavigationElement).addClass("jPopover_navigation_"+pageId);

			$(newNavigationElement).bind("click", function() {

				self.changePage(pageId);

			});

			$(this.el).find("div.jPopover_navigation").append(newNavigationElement);

			var newPage = document.createElement("div");
			$(newPage).addClass("jPopover_page");
			$(newPage).addClass("jPopover_page_"+pageId);

			$(this.el).find("div.jPopover_content_inner").append(newPage);

			return new function() {
				this.addSection = function(title) {
					return self.addSection(newPage, title);
				}
			};

		}



		this.addSection = function(page, title) {

			var newSection = document.createElement("div");
			$(newSection).addClass("jPopover_section");

			if (title != undefined) {
				var newTitle = document.createElement("span");
				$(newTitle).addClass("jPopover_section_title");
				$(newTitle).html(title);
				$(page).append(newTitle);
			}

			$(page).append(newSection);

			return new function() {
				this.addElement = function(title) {
					return self.addElement(newSection, title);
				}
			};
			
		}

		this.addElement = function(section, title) {

			var newElement = document.createElement("div");
			$(newElement).addClass("jPopover_element");
			$(newElement).html(title);

			$(section).append(newElement);
			
			return new function() {
				
				this.setHtml = function(html) {
					$(newElement).html(html);
				}
				
				this.getDOM = function() {
					return newElement;
				}
				
				this.setValue = function(value) {
					
					$(newElement).append('<div class="jPopover_button_right">'+value+'</div><br style="clear: both" />');
					
				}
				
				this.setInactive = function() {

					$(newElement).children("div.jPopover_button_right").addClass("jPopover_button_inactive");
					
				}
				
				this.addWidget = function(type) {
					
					$(newElement).append('<div class="jPopover_button_right"></div><br style="clear: both" />');
						
					return new jPopoverWidget(type, $(newElement), $($(newElement).children("div.jPopover_button_right").get(0)), self, title);
					
				}
				
				this.onClick = function(callback) {
					$(newElement).click(callback);
				}
				
			};

		}

		this.setContent = function(content) {
			$(this.el).find("div.jPopover_content_inner").html(content);
		}


		this.reset = function() {
			$(self.el).find("div.jPopover_header").html('<div class="jPopover_navigation"></div>');
			$(self.el).find("div.jPopover_content").html('<div class="jPopover_content_inner"></div>');
			self.pageIdCounter = 0;
		}






		this.buildGUI = function() {

			window.setTimeout(function() {

				/* check minimal navigation width */

				$(self.el).css("width", "700px");

				var navigation = $(self.el).find("div.jPopover_navigation");
				var navigationElements = navigation.children("div");

				if (navigationElements.length > 1) {
					/* navigation found */

					var navigationWidth = navigation.outerWidth();

					if (navigationWidth < self.options.minWidth) {
						/* expand all navigation elements until navigation width is this.minWidth */

						$(self.el).css("width", self.options.minWidth+"px");

						var space = self.options.minWidth-navigationWidth;
						var numberOfNavigationElements = navigationElements.length;

						var spacePerElement = Math.floor(space/numberOfNavigationElements);

						var spaceLeft = Math.floor(spacePerElement/2);
						var spaceRight = Math.floor(spacePerElement/2)+spacePerElement%2;

						/* add padding to each element */
						navigationElements.each(function() {

							$(this).css("paddingLeft", "+="+spaceLeft+"px");

						});

						navigationElements.each(function() {

							$(this).css("paddingRight", "+="+spaceRight+"px");

						});

						/* add remaining space to first and last element */
						var remainingSpace = space%numberOfNavigationElements;

						var remainingSpaceLeft = Math.floor(remainingSpace/2);
						var remainingSpaceRight = remainingSpace%2;

						navigation.children("div:first-child").css("paddingLeft", "+="+remainingSpaceLeft+"px");
						navigation.children("div:last-child").css("paddingRight", "+="+remainingSpaceRight+"px");


					} else {
						/* resize popup to navigation width */

						$(self.el).css("width", navigationWidth+"px");

					}

				} else {
					/* no navigation --> show title */
					$(self.el).find("div.jPopover_header").html(self.title);
					$(self.el).css("width", self.options.minWidth+"px");
				}

				/* positioning of popup and arrow */

				var x = $(self.target).position().left+self.options.positionOffsetX;
				var y = $(self.target).position().top+$(self.target).outerHeight()+self.options.positionOffsetY;

				if (x+$(self.el).width() > $(window).width()) {

					x = $(window).width()-$(self.el).width()-4;

					/* arrow right */

					var arrowPos = $(window).width()-$(self.target).position().left-self.options.arrowOffsetRight;

					$(self.el).find("div.jPopover_arrow").css("right", arrowPos+"px");
					$(self.el).find("div.jPopover_arrow_border").css("right", arrowPos+"px");
					$(self.el).find("div.jPopover_arrow_border_inner").css("right", arrowPos+"px");
					$(self.el).find("div.jPopover_arrow_shadow").css("right", arrowPos-1+"px");

				} else {
					/* arrow left */

					$(self.el).find("div.jPopover_arrow").css("left", "8px");
					$(self.el).find("div.jPopover_arrow_border").css("left", "8px");
					$(self.el).find("div.jPopover_arrow_border_inner").css("left", "8px");
					$(self.el).find("div.jPopover_arrow_shadow").css("left", "7px");

				}

				$(self.el).css("left", x);
				$(self.el).css("top", y);

			}, 1);

		}
		
		
		
		this.callEvent = function(eventName) {

			var eventFunction = eval("self.options."+eventName);

			if (eventFunction != undefined) {
				eventFunction(self.el, self);
			}

		}
	
	
		
		/**
		 * called when using .jPopover({...}) for an element the second time
		 *
		 */
		this.reload = function() { }

		
		/* call setup function */
		this.setup();
		
	};

	var $ts = $.jPopover;

	/**
	 * Creates a popover element
	 *
	 * @example $("#myelement").jPopover();
	 * @method jPopover
	 * @return jQuery
	 * @param o {Hash|String} A set of key/value pairs to set as configuration properties or a method name to call on a formerly created instance.
	 */
		
	$.fn.jPopover = function(o) {
	        
		if (typeof o == 'string') {
			var instance = $(this).data('jPopover'), args = Array.prototype.slice.call(arguments, 1);
			return instance[o].apply(instance, args);
		} else {
			return this.each(function() {
				var instance = $(this).data('jPopover');
				if (instance) {
					if (o) {
						$.extend(instance.options, o);
					}
					instance.reload();
				} else {
					$(this).data('jPopover', new $ts(this, o));
				}
			});
		}
	};
	
})( jQuery );