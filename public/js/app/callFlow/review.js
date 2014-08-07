$('form#review').bootstrapValidator({
})
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();
        var review = $('input[name=1]:checked', 'form#review').val() + $('input[name=2]:checked', 'form#review').val();
        $.ajax({
            url    : '/rest/call/review/' + reviewId,
            type   : 'post',
            data   : {
                phoneCallReview    : {
                    review:review,
                    comment:$('#comment').val()
                }
            },
            success: function()
            {
                bootbox.alert('Your Feedback has been saved. Thank you. Press Ok to Close the window', function()
                {
                    window.close();
                });
            }
        });
    });