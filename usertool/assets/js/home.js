// general user information table handling
var baseURL = document.getElementById('baseURL').value;
var username = document.getElementById('username').value;

$(document).ready(function() {
    $('#userTable input').each(function() {
        $(this).data('oldvalue', $(this).val());
    });
});
$('#userTable input').on('change input', function() {
    if ($(this).data('oldvalue') !== $(this).val()) {
        if ($(this).attr('name') === 'email' || "" !== $.trim($(this).val())) {
            $(this).addClass('changed');
        } else {
            $(this).removeClass('changed');
        }
    } else {
        $(this).removeClass('changed');
    }
});
$('#userTable input').on('blur', function() {
    if ($(this).hasClass('changed')) {
        $(this).removeClass('changed');
        $(this).siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/ajax-loader.gif');
        var data = {};
        data.username = username;
        data.name = $(this).attr('name');
        data.value = $(this).val();
        $.ajax({
            url: baseURL + 'users/' + username,
            type: 'POST',
            data: data,
            success: function(json) {
                var decodedJSON = $.parseJSON(json);
                if (decodedJSON["status"] === "success") {
                    if (decodedJSON["name"] === 'firstName') {
                        $('#inputFirstName').data('oldvalue', decodedJSON["value"]);
                        setTimeout(function() {
                            $('#inputFirstName').siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/icon_ok.png');
                        }, 200);
                    } else if (decodedJSON["name"] === 'lastName') {
                        $('#inputLastName').data('oldvalue', decodedJSON["value"]);
                        setTimeout(function() {
                            $('#inputLastName').siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/icon_ok.png');
                        }, 200);
                    } else {
                        $('#inputEmail').data('oldvalue', decodedJSON["value"]);
                        setTimeout(function() {
                            $('#inputEmail').siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/icon_ok.png');
                        }, 200);
                    }
                } else {
                    alert('Es ist etwas schief gelaufen...');
                }
            }
        });
    }
});
$('#userTable input').on('keyup', function(event) {
    if (event.keyCode == 13 && $(this).hasClass('changed')) {
        $(this).removeClass('changed');
        $(this).siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/ajax-loader.gif');
        var data = {};
        data.username = username;
        data.name = $(this).attr('name');
        data.value = $(this).val();
        $.ajax({
            url: baseURL + 'users/' + username,
            type: 'POST',
            data: data,
            success: function(json) {
                var decodedJSON = $.parseJSON(json);
                if (decodedJSON["status"] === "success") {
                    if (decodedJSON["name"] === 'firstName') {
                        $('#inputFirstName').data('oldvalue', decodedJSON["value"]);
                        setTimeout(function() {
                            $('#inputFirstName').siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/icon_ok.png');
                        }, 200);
                    } else if (decodedJSON["name"] === 'lastName') {
                        $('#inputLastName').data('oldvalue', decodedJSON["value"]);
                        setTimeout(function() {
                            $('#inputLastName').siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/icon_ok.png');
                        }, 200);
                    } else {
                        $('#inputEmail').data('oldvalue', decodedJSON["value"]);
                        setTimeout(function() {
                            $('#inputEmail').siblings('.feedbackIcon').attr('src', baseURL + '/assets/img/icon_ok.png');
                        }, 200);
                    }
                } else {
                    alert('Es ist etwas schief gelaufen...');
                }
            }
        });
    }
});
$('#passwordForm').submit(function() {
    $('#passwordFeedback').html('');
    
    var data = {};
    data.passwordOld = document.getElementById('passwordOld').value;
    data.passwordNew = document.getElementById('passwordNew').value;
    data.passwordNew2 = document.getElementById('passwordNew2').value;
    $.ajax({
        url: baseURL + 'login/password',
        type: 'POST',
        data: data,
        success: function(json) {
            var decodedJSON = $.parseJSON(json);
            if (decodedJSON["status"] === "success") {
                $('#passwordFeedback').css('color', 'green');
                setTimeout(function() { $('#passwordFeedback').html('Neues Passwort erfolgreich gespeichert.'); }, 200);
            } else if (decodedJSON["status"] === "error") {
                $('#passwordFeedback').css('color', 'red');
                if (decodedJSON["error"] === "loading") {
                    setTimeout(function() { $('#passwordFeedback').html('Passwort erfolgreich geändert.'); }, 200);
                } else if (decodedJSON["error"] === "saving") {
                    setTimeout(function() { $('#passwordFeedback').html('Neues Passwort konnte nicht gespeichert werden.'); }, 200);
                } else if (decodedJSON["error"] === "invalid") {
                    setTimeout(function() { $('#passwordFeedback').html('Altes Passwort ist nicht korrekt.'); }, 200);
                } else if (decodedJSON["error"] === "newPassword") {
                    setTimeout(function() { $('#passwordFeedback').html('Neues Passwort stimmt nicht überein.'); }, 200);
                }
            }
        }
    });
});