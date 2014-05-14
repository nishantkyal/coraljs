/* Index schedules */
schedules = schedules || [moment()];
var timeSlotsByDate = _.groupBy(schedules, function(schedule) { return moment(schedule.start_time).format('DD-MM-YYYY') });
setMonth(schedules[0].start_time);

/* Duration select - Event handler */
$('.duration li').click(function(event)
{
    var selectedDurationIndex = $(event.currentTarget).parent().children().index($(event.currentTarget))
    $('.duration li').removeClass('active');
    $('.duration li:nth-child(' + (selectedDurationIndex + 1) + ')').addClass('active');
    duration = $('a', event.currentTarget).text();

    var dateElement = $('a.date-link.active');
    var selectedDate = parseInt($(dateElement).parent().attr('value'));
    selectDate(selectedDate, dateElement);
});

/* Prev month selected - Event Handler */
$('#monthSelector #prev').click(function()
{
    var currentDate = moment($('#monthSelector #month').text(), "MMM YYYY");
    var prevMonth = currentDate.subtract({months: 1});
    $('#monthSelector #month').text(prevMonth.format("MMM YYYY"));
    setMonth(prevMonth);
});

/* Next month selected - Event Handler */
$('#monthSelector #next').click(function()
{
    var currentDate = moment($('#monthSelector #month').text(), "MMM YYYY");
    var nextMonth = currentDate.add({months: 1});
    $('#monthSelector #month').text(nextMonth.format("MMM YYYY"));
    setMonth(nextMonth);
});

/* Time slot selection - Event handler */
$(document).on('click', '.timeslot-widget ul li span', function handleTimeSlotSelected(event)
{
    $(event.currentTarget).addClass('checked');
    var selectedSlot = $(event.currentTarget).parent().data('slot');
    var index = selectedTimeSlots.indexOf(selectedSlot);
    if (index == -1)
        selectedTimeSlots.push(selectedSlot);
    else
        selectedTimeSlots.splice(index, 1);

    updateSelectedTimeSlots();
});

/* Date selection - Event handler */
$(document).on('click', 'a.date-link', function handleDateSelected(event)
{
    var selectedDate = parseInt($(event.currentTarget).parent().attr('value'));
    $('a.date-link').removeClass('active');
    $(event.currentTarget).addClass('active');
    selectDate(selectedDate, $(event.currentTarget));
});

/* Remove selected schedule event handler */
$('.row.scheduled-slots li .col-xs-4.remove').click(function(event)
{
    var removedSlotIndex = $('.row.scheduled-slots li .col-xs-4.remove').index($(event.currentTarget));
    var removedSlot = selectedTimeSlots.splice(removedSlotIndex, 1);
    updateSelectedTimeSlots();

    // Disable the checkbox if the removed slot is currently displayed
    $('.timeslot-widget li[data-slot="' + removedSlot[0] + '"] span').removeClass('checked');
});

/* Schedule clicked - Event Handler */
$('#schedule').click(function()
{
    var agenda = $('#agenda').val().trim();
    var callerName = $('#caller-name').val().trim();
    var callerPhone = $('#caller-phone').val().trim();

    if (agenda && callerName && callerPhone)
        $('#scheduler').modal();

});

/* Schedule selected - Event Handler */
$('#schedule-done').click(function()
{
    var agenda = $('#agenda').val().trim();
    var callerName = $('#caller-name').val().trim();
    var callerPhone = $('#caller-phone').val().trim();

    $('<form action="/expert/call/payment" method="POST">' +
        '<input type="hidden" name="agenda" value="' + agenda + '">' +
        '<input type="hidden" name="duration" value="' + duration + '">' +
        '<input type="hidden" name="name" value="' + callerName + '">' +
        '<input type="hidden" name="phone" value="' + callerPhone + '">' +
        _.map(selectedTimeSlots, function(slot)
        {
            return '<input type="hidden" name="startTime" value="' + slot + '">';
        }).join('') +
        '</form>').submit();
});

