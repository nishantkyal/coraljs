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
        var tt = $('#selectNewTime #date').val() + ' ' + $('#selectNewTime #time_hour').val() + ':' + $('#selectNewTime #time_min').val();
        var option_one = moment(tt, "DD-MM-YYYY HH:mm").toDate().valueOf();
        $.ajax({
            url : '/call/' + call.id + '/rescheduleByExpert',
            type: 'post',
            data: {
                startTime: option_one
            }
        })
    }
});