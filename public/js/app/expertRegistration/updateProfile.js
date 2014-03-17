$('form').validate({
    rules        : {},
    submitHandler: function()
    {
        $.ajax({
            type: 'post',
            data: {
                user: {
                    short_desc: $('form #summary').val(),
                    long_desc : $('form #description').val()
                }
            },
            success: function()
            {
                location.href = '/expert/registration/mobile/verification'
            }
        });
    }
});