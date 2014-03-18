$('form').validate({
    rules        : {
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
    submitHandler: function()
    {
        $.ajax({
            url     : '/rest/coupon',
            type    : 'put',
            dataType: 'json',
            data    : {
                coupon: {
                    integration_id       : integrationId,
                    code                 : $('form #code').val(),
                    expiry_time          : $('form #expiry_time').val(),
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

$('select').selectpicker();