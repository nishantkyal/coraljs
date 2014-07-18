var userEmploymentCard = $('#userEmployment').card();

$('.empSummary').expander();

$('#userEmployment .editCardBtn').click(function(event)
{
    var employmentId = $(this).data('id');
    var employment = _.findWhere(userEmployment, {id: employmentId});

    userEmploymentCard.edit(employment, $(event.currentTarget));
    
    if (employment.start_date)
        $('#userEmployment .edit-card form input[name="start_date"]').val(moment.unix(parseInt(employment.start_date/1000)).format('MM-YYYY'));
    if (employment.end_date)
        $('#userEmployment .edit-card form input[name="end_date"]').val(moment.unix(parseInt(employment.end_date/1000)).format('MM-YYYY'));
});

$('[name="deleteUserEmployment"]').click(function()
{
    var employmentId = $(this).data('id');
    bootbox.confirm("Are you sure you want to delete selected employment detail?", function(result) {
        if (result)
        {
            $.ajax({
                url    : '/rest/user/employment/' + employmentId,
                type   : 'DELETE',
                data: {
                    id              : employmentId,
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

$('#userEmployment .edit-card form').bootstrapValidator({
    submitHandler : function()
    {
        var startDate = $('#userEmployment .edit-card form input[name="start_date"]').val() == "" ? -1:moment($('#userEmployment .edit-card form input[name="start_date"]').val(),'MM-YYYY').valueOf()
        var endDate = $('#userEmployment .edit-card form input[name="end_date"]').val() == "" ? -1:moment($('#userEmployment .edit-card form input[name="end_date"]').val(),'MM-YYYY').valueOf();

        var employmentId = $('#userEmployment .edit-card form input[name="id"]').val();
        var url = employmentId ? '/rest/user/employment/' + employmentId : '/rest/user/employment';
        var method = employmentId ? 'post' : 'put';

        $.ajax({
            url : url,
            type: method,
            data: {
                employment: {
                    title           : $('#userEmployment .edit-card form input[name="title"]').val(),
                    start_date      : startDate,
                    end_date        : endDate,
                    summary         : $('#userEmployment .edit-card form input[name="summary"]').val(),
                    company         : $('#userEmployment .edit-card form input[name="company"]').val(),
                    is_current      : $('#userEmployment .edit-card form select[name="is_current"]').val()
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
        title : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        }
    }
});
