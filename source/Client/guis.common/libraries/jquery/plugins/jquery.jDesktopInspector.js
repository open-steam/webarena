var jDesktopInspectorWidget = function(type, el, valueBox, inspector, title, page) {
	
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
		
		this.setStepsize = function(stepsize) {
			widget.valueBox.children("input").attr("step", stepsize);
		}
		
		widget.valueBox.html('<input type="number" id="inspector_" />');
		
		widget.valueBox.children("input").bind("change", function() {
			if ($(this).val() == "") return;
			self.callChange();
			$(this).blur();
		});
		
		widget.valueBox.children("input").bind("mouseup", function() {
			if ($(this).val() == "") return;
			self.callChange();
		});
		
		widget.valueBox.children("input").bind("blur", function() {
			if ($(this).val() == "") return;
			self.callChange();
			inspector.hasFocus=false;
		});
		
		widget.valueBox.children("input").bind("focus", function() {
			inspector.hasFocus=true;
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
			$(this).blur();
		});
		
		widget.valueBox.children("input").bind("blur", function() {
			if ($(this).val() == "") return;
			self.callChange();
			inspector.hasFocus=false;
		});
		
		widget.valueBox.children("input").bind("focus", function() {
			inspector.hasFocus=true;
		});
		
	}
	
	/* point widget */
	/*
	this.point = function() {
		var self = this;
		
		this.setMultipleValues = function(multipleValues) {
			if (multipleValues) {
				widget.valueBox.children("input[name=x]").val("");
				widget.valueBox.children("input[name=y]").val("");
				
				widget.valueBox.children("input").attr("placeholder", '-');
			}
		}
		
		this.getValue = function() {
			var x = widget.valueBox.children("input[name=x]").val();
			var y = widget.valueBox.children("input[name=y]").val();
			
			if (x == "") {
				x = widget.valueBox.children("input[name=x]").attr("realValue");
				console.log("x by real");
			}
			
			if (y == "") {
				y = widget.valueBox.children("input[name=y]").attr("realValue");
				console.log("y by real");
			}
			
			console.log("GG", x,y);
			return x+";"+y;
			
		}
		
		this.setValue = function(value) {
			var parts = value.split(";");
			widget.valueBox.children("input[name=x]").val(parts[0]).attr("realValue", parts[0]);
			widget.valueBox.children("input[name=y]").val(parts[1]).attr("realValue", parts[1]);
		}
		
		widget.valueBox.html('X: <input type="number" class="jDesktopInspectorWidget_point_input" name="x" /> Y: <input type="number" class="jDesktopInspectorWidget_point_input" name="y" />');
		
		widget.valueBox.children("input").bind("change", function() {
			self.callChange();
		});
		
	}
	*/
	
	/* plaintext widget */
	/*
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
				width: 450,
				zIndex: 100000
			});
			
		});
		
	}
	*/
	
	/* objectid widget */
	this.objectid = function() {
		var self = this;
		
		this.getValue = function() {
			
			widget.valueBox.find("input").attr("value", GUI.translate("1 object selected"));
			
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
			
			widget.valueBox.find("input").attr("value", GUI.translate("no object selected"));

			return "";
			
		}
		
		this.setValue = function(value) {

			if (value == "") {
				$(dialog).find("#selectId_none").attr("checked", true);
				widget.valueBox.find("input").attr("value", GUI.translate("no object selected"));
				return;
			}

			widget.valueBox.find("input").attr("value", GUI.translate("1 object selected"));

			var set = false;

			$(dialog).find("tr").each(function() {
				if ($(this).attr("id") == value) {
					$(this).find("input").attr("checked", true);
					set = true;
				}
			});
			
			if (set) return;
			
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
			if (object.data.id != self.ownObjectId) {
		
				dialogHtml += '<tr id="'+object.data.id+'"><td><input type="radio" name="selectId" value="'+object.data.id+'" /> '+object.data.name+'</td><td>'+object.translate(GUI.currentLanguage, object.data.type)+'</td><td>'+object.data.id+'</td></tr>';
			
			}
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

		
		widget.valueBox.html('<input type="submit" value="'+GUI.translate("no object selected")+'" />');
		
		widget.valueBox.children("input").bind("click", function() {
			
			$(dialog).dialog({
				modal: true,
				resizable: true,
				buttons: formButtons,
				width: 450,
				height: 400,
				zIndex : 100000
			});
			
		});
			
	}
	
	/* selection widget */
	this.selection = function() {
		var self = this;
		
		this.setMultipleValues = function(multipleValues) {
			
			if (multipleValues) {
			
				widget.valueBox.find("option").attr("selected", ""); //deselect all options
				widget.valueBox.find("select").prepend('<option value="multipleValues" selected="selected">'+GUI.translate("multiple values")+'</option>'); //add option "multiple values"
			
			}
			
		}
		
		this.getValue = function() {
			
			return widget.valueBox.find("option:selected").attr("value");
			
		}
		
		this.setValue = function(value) {
		
			widget.valueBox.find("option[value='"+value+"']").attr("selected", "selected");
			
		}
		
		this.setOptions = function(options) {
			
			var newHtml = '<select size="1">';
			
			$.each(options, function(key, value) {
			
				var val = GUI.translate(value);
			
				newHtml += '<option value="'+value+'">'+val+'</option>';
				
			});
			
			newHtml += '</select>';
			
			widget.valueBox.html(newHtml);
			
			widget.valueBox.children("select").bind("change", function() {
				self.callChange();
			});
			
		}
		
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
		
		widget.valueBox.html('<div class="jDesktopInspectorWidget_color_preview" style="cursor: pointer"></div>');
		widget.valueBox.children("div").bind("click", function() {
			self.showSelectPage();
		});
		
		
		this.page_open = false;
		
		this.hidePage = function() {
			
			this.page_open = false;

			widget.el.find("table").hide();
			widget.el.find("table").remove();
			
		}

		this.showSelectPage = function() {
			
			if (this.page_open) {
				this.hidePage();
				return;
			} else {
				this.page_open = true;
			}
			
				var hues=[51,213,2,80,267,193,27];  // Word's colors

				var selector='<table style="margin:auto; width: 100%;" class="jDesktopInspectorWidget_selector">';
				selector+='<tr>';
				selector+='<td colspan="3">'+GUI.translate('Custom')+':</td>';
				selector+='<td colspan="2" style="text-align:center;height:20px;margin:4px" class="selector"><input type="color" style="width:100%;height:100%" value="#FF00FF"></td>';
				selector+='<td colspan="1" style="text-align:center;height:20px;margin:4px" class="save"><input type="button" value="'+GUI.translate('Save')+'"></td>';

				selector+='</tr>';
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


			$(inspector.mainEl).find(".jDesktopInspectorWidget_selector").remove();

			widget.el.append(selector);

			widget.el.find("table").hide();
			
			widget.el.find("table").show();
			inspector.openPage(page.page, page.head);
			

			widget.el.find("table").find("td").click(function(event) {
				
				if ($(this).attr('class')=='selector') return;

				self.setColor($(this).css("background-color"));
				self.callChange();
				
				self.hidePage();

			});
			
			widget.el.find("table").find(".save input").click(function(event) {
				
				var value=widget.el.find("table").find(".selector input").val();
				
				self.setColor(value);
				self.callChange();
				
				self.hidePage();
			});
				
		}
	}
	
	/* font picker widget */
	this.font = function() {
		var self = this;
		
		var font = undefined;
		
		this.setMultipleValues = function(multipleValues) {
			if (multipleValues) {
				self.setFont("multipleValues");
			}
		}
		
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

		
		widget.valueBox.html('<div class="jDesktopInspectorWidget_font_preview" style="cursor: pointer"></div>');
		widget.valueBox.children("div").bind("click", function() {
			self.showSelectPage();
		});
		
		if (font == undefined) {
			widget.valueBox.children("div").css("font-family", "").html("Standard");
		} else {
			widget.valueBox.children("div").css("font-family", font).html(font);
		}
		
		
		this.page_open = false;
		
		this.showSelectPage = function() {
			
			if (this.page_open) {
				this.hidePage();
				return;
			} else {
				this.page_open = true;
			}

			var selectBox = document.createElement("div");
			$(selectBox).addClass("jDesktopInspectorWidget_font_selectbox");
			$(selectBox).addClass("jDesktopInspectorWidget_selector");
			$(selectBox).hide();

			this.addFont(selectBox, "Arial");
			this.addFont(selectBox, "Comic Sans MS");
			this.addFont(selectBox, "Times New Roman");
			this.addFont(selectBox, "Trebuchet MS");
			this.addFont(selectBox, "Verdana");
			this.addFont(selectBox, "Courier");
			this.addFont(selectBox, "Marker Felt");

			$(inspector.mainEl).find(".jDesktopInspectorWidget_selector").remove();

			widget.el.append(selectBox);
			
			$(selectBox).show();
			inspector.openPage(page.page, page.head);
			
		}
		
		
		this.hidePage = function() {
			
			this.page_open = false;
			
			widget.el.find("div.jDesktopInspectorWidget_font_selectbox").hide();
			widget.el.find("div.jDesktopInspectorWidget_font_selectbox").remove();
			
		}
		
		
		this.addFont = function(selectBox, font) {
			
			var fontBox = document.createElement("div");
			$(fontBox).css("font-family", font);
			$(fontBox).html(font);
			$(fontBox).click(function(event) {

				self.setFont($(this).css("font-family").replace("'", "").replace("'", ""));
				self.callChange();
				self.hidePage();

			});
			
			$(selectBox).append(fontBox);
		
		}
		
		
	}
	
	
	
	/* list widget */
	this.list = function() {
		var self = this;
		self.value = [];
		
		this.setMultipleValues = function(multipleValues) {
			if (multipleValues) widget.valueBox.html(GUI.translate("multiple values"));
		}
		
		this.getValue = function() {
			
			var newValue = [];
			
			widget.el.find("table").find("input").each(function(index,el) {

				if ($(el).val() != undefined && $(el).val() != "") {
					newValue.push($(el).val());
				}
				
			});
			
			return newValue;
			
		}

		this.setValue = function(value) {

			self.value = value;
			
		}
		
		widget.valueBox.html('<div style="cursor: pointer">...</div>');
		widget.valueBox.children("div").bind("click", function() {
			self.showSelectPage();
		});
		
		
		this.page_open = false;
		
		
		this.hidePage = function() {
			
			this.page_open = false;
			
			widget.el.find("table").hide();
			widget.el.find("table").remove();
			
			widget.el.find("input.inspector_addValueButton").hide();
			widget.el.find("input.inspector_addValueButton").remove();
			
		}
		
		
		this.showSelectPage = function() {
			
			if (this.page_open) {
				this.hidePage();
				return;
			} else {
				this.page_open = true;
			}
			
			var selector='<table style="margin:auto; width: 100%;">';
			
			for (var i=0; i<self.value.length;i++) {
				
				var value = self.value[i];
				
				selector+='<tr><td><input type="text" value="'+value+'" style="width: 95%" /></td></tr>';
				
			}

			selector+='</table><input type="submit" value="'+GUI.translate('Add value')+'" class="inspector_addValueButton" style="margin-top: 10px; margin-left: 5px;" />';

			$(widget.el).find(".jDesktopInspectorWidget_selector").remove();
			$(widget.el).find("input.inspector_addValueButton").remove();

			widget.el.append(selector);

			widget.el.find("table").hide();
			
			widget.el.find("table").show();
			inspector.openPage(page.page, page.head);
			

			widget.el.find("table").find("input").bind("keyup", function(event) {

				self.callChange();
				
			});
			
			widget.el.find("input.inspector_addValueButton").click(function() {
				widget.el.find("table").append('<tr><td><input type="text" value="" style="width: 95%" /></td></tr>');
				widget.el.find("table").find("input").last().bind("keyup", function(event) {
					self.callChange();
				}).focus();
			});
	
		}
		
		
	}
	
	this.el = el;
	this.valueBox = valueBox;
	
	this.onChange = undefined;
	
	var widget = this;
	var inspector = inspector;
	var title = title;
	var page = page;

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

$(function() { });

(function( $ ){
	
	// Default configuration properties
	var defaults = {
		onSetup : undefined,
		onUpdate : undefined
	};
	
	/**
	 * The jDesktopInspector object.
	 *
	 * @constructor
	 * @class jDesktopInspector
	 * @param e {HTMLElement} The element
	 * @param o {Object} A set of key/value pairs to set as configuration properties.
	 */
  	$.jDesktopInspector = function(e, o) {
	
		this.options = $.extend({}, defaults, o || {});

		this.el = e;
		this.visible = true;

		this.pages = Array();
		
		this.pageIdCounter = 0;
		this.currentPage = 0;
		this.prevPage = 0;
		this.mainEl = undefined;
		this.hasFocus = false;
	
		
		/* used to reference object in context where "this" is already in use */
		var self = this;
		
		/* initial setup */
		this.setup = function() {
			$(self.el).addClass("jDesktopInspector");
			self.callEvent("onSetup");
			self.update();
		};

		this.addPage = function(title) {

			var pageId = self.pageIdCounter;
			self.pageIdCounter++;

			var newHead = document.createElement("div");
			$(newHead).addClass("jDesktopInspector_pageHead");
			$(newHead).html(title);

			var newPage = document.createElement("div");
			//$(newPage).hide();
			$(newPage).addClass("jDesktopInspector_page");
			$(newPage).addClass("jDesktopInspector_page_"+pageId);

			$(this.el).children("div").append(newHead);
			$(this.el).children("div").append(newPage);

			//TEMP:
			//$(newHead).removeClass("jDesktopInspector_pageHead_closed");
			//$(newPage).show();
			
			var thisPage = {
				page: newPage,
				head: newHead
			};
			
			self.pages.push(thisPage);

			return new function() {
				this.addSection = function(title) {
					return self.addSection(thisPage, title);
				}
			};
		}

		this.addSection = function(page, title) {

			var newSection = document.createElement("div");
			$(newSection).addClass("jDesktopInspector_section");

			if (title != undefined) {
				var newTitle = document.createElement("span");
				$(newTitle).addClass("jDesktopInspector_section_title");
				$(newTitle).html(title);
				$(page.page).append(newTitle);
			}

			$(page.page).append(newSection);

			return new function() {
				this.addElement = function(title) {
					return self.addElement(newSection, title, page);
				}
			};
			
		}

		this.addElement = function(section, title, page) {

			var newElement = document.createElement("div");
			$(newElement).addClass("jDesktopInspector_element");
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
					
					$(newElement).append('<div class="jDesktopInspector_button_right">'+value+'</div><br style="clear: both" />');
					
				}
				
				this.setVal = function(value) {
					
					var val = GUI.translate('choose');

					$(newElement).children().text(val);
					
				}
				
				this.setInactive = function() {
				
					$(newElement).children("div.jDesktopInspector_button_right").addClass("jDesktopInspector_button_inactive");
					
				}
				
				this.addWidget = function(type) {
					
					$(newElement).append('<div class="jDesktopInspector_button_right"></div><br style="clear: both" />');
						
					return new jDesktopInspectorWidget(type, $(newElement), $($(newElement).children("div.jDesktopInspector_button_right").get(0)), self, title, page);
					
				}
				
				this.onClick = function(callback) {
					$(newElement).click(callback);
				}
			};
		}

		this.reset = function() {
			self.mainEl = document.createElement("div");
			$(self.mainEl).addClass("jDesktopInspector_main");
//			$(self.mainEl).css("border", "1px solid red");
			
			$(self.el).html("");
			$(self.el).append(self.mainEl);
			
			self.pageIdCounter = 0;
		}

		this.update = function() {
			self.reset();
			self.callEvent("onUpdate");
		}

		this.openPage = function(page, head) {
			var open = $(page).is(":visible");
			
			$(head).removeClass("jDesktopInspector_pageHead_closed");
			$(page).show();
		}
		
		this.callEvent = function(eventName) {
			var eventFunction = eval("self.options."+eventName);

			if (eventFunction != undefined) {
				eventFunction(self.el, self);
			}
		}

		/**
		 * called when using .jDesktopInspector({...}) for an element the second time
		 *
		 */
		this.reload = function() { }
		
		/* call setup function */
		this.setup();
	};

	var $ts = $.jDesktopInspector;

	/**
	 * Creates a inspector element
	 *
	 * @example $("#myelement").jDesktopInspector();
	 * @method jDesktopInspector
	 * @return jQuery
	 * @param o {Hash|String} A set of key/value pairs to set as configuration properties or a method name to call on a formerly created instance.
	 */
	$.fn.jDesktopInspector = function(o) {
	        
		if (typeof o == 'string') {
			var instance = $(this).data('jDesktopInspector'), args = Array.prototype.slice.call(arguments, 1);
			return instance[o].apply(instance, args);
		} else {
			return this.each(function() {
				var instance = $(this).data('jDesktopInspector');
				if (instance) {
					if (o) {
						$.extend(instance.options, o);
					}
					instance.reload();
				} else {
					$(this).data('jDesktopInspector', new $ts(this, o));
				}
			});
		}
	};
	
})( jQuery );