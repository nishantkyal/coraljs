$('select').selectpicker();

$('#timepicker3').timepicker({
    minuteStep: 5,
    showInputs: false,
    disableFocus: true
});

$(function(){
    for(var i=0; i< rules.length; i++)
    {
        var row = "<tr>";

        if(rules[i].title)
            row += "<td>" + rules[i].title +  "</td>";
        else
            row +="<td></td>";

        var cronParts = rules[i].cron_rule.split(" ");

        row += "<td>"
        switch(cronParts[5])
        {
            case "0"    : row +="Sunday";break;
            case "1"    : row +="Monday";break;
            case "2"    : row +="Tuesday";break;
            case "3"    : row +="Wednesday";break;
            case "4"    : row +="Thursday";break;
            case "5"    : row +="Friday";break;
            case "6"    : row +="Saturday";break;
            case "1-5"  : row +="Weekdays";break;
            case "0,6"  : row +="Weekends";break;
        }
        row += "</td>";

        row += "<td>" + cronParts[2] + ":" + (cronParts[1] == "0" ? "00" : cronParts[1]) + "</td>"

        rules[0].startHour = cronParts[2];
        rules[0].startMinute = cronParts[1];

        var duration = parseInt(rules[i].duration) / 60000;
        var startTime = parseInt(cronParts[2])*60 + parseInt(cronParts[1]);

        row += "<td>"+ Math.floor((startTime+duration)/60) + ":" + ((startTime + duration)%60 == 0 ? "00" : (startTime + duration)%60) +"</td>";

        row += "<td>" + (rules[i].price_unit == "1" ? "Rs." :"$ ") + rules[i].price_per_min + "</td>";

        row += "<td><a class=\"fa fa-pencil-square editSchedule\" id=\"editSchedule\" href=\"#AddSchedule\" data-toggle=\"modal\" data-id=" + rules[i].id + "></a>" +
            "<a id=\"deleteSchedule\" class=\"fa fa-times-circle deleteSchedule\" href=\"#deleteSchedule\" data-id=" + rules[i].id + "></a>"
            "</td>";

        row += "</tr>"
        $('#rules').find('tbody').append(row);
    }
});

$('#AddSchedule form').validate({
    rules         : {
        title: { required: true},
        price_per_unit : { required: true}
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
        var ruleId = $('#AddSchedule form .btn-primary').attr('data-id');
        if(ruleId)
            $.ajax({
                url : '/rest/scheduleRule/' + ruleId,
                type: 'post',
                data: {
                    expertId : memberId,
                    scheduleTimeSlots:{
                        title:$('#AddSchedule form #title').val(),
                        day:$('#AddSchedule form #day').val(),
                        startHour:$('#AddSchedule form #startHour').val(),
                        startMinute:$('#AddSchedule form #startMinute').val(),
                        endHour:$('#AddSchedule form #endHour').val(),
                        endMinute:$('#AddSchedule form #endMinute').val(),
                        pricePerMin:$('#AddSchedule form #pricePerMin').val(),
                        priceUnit:$('#AddSchedule form #priceUnit').val()
                    }
                },
                success: function()
                {
                    location.reload();
                },
                error: function(error)
                {
                    bootbox.alert(error.responseText)
                }
            })
        else
            $.ajax({
                url : '/rest/scheduleRule',
                type: 'post',
                data: {
                    expertId : memberId,
                    scheduleTimeSlots:{
                        title:$('#AddSchedule form #title').val(),
                        day:$('#AddSchedule form #day').val(),
                        startHour:$('#AddSchedule form #startHour').val(),
                        startMinute:$('#AddSchedule form #startMinute').val(),
                        endHour:$('#AddSchedule form #endHour').val(),
                        endMinute:$('#AddSchedule form #endMinute').val(),
                        pricePerMin:$('#AddSchedule form #pricePerMin').val(),
                        priceUnit:$('#AddSchedule form #priceUnit').val()
                    }
                },
                success: function()
                {
                    location.reload();
                },
                error: function(error)
                {
                    bootbox.alert(error.responseText, function () {
                        location.reload();
                    })
                }
            })

    }
});

$(document).on('click','.editSchedule',function()
{
    var selectedRule;
    var ruleId = $(this).data('id');
    for(var i = 0; i<rules.length; i++)
        if(rules[i].id == ruleId)
            selectedRule = rules[i];
    if (selectedRule) {
        var cronParts = selectedRule.cron_rule.split(" ");
        var duration = parseInt(selectedRule.duration) / 60000;
        var startTime = parseInt(cronParts[2])*60 + parseInt(cronParts[1]);

        $('#AddSchedule .btn-primary').attr('data-id', selectedRule.id);
        $('#AddSchedule form [name="title"]').val(selectedRule.title);
        $('#AddSchedule [name="pricePerMin"]').val(selectedRule.price_per_min);
        $('#AddSchedule [name="day"]').selectpicker('val', parseInt(cronParts[5]));
        $('#AddSchedule [name="startHour"]').selectpicker('val', parseInt(cronParts[2]));
        $('#AddSchedule [name="startMinute"]').selectpicker('val', parseInt(cronParts[1]));
        $('#AddSchedule #endHour').selectpicker('val', Math.floor((startTime+duration)/60));
        $('#AddSchedule #endMinute').selectpicker('val', (startTime + duration)%60);
        $('#AddSchedule [name="priceUnit"]').selectpicker('val', parseInt(selectedRule.price_unit));
    }
});

$(document).on('click','.deleteSchedule',function()
{
    var ruleId = $(this).data('id');
    bootbox.confirm("Are you sure you want to delete this schedule?", function(result){
        $.ajax({
            url : '/rest/scheduleRule/' + ruleId,
            type: 'delete',
            success: function()
            {
                location.reload();
            },
            error: function(error)
            {
                bootbox.alert(error.responseText, function (){
                    location.reload();
                })
            }
        })
    })
});