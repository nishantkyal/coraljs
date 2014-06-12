$('#inviteMemberBtn').click(function()
{
    $('#inviteMemberCard').show();
    $('#members').hide();

    $('form#inviteUser').trigger('reset');
    $('form#inviteUser .alert').hide();
    $('form#inviteUser').data('bootstrapValidator').resetForm();
});

$('form#inviteUser').bootstrapValidator({
    message      : 'This value is not valid',
    submitHandler: function(form)
    {
        $.ajax({
            url    : '/rest/code/expert/invitation',
            type   : 'POST',
            data   : {
                integration_member: {
                    role          : $('form#inviteUser [name="role"]').val(),
                    integration_id: integrationId,
                    user          : {
                        email     : $('form#inviteUser [name="email"]').val(),
                        title     : $('form#inviteUser [name="title"]').val(),
                        first_name: $('form#inviteUser [name="first_name"]').val(),
                        last_name : $('form#inviteUser [name="last_name"]').val()
                    }
                }
            },
            success: function(result)
            {
                bootbox.alert('Your invitation has been sent. The invited member will receive an email with registration link.', function()
                {
                    location.reload();
                });
            },
            error  : function(jqXHR, textStatus, errorThrown)
            {
                $('form#inviteUser .alert').show();
                $('form#inviteUser .alert').text(jqXHR.responseText);
            }
        });
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields       : {
        first_name: {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        last_name : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        email     : {
            validators: {
                notEmpty    : {
                    message: 'The email is required and cannot be empty'
                },
                emailAddress: {
                    message: 'The input is not a valid email address'
                }
            }
        }
    }
});

$('#cancelInvite').click(function()
{
    $('#inviteMemberCard').hide();
    $('#members').show();
});