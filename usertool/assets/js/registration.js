$('.error').hide();
$('#registrationForm').submit(function(){
    $('.error').hide();
    
    var data = {};
    data.username = $('#inputUsername').val();
    data.password = $('#inputPassword').val();
    data.passwordRE = $('#inputPasswordRE').val();
    data.email = $('#inputEmail').val();
    data.firstName = $('#inputFirstName').val();
    data.lastName = $('#inputLastName').val();
    if ($.trim(data.username) !== '' && $.trim(data.passwordRE) !== '' && $.trim(data.password) !== '' && $.trim(data.firstName) !== '' && $.trim(data.lastName) !== '') {
        $.ajax({
            url: 'registration',
            type: 'POST',
            data: data,
            success: function(json){
                var decodedJSON = $.parseJSON(json);
                if (decodedJSON['status'] === 'success') {
                    window.location.reload();
                } else {
                    if (decodedJSON["error"] === "username") {
                        $('#username_error').show();
                        $('#inputUsername').focus();
                        $('#username_error').html('Benutzername bereits vergeben.');
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
    } else if ($.trim(data.username) === '') {
        $('#username_error').show();
        $('#inputUsername').focus();
        $('#username_error').html('Bitte einen Benutzernamen eingeben.');
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