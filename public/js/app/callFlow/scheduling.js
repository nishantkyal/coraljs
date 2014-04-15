function handleConfirmAppointment(event)
{
    bootbox.alert("Appointment Confirmed! You will receive an E-mail containing more information", function(){
        $('appointment').hide();
        $.ajax({
            url    : '/call/' + call.id + '/scheduling',
            type   : 'post',
            data: {
                startTime              : startTime
            },
            success: function()
            {
                location.reload();
            }
        });
    });
}

function handleRejectAppointment(event)
{
    bootbox.confirm("You have declined this appointment. Do you want to choose any other slot?", function(result){
        if(result)
            console.log('yes');
        else
            console.log('no');
    });
}