$('form').validate({
    rules         : {
        first_name: { required: true},
        last_name : { required: true}
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
    submitHandler : function()
    {
        $.ajax({
            url : '/member/' + memberId + '/profile',
            type: 'post',
            data: {
                user: {
                    first_name: $('form #first_name').val(),
                    last_name : $('form #last_name').val(),
                    short_desc: $('form #short_desc').val(),
                    long_desc : $('form #long_desc').val()
                }
            },
            success: function()
            {
                location.reload();
            }
        })
    }
});
