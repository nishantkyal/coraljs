$.validator.addMethod("greaterThanStartYear",
    function(value, element, params)
    {
        return value > params;
    },'EndYear Must be greater then Start Year');

$('.editUserEducation').click(function()
{
    var selectedUserEducation;
    var userEducationId = $(this).data('id');
    for(var i = 0; i<userEducation.length; i++)
        if(userEducation[i].id == userEducationId)
            selectedUserEducation = userEducation[i];
    if (selectedUserEducation) {
        $('#EditUserEducationModal .btn-primary').attr('data-id', selectedUserEducation.id);
        $('#EditUserEducationModal [name="school_name"]').val(selectedUserEducation.school_name);
        $('#EditUserEducationModal [name="field_of_study"]').val(selectedUserEducation.field_of_study);
        $('#EditUserEducationModal [name="activities"]').val(selectedUserEducation.activities);
        $('#EditUserEducationModal [name="degree"]').val(selectedUserEducation.degree);
        $('#EditUserEducationModal [name="description"]').val(selectedUserEducation.notes);
        $('#EditUserEducationModal #start_year').selectpicker('val', selectedUserEducation.start_year);
        $('#EditUserEducationModal #end_year').selectpicker('val', selectedUserEducation.end_year);
    }
});

$('.deleteUserEducation').click(function()
{
    var memberEducationId = $(this).data('id');
    $('#DeleteUserEducationModal .btn-primary').attr('data-id', memberEducationId);
});

$('#AddUserEducationModal form').validate({
    rules         : {
        school_name : { required: true},
        end_year    : { greaterThanStartYear:$('#AddUserEducationModal form #start_year').val()}
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
        $.ajax({
            url : '/rest/user/education',
            type: 'put',
            data: {
                education: {
                    school_name     : $('#AddUserEducationModal form #school_name').val(),
                    start_year      : $('#AddUserEducationModal form #start_year').val(),
                    end_year        : $('#AddUserEducationModal form #end_year').val(),
                    degree          : $('#AddUserEducationModal form #degree').val(),
                    field_of_study  : $('#AddUserEducationModal form #field_of_study').val(),
                    activities      : $('#AddUserEducationModal form #activities').val(),
                    notes           : $('#AddUserEducationModal form #description').val()
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

$('#EditUserEducationModal form').validate({
    rules         : {
        school_name : { required: true}
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
        var educationId = $('#EditUserEducationModal form .btn-primary').attr('data-id');
        $.ajax({
            url : '/rest/user/education/' + educationId,
            type: 'post',
            data: {
                education: {
                    school_name     : $('#EditUserEducationModal form #school_name').val(),
                    start_year      : $('#EditUserEducationModal form #start_year').val(),
                    end_year        : $('#EditUserEducationModal form #end_year').val(),
                    degree          : $('#EditUserEducationModal form #degree').val(),
                    field_of_study  : $('#EditUserEducationModal form #field_of_study').val(),
                    activities      : $('#EditUserEducationModal form #activities').val(),
                    notes           : $('#EditUserEducationModal form #description').val()
                }
            },
            success: function()
            {
                location.reload();
            }
        })
    }
});

function handleEducationDeleteClicked(event)
{
    var educationId = $(event.currentTarget).attr('data-id');
    $.ajax({
        url    : '/rest/user/education/' + educationId,
        type   : 'DELETE',
        data: {
                id              : educationId,
            profileId           : profileId
        },
        success: function()
        {
            location.reload();
        }
    });
};

$('select').selectpicker();