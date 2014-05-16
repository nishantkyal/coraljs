$('select').selectpicker();
$('#phoneNumberSelector').selectpicker($("#phoneNumberSelector").is(":visible") ? 'show' : 'hide');
$('#phoneNumberSelector').selectpicker($("#phoneNumberSelector").is(":visible") ? 'show' : 'hide');

$('#sendPhoneVerificationCode').click(function()
{
    $.ajax({
        url    : '/rest/code/mobile/verification',
        type   : 'post',
        data   : {
            phoneNumber: {
                phone       : $('#phoneNumber').val(),
                country_code: $('#countryCode').val()
            }
        },
        success: function()
        {
            $('#enterVerificationCodeModal').modal('show');
        },
        error  : function(jqXHR, textStatus, errorThrown)
        {
            bootbox.alert(jqXHR.responseText);
        }
    })
});

$('#phoneNumberSelector').change(function(event)
{
    if ($(event.currentTarget).val() == "-1") {
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
            code       : $('#enterVerificationCodeModal #verificationCode').val(),
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
        error   : function(jqXHR, textStatus, errorThrown)
        {
            bootbox.alert(jqXHR.responseText);
        }
    })
});

// Make user login before applying coupon or checking out
var loginContext;

$('form#couponForm,form#checkout').submit(function(event)
{
    if (!loginContext || loginContext != $(event.currentTarget).attr('id')) {
        loginContext = $(event.currentTarget).attr('id');
        event.preventDefault();

        $.ajax({
            url    : '/rest/user/authentication',
            type   : 'GET',
            success: function(data, textStatus, jqXHR)
            {
                // If not logged in, stop event propagation and show modal
                if (!data) {
                    $('#login-modal').modal('show');
                }
                else {
                    $(event.currentTarget).submit();
                }
            }
        });
    }
});

/* Login handler */
$('#login-button').click(function()
{
    $.ajax({
        url        : '/login',
        type       : 'post',
        dataType   : 'json',
        contentType: 'application/json',
        async      : false,
        data       : JSON.stringify({
            username: $('#authentication input[name="username"]').val(),
            password: $('#authentication input[name="password"]').val()
        }),
        success    : function()
        {
            if (loginContext)
                $('form#' + loginContext).submit();
        },
        error      : function(jqXhr, textStatus, response)
        {
            $('#login-modal .alert').show();
            $('#login-modal .alert').text('Login Failed');
        }
    })
});

/* Registration handler */
$('#register-button').click(function()
{
    $.ajax({
        url        : '/register',
        type       : 'post',
        dataType   : 'json',
        contentType: 'application/json',
        async      : false,
        data       : JSON.stringify({
            email      : $('#authentication input[name="username"]').val(),
            password   : $('#authentication input[name="password"]').val(),
            first_name : $('#authentication input[name="first_name"]').val(),
            last_name  : $('#authentication input[name="last_name"]').val(),
            middle_name: $('#authentication input[name="middle_name"]').val()
        }),
        success    : function()
        {
            if (loginContext)
                $('form#' + loginContext).submit();
        },
        error      : function(jqXhr, textStatus, response)
        {
            $('#login-modal .alert').show();
            $('#login-modal .alert').text('Registration Failed');
        }
    })
});

/* Switch login/register UI */
$('#register-link,#login-link').click(function(event)
{
    $('.register').toggle($(event.currentTarget).attr('id') == 'register-link');
    $('.login').toggle($(event.currentTarget).attr('id') == 'login-link');
});