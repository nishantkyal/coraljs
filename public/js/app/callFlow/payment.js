// Make user login before applying coupon or checking out
var loginContext;
var isLoggedIn = false;

$('form#couponForm,form#checkout').submit(function(event)
{
    if (!isLoggedIn)
    {
        event.preventDefault();

        $.ajax({
            url    : '/rest/user/authentication',
            type   : 'GET',
            success: function(data, textStatus, jqXHR)
            {
                // If not logged in, stop event propagation and show modal
                // Set loginContext so we know what to do after user signs in from the modal
                isLoggedIn = data;
                if (!data) {
                    loginContext = $(event.currentTarget).attr('id');
                    $('#login-modal').modal('show');
                }
                else {
                    $(event.currentTarget).submit();
                }
            }
        });
    }
});

/* Login handler */
$('#login-button').click(function()
{
    $.ajax({
        url        : '/login',
        type       : 'post',
        dataType   : 'json',
        contentType: 'application/json',
        async      : false,
        data       : JSON.stringify({
            username: $('#authentication input[name="username"]').val(),
            password: $('#authentication input[name="password"]').val()
        }),
        success    : function()
        {
            if (loginContext)
                $('form#' + loginContext).submit();
        },
        error      : function(jqXhr, textStatus, response)
        {
            $('#login-modal .alert').show();
            $('#login-modal .alert').text('Login Failed');
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
        success    : function()
        {
            if (loginContext)
                $('form#' + loginContext).submit();
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