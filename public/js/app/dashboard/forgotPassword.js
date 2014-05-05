$('#request-new-password').click(function()
{
    $.ajax({
        url: '/rest/code/password/forgot',
        type: 'POST',
        data: {
            email: $('#email').val()
        },
        success: function()
        {
            bootbox.alert("You'll receive an email on the mentioned address. Please click the link in the email to choose a new password.");
        }
    })
});

$('#reset-password').click(function()
{
    $.ajax({
        url: '/rest/code/password/reset',
        type: 'POST',
        data: {
            code: code,
            pass: $('#password').val()
        },
        success: function()
        {
            bootbox.dialog({
                message: "Your password has been updated.",
                title: "Success",
                buttons: {
                    success: {
                        label: "Login with new password",
                        className: "btn-success",
                        callback: function() {
                            location.href = '/login';
                        }
                    }
                }
            });
        },
        error: function()
        {

        }
    })
});