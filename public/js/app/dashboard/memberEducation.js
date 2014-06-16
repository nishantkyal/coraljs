$('#addeducationbtn').click(function()
{
    $('#AddUserEducationCard').show();
    $('#educationDetails').hide();

    $('form#AddUserEducationForm').trigger('reset');
    $('form#AddUserEducationForm .alert').hide();
    $('form#AddUserEducationForm').data('bootstrapValidator').resetForm();
});

$('form#AddUserEducationForm').bootstrapValidator({
    submitHandler : function(form)
    {
        var educationId = $('form#AddUserEducationForm input[name="id"]').val();
        var url = educationId ? '/rest/user/education/' + educationId : '/rest/user/education';
        var method = educationId ? 'post' : 'put';

        $.ajax({
            url : url,
            type: method,
            data: {
                education: {
                    school_name     : $('#AddUserEducationForm input[name="school_name"]').val(),
                    start_year      : $('#AddUserEducationForm select[name="start_year"]').val(),
                    end_year        : $('#AddUserEducationForm select[name="end_year"]').val(),
                    degree          : $('#AddUserEducationForm input[name="degree"]').val(),
                    field_of_study  : $('#AddUserEducationForm input[name="field_of_study"]').val(),
                    activities      : $('#AddUserEducationForm input[name="activities"]').val(),
                    notes           : $('#AddUserEducationForm input[name="description"]').val()
                },
                profileId           : userProfile.id
            },
            success: function()
            {
                location.reload();
            }
        })
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields         : {
        school_name : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        }
    }
});

$('#cancelAddUserEducation').click(function()
{
    $('#educationDetails').show();
    $('#AddUserEducationCard').hide();
});

$('[name="editUserEducation"]').click(function()
{
    $('#AddUserEducationCard').show();
    $('#educationDetails').hide();

    var educationId = $(this).data('id');
    var education = _.findWhere(userEducation, {id: educationId});

    populate($('form#AddUserEducationForm'), unEscapeObject(education));
});

$('[name="deleteUserEducation"]').click(function()
{
    var educationId = $(this).data('id');
    $.ajax({
        url    : '/rest/user/education/' + educationId,
        type   : 'DELETE',
        data: {
                id              : educationId,
            profileId           : userProfile.id
        },
        success: function()
        {
            location.reload();
        }
    });
});