var userPhoneCard = $('#userPhone').card();

$('.editPhoneBtn').click(function(event)
{
    var phoneId = $(event.currentTarget).data('id');
    var phone = _.findWhere(userPhones, {id: phoneId});
    userPhoneCard.edit(phone);
});

$('#userPhone .edit-card form').bootstrapValidator({
    submitHandler: function(validator, form, submitBtn)
    {
        var method = $(submitBtn).attr('name') == 'sendCode' ? 'post' : 'get';

        $.ajax({
            url     : '/rest/code/mobile/verification',
            type    : method,
            dataType: 'json',
            data    : {
                code       : $('#userPhone .edit-card form input[name="code"]').val(),
                phoneNumber: {
                    phone       : $('#userPhone .edit-card form input[name="phone"]').val(),
                    country_code: $('#userPhone .edit-card form select[name="country_code"]').val(),
                    id          : $('#userPhone .edit-card form input[name="id"]').attr('id')
                }
            },
            success : function()
            {
                if (method == 'post') {
                    $('.update').show();
                    $('.sendCode').hide();
                    $('#userPhone .edit-card form').data('bootstrapValidator').enableFieldValidators('code', true);
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
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields       : {
        phone: {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                },
                digits  : {
                    message: 'Please enter a valid number'
                }
            }
        },
        code : {
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
});

$('#userPhone .edit-card form input[name=phone],select[name=country_code]').change(function()
{
    $('#userPhone .edit-card form .update').hide();
    $('#userPhone .edit-card form .sendCode').show();
});