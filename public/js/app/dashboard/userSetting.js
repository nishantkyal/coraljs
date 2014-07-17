$('#sectionNav li a').click(function(event)
{
    var selectedIndex = $('#sectionNav li a').index($(event.currentTarget));
    $('#sections > .row').hide();
    $('#sections > .row:nth-child(' + (selectedIndex + 1) + ')').show();

    $('#sectionNav li').removeClass('active');
    $(event.currentTarget).parent().addClass('active');
});

/* User Phone Card */
var userPhoneCard = $('#userPhone').card();

$('.editPhoneBtn').click(function(event)
{
    var phoneId = $(event.currentTarget).data('id');
    var phone = _.findWhere(userPhones, {id: phoneId});
    userPhoneCard.edit(phone);
});

$('#userPhone .edit-card form').bootstrapValidator({
    submitHandler: function(validator, form, submitBtn)
    {
        var method = $(submitBtn).attr('name') == 'sendCode' ? 'post' : 'get';

        $.ajax({
            url        : '/rest/code/mobile/verification',
            type       : method,
            dataType   : 'json',
            contentType: 'application/json',
            data       : JSON.stringify({
                code       : $('#userPhone .edit-card form input[name="code"]').val(),
                phoneNumber: {
                    phone       : $('#userPhone .edit-card form input[name="phone"]').val(),
                    country_code: $('#userPhone .edit-card form select[name="country_code"]').val(),
                    id          : $('#userPhone .edit-card form input[name="code"]').attr('id')
                }
            }),
            success    : function()
            {
                $('.update').show();
                $('.sendCode').hide();
                $('#userPhone .edit-card form').data('bootstrapValidator').enableFieldValidators('code', true);
            },
            error      : function(jqXHR, textStatus, errorThrown)
            {
                $('#userPhone .edit-card .alert-danger').show();
                $('#userPhone .edit-card .alert-danger').text(jqXHR.responseText);
            }
        });
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields       : {
        phone: {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                },
                digits  : {
                    message: 'Pleae enter a valid number'
                }
            }
        },
        code : {
            enabled   : false,
            validators: {
                digits      : {
                    message: 'Please enter a valid number'
                },
                stringLength: {
                    max    : 5,
                    min    : 5,
                    message: 'Please enter the code sent to your phone'
                }
            }
        }
    }
});

/* Change Password */
$('form#changePasswordForm').bootstrapValidator({
    submitHandler: function()
    {
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
        })
    },
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
                regexp: { // also used in authenticate.js (create password)
                    regexp: /^(?=.*\d+)(?=.*[@#$%&*-])([a-zA-Z0-9@#$%&*-]{7,})$/,
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
});