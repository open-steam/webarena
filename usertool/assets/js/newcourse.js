$('.error').hide();
$('#newCourseForm').submit(function(){
    var data = {};
    data.courseName = $('#inputCourseName').val();
    data.description = $('#inputDescription').val();
    if ($.trim(data.courseName) !== '') {
        $.ajax({
            url: 'create',
            type: 'POST',
            data: data,
            success: function(json){
                var decodedJSON = $.parseJSON(json);
                if (decodedJSON['status'] === 'success') {
                    window.location = decodedJSON['url'];
                } else {
                    alert('Es ist etwas schief gelaufen...');
                }
            }
        });
    } else {
        $('#coursename_error').show();
        $('#inputCourseName').focus();
        $('#coursename_error').html('Bitte einen Kursnamen eingeben.');
    } 
    return false;
});