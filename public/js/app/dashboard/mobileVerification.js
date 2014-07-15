$('form#sendCode').bootstrapValidator({
    fields         : {
        'phone': {
            validators: {
                notEmpty: {message: "This is a required field"},
                digits: {message: "Please enter a valid number"}
            }
        }
    },
    submitHandler : function()
    {
        $.ajax({
            url     : '/rest/code/mobile/verification',
            type    : 'post',
            dataType: 'json',
            data    : {
                phoneNumber: {
                    phone       : $('#sendCode input[name=phone]').val(),
                    country_code: $('#sendCode select[name=country_code]').val()
                }
            },
            success: function() {
                $('#sendCode input[type="submit"]').hide();
                $('#verifyCode').show();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                bootbox.alert(jqXHR.responseText);
            }
        })
    }
});

$('form#verifyCode').bootstrapValidator({
    fields: {
        'code': {
            validators: {
                notEmpty: {message: "This is a required field"},
                digits: {message: "Please enter a valid number"}
            }
        }
    },
    submitHandler : function()
    {
        $.ajax({
            url     : '/rest/code/mobile/verification',
            type    : 'get',
            dataType: 'json',
            data    : {
                code: $('#verifyCode #verificationCode').val(),
                phoneNumber: {
                    phone       : $('#sendCode input[name=phone]').val(),
                    country_code: $('#sendCode select[name=country_code]').val()
                }
            },
            success : function(data, textStatus, jqXHR)
            {
                location.href = '/member/registration/complete';
            },
            error: function(jqXHR, textStatus, errorThrown) {
                bootbox.alert(jqXHR.responseText);
            }
        })
    }
});

$('#sendCode #phoneNumber').keydown(function()
{
    // Change form to send verification code
    $('#sendCode input[type="submit"]').show();
    $('#verifyCode').hide();
});

$('#sendCode #countryCode').change(function()
{
    // Change form to send verification code
    $('#sendCode input[type="submit"]').show();
    $('#verifyCode').hide();
});