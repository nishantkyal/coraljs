$('.datepicker').datepicker({
    format: 'mm-yyyy',
    viewMode:1,
    minViewMode:1,
    autoclose: true,
    endDate: '0'
});

$('#AddUserEmploymentModal form').validate({
    rules         : {
        title : { required: true}
    },
    errorPlacement: function(error, element)
    {
        $(element).attr('title', error[0].innerHTML);
        $(element).tooltip('show');
    },
    highlight     : function(element)
    {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight   : function(element)
    {
        $(element).closest('.form-group').removeClass('has-error');
    },
    submitHandler : function()
    {
        var startDate = $('#AddUserEmploymentModal form #start_date').val() == "" ? -1:moment($('#EditUserEmploymentModal form #start_date').val(),'MM-YYYY').valueOf()
        var endDate = $('#AddUserEmploymentModal form #end_date').val() == "" ? -1:moment($('#EditUserEmploymentModal form #end_date').val(),'MM-YYYY').valueOf();

        $.ajax({
            url : '/rest/user/employment',
            type: 'put',
            data: {
                employment: {
                    title           : $('#AddUserEmploymentModal form #title').val(),
                    start_date      : startDate,
                    end_date        : endDate,
                    summary         : $('#AddUserEmploymentModal form #summary').val(),
                    company         : $('#AddUserEmploymentModal form #company').val(),
                    is_current      : $('#AddUserEmploymentModal form #is_current').val()
                },
                profileId           : profileId
            },
            success: function()
            {
                location.reload();
            }
        })
    }
});

$('.editUserEmployment').click(function()
{
    var selectedUserEmployment;
    var userEmploymentId = $(this).data('id');
    for(var i = 0; i<userEmployment.length; i++)
        if(userEmployment[i].id == userEmploymentId)
            selectedUserEmployment = userEmployment[i];
    if (selectedUserEmployment) {
        if(selectedUserEmployment.start_date && selectedUserEmployment.start_date !=-1 )
        {
            var startDate = new Date(selectedUserEmployment.start_date);
            var startDatePicker = startDate.getMonth()+1 + '-' + startDate.getFullYear();
            $('#EditUserEmploymentModal #start_date').datepicker('update', startDatePicker);
        }

        if(selectedUserEmployment.end_date && selectedUserEmployment.end_date != -1)
        {
            var endDate = new Date(selectedUserEmployment.end_date);
            var endDatePicker = endDate.getMonth()+1 + '-' + endDate.getFullYear();
            $('#EditUserEmploymentModal #end_date').datepicker('update', endDatePicker);
        }

        selectedUserEmployment = unEscapeObject(selectedUserEmployment);
        $('#EditUserEmploymentModal .btn-primary').attr('data-id', selectedUserEmployment.id);
        $('#EditUserEmploymentModal [name="title"]').val(selectedUserEmployment.title);
        $('#EditUserEmploymentModal [name="summary"]').val(selectedUserEmployment.summary);
        $('#EditUserEmploymentModal [name="company"]').val(selectedUserEmployment.company);
        $('#EditUserEmploymentModal #is_current').selectpicker('val', selectedUserEmployment.is_current);
    }
});

$('#EditUserEmploymentModal form').validate({
    rules         : {
        title : { required: true}
    },
    errorPlacement: function(error, element)
    {
        $(element).attr('title', error[0].innerHTML);
        $(element).tooltip('show');
    },
    highlight     : function(element)
    {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight   : function(element)
    {
        $(element).closest('.form-group').removeClass('has-error');
    },
    submitHandler : function()
    {
        var employmentId = $('#EditUserEmploymentModal form .btn-primary').attr('data-id');
        var startDate = $('#EditUserEmploymentModal form #start_date').val() == "" ? -1:moment($('#EditUserEmploymentModal form #start_date').val(),'MM-YYYY').valueOf()
        var endDate = $('#EditUserEmploymentModal form #end_date').val() == "" ? -1:moment($('#EditUserEmploymentModal form #end_date').val(),'MM-YYYY').valueOf();

        $.ajax({
            url : '/rest/user/employment/' + employmentId,
            type: 'post',
            data: {
                employment: {
                    title           : $('#EditUserEmploymentModal form #title').val(),
                    start_date      : startDate,
                    end_date        : endDate,
                    summary         : $('#EditUserEmploymentModal form #summary').val(),
                    company         : $('#EditUserEmploymentModal form #company').val(),
                    is_current      : $('#EditUserEmploymentModal form #is_current').val()
                }
            },
            success: function()
            {
                location.reload();
            }
        })
    }
});

$('.deleteUserEmployment').click(function()
{
    var memberEmploymentId = $(this).data('id');
    $('#DeleteUserEmploymentModal .btn-primary').attr('data-id', memberEmploymentId);
});

function handleEmploymentDeleteClicked(event)
{
    var employmentId = $(event.currentTarget).attr('data-id');
    $.ajax({
        url    : '/rest/user/employment/' + employmentId,
        type   : 'DELETE',
        data: {
            id              : employmentId,
            profileId           : profileId
        },
        success: function()
        {
            location.reload();
        }
    });
};
