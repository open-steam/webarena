$('.error').hide();
$('#loginForm').submit(function(){
    var data = {};
    data.username = $('#inputUsername').val();
    data.password = $('#inputPassword').val();
    if ($.trim(data.username) !== '' && data.password !== '') {
        $.ajax({
            url: 'login',
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
                        $('#username_error').html('Ungültiger Benutzername.');
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
    } else {
        $('#password_error').show();
        $('#inputPassword').focus();
        $('#password_error').html('Bitte ein Passwort eingeben.');
    }
    return false;
});