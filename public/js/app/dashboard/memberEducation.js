$('#addUserEducationBtn').click(function()
{
    $('#userEducationDetails').show();
    $('#userEducation').hide();

    $('#userEducationDetails form').trigger('reset');
    $('#userEducationDetails form .alert').hide();
    $('#userEducationDetails form').data('bootstrapValidator').resetForm();
});

$('#userEducationDetails form').bootstrapValidator({
    submitHandler : function(form)
    {
        var educationId = $('#userEducationDetails form input[name="id"]').val();
        var url = educationId ? '/rest/user/education/' + educationId : '/rest/user/education';
        var method = educationId ? 'post' : 'put';

        $.ajax({
            url : url,
            type: method,
            data: {
                education: {
                    school_name     : $('#userEducationDetails form input[name="school_name"]').val(),
                    start_year      : $('#userEducationDetails form select[name="start_year"]').val(),
                    end_year        : $('#userEducationDetails form select[name="end_year"]').val(),
                    degree          : $('#userEducationDetails form input[name="degree"]').val(),
                    field_of_study  : $('#userEducationDetails form input[name="field_of_study"]').val(),
                    activities      : $('#userEducationDetails form input[name="activities"]').val(),
                    notes           : $('#userEducationDetails form input[name="description"]').val()
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

$('#cancelUserEducationDetails').click(function()
{
    $('#userEducation').show();
    $('#userEducationDetails').hide();
});

$('.editUserEducation').click(function()
{
    $('#userEducationDetails').show();
    $('#userEducation').hide();

    var educationId = $(this).data('id');
    var education = _.findWhere(userEducation, {id: educationId});

    populate($('#userEducationDetails form'), unEscapeObject(education));
});

$('.deleteUserEducation').click(function()
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