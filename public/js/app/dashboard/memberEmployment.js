$('#addEmploymentbtn').click(function()
{
    $('#AddUserEmploymentCard').show();
    $('#employmentDetails').hide();

    $('form#AddUserEmploymentForm').trigger('reset');
    $('form#AddUserEmploymentForm .alert').hide();
    $('form#AddUserEmploymentForm').data('bootstrapValidator').resetForm();
});

$('#cancelAddUserEmployment').click(function()
{
    $('#employmentDetails').show();
    $('#AddUserEmploymentCard').hide();
});

$('[name="editUserEmployment"]').click(function()
{
    $('#AddUserEmploymentCard').show();
    $('#employmentDetails').hide();

    var employmentId = $(this).data('id');
    var employment = _.findWhere(userEmployment, {id: employmentId});

    populate($('form#AddUserEmploymentForm'), unEscapeObject(employment));
});

$('[name="deleteUserEmployment"]').click(function()
{
    var employmentId = $(this).data('id');
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
});

$('.datepicker').datetimepicker();

$('form#AddUserEmploymentForm').bootstrapValidator({
    submitHandler : function()
    {
        var startDate = $('form#AddUserEmploymentForm input[name="start_date"]').val() == "" ? -1:moment($('form#AddUserEmploymentForm input[name="start_date"]').val(),'MM/YYYY').valueOf()
        var endDate = $('form#AddUserEmploymentForm input[name="end_date"]').val() == "" ? -1:moment($('form#AddUserEmploymentForm input[name="end_date"]').val(),'MM/YYYY').valueOf();

        var employmentId = $('form#AddUserEmploymentForm input[name="id"]').val();
        var url = employmentId ? '/rest/user/employment/' + employmentId : '/rest/user/employment';
        var method = employmentId ? 'post' : 'put';
        
        $.ajax({
            url : url,
            type: method,
            data: {
                employment: {
                    title           : $('form#AddUserEmploymentForm input[name="title"]').val(),
                    start_date      : startDate,
                    end_date        : endDate,
                    summary         : $('form#AddUserEmploymentForm input[name="summary"]').val(),
                    company         : $('form#AddUserEmploymentForm input[name="company"]').val(),
                    is_current      : $('form#AddUserEmploymentForm input[name="is_current"]').val()
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
