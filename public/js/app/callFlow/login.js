$('form#login').validate({
    rules         : {
        email   : {
            required: true,
            email   : true
        },
        password: {
            required: true
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
    }
});

$('form#register').validate({
    rules         : {
        email           : {
            required: true,
            email   : true
        },
        first_name      : {
            required: true
        },
        last_name       : {
            required: true
        },
        password        : {
            required: true
        },
        confirm_password: {
            required: true,
            equalTo : '#password'
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
    }
});

$('#skip').click(function()
{
    bootbox.confirm("If you skip login, we'll not be able to process refunds. Continue?", function(result)
    {
        bootbox.hideAll();

        if (result)
            window.location = "/expert/call/payment";
    });
});