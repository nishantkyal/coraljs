$('form#changePasswordForm').bootstrapValidator({
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields       : {
        oldPassword    : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        newPassword    : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                },
                regexp  : { // also used in authenticate.js (create password)
                    regexp : /^(?=.*\d+)(?=.*[@#$%&*-])([a-zA-Z0-9@#$%&*-]{7,})$/,
                    message: 'Password must have 8 or more characters, contain a digit(0-9) and a special character(@,#,$,%,&,- or *).'
                }
            }
        },
        confirmPassword: {
            validators: {
                identical: {
                    field  : 'newPassword',
                    message: 'Please re-enter same password'
                }
            }
        }
    }
})
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

        $.ajax({
            url    : '/rest/user/' + user.id,
            type   : 'post',
            data   : {
                oldPass: $('form#changePasswordForm input[name="oldPassword"]').val(),
                pass   : $('form#changePasswordForm input[name="newPassword"]').val(),
                user   : user
            },
            success: function(res)
            {
                bootbox.alert(res, function()
                {
                    location.reload();
                });
            },
            error  : function(error)
            {
                $('form#changePasswordForm .alert').show();
                $('form#changePasswordForm .alert').text(error.responseText);
            }
        });
    });