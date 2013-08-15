var baseURL = document.getElementById('baseURL').value;

$(document).ready(function() {
    $("#appliedTable").tablesorter();
    $("#appliedAdminTable").tablesorter({
        headers: {2: {sorter: false},
                  3: {sorter:false}}
    });
    $("#verifiedTable").tablesorter({
        headers: {3: {sorter: false}}
    });
});

// verify button handling
$('.verifyButton').click(function() {
    var data = {};
    data.courseID = $(this).siblings('.courseID').val();
    data.username = $(this).siblings('.username').val();
    
    $.ajax({
        url: baseURL + 'courses/verifyUser',
        type: 'POST',
        data: data,
        success: function(json) {
            var decodedJSON = $.parseJSON(json);
            if (decodedJSON["status"] === "success") {
                window.location.reload();
            } else {
                alert('Es ist etwas schief gelaufen...');
            }
        }
    });
});

// delete user handling
$('.deleteUserButton').click(function() {
    var data = {};
    data.courseID = $(this).siblings('.courseID').val();
    data.courseName = $(this).siblings('.courseName').val();
    data.username = $(this).siblings('.username').val();
    
    var response = confirm('Benutzer '+data.username+' wirklich aus dem Kurs '+data.courseName+' entfernen?');
    if (response) {
        $.ajax({
            url: baseURL + 'courses/deleteUser',
            type: 'POST',
            data: data,
            success: function(json) {
                var decodedJSON = $.parseJSON(json);
                if (decodedJSON["status"] === "success") {
                    window.location.reload();
                } else {
                    alert('Es ist etwas schief gelaufen...');
                }
            }
        });
    }
});