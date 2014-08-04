var userPhoneCard = $('#userPhone').card();

$(function(){
    $('#userPhone .edit-card form .resendCode').hide();
});

$('.editPhoneBtn').click(function(event)
{
    var phoneId = $(event.currentTarget).data('id');
    var phone = _.findWhere(userPhones, {id: phoneId});
    userPhoneCard.edit(phone);
});

$('#userPhone .edit-card form').bootstrapValidator({
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields       : {
        phone    : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                },
                digits  : { message: 'Phone number can only contain digit' }
            }
        },
        area_code: {
            validators: {
                digits: {message: 'Area code can only contain digit'}
            }
        },
        code     : {
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
})
    .on('success.form.bv', function(e)
    {
        // Prevent form submission
        e.preventDefault();

        var $form = $(e.target),
            validator = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

        var method = $(submitButton).attr('name') == 'sendCode' ? 'post' : 'get';
        var url = '/rest/code/mobile/verification';

        if(method == 'post')
            $('#userPhone .edit-card form .resendCode').show();

        if($(submitButton).attr('name') == 'resendCode')
        {
            method = 'post';
            url = '/rest/code/mobile/verification/resend';
        }

        $.ajax({
            url     : url,
            type    : method,
            dataType: 'json',
            data    : {
                code       : $('#userPhone .edit-card form input[name="code"]').val(),
                phoneNumber: {
                    phone       : $('#userPhone .edit-card form input[name="phone"]').val(),
                    country_code: $('#userPhone .edit-card form select[name="country_code"]').val(),
                    area_code   : $('#userPhone .edit-card form input[name="country_code"]').val(),
                    id          : $('#userPhone .edit-card form input[name="id"]').attr('id')
                }
            },
            success : function()
            {
                if (method == 'post') {
                    if($(submitButton).attr('name') != 'resendCode')
                    {
                        $('.update').show();
                        $('.resendCode').show();
                        $('.sendCode').hide();
                        $('#userPhone .edit-card form').data('bootstrapValidator').enableFieldValidators('code', true);
                    }
                    else
                    bootbox.alert('Verification Code Resent.', function(){
                        $('.resendCode').hide();
                    })
                }
                else {
                    location.reload();
                }
            },
            error   : function(jqXHR, textStatus, errorThrown)
            {
                $('#userPhone .edit-card .alert-danger').show();
                $('#userPhone .edit-card .alert-danger').text(jqXHR.responseText);
            }
        });
    });

$('#userPhone .edit-card form input[name=phone],select[name=country_code]').change(function()
{
    $('#userPhone .edit-card form .update').hide();
    $('#userPhone .edit-card form .resendCode').hide();
    $('#userPhone .edit-card form .sendCode').show();
});