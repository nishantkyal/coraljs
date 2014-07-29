var zone;

$('#networkSetting').card();
$('#networkSetting .editCardBtn').click(function(){
    $('#networkSetting').card().edit(integration);
});

$('#networkSetting .edit-card form').bootstrapValidator({
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields       : {
        title: {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        website_url : {
            validators: {
                uri: {
                    message: 'Please enter a valid url. Enter full url (including the http:// part)'
                }
            }
        }
    }
})
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

        $.ajax({
            url    : '/rest/integration/' + integration.id,
            type   : 'POST',
            data   : {
                integration: {
                    title           : $('#networkSetting .edit-card form [name="title"]').val(),
                    website_url     : $('#networkSetting .edit-card form [name="website_url"]').val(),
                    redirect_url    : $('#networkSetting .edit-card form [name="redirect_url"]').val(),
                }
            },
            success: function(result)
            {
                bootbox.alert('Network setting Updated. Press OK to continue.', function()
                {
                    location.reload();
                });
            },
            error  : function(jqXHR, textStatus, errorThrown)
            {
                bootbox.alert(jqXHR.responseText, function()
                {
                    location.reload();
                });
            }
        });
    });

$(function()
{
    var offset = new Date().getTimezoneOffset() * -60;
    zone = _.find(Timezone, function(zone)
    {
        return zone.gmt_offset == offset;
    });
});

$('#integrationMemberCard').card();

$('#integrationMemberCard .edit-card form').bootstrapValidator({
    message      : 'This value is not valid',
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields       : {
        first_name: {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        last_name : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        email     : {
            validators: {
                notEmpty    : {
                    message: 'The email is required and cannot be empty'
                },
                emailAddress: {
                    message: 'The input is not a valid email address'
                }
            }
        },
        phone     : {
            validators: {
                digits: {
                    message: "Please enter a valid phone number"
                }
            }
        }
    }
})
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

        var sendInvite = $(submitButton).attr('name') == 'send-invite';

        if (sendInvite) {
            $.ajax({
                url    : '/rest/code/expert/invitation',
                type   : 'POST',
                data   : {
                    integration_member: {
                        role          : $('#integrationMemberCard .edit-card form [name="role"]').val(),
                        integration_id: integrationId,
                        user          : {
                            email     : $('#integrationMemberCard .edit-card form [name="email"]').val(),
                            title     : $('#integrationMemberCard .edit-card form [name="title"]').val(),
                            first_name: $('#integrationMemberCard .edit-card form [name="first_name"]').val(),
                            last_name : $('#integrationMemberCard .edit-card form [name="last_name"]').val(),
                            timezone  : zone.zone_id
                        },
                        phoneNumber   : {
                            country_code: $('#integrationMemberCard .edit-card form [name="country_code"]').val(),
                            phone       : $('#integrationMemberCard .edit-card form [name="phone"]').val()
                        }
                    }
                },
                success: function(result)
                {
                    bootbox.alert('Your invitation has been sent. The invited member will receive an email with registration link.', function()
                    {
                        location.reload();
                    });
                },
                error  : function(jqXHR, textStatus, errorThrown)
                {
                    $('#integrationMemberCard .edit-card form .alert').show();
                    $('#integrationMemberCard .edit-card form .alert').text(jqXHR.responseText);
                }
            });
        }
        else {
            // 1. Create a new expert entry with the entered details
            // 2. Associate entered phone with created user
            $.ajax({
                url    : '/rest/expert',
                type   : 'put',
                data   : {
                    integration_member: {
                        role          : $('#integrationMemberCard .edit-card form [name="role"]').val(),
                        integration_id: integrationId
                    },
                    user              : {
                        email     : $('#integrationMemberCard .edit-card form [name="email"]').val(),
                        title     : $('#integrationMemberCard .edit-card form [name="title"]').val(),
                        first_name: $('#integrationMemberCard .edit-card form [name="first_name"]').val(),
                        last_name : $('#integrationMemberCard .edit-card form [name="last_name"]').val(),
                        timezone  : zone.zone_id
                    }
                },
                success: function(result)
                {
                    if ($('#integrationMemberCard .edit-card form [name="phone"]').val())
                        $.ajax({
                            url        : '/rest/phone-number',
                            type       : 'put',
                            dataType   : 'json',
                            contentType: 'application/json',
                            data       : JSON.stringify({
                                phoneNumber: {
                                    user_id     : result.user_id,
                                    country_code: $('#integrationMemberCard .edit-card form [name="country_code"]').val(),
                                    phone       : $('#integrationMemberCard .edit-card form [name="phone"]').val(),
                                    verified    : true,
                                    type        : 2
                                }
                            }),
                            success    : function(result)
                            {
                                bootbox.alert('Done! The added member will receive an email so he/she can login and configure their profile.', function()
                                {
                                    location.reload();
                                });
                            },
                            error      : function(jqXHR)
                            {
                                $('#integrationMemberCard .edit-card form .alert').show();
                                $('#integrationMemberCard .edit-card form .alert').text(jqXHR.responseText);
                            }
                        })
                    else
                        bootbox.alert('Done! The added member will receive an email so he/she can login and configure their profile.', function()
                        {
                            location.reload();
                        });
                },
                error  : function(jqXHR)
                {
                    $('#integrationMemberCard .edit-card form .alert').show();
                    $('#integrationMemberCard .edit-card form .alert').text(jqXHR.responseText);
                }
            })
        }
    });

