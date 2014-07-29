$('form#request-new-password').bootstrapValidator()
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

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
        });
    });

$('form#reset-password').bootstrapValidator(
    {
        fields: {
            password: {
                validators: {
                    notEmpty: {
                        message: 'This is a required field'
                    }
                }
            },
            confirm_password: {
                validators: {
                    identical: {
                        field:'password',
                        message:'Please re-enter same password'
                    },
                    notEmpty: {
                        message: 'This field is required and cannot be empty'
                    }
                }
            }
        }
    }
)
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

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
        });
    });