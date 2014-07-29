$(document).on('click', 'form#scheduling ul li div.checkbox', function handleTimeSlotSelected(event)
{
    $(event.currentTarget).addClass('checked');
    $('[name="newSlot"]').val('');
});

$('[name="checkbox"]').on('click', function(){
    $('[name="checkbox"]').removeClass('checked');
});

$('[name="newSlot"]').on('click', function(){
    $('[name="checkbox"]').removeClass('checked');
});

/* Send scheduling details */
$('form#scheduling').bootstrapValidator({
    fields        : {
        'start_time': {
            validators: {
                choice: {
                    min: 1,
                    message: 'Please select one of the available slots or specify an alternate time'
                }
            }
        }
    }
})
    .find('input[name=start_time]')
    .iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green'
    })
    .on('ifChanged', function(e) {
        var field = $(this).attr('name');
        $('form#scheduling').data('bootstrapValidator').resetForm().validate();
    })
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

        $.ajax({
            type: 'post',
            url: $form.action,
            data: {
                startTime: $('form#scheduling input[name=start_time]:checked').val() || moment($('form#scheduling input#newSlot').val()).valueOf(),
                code: $('form#scheduling input[name=code]').val(),
                phoneNumberId: $('form#scheduling input[name=phoneNumberId]').val()
            },
            success: function(result)
            {
                var message;

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
            error: function(error)
            {
                bootbox.alert(error.responseText);
            }
        });
    });

/* Cancel call with a reason */
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
                bootbox.alert('The call has been cancelled as per your request. You may close this window.', function()
                {
                    window.close();
                });
            },
            error: function()
            {
                bootbox.alert('Request failed');
            }
        });
    });
});

/* Send and process verification code */
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
                        $('form#scheduling input[name="phoneNumberId"]').val(result.id);
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

/* Deselect start time radio button if alternate time entered */
$(".datepicker").on("dp.change",function (e)
{
    $('input[name="startTime"]').prop('checked', false);
});

/* Empty startTime input if startTime slot selected */
$('input[name="startTime"]').focus(function()
{
    $('input#startTime').val('');
});

$('.datepicker').datetimepicker({
    sideBySide: true,
    minuteStepping: 15,
    minDate: moment().minutes(moment().minutes() - moment().minutes() % 15).toDate()
});