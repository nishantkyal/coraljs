$('select').selectpicker();
$('#phoneNumberSelector').selectpicker($("#phoneNumberSelector").is(":visible") ? 'show' : 'hide');
$('#phoneNumberSelector').selectpicker($("#phoneNumberSelector").is(":visible") ? 'show' : 'hide');

$('#sendPhoneVerificationCode').click(function()
{
    $.ajax({
        url     : '/rest/code/mobile/verification',
        type    : 'post',
        data    : {
            phoneNumber: {
                phone       : $('#phoneNumber').val(),
                country_code: $('#countryCode').val()
            }
        },
        success: function() {
            $('#enterVerificationCodeModal').modal('show');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            bootbox.alert(jqXHR.responseText);
        }
    })
});

$('#phoneNumberSelector').change(function(event)
{
   if ($(event.currentTarget).val() == "-1")
   {
       $('#phoneNumberSelector').selectpicker('hide');
       $('#phoneNumberInput').show();
   }
});

$("#verifyCode").click(function()
{
    $.ajax({
        url     : '/rest/code/mobile/verification',
        type    : 'get',
        dataType: 'json',
        data    : {
            code: $('#enterVerificationCodeModal #verificationCode').val(),
            phoneNumber: {
                phone       : $('#phoneNumber').val(),
                country_code: $('#countryCode').val()
            }
        },
        success : function(data, textStatus, jqXHR)
        {
            $('#phoneNumberSelector').prepend('<option value="' + data.id + '">' + data.phone + '</option>');
            $('#phoneNumberSelector').selectpicker('refresh');
            $('#phoneNumberSelector').selectpicker('show');
            $('#phoneNumberInput').hide();
            $("#enterVerificationCodeModal").modal('hide');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            bootbox.alert(jqXHR.responseText);
        }
    })
});

$('form').validate({
    submitHandler: function(form)
    {
        $.ajax({
            url: '/rest/user/authentication',
            type: 'GET',
            success: function(data, textStatus, jqXHR)
            {
                // If not logged in, stop event propagation and show modal
                if (!data)
                    $('#login-modal').modal('show');
                else
                    form.submit();
            }
        })
    }
});