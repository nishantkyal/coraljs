var userEducationCard = $('#userEducation').card();

$('#userEducation .edit-card form').bootstrapValidator({
    submitHandler : function(form)
    {
        var educationId = $('#userEducation .edit-card form input[name="id"]').val();
        var url = educationId ? '/rest/user/education/' + educationId : '/rest/user/education';
        var method = educationId ? 'post' : 'put';

        $.ajax({
            url : url,
            type: method,
            data: {
                education: {
                    school_name     : $('#userEducation .edit-card form input[name="school_name"]').val(),
                    start_year      : $('#userEducation .edit-card form select[name="start_year"]').val(),
                    end_year        : $('#userEducation .edit-card form select[name="end_year"]').val(),
                    degree          : $('#userEducation .edit-card form input[name="degree"]').val(),
                    field_of_study  : $('#userEducation .edit-card form input[name="field_of_study"]').val(),
                    activities      : $('#userEducation .edit-card form input[name="activities"]').val(),
                    notes           : $('#userEducation .edit-card form input[name="description"]').val()
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

$('.editUserEducation').click(function(event)
{
    var educationId = $(this).data('id');
    var education = _.findWhere(userEducation, {id: educationId});

    userEducationCard.edit(education, $(event.currentTarget))
});

$('.deleteUserEducation').click(function()
{
    var educationId = $(this).data('id');
    bootbox.confirm("Are you sure you want to delete selected education detail?", function(result) {
        if (result)
        {
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
        }
    });
});