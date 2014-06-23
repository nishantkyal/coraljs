var cards = ['#schedule','#scheduleDetails','#pricing','#changePasswordCard','#phoneDetails','#editUserPhoneCard','#verifyUserPhoneCard','#widgetCard'];
function showAndHideCards(cardsToShow)
{
    _.each(cardsToShow, function(showCard){ $(showCard).show(); })

    var temp = _.filter(cards, function(hideCard){
        return _.find(cardsToShow, function(showCard){ return hideCard == showCard; }) ? false : true;
    });

    _.each(temp,
        function(card){
            $(card).hide();
        })
}

$(function(){
    showAndHideCards(['#phoneDetails']);
})

$('[name="phoneDetailsLink"]').click(function()
{
    if(!$('[name="phoneDetailsLink"]').hasClass('active'))
    {
        $('[name="phoneDetailsLink"]').addClass('active').siblings().removeClass('active');
        showAndHideCards(['#phoneDetails'])
    }
});

$('[name="scheduleAndPricingLink"]').click(function()
{
    if(!$('[name="scheduleAndPricingLink"]').hasClass('active'))
    {
        $('[name="scheduleAndPricingLink"]').addClass('active').siblings().removeClass('active');
        showAndHideCards(['#schedule','#pricing']);
    }
});

$('[name="changePasswordLink"]').click(function()
{
    showAndHideCards(['#changePasswordCard']);
    $('[name="changePasswordLink"]').addClass('active').siblings().removeClass('active');

    $('form#changePasswordForm').trigger('reset');
    $('form#changePasswordForm').data('bootstrapValidator').resetForm();
});

$('[name="widgetLink"]').click(function()
{
    showAndHideCards(['#widgetCard']);
    $('[name="widgetLink"]').addClass('active').siblings().removeClass('active');
});

$('#cancelEditUserPhone').click(function()
{
    $('#phoneDetails').show();
    $('#editUserPhoneCard').hide();
});

$('#cancelVerifyUserPhone').click(function()
{
    $('#phoneDetails').show();
    $('#verifyUserPhoneCard').hide();
});

$('#cancelChangePassword').click(function()
{
    $('#phoneDetails').show();
    $('[name="phoneDetailsLink"]').addClass('active').siblings().removeClass('active');
    $('#changePasswordCard').hide();
});

$('[name="editUserPhone"]').click(function()
{
    $('#editUserPhoneCard').show();
    $('#phoneDetails').hide();
});

$('form#editUserPhoneForm').bootstrapValidator({
    submitHandler : function()
    {
        $.ajax({
            url     : '/rest/code/mobile/verification',
            type    : 'post',
            dataType: 'json',
            data    : {
                phoneNumber: {
                    phone       : $('form#editUserPhoneForm input[name="phoneNumber"]').val(),
                    country_code: $('form#editUserPhoneForm select[name="countryCode"]').val()
                }
            },
            success: function() {
                $('#editUserPhoneCard').hide();
                $('#verifyUserPhoneCard').show();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                bootbox.alert(jqXHR.responseText);
            }
        })
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields         : {
        phoneNumber : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        }
    }
});

$('form#verifyUserPhoneForm').bootstrapValidator({
    submitHandler : function()
    {
        $.ajax({
            url     : '/rest/code/mobile/verification',
            type    : 'get',
            dataType: 'json',
            data    : {
                code: $('form#verifyUserPhoneForm input[name="verificationCode"]').val(),
                phoneNumber: {
                    phone       : $('form#editUserPhoneForm input[name="phoneNumber"]').val(),
                    country_code: $('form#editUserPhoneForm select[name="countryCode"]').val(),
                    id          : $('form#verifyUserPhoneForm input[name="verificationCode"]').attr('id')
                }
            },
            success : function(data, textStatus, jqXHR)
            {
                location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                bootbox.alert(jqXHR.responseText);
            }
        })
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields         : {
        verificationCode : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        }
    }
});

$('form#changePasswordForm').bootstrapValidator({
    submitHandler : function()
    {
        $.ajax({
            url : '/rest/user/' + user.id,
            type: 'post',
            data: {
                oldPass: $('form#changePasswordForm input[name="oldPassword"]').val(),
                pass: $('form#changePasswordForm input[name="newPassword"]').val(),
                user: user
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
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields         : {
        oldPassword : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        newPassword : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        confirmPassword : {
            validators: {
                identical: {
                    field: 'newPassword',
                    message: 'Please re-enter same password'
                }
            }
        }
    }
});