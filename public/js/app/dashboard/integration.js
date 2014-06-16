$('#inviteMemberBtn').click(function()
{
    $('#inviteMemberCard').show();
    $('#members').hide();

    $('form#inviteUser').trigger('reset');
    $('form#inviteUser .alert').hide();
    $('form#inviteUser').data('bootstrapValidator').resetForm();
});

$('form#inviteUser').bootstrapValidator({
    message      : 'This value is not valid',
    submitHandler: function(form)
    {
        $.ajax({
            url    : '/rest/code/expert/invitation',
            type   : 'POST',
            data   : {
                integration_member: {
                    role          : $('form#inviteUser [name="role"]').val(),
                    integration_id: integrationId,
                    user          : {
                        email     : $('form#inviteUser [name="email"]').val(),
                        title     : $('form#inviteUser [name="title"]').val(),
                        first_name: $('form#inviteUser [name="first_name"]').val(),
                        last_name : $('form#inviteUser [name="last_name"]').val()
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
                $('form#inviteUser .alert').show();
                $('form#inviteUser .alert').text(jqXHR.responseText);
            }
        });
    },
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
        }
    }
});

$('#cancelInvite').click(function()
{
    $('#inviteMemberCard').hide();
    $('#members').show();
});

/** COUPONS CARD **/
$('#createCouponBtn').click(function()
{
    $('form#couponDetailsForm').trigger('reset');
    $('form#couponDetailsForm .alert').hide();
    $('form#couponDetailsForm').data('bootstrapValidator').resetForm();

    $('#couponCard').hide();
    $('#couponDetailsCard').show();
});

$('.editCouponBtn').click(function(event)
{
    var couponId = $(event.currentTarget).data('id');
    var coupon = _.findWhere(coupons, {id: couponId});

    populate($('form#couponDetailsForm'), coupon);

    $('#couponCard').hide();
    $('#couponDetailsCard').show();
});

$('form#couponDetailsForm').bootstrapValidator({
    submitHandler: function(form)
    {
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
    },
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
});

$('#cancelCoupon').click(function()
{
    $('#couponCard').show();
    $('#couponDetailsCard').hide();
});

$('.datepicker').datetimepicker();