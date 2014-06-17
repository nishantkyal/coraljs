$('[name="phoneDetailsLink"]').click(function()
{
    if(!$('[name="phoneDetails"]').hasClass('active'))
    {
        $('[name="phoneDetails"]').addClass('active').siblings().removeClass('active');
        $('#changePasswordCard').hide();
        $('#phoneDetails').show();
    }
});

$('[name="editUserPhone"]').click(function()
{
    $('#editUserPhoneCard').show();
    $('#phoneDetails').hide();
});

$('#cancelEditUserPhone').click(function()
{
    $('#phoneDetails').show();
    $('#editUserPhoneCard').hide();
});

$('form#editUserPhoneForm').bootstrapValidator({
    submitHandler : function()
    {
        $.ajax({
            url     : '/rest/code/mobile/verification',
            type    : 'post',
            dataType: 'json',
            data    : {
                phoneNumber: {
                    phone       : $('form#editUserPhoneForm input[name="phoneNumber"]').val(),
                    country_code: $('form#editUserPhoneForm select[name="countryCode"]').val()
                }
            },
            success: function() {
                $('#editUserPhoneCard').hide();
                $('#verifyUserPhoneCard').show();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                bootbox.alert(jqXHR.responseText);
            }
        })
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields         : {
        phoneNumber : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        }
    }
});

$('form#verifyUserPhoneForm').bootstrapValidator({
    submitHandler : function()
    {
        $.ajax({
            url     : '/rest/code/mobile/verification',
            type    : 'get',
            dataType: 'json',
            data    : {
                code: $('form#verifyUserPhoneForm input[name="verificationCode"]').val(),
                phoneNumber: {
                    phone       : $('form#editUserPhoneForm input[name="phoneNumber"]').val(),
                    country_code: $('form#editUserPhoneForm select[name="countryCode"]').val(),
                    id          : $('form#verifyUserPhoneForm input[name="verificationCode"]').attr('id')
                }
            },
            success : function(data, textStatus, jqXHR)
            {
                location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                bootbox.alert(jqXHR.responseText);
            }
        })
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields         : {
        verificationCode : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        }
    }
});

$('#cancelVerifyUserPhone').click(function()
{
    $('#phoneDetails').show();
    $('#verifyUserPhoneCard').hide();
});

$('[name="changePasswordLink"]').click(function()
{
    $('#editUserPhoneCard').hide();
    $('#phoneDetails').hide();
    $('#verifyUserPhoneCard').hide();
    $('#changePasswordCard').show();

    $('[name="changePassword"]').addClass('active').siblings().removeClass('active');

    $('form#changePasswordForm').trigger('reset');
    $('form#changePasswordForm').data('bootstrapValidator').resetForm();
});

$('#cancelChangePassword').click(function()
{
    $('#phoneDetails').show();
    $('#changePasswordCard').hide();
});

$('form#changePasswordForm').bootstrapValidator({
    submitHandler : function()
    {
        $.ajax({
            url : '/rest/user/' + user.id,
            type: 'post',
            data: {
                oldPass: $('form#changePasswordForm input[name="oldPassword"]').val(),
                pass: $('form#changePasswordForm input[name="newPassword"]').val(),
                user: user
            },
            success: function(res)
            {
                bootbox.alert(res, function(){
                    location.reload();
                });
            },
            error: function(error)
            {
                bootbox.alert(error.responseText, function(){
                    location.reload();
                });
            }
        })
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields         : {
        oldPassword : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        newPassword : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        confirmPassword : {
            validators: {
                identical: {
                    field: 'newPassword',
                    message: 'Please re-enter same password'
                }
            }
        }
    }
});