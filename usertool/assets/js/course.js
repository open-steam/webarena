$(document).ready(function() {
    $("#appliedTable").tablesorter({
        headers: {3: {sorter: false},
                  4: {sorter: false}}
    });
    $("#memberTable").tablesorter({
        headers: {3: {sorter: false},
                  4: {sorter: false}}
    });
});

var baseURL = document.getElementById('baseURL').value;
var courseID = document.getElementById('courseID').value;

// verify button handling
$('.verifyButton').click(function() {
    var data = {};
    data.courseID = courseID;
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

// apply button handling
$('#applyButton').click(function() {
    var data = {};
    data.courseID = courseID;
    
    $.ajax({
        url: baseURL + 'courses/apply',
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

// freeze button handling
$('#freezeButton').click(function() {
    var data = {};
    data.courseID = courseID;
    
    var response = confirm('Diesen Kurs wirklich einfrieren?\nDieser Vorgang kann nicht rückgängig gemacht werden.');
    if (response) {
        $.ajax({
            url: baseURL + 'courses/freeze',
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

// write access checkbox handling
$('.writeAccessCheckbox').attr("autocomplete", "off");
$('.writeAccessCheckbox').click(function() {
    var data = {};
    data.courseID = courseID;
    data.username = $(this).siblings('.username').val();
    data.writeAccess = $(this).is(":checked") ? true : false;

    $('#' + data.username).attr('src', baseURL + '/assets/img/ajax-loader.gif');

    $.ajax({
        url: baseURL + 'courses/changeWriteAccessUser',
        type: 'POST',
        data: data,
        success: function(json) {
            var decodedJSON = $.parseJSON(json);
            if (decodedJSON["status"] === "success") {
                setTimeout(function() {
                    $('#' + data.username).attr('src', baseURL + '/assets/img/icon_ok.png');
                }, 200);
            } else {
                alert('Es ist etwas schief gelaufen...');
            }
        }
    });
});

// delete user handling
$('.deleteUserButton').click(function() {
    var data = {};
    data.courseID = courseID;
    data.username = $(this).siblings('.username').val();
    
    var response = confirm('Benutzer '+data.username+' wirklich aus dem Kurs entfernen?');
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

// general information table handling
$(document).ready(function() {
    $('#courseTable input, #courseTable textarea').each(function() {
        $(this).data('oldvalue', $(this).val());
    });
});
$('#courseTable input, #courseTable textarea').on('change input', function() {
    if ($(this).data('oldvalue') !== $(this).val()) {
        $(this).addClass('changed');
    } else {
        $(this).removeClass('changed');
    }
});
$('#courseTable input, #courseTable textarea').on('blur', function() {
    if ($(this).hasClass('changed')) {
        if (!($(this).attr('name')== 'courseName' && $(this).val() == '')) {
            $(this).removeClass('changed');
            $(this).siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/ajax-loader.gif');
            var data = {};
            data.id = courseID;
            data.name = $(this).attr('name');
            data.value = $(this).val();
            $.ajax({
                url: baseURL + 'courses/' + courseID,
                type: 'POST',
                data: data,
                success: function(json) {
                    var decodedJSON = $.parseJSON(json);
                    if (decodedJSON["status"] === "success") {
                        if (decodedJSON["name"] === 'courseName') {
                            $('#inputCourseName').data('oldvalue', decodedJSON["value"]);
                            setTimeout(function() {
                                $('#inputCourseName').siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/icon_ok.png');
                            }, 200);
                        } else {
                            $('#inputDescription').data('oldvalue', decodedJSON["value"]);
                            setTimeout(function() {
                                $('#inputDescription').siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/icon_ok.png');
                            }, 200);
                        }
                    } else {
                        alert('Es ist etwas schief gelaufen...');
                    }
                }
            });
        }
    }
});
$('#courseTable input, #courseTable textarea').on('keyup', function(event) {
    if (event.keyCode == 13) {
        if (!($(this).attr('name')== 'courseName' && $(this).val() == '')) {
            $(this).removeClass('changed');
            $(this).siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/ajax-loader.gif');
            var data = {};
            data.id = courseID;
            data.name = $(this).attr('name');
            data.value = $(this).val();
        
            $.ajax({
                url: baseURL + 'courses/' + courseID,
                type: 'POST',
                data: data,
                success: function(json) {
                    var decodedJSON = $.parseJSON(json);
                    if (decodedJSON["status"] === "success") {
                        if (decodedJSON["name"] === 'courseName') {
                            $('#inputCourseName').data('oldvalue', decodedJSON["value"]);
                            setTimeout(function() {
                                $('#inputCourseName').siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/icon_ok.png');
                            }, 200);
                        } else {
                            $('#inputDescription').data('oldvalue', decodedJSON["value"]);
                            setTimeout(function() {
                                $('#inputDescription').siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/icon_ok.png');
                            }, 200);
                        }
                    } else {
                        alert('Es ist etwas schief gelaufen...');
                    }
                }
            });
        }
    }
});