$('#login-form').validate({
    rules: {
        username: {
            required: true,
            email: true
        },
        password: {
            required: true
        }
    },
    errorPlacement: function(error, element) {
        $(element).attr('title', error[0].innerHTML);
        $(element).tooltip('show');
    },
    highlight: function(element) {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        $(element).closest('.form-group').removeClass('has-error');
    }
});