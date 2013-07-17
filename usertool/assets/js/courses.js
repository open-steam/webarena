$(document).ready(function() {
    $("#appliedTable").tablesorter();
    $("#verifiedTable").tablesorter({
        headers: {3: {sorter: false}}
    });
});
