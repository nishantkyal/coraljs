$('form#request-new-password').validate({
        submitHandler: function()
        {
            $.ajax({
                url    : '/rest/code/password/forgot',
                type   : 'POST',
                data   : {
                    email: $('#email').val()
                },
                success: function()
                {
                    bootbox.alert("You'll receive an email on the mentioned address. Please click the link in the email to choose a new password.");
                }
            })
        }
    });

$('form#reset-password').validate(
    {
        rules: {
            password: {
                required: true
            },
            confirm_password: {
                required: true,
                equalTo: '#password'
            }
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
        submitHandler: function()
        {
            $.ajax({
                url    : '/rest/code/password/reset',
                type   : 'POST',
                data   : {
                    code: code,
                    pass: $('#password').val()
                },
                success: function()
                {
                    bootbox.dialog({
                        message: "Your password has been updated.",
                        title  : "Success",
                        buttons: {
                            success: {
                                label    : "Login with new password",
                                className: "btn-success",
                                callback : function()
                                {
                                    location.href = '/login';
                                }
                            }
                        }
                    });
                },
                error  : function(jqXHR, textStatus, errorThrown)
                {
                    bootbox.alert('Update password failed. Please try again later.');
                }
            })
        }
    }
);