/* Call now clicked - Event Handler */
$('#call-now').click(function()
{
    var agenda = $('#agenda').val().trim();
    var callerName = $('#caller-name').val().trim();
    var callerPhone = $('#caller-phone').val().trim();

    $('<form action="/expert/call/payment" method="POST">' +
        '<input type="hidden" name="agenda" value="' + agenda + '">' +
        '<input type="hidden" name="duration" value="' + duration + '">' +
        '<input type="hidden" name="name" value="' + callerName + '">' +
        '<input type="hidden" name="phone" value="' + callerPhone + '">' +
        '<input type="hidden" name="call-now" value="true">' +
        '</form>').submit();
});

/* Helper method to mark a data selected */
function selectDate(selectedDate, dateElement)
{
    $('.timeslot-widget ul').empty();

    $('a.date-link').removeClass('active');
    if (dateElement)
        $(dateElement).addClass('active');

    var schedulesForSelectedDate = timeSlotsByDate[moment(selectedDate).format('DD-MM-YYYY')];
    _.each(schedulesForSelectedDate, function(schedule)
    {
        var slotTime = schedule.start_time;
        var selectedDurationInMillis = duration * 60 * 1000;
        var maxSlotTime = schedule.start_time + schedule.duration - selectedDurationInMillis;
        while (slotTime < maxSlotTime) {
            $('.timeslot-widget ul').append('<li class="timeslot" data-slot="' + slotTime + '">' + moment(slotTime).format('hh:mm A') + '<span class="checkbox"></span></li>');
            if (selectedTimeSlots.indexOf(slotTime) != -1)
                $('.timeslot-widget ul li:last-child span').addClass('checked');
            slotTime += selectedDurationInMillis;
        }
    });
}

/* Helper method to set displayed month in calendar */
function setMonth(monthMoment)
{
    var firstDateSelected = false;
    var firstWeekdayOfMonth = moment(monthMoment).date(1).day();
    var daysInMonth = moment().endOf("month").date();

    // Update dates and mark dates with available slots as active
    $(".calendar-widget tbody").empty();
    for (var row = 0; row < 6; row++) {
        // Create row
        $('.calendar-widget tbody').append('<tr/>');
        var rowElement = $('.calendar-widget tbody tr:last-child');

        for (var col = 0; col < 7; col++) {
            var cell = row * 7 + col;
            var dateIndex = cell - firstWeekdayOfMonth + 1;

            // Create date cell if i a valid date
            if (dateIndex > 0 && dateIndex < daysInMonth) {
                var dayMoment = moment(monthMoment).date(dateIndex);

                $(rowElement).append('<td value="' + dayMoment + '"><a class="date-link">' + dateIndex + '</a></td>');

                // Display dot if has schedules
                if (timeSlotsByDate.hasOwnProperty(dayMoment.format('DD-MM-YYYY'))) {
                    $("td:last-child a", rowElement).append('<span class="marker status-ok">●</span>');

                    // If this is first date of month with available slots, select it
                    if (!firstDateSelected) {
                        selectDate(dayMoment, $('td:last-child', rowElement));
                        firstDateSelected = true;
                    }
                }
            }
            else
                $(rowElement).append('<td/>');
        }
    }

    $('#monthSelector #month').text(moment(monthMoment).format('MMM YYYY'));
    updateSelectedTimeSlots();
}

/* Helper method to update the list of selected slots */
function updateSelectedTimeSlots()
{
    selectedTimeSlots = selectedTimeSlots.splice(0, 3);
    for (var i = 0; i < 3; i++) {
        var slotElement = $('.row.scheduled-slots li:nth-child(' + (i + 1) + ')');
        if (selectedTimeSlots[i]) {
            $('.col-xs-4.slot', slotElement).text(moment(selectedTimeSlots[i]).format('DD MMM YYYY [at] hh:mm a'));
            $('.col-xs-4.remove', slotElement).removeClass('hidden');
        }
        else {
            $('.col-xs-4.slot', slotElement).text('No time slot selected');
            $('.col-xs-4.remove', slotElement).addClass('hidden');
        }
    }

    if (selectedTimeSlots.length < 3) {
        $('.modal-footer #schedule-done').hide();
        $('.modal-footer .alert.alert-warning').show();
        $('.modal-footer .alert.alert-warning .num-slots').text(selectedTimeSlots.length);
    }
    else {
        $('.modal-footer #schedule-done').show();
        $('.modal-footer .alert.alert-warning').hide();
    }
}