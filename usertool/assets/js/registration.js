$('.error').hide();
$('#registrationForm').submit(function(){
    var data = {};
    data.username = $('#inputUsername').val();
    var usernameValid = true;
    // todo check if username contains only valid input
    
    data.password = $('#inputPassword').val();
    data.email = $('#inputEmail').val();
    data.firstName = $('#inputFirstName').val();
    data.lastName = $('#inputLastName').val();
    if (usernameValid && $.trim(data.username) !== '' && $.trim(data.password) !== '' && $.trim(data.firstName) !== '' && $.trim(data.lastName) !== '') {
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
                    } else {
                        $('#password_error').show();
                        $('#inputPassword').focus();
                        $('#password_error').html('Ungültiges Passwort.');
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
    } else if ($.trim(data.firstName) === '') {
        $('#firstname_error').show();
        $('#inputFirstName').focus();
        $('#firstname_error').html('Bitte einen Vornamen eingeben.');
    } else {
        $('#lastname_error').show();
        $('#inputLastName').focus();
        $('#lastname_error').html('Bitte einen Nachnamen eingeben.');
    }
    return false;
});