// Make user login before applying coupon or checking out
var loginContext;

$(function(){
    addTimezoneInLinkedInLink();
    addTimezoneInFacebookLink();
})

$('#applyCoupon, #checkout').on('click', function(event)
{
    loginContext = $(event.currentTarget).attr('id');

    $.ajax({
        url        : '/checkLogin',
        type       : 'GET',
        dataType   : 'json',
        contentType: 'application/json',
        success    : function(data, textStatus, jqXHR)
        {
            // If not logged in, stop event propagation and show modal
            // Set loginContext so we know what to do after user signs in from the modal
            if (!data.valid) {
                $('#login-modal').modal('show');
                return;
            }

            switch (loginContext) {
                case 'applyCoupon':
                    return applyCoupon();
                case 'checkout':
                    return checkout();
            }
        }
    });

});

$('form.login').bootstrapValidator({
    submitHandler: function()
    {
        $.ajax({
            url        : '/login',
            type       : 'post',
            dataType   : 'json',
            contentType: 'application/json',
            data       : JSON.stringify({
                email : $('form.login input[name="email"]').val(),
                password: $('form.login input[name="password"]').val()
            }),
            success    : function(response)
            {
                switch (loginContext) {
                    case 'applyCoupon':
                        return applyCoupon();
                    case 'checkout':
                        return checkout();
                }
            },
            error      : function(jqXhr, textStatus, response)
            {
                $('#login-modal .alert-danger').show();
                $('#login-modal .alert-danger').text(jqXhr.responseText);
            }
        });
    },
    fields       : {
        email   : {
            validators: {
                notEmpty    : { message: "This field is required"},
                emailAddress: {message: "Please enter a valid email"}
            }
        },
        password: {
            validators: {
                notEmpty: { message: "This field is required"}
            }
        }
    }
});

$('form.register').bootstrapValidator({
    submitHandler: function()
    {
        $.ajax({
            url        : '/rest/register',
            type       : 'post',
            dataType   : 'json',
            contentType: 'application/json',
            async      : false,
            data       : JSON.stringify({
                user          : {
                    email      : $('form.register input[name="email"]').val(),
                    password   : $('form.register input[name="password"]').val(),
                    first_name : $('form.register input[name="first_name"]').val(),
                    last_name  : $('form.register input[name="last_name"]').val(),
                    middle_name: $('form.register input[name="middle_name"]').val()
                },
                timezoneOffset: -new Date().getTimezoneOffset() * 60
            }),
            success    : function(response)
            {
                switch (loginContext) {
                    case 'applyCoupon':
                        return applyCoupon();
                    case 'checkout':
                        return checkout();
                }
            },
            error      : function(jqXhr, textStatus, response)
            {
                $('#login-modal .alert').show();
                $('#login-modal .alert').text('Registration Failed');
            }
        });
    },
    fields       : {
        email     : {
            validators: {
                notEmpty    : { message: "This field is required"},
                emailAddress: {message: "Please enter a valid email"}
            }
        },
        first_name: {
            validators: {
                notEmpty: { message: "This field is required"}
            }
        },
        last_name : {
            validators: {
                notEmpty: { message: "This field is required"}
            }
        },
        password  : {
            validators: {
                notEmpty: { message: "This field is required"}
            }
        }
    }
});

/* Switch login/register UI */
$('#register-link,#login-link').click(function(event)
{
    $('.register').toggle($(event.currentTarget).attr('id') == 'register-link');
    $('.login').toggle($(event.currentTarget).attr('id') == 'login-link');
});

function applyCoupon()
{
    var form = $('<form action="/payment/coupon" method="post"><input name="code" value="' + $("input[name='code']").val() + '"/></form>');
    $('body').append(form);
    form.submit();
}

function checkout()
{
    var form = $('<form action="/checkout" method="post"></form>');
    $('body').append(form);
    form.submit();
}