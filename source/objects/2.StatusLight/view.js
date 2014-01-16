StatusLight.execute = function(){
    var that = this;
    var compiledTemplate = _.template($('script#proceeding-statusdialog').html());

    var afterLoad = function(data){
        //only first not done can be changed
        var firstNotDoneIndex = _(data).findIndex(function(elem){
            return !elem.done;
        });
        var changedDate = false;
        var initialDone = data[firstNotDoneIndex].done;
        var newStatus = initialDone;

        //replace timestamp with formated string
        _(data).each(function(e){
            if(e.startdate){
                e.startdate = moment(e.startdate).format("DD.MM.YYYY");
            }
            if(e.enddate){
                e.enddate = moment(e.enddate).format("DD.MM.YYYY");
            }
            return e;
        })
        var content = compiledTemplate({milestones : data, editable : firstNotDoneIndex});

        var dialog_buttons = {
            "Speichern" : function(){
                var changeEventData = {
                    milestoneIndex : firstNotDoneIndex,
                    diff : {}
                };

                //s.th. changed
                if(changedDate || initialDone != newStatus){
                    if(changedDate){
                        changeEventData.diff.enddate = changedDate;
                    }
                    if(initialDone != newStatus){
                        changeEventData.diff.done = newStatus;
                    }
                }
                that.saveChanges(changeEventData, function(){
                    //TODO: give some visual feedback
                    that.draw();
                })
            },
            "Verwerfen" : function(){return false;}
        }

        var dialog = GUI.dialog(
            that.translate(GUI.currentLanguage, "Proceeding_Milestones"),
            content,
            dialog_buttons
        );

        $(dialog).find(".datepicker-trigger").datepicker({
            "dateFormat" : "d.m.yy",
            onSelect : function(e){
                changedDate  = moment(e, "D.M.YYYY")._d.getTime();
            }
        });

        ($($(dialog).find("input[type=checkbox]")[firstNotDoneIndex])).change(function(e){
            newStatus = e.target.checked ;
        });
    }

    this.getContentFromApplication("kokoa", afterLoad);
}

StatusLight.createRepresentation = function (parent) {

    var rep = GUI.svg.group(parent, this.getAttribute('id'));
    var circleRed = GUI.svg.circle(rep, 0, 0, 10);
    var text = GUI.svg.text(rep, 20, 5 , "");

    this.getCurrentMileStoneStatus(function(res){
        $(text).text(res.name);
        var fillColor = "green";
        if(res.status === "green"){
            fillColor = "green";
        } else if(res.status === "red"){
            fillColor = "red";
        } else {
            fillColor = "yellow";
        }
        $(circleRed).attr({"fill" : fillColor});
    });

    $(rep).attr("transform", "translate(0,0)");
    $(rep).attr("id", this.getAttribute('id'));
    rep.dataObject = this;
    this.initGUI(rep);


    this.draw();
    return rep;

}

StatusLight.draw = function (external) {

    GeneralObject.draw.call(this, external);
    var rep = this.getRepresentation();
    var text = $(rep).find("text");
    var circleRed = $(rep).find("circle");
    this.getCurrentMileStoneStatus(function(res){
        $(text).text(res.name);
        var fillColor = "green";
        if(res.status === "green"){
            fillColor = "green";
        } else if(res.status === "red"){
            fillColor = "red";
        } else {
            fillColor = "yellow";
        }
        $(circleRed).attr({"fill" : fillColor});
    });
}

/**
 * Have to be overwritten because we want to set the position by transforming the svg group.
 *
 * @param value
 */
StatusLight.setViewX = function (value) {
    GeneralObject.setViewX.call(this, value);
    var transformation = $(this.getRepresentation()).attr("transform");
    var newTrans = transformation.replace(/(\d)+(?=,)/, value);

    $(this.getRepresentation()).attr("transform", newTrans);


}

/**
 * Have to be overwritten because we want to set the position by transforming the svg group.
 *
 * @param value
 */
StatusLight.setViewY = function (value) {
    GeneralObject.setViewY.call(this, value);

    var transformation = $(this.getRepresentation()).attr("transform");
    var newTrans = transformation.replace(/(\d)+(?=\))/, value);

    $(this.getRepresentation()).attr("transform", newTrans);


}

StatusLight.setViewWidth = function (value) {
    GeneralObject.setViewWidth.call(this, value);

}

StatusLight.setViewHeight = function (value) {
    GeneralObject.setViewHeight.call(this, value);
}