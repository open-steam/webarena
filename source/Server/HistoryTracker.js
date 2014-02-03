"use strict";

var _ = require("lodash");

var HistoryTracker = function(maxStackSize){
    var that = { };

    /**
     * The ids of the stored transactions. Should be ordered by time.
     * @type {Array}
     */
    var historyTransactionIds = [];

    /**
     * For each history entry there should exist an object attribute,
     * e.g. historyEntries[someTransactionId].
     * A history entry is a collection of changes belonging to a transaction.
     *
     * @type {{}}
     */
    var historyEntries = {

    };

    /**
     * The history stack should have a limited size. Therefore it should be shortened
     * to this size, if it's to long.
     */
    var shorten = function(){
        while(historyTransactionIds.length > maxStackSize){
            var idToRemove = historyTransactionIds.shift();
            delete historyEntries[idToRemove];
        }
    }

    that.add = function(transactionId, userId, historyEntry){
        if(!historyEntries[transactionId]){
            historyEntries[transactionId] = {
                'changeSet' : [],
                'userId': userId
            };
            historyTransactionIds.push(transactionId);
        }

        historyEntries[transactionId].changeSet.push(historyEntry);
        shorten();
    }

    that.getLastChangeForUser = function(userId){
        var i = historyTransactionIds.length;
        var found = false;
        var changedByOthers = [];

	    //Go back until end of history, as long as not found
	    //history entry for the user id.
        while(i-- && !found){
            var hid = historyTransactionIds[i];
            var changeSet = historyEntries[hid].changeSet;
            var changeUserId = historyEntries[hid].userId;

            if(userId === changeUserId){
                found = true;
                var isChangedByOthers = _(changeSet).some(function(e){
                    return _(changedByOthers).contains(e.objectID)
                });

                if(! isChangedByOthers){
                    return {
                        transactionId: hid,
                        changeSet : changeSet,
                        blocked: false
                    };
                } else {
                    return {
                        transactionId: hid,
                        changeSet : changeSet,
                        blocked: true
                    };
                }

            } else {
                changedByOthers = _.union(
                    _.map(changeSet,
                        function(changeEntry){return changeEntry.objectID}
                    ),
                    changedByOthers);
            }
        }
    }

    that.removeHistoryEntry = function(transactionId){
        delete historyEntries[transactionId];
        historyTransactionIds = _.filter(historyTransactionIds, function(e){return e != transactionId})
    }

    return that;

}

exports.HistoryTracker = HistoryTracker;