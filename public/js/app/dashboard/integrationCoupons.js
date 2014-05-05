$('form').validate({
    rules         : {
        code: {
            required: true,
            remote  : {
                url     : '/rest/coupon/validation',
                type    : 'get',
                dataType: 'json',
                data    : {
                    coupon: {
                        code: function()
                        {
                            return $('form #code').val()
                        }
                    }
                }
            }
        }
    },
    errorPlacement: function(error, element)
    {
        $(element).attr('title', error[0].innerHTML);
        $(element).tooltip('show');
    },
    highlight     : function(element)
    {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight   : function(element)
    {
        $(element).closest('.form-group').removeClass('has-error');
    },
    submitHandler : function(event)
    {
        var couponId = $('#submit').data('id');
        var url = couponId ? '/rest/coupon/' + couponId : '/rest/coupon';
        var method = couponId ? 'post' : 'put';

        $.ajax({
            url     : url,
            type    : method,
            dataType: 'json',
            data    : {
                coupon: {
                    integration_id       : integrationId,
                    code                 : $('form #code').val(),
                    expiry_time          : moment($('form #expiry').val(), "DD/MM/YYYY").valueOf(),
                    discount_amount      : $('form #discount_amount').val(),
                    discount_unit        : $('form #discount_unit').val(),
                    max_coupons          : $('form #max_coupons').val(),
                    waive_network_charges: $('form #waive_network_charges').val()
                }
            },
            success : function()
            {
                location.reload();
            },
            error   : function()
            {

            }
        })
    }
});

$('tr').click(function(event)
{
    var couponId = $(event.currentTarget).data('id');
    var coupon = _.findWhere(coupons, {id: couponId});

    $('#couponDetails #code').val(coupon.code);
    $('#couponDetails #expert_id').selectpicker('val', coupon.expert_id);
    $('#couponDetails #expiry').val(moment(coupon.expiry_time).format('DD/MM/YYYY'));
    $('#couponDetails #num_used').text(coupon.num_used);
    $('#couponDetails #max_coupons').val(coupon.max_coupons);
    $('#couponDetails #discount_amount').val(coupon.discount_amount);
    $('#couponDetails #discount_unit').selectpicker('val', coupon.discount_unit);

    $('#couponDetails #submit').attr('data-id', coupon.id);
});

$('.save').click(function()
{
    $('#couponDetails #code').val(null);
    $('#couponDetails #expert_id').selectpicker('val', null);
    $('#couponDetails #expiry').val(null);
    $('#couponDetails #num_used').text(0);
    $('#couponDetails #max_coupons').val(null);
    $('#couponDetails #discount_amount').val(null);
    $('#couponDetails #discount_unit').selectpicker('val', null);
});


$('select').selectpicker();
$('.datepicker').datepicker();
