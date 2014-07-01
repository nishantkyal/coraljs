setCookie('offset', -new Date().getTimezoneOffset() * 60);

$("#login-form").bootstrapValidator({
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields         : {
        username : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                },
                emailAddress: {
                    message: 'This field should be a valid Email Address'
                }
            }
        },
        login_password : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        }
    }
});

$("#registration-form").bootstrapValidator({
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields         : {
        email : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                },
                emailAddress: {
                    message: 'This field should be a valid Email Address'
                }
            }
        },
        first_name : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        password: {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
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
});