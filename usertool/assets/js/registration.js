function IsEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}
$('.error').hide();

$('#registrationForm').submit(function() {
    $('.error').hide();
    var loginWithEmail = $('#hiddenValue').val() == "1";
    console.log(loginWithEmail);
    var data = {};
    if (loginWithEmail) {
        data.username = $('#inputEmail').val();
    } else {
        data.username = $('#inputUsername').val();
    }
    data.password = $('#inputPassword').val();
    data.passwordRE = $('#inputPasswordRE').val();
    data.email = $('#inputEmail').val();
    data.firstName = $('#inputFirstName').val();
    var validEmail = IsEmail(data.email);
    data.lastName = $('#inputLastName').val();

    var validRequest = false;
    if (loginWithEmail) {
        if (validEmail && $.trim(data.passwordRE) !== '' && $.trim(data.password) !== '' && $.trim(data.firstName) !== '' && $.trim(data.lastName) !== '') {
            validRequest = true;
        }
    } else {
        if ($.trim(data.username) !== '' && $.trim(data.passwordRE) !== '' && $.trim(data.password) !== '' && $.trim(data.firstName) !== '' && $.trim(data.lastName) !== '') {
            validRequest = true;
        }

    }
    if (validRequest) {
        $.ajax({
            url: 'registration',
            type: 'POST',
            data: data,
            success: function(json) {
                var decodedJSON = $.parseJSON(json);
                if (decodedJSON['status'] === 'success') {
                    window.location.reload();
                } else {
                    if (decodedJSON["error"] === "username") {
                        $('#username_error').show();
                        $('#inputUsername').focus();
                        if (loginWithEmail) {
                            $('#username_error').html('Email bereits registriert.');
                        } else {
                            $('#username_error').html('Benutzername bereits vergeben.');

                        }
                    } else if (decodedJSON["error"] === "characters") {
                        $('#username_error').show();
                        $('#inputUsername').focus();
                        $('#username_error').html('Benutzername darf keine Sonderzeichen enthalten.');
                    } else if (decodedJSON["error"] === "passwordRE") {
                        $('#passwordRE_error').show();
                        $('#inputPasswordRE').focus();
                        $('#passwordRE_error').html('Passwort stimmt nicht überein.');
                    } else if (decodedJSON["error"] === "writing") {
                        alert('Daten konnten nicht gespeichert werden.');
                    } else {
                        alert('Es ist etwas schief gelaufen...');
                    }
                }
            }
        });
    } else if (!validEmail) {
        if (loginWithEmail) {
            $('#email_error').show();
            $('#inputEmail').focus();
            $('#email_error').html('Bitte eine korrekte Email-Adresse angeben.');

        }


    } else if ($.trim(data.username) === '') {
        if (!loginWithEmail) {
            $('#username_error').show();
            $('#inputUsername').focus();
            $('#username_error').html('Bitte einen Benutzernamen eingeben.');
        }

    } else if ($.trim(data.password) === '') {
        $('#password_error').show();
        $('#inputPassword').focus();
        $('#password_error').html('Bitte ein Passwort eingeben.');
    } else if ($.trim(data.passwordRE) === '') {
        $('#passwordRE_error').show();
        $('#inputPasswordRE').focus();
        $('#passwordRE_error').html('Bitte das Passwort wiederholen.');
    } else if ($.trim(data.firstName) === '') {
        $('#firstname_error').show();
        $('#inputFirstName').focus();
        $('#firstname_error').html('Bitte einen Vornamen eingeben.');
    } else if ($.trim(data.lastName) === '') {
        $('#lastname_error').show();
        $('#inputLastName').focus();
        $('#lastname_error').html('Bitte einen Nachnamen eingeben.');
    }
    return false;
});