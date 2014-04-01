$('#sendCode').validate({
    rules         : {
        'phoneNumber': {
            required: true
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
    submitHandler : function()
    {
        $.ajax({
            url     : '/rest/code/mobile/verification',
            type    : 'post',
            dataType: 'json',
            data    : {
                phoneNumber: {
                    phone       : $('#sendCode #phoneNumber').val(),
                    country_code: $('#sendCode #countryCode').val()
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                bootbox.alert(jqXHR.responseText);
            }
        })
    }
});

$('#verifyCode').validate({
    rules         : {
        'verificationCode': {
            required: true
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
    submitHandler : function()
    {
        $.ajax({
            url     : '/rest/code/mobile/verification',
            type    : 'get',
            dataType: 'json',
            data    : {
                code: $('#verifyCode #verificationCode').val(),
                phoneNumber: {
                    phone       : $('#sendCode #phoneNumber').val(),
                    country_code: $('#sendCode #countryCode').val()
                }
            },
            success : function(data, textStatus, jqXHR)
            {
                location.href = '/expert/registration/complete';
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

$('select').selectpicker();