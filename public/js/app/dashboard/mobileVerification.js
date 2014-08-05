$('form#sendCode').bootstrapValidator({
    fields         : {
        'phone': {
            validators: {
                notEmpty: {message: "This is a required field"},
                digits: {message: "Phone number can only contain digits"}
            }
        },
        'area_code': {
            validators: {
                digits: {message: "Area code can only contain digits"}
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
            url     : '/rest/code/mobile/verification',
            type    : 'post',
            dataType: 'json',
            data    : {
                phoneNumber: {
                    phone       : $('#sendCode input[name=phone]').val(),
                    area_code   : $('#sendCode input[name=area_code]').val(),
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
    });

$('form#verifyCode').bootstrapValidator({
    fields: {
        'code': {
            validators: {
                notEmpty: {message: "This is a required field"},
                digits: {message: "Please enter a valid number"}
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
        });
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