/** COUPONS CARD **/
var couponCard = $('#couponCard').card();

$('.editCouponBtn').click(function(event)
{
    var couponId = $(event.currentTarget).data('id');
    var coupon = _.findWhere(coupons, {id: couponId});
    couponCard.edit(coupon);
});

$('#couponCard .edit-card form').bootstrapValidator({
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields       : {
        code           : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        expiry_time    : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        discount_amount: {
            validators: {
                notEmpty: {
                    message: 'The email is required and cannot be empty'
                }
            }
        }
    }
})
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

        var couponId = $('form#couponDetailsForm input[name="id"]').val();
        var url = couponId ? '/rest/coupon/' + couponId : '/rest/coupon';
        var method = couponId ? 'post' : 'put';

        $.ajax({
            url     : url,
            type    : method,
            dataType: 'json',
            data    : {
                coupon: {
                    integration_id    : integrationId,
                    code              : $('form#couponDetailsForm input[name="code"]').val(),
                    expiry_time       : $('form#couponDetailsForm input[name="expiry_time"]').val() ? moment($('form#couponDetailsForm input[name="expiry_time"]').val(), "DD/MM/YYYY").valueOf() : null,
                    discount_amount   : $('form#couponDetailsForm input[name="discount_amount"]').val(),
                    discount_unit     : $('form#couponDetailsForm input[name="discount_unit"]').val(),
                    max_coupons       : $('form#couponDetailsForm input[name="max_coupons"]').val(),
                    expert_resource_id: $('form#couponDetailsForm select[name="expert_resource_id"]').val(),
                    coupon_type       : $('form#couponDetailsForm select[name="coupon_type"]').val()
                }
            },
            success : function()
            {
                location.reload();
            },
            error   : function()
            {

            }
        });
    });

$('form#integration').bootstrapValidator({
    fields       : {
        title           : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        website_url     : {
            validators: {
                uri: {
                    message: 'Please enter a valid url. Enter full url (including the http:// part)'
                }
            }
        }
    }
})
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

        $.ajax({
            url        : '/rest/integration',
            type       : 'put',
            dataType   : 'json',
            contentType: 'application/json',
            data       : JSON.stringify({
                integration: {
                    title           : $('form#integration input[name=title]').val(),
                    website_url     : $('form#integration input[name=website_url]').val(),
                    redirect_url    : $('form#integration input[name=redirect_url]').val()
                }
            }),
            success    : function()
            {
                location.reload();
            },
            error      : function(jqXHR)
            {
                bootbox.alert(jqXHR.responseText);
            }
        });
    });