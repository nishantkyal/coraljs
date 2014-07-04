var cards = ['#schedule','#scheduleDetails','#pricing','#password','#phone','#editUserPhoneCard','#verifyUserPhoneCard','#widget', '#createWidget'];

function showAndHideCards(cardsToShow)
{
    _.each(cardsToShow, function(showCard) { $(showCard).show(); })

    var temp = _.filter(cards, function(hideCard)
    {
        return _.find(cardsToShow, function(showCard) { return hideCard == showCard; }) ? false : true;
    });

    _.each(temp,
        function(card)
        {
            $(card).hide();
        })
}

$(function()
{
    showAndHideCards(['#' + selectedTab]);
})

$('[name="phoneDetailsLink"]').click(function()
{
    if (!$('[name="phoneDetailsLink"]').hasClass('active')) {
        $('[name="phoneDetailsLink"]').addClass('active').siblings().removeClass('active');
        showAndHideCards(['#phone'])
    }
});

$('[name="scheduleAndPricingLink"]').click(function()
{
    if (!$('[name="scheduleAndPricingLink"]').hasClass('active')) {
        $('[name="scheduleAndPricingLink"]').addClass('active').siblings().removeClass('active');
        showAndHideCards(['#schedule', '#pricing']);
    }
});

$('[name="changePasswordLink"]').click(function()
{
    showAndHideCards(['#password']);
    $('[name="changePasswordLink"]').addClass('active').siblings().removeClass('active');

    $('form#changePasswordForm').trigger('reset');
    $('form#changePasswordForm').data('bootstrapValidator').resetForm();
});

$('[name="widgetLink"]').click(function()
{
    showAndHideCards(['#widget']);
    $('[name="widgetLink"]').addClass('active').siblings().removeClass('active');
});

$('#cancelEditUserPhone').click(function()
{
    $('#phone').show();
    $('#userPhoneDetailsCard').hide();
});

$('#cancelVerifyUserPhone').click(function()
{
    $('#phone').show();
    $('#verifyUserPhoneCard').hide();
});

$('#cancelChangePassword').click(function()
{
    $('#phone').show();
    $('[name="phoneDetailsLink"]').addClass('active').siblings().removeClass('active');
    $('#password').hide();
});

$('#addUserPhone').click(function()
{
    $('#userPhoneDetailsCard').show();
    $('#phone').hide();
});

$('.editUserPhone').click(function(event)
{
    var phoneId = $(event.currentTarget).data('id');
    var phone = _.findWhere(userPhones, {id: phoneId});

    populate('#userPhoneDetailsCard form', phone);
    $('#userPhoneDetailsCard').show();
    $('#phone').hide();
});

$('[name="createWidget"]').click(function()
{
    $('#widget').hide();
    $('form#createWidgetForm').data('bootstrapValidator').resetForm();
    $('#createWidget').show();
});

$('#cancelCreateWidget').click(function()
{
    $('#widget').show();
    $('#createWidget').hide();
});

$('#userPhoneDetailsCard form').bootstrapValidator({
    submitHandler: function(validator, form, submitBtn)
    {
        var method = $(submitBtn).attr('name') == 'sendCode' ? 'post' : 'get';

        $.ajax({
            url        : '/rest/code/mobile/verification',
            type       : method,
            dataType   : 'json',
            contentType: 'application/json',
            data       : JSON.stringify({
                code       : $('#userPhoneDetailsCard form input[name="code"]').val(),
                phoneNumber: {
                    phone       : $('#userPhoneDetailsCard form input[name="phone"]').val(),
                    country_code: $('#userPhoneDetailsCard form select[name="country_code"]').val(),
                    id          : $('#userPhoneDetailsCard form input[name="code"]').attr('id')
                }
            }),
            success    : function()
            {
                $('.update').show();
                $('.sendCode').hide();
                $('#userPhoneDetailsCard form').data('bootstrapValidator').enableFieldValidators('code', true);
            },
            error      : function(jqXHR, textStatus, errorThrown)
            {
                $('.card#userPhoneDetailsCard .alert-danger').text(jqXHR.responseText);
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
                    message: 'Pleae enter a valid number'
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

$('form#changePasswordForm').bootstrapValidator({
    submitHandler: function()
    {
        $.ajax({
            url    : '/rest/user/' + user.id,
            type   : 'post',
            data   : {
                oldPass: $('form#changePasswordForm input[name="oldPassword"]').val(),
                pass   : $('form#changePasswordForm input[name="newPassword"]').val(),
                user   : user
            },
            success: function(res)
            {
                bootbox.alert(res, function()
                {
                    location.reload();
                });
            },
            error  : function(error)
            {
                bootbox.alert(error.responseText, function()
                {
                    location.reload();
                });
            }
        })
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields       : {
        oldPassword    : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        newPassword    : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        confirmPassword: {
            validators: {
                identical: {
                    field  : 'newPassword',
                    message: 'Please re-enter same password'
                }
            }
        }
    }
})

;$('form#createWidgetForm').bootstrapValidator({
    submitHandler : function()
    {
        $.ajax({
            url : '/rest/widget',
            type: 'put',
            data: {
                widget: {
                    template:$('form#createWidgetForm select[name="widgetType"]').val(),
                    user_id: user.id
                }
            },
            success: function(res)
            {
                bootbox.alert(res, function(){
                    location.reload();
                });
            },
            error: function(error)
            {
                bootbox.alert(error.responseText, function(){
                    location.reload();
                });
            }
        })
    }
});