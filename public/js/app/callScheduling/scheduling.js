$('form#scheduling').validate({
    ignore: "",
    rules        : {
        'phoneId': {
            required: true
        },
        'startTime': {
            required: function(element) {
                return $("form#scheduling input[name='startTime']").val() == null;
            }
        },
        'startTimeInput': {
            required: function(element) {
                return $("form#scheduling input#startTime").val().trim().length == 0;
            }
        }
    },
    submitHandler: function(form)
    {
        $.ajax({
            type: 'post',
            url: form.action,
            data: {
                startTime: $('form#scheduling input#startTime').val() || $('form#scheduling input[name="startTime"]').val(),
                code: $('form#scheduling input[name="code"]').val(),
                phoneId: $('form#scheduling input[name="phoneId"]').val()
            },
            success: function(result)
            {
                var message = 'Done';

                switch(result)
                {
                    case "3":
                        message = "The call has been scheduled and we've sent you an email with the details. You may close this window now";
                        break;
                    case "2":
                        message = "We've communicated your preferences to the other party and will keep you posted. You may close this window now";
                        break;
                }
                bootbox.alert(message, function()
                {
                    window.close();
                });
            },
            error: function()
            {
                bootbox.alert('Request failed. Please click on the link in the email and try again');
            }
        });
    }
});

$('#reject-call').click(function()
{
    bootbox.prompt('Please tell us why you want to reject this call so we can inform the caller.', function(reason)
    {
        $.ajax({
            type: 'post',
            url: '/rest/call/' + callId + '/scheduling',
            data: {
                code: code,
                reason: reason
            },
            dataType: 'json',
            success: function()
            {

            },
            error: function()
            {

            }
        });
    });
});

$('#verify-btn').click(function()
{
    var phone = $('#phone').val();
    var country_code = $('#country_code').val();

    $.ajax({
        url: '/rest/code/mobile/verification',
        type: 'post',
        data: {
            phoneNumber: {
                phone: phone,
                country_code: country_code
            }
        },
        dataType: 'json',
        success: function()
        {
            bootbox.prompt('Please enter the verification code sent to your mobile', function(code)
            {
                $.ajax({
                    url: '/rest/code/mobile/verification',
                    type: 'get',
                    data: {
                        phone: phone,
                        country_code: country_code,
                        code: code
                    },
                    dataType: 'json',
                    success: function(result)
                    {
                        $('form#scheduling input[name="phoneId"]').val(result.id);
                    },
                    error: function()
                    {

                    }
                })
            });
        },
        error: function()
        {
            bootbox.alert('Sending verification code to your mobile failed. Please check the number and try again.')
        }
    })
});

$('input#startTime').keydown(function(event)
{
    $('input[name="startTime"]').removeAttr('checked');
});

$('input[name="startTime"]').focus(function()
{
    $('input#startTime').val('');
});