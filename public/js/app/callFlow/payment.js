// Make user login before applying coupon or checking out
var loginContext;

$('#applyCoupon, #checkout').on('click', function(event)
{
    loginContext = $(event.currentTarget).attr('id');

    $.ajax({
        url    : '/rest/user/authentication',
        type   : 'GET',
        success: function(data, textStatus, jqXHR)
        {
            // If not logged in, stop event propagation and show modal
            // Set loginContext so we know what to do after user signs in from the modal
            if (!data)
            {
                $('#login-modal').modal('show');
                return;
            }

            switch(loginContext)
            {
                case 'applyCoupon': applyCoupon(); break;
                case 'checkout': checkout(); break;
            }
        }
    });

});

/* Login handler */
$('#login-button').click(function()
{
    $.ajax({
        url        : '/login',
        type       : 'post',
        dataType   : 'json',
        contentType: 'application/json',
        data       : JSON.stringify({
            username: $('#authentication input[name="username"]').val(),
            password: $('#authentication input[name="password"]').val()
        }),
        success    : function(response)
        {
            switch(loginContext)
            {
                case 'applyCoupon': applyCoupon(); break;
                case 'checkout': checkout(); break;
            }
        },
        error      : function(jqXhr, textStatus, response)
        {
            $('#login-modal .alert-danger').show();
            $('#login-modal .alert-danger').text('Login Failed');
        }
    })
});

/* Registration handler */
$('#register-button').click(function()
{
    $.ajax({
        url        : '/register',
        type       : 'post',
        dataType   : 'json',
        contentType: 'application/json',
        async      : false,
        data       : JSON.stringify({
            email      : $('#authentication input[name="username"]').val(),
            password   : $('#authentication input[name="password"]').val(),
            first_name : $('#authentication input[name="first_name"]').val(),
            last_name  : $('#authentication input[name="last_name"]').val(),
            middle_name: $('#authentication input[name="middle_name"]').val()
        }),
        success    : function(response)
        {
            switch(loginContext)
            {
                case 'applyCoupon': applyCoupon(); break;
                case 'checkout': checkout(); break;
            }
        },
        error      : function(jqXhr, textStatus, response)
        {
            $('#login-modal .alert').show();
            $('#login-modal .alert').text('Registration Failed');
        }
    })
});

/* Switch login/register UI */
$('#register-link,#login-link').click(function(event)
{
    $('.register').toggle($(event.currentTarget).attr('id') == 'register-link');
    $('.login').toggle($(event.currentTarget).attr('id') == 'login-link');
});

function applyCoupon()
{
    var form = $('<form action="/expert/call/payment/coupon" method="post"><input name="code" value="' + $("input[name='code']").val() + '"/></form>');
    $('body').append(form);
    form.submit();
}

function checkout()
{
    var form = $('<form action="/expert/call/checkout" method="post"></form>');
    $('body').append(form);
    form.submit();
}