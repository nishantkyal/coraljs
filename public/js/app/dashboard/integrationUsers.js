function handleDeleteClicked(event)
{
    var memberId = $(event.currentTarget).attr('data-id');
    $.ajax({
        url    : '/rest/expert/' + memberId,
        type   : 'DELETE',
        success: function()
        {
            location.reload();
        }
    });
};

$('#inviteUserModal form').validate({
    rules         : {
        'first_name': {required: true},
        'last_name' : {required: true},
        'email'     : {required: true, email: true}
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
            url    : '/rest/code/expert/invitation',
            type   : 'POST',
            data   : {
                integration_member: {
                    role          : $('#inviteUserModal [name="role"]').val(),
                    integration_id: integrationId,
                    user          : {
                        email     : $('#inviteUserModal [name="email"]').val(),
                        title     : $('#inviteUserModal [name="title"]').val(),
                        first_name: $('#inviteUserModal [name="first_name"]').val(),
                        last_name : $('#inviteUserModal [name="last_name"]').val()
                    }
                }
            },
            success: function(result)
            {
                $("#inviteUserModal").modal('hide');
                bootbox.alert('Your invitation has been sent. The invited member will receive an email with registration link.', function()
                {
                    location.reload();
                });
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
                $("#inviteUserModal").modal('hide');
                bootbox.alert(jqXHR.responseText);
            }
        });
    }
})

$('.sendAgain').click(function(event)
{
    var emailId = $(event.currentTarget).data('emailid');
    var invitedMember = _.find(members, function(member) {
        return member.user.email == emailId && member.id == null;
    });

    if (invitedMember)
        $.ajax({
            url    : '/rest/code/expert/invitation/resend',
            type   : 'POST',
            data   : {
                integration_member: {
                    role          : invitedMember.role,
                    integration_id: integrationId,
                    user          : {
                        email     : invitedMember.user.email,
                        title     : invitedMember.user.title,
                        first_name: invitedMember.user.first_name,
                        last_name : invitedMember.user.last_name
                    }
                }
            },
            success: function(result)
            {
                $("#inviteUserModal").modal('hide');
                bootbox.alert('Your invitation has been sent. The invited member will receive an email with registration link.');
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
                $("#inviteUserModal").modal('hide');
                bootbox.alert(jqXHR.responseText);
            }
        });

});

$('select').selectpicker();