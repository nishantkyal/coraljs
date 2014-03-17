function handleSendVerificationCodeClicked()
{
    $.post('/register/mobile', {mobile: $('#mobile').val(), countryCode: $('#countryCode').val()}, function(data, a, xhr) {
        var codeRef = data;
        bootbox.prompt('Please enter the verification code sent to your mobile', function(result) {
            if (result != null)
                verifyMobileCode(result, codeRef);
        });
    });
}
function verifyMobileCode(code, codeRef)
{
    $.get('/register/mobile/verification', {code: code, ref: codeRef}, function(data) {

    });
};

$('select').selectpicker();