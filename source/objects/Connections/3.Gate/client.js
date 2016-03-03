Gate.clientRegister=function(){
	
	Gate.parent.clientRegister.call(this);
	
	this.registerAction('Follow',function(object){
		object.execute();
	},true);
}

/**
* creates a Dialogbox, display all subrooms in a list and set the destination
*   context: Gate Object which is used
*/
Gate.showLinklDialog = function(context) {
	console.log(context);
    var self = this;
	var that=this;
    var dialog_buttons = {};
    var html;
	
	var callback = function(roomlist){
		for( var i =0; i< roomlist.length;i++){
			var roomItem=roomlist[i].data.title
			if(roomItem.id != "trash" && roomItem.id != "public"){
				$("#selectableRoomList").append("<li id='"+roomItem.id+"'><a >"+roomItem.name+" ("+roomItem.id+")</a></li>");	
			}
		}
		$("#selectableRoomList").append("<script>$('#selectableRoomList li').click(function() {$( '#selectableRoomList li' ).each(function() {$( this ).css('background-color','rgba(220,160,140,0)');});$(this).css('background-color','rgb(255, 255, 255)');});</script>");	
	}
	
	Modules.Dispatcher.query('roomlist',callback, function(rooms){
								var roomArray = new Array();
								for(var i = 0; i<rooms.length; i++){
									var node = {
										data : {
											title : rooms[i],
											icon : '/objectIcons/Subroom'
										},
										metadata : {
											id : rooms[i],
											name : rooms[i],
											type : 'Room'
										}
									}
									if(!that.getAttribute('filterObjects')){
										node.state = 'closed';
									}
									roomArray.push(node);
								}
								callback(roomArray);
							});
    
	var saveDestination = function(roomID){
		$( '#selectableRoomList li' ).each(function(){
			if($(this).css('background-color') == "rgb(255, 255, 255)"){
				console.log($(this).context.id);
				context.saveDestination($(this).context.id);
			}
		});
		dialog.dialog("close");
	};
	
    dialog_buttons[that.translate(GUI.currentLanguage, "set target room")] = function() {
        saveDestination();
    };
	dialog_buttons[that.translate(GUI.currentLanguage, "cancel process")] = function() {
        return false;
    };
    
    var dialog_width = 350;
    var content = [];
	
    html = "<p>"+that.translate(GUI.currentLanguage, "please select a room")+"</p>";
	html = html + "<ul id='selectableRoomList'></ul>";
	html = html + "<style>li:hover { background-color: rgb(255, 255, 255); }li{ list-style: none; }</style>";

    content.push(html);

    var position = {
            open: function(event, ui) {
            $(event.target).parent().css('position', 'fixed');
            $(event.target).parent().css('top', context.getAttribute("y")+'px');
            $(event.target).parent().css('left', context.getAttribute("x")+'px');
        }
    };

    var dialog = GUI.dialog(
            that.translate(GUI.currentLanguage, "select room"),
            content,
            dialog_buttons,
            dialog_width,
            position
            );

     document.onkeydown = function(event){ 
            if(event.keyCode ==13){
            	saveDestination();
            }
        }

}
