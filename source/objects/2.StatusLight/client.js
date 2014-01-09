StatusLight.getContentFromApplication = function(application, callback){
    this.serverCall('getContentFromApplication', application, callback);
}

StatusLight.saveChanges = function(data, callback){
    this.serverCall('saveMilestoneChanges', data, callback);
}

StatusLight.getCurrentMileStoneStatus = function( callback){
    this.serverCall('getCurrentMileStoneStatus', callback);
}