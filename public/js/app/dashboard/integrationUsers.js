$('.save').click(function()
{
    var memberId = $(this).data('id');
    var selectedMember = _.findWhere(members, {id: memberId});

    if (selectedMember) {
        var user = selectedMember.user;
        $('#editUserModal .btn-primary').attr('data-id', selectedMember.id);
        $('#editUserModal [name="first_name"]').val(user.first_name);
        $('#editUserModal [name="last_name"]').val(user.last_name);
        $('#editUserModal [name="revenue_share"]').val(selectedMember.revenue_share);
        $('#editUserModal #revenueShareUnit').selectpicker('val', selectedMember.revenue_share_unit);
        $('#editUserModal #role option:contains(' + selectedMember.role + ')').attr('selected', true);
        $('#editUserModal #role').selectpicker('render');
    }
});

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

function handleSaveClicked(event)
{
    var memberId = parseInt($(event.currentTarget).attr('data-id'));
    var selectedMember = _.findWhere(members, {id: memberId});

    var expert = {
        'revenue_share_unit': $('#editUserModal #revenueShareUnit').val(),
        'revenue_share'     : $('#editUserModal [name="revenue_share"]').val(),
        'role'              : $('#editUserModal #role').val()
    };

    var user = {
        'first_name': $('#editUserModal [name="first_name"]').val(),
        'last_name' : $('#editUserModal [name="last_name"]').val()
    };

    $.ajax({
        url     : "/rest/expert/" + memberId,
        type    : 'post',
        data    : {'expert': expert},
        dataType: 'json',
        success : function(data)
        {
            $.ajax({
                url     : '/rest/user/' + selectedMember.user_id,
                type    : 'post',
                data    : {'user': user},
                dataType: 'json',
                success : function(data)
                {
                    location.reload();
                },
                error   : function()
                {
                    bootbox.hideAll();
                    bootbox.alert('An error occurred while updating user details');
                }
            });
        },
        error   : function()
        {
            bootbox.hideAll();
            bootbox.alert('An error occurred while updating user details');
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
            type   : 'PUT',
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
        })
    }
})

$('select').selectpicker();