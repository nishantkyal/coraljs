$('.datepicker').datepicker({
    format: 'dd/mm/yyyy'
});

$('#selectNewTime').validate({
    rules         : {
        date : { required: true}
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
        var slot = moment($('#selectNewTime #date').val())
            .hours($('#selectNewTime #time_hour').val())
            .minutes($('#selectNewTime #time_min').val())
            .valueOf();

        $.ajax({
            url : '/call/' + call.id + '/scheduling/suggest',
            type: 'post',
            data: {
                startTime: slot,
                code: code
            }
        })
    }
});