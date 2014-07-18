/* Index schedules */
var userGmtOffset = new Date().getTimezoneOffset() * -60 * 1000;

schedules = schedules || [moment()];
var timeSlotsByDate = _.groupBy(schedules, function(schedule) { return moment(schedule.start_time).format('DD-MM-YYYY') });
var exceptionsByDate = _.groupBy(exceptions, function(exception) { return moment(exception.start_time).format('DD-MM-YYYY') });

setMonth(schedules[0].start_time);

/* Duration select - Event handler */
$('.duration li').click(function(event)
{
    var selectedDurationIndex = $(event.currentTarget).parent().children().index($(event.currentTarget))
    $('.duration li').removeClass('active');
    $('.duration li:nth-child(' + (selectedDurationIndex + 1) + ')').addClass('active');
    duration = $('a', event.currentTarget).text();

    //clear time slots as duration has changed
    selectedTimeSlots = [];
    updateSelectedTimeSlots();

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
    var selectedSlot = $(event.currentTarget).parent().data('slot');
    var index = selectedTimeSlots.indexOf(selectedSlot);
    if (index == -1) {
        if (selectedTimeSlots.length < 3) {
            $(event.currentTarget).addClass('checked');
            selectedTimeSlots.push(selectedSlot);
        }
    }
    else {
        selectedTimeSlots.splice(index, 1);
        $(event.currentTarget).removeClass('checked');
    }

    updateSelectedTimeSlots();
});

/* Date selection - Event handler */
$(document).on('click', 'a.date-link', function handleDateSelected(event)
{
    var selectedDate = parseInt($(event.currentTarget).parent().attr('value'));
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
    proceedToPayment()
});

/* Schedule selected - Event Handler */
$('#schedule-done').click(function()
{
    $('#scheduler').modal('hide');
});

/* Call now clicked - Event Handler
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
 });*/

/* Helper method to validate input and process to payment page */
function proceedToPayment()
{
    var agenda = $('#agenda').val().trim();
    var countryCode = $('#country-code').val().trim();
    var callerPhone = $('#caller-phone').val().trim();

    // Show scheduling popup if 3 slots not selected
    if (selectedTimeSlots.length != 3) {
        $('#scheduler').modal('show');
        return;
    }

    // Dismiss modal if agenda or phone not supplied
    if (agenda.length == 0) {
        $('#scheduler').modal('hide');
        $('#agenda').focus();
        return;
    }

    // Dismiss modal if agenda or phone not supplied
    if (callerPhone.length == 0) {
        $('#scheduler').modal('hide');
        $('#caller-phone').focus();
        return;
    }

    var form = $('<form action="/payment" method="POST">' +
        '<input type="hidden" name="agenda" value="' + agenda + '">' +
        '<input type="hidden" name="duration" value="' + duration + '">' +
        '<input type="hidden" name="countryCode" value="' + countryCode + '">' +
        '<input type="hidden" name="phone" value="' + callerPhone + '">' +
        '<input type="hidden" name="userGmtOffset" value="' + userGmtOffset + '">' +
        _.map(selectedTimeSlots, function(slot)
        {
            return '<input type="hidden" name="startTime" value="' + (slot) + '">';
        }).join('') +
        '</form>');

    $('body').append(form);
    form.submit();
}

/* Helper method to mark a data selected */
function selectDate(selectedDate, dateElement)
{
    var schedulesForSelectedDate = timeSlotsByDate[moment(selectedDate).format('DD-MM-YYYY')];
    var slots = [];

    _.each(schedulesForSelectedDate, function(schedule)
    {
        var slotTime = schedule.start_time;
        var selectedDurationInMillis = duration * 60 * 1000;
        var jumpInMillis = 15 * 60 * 1000;
        var maxSlotTime = schedule.start_time + schedule.duration - selectedDurationInMillis;
        while (slotTime <= maxSlotTime) {
            if (slotTime > moment().valueOf()) {
                var tempSlot = {start_time: slotTime, duration: jumpInMillis / 1000};
                slots.push(tempSlot);
            }
            slotTime += jumpInMillis;
        }
    });

    var exceptionsForSelectedDate = exceptionsByDate[moment(selectedDate).format('DD-MM-YYYY')];
    slots = applyExceptions(slots, exceptionsForSelectedDate);

    if (slots.length != 0)
    {
        $('a.date-link').removeClass('active');
        if (dateElement)
            $(dateElement).addClass('active');

        $('.timeslot-widget ul').empty();
        _.each(slots, function(slot)
        {
            var slotTime = slot.start_time;
            $('.timeslot-widget ul').append('<li class="timeslot" data-slot="' + slotTime + '">' + moment(slotTime).format('hh:mm A') + '<span class="checkbox"></span></li>');
            if (selectedTimeSlots.indexOf(slotTime) != -1)
                $('.timeslot-widget ul li:last-child span').addClass('checked');
        });
    }
}

// Remove exceptions from schedulesForSelectedDate
function applyExceptions(schedules, exceptions)
{
    if (!exceptions || exceptions.length == 0)
        return schedules;
    else
        return _.filter(schedules, function(schedule)
        {
            var applicableExceptions = _.filter(exceptions, function(exception)
            {
                if ((schedule.start_time >= (exception.start_time + exception.duration * 1000)) || ((schedule.start_time + schedule.duration * 1000) <= exception.start_time))
                    return false;
                else
                    return true;
            });

            if (applicableExceptions && applicableExceptions.length != 0)
                return false;
            else
                return true;
        });
}

/* Helper method to set displayed month in calendar */
function setMonth(monthMoment)
{
    var firstDateSelected = false;
    var firstWeekdayOfMonth = moment(monthMoment).date(1).day();
    var daysInMonth = moment(monthMoment).endOf("month").date();

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
            if (dateIndex > 0 && dateIndex <= daysInMonth) {
                var dayMoment = moment(monthMoment).date(dateIndex);

                $(rowElement).append('<td value="' + dayMoment + '"><a class="date-link">' + dateIndex + '</a></td>');

                // Display dot if has schedules
                if (timeSlotsByDate.hasOwnProperty(dayMoment.format('DD-MM-YYYY'))) {
                    $("td:last-child a", rowElement).append('<i class="icon-marker status-ok"/>');

                    // If this is first date of month with available slots, select it
                    if (!firstDateSelected) {
                        selectDate(dayMoment, $('td:last-child .date-link', rowElement));
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
        var selectedSlotElement = $('#selectedSlots .tagit-choice:nth-child(' + (i + 1) + ')');

        if (selectedTimeSlots[i]) {
            $('.col-xs-4.slot', slotElement).text(moment(selectedTimeSlots[i]).format('DD MMM YYYY [at] hh:mm a'));
            $('.col-xs-4.remove', slotElement).removeClass('hidden');

            $('.tagit-label', selectedSlotElement).text(moment(selectedTimeSlots[i]).format('DD MMM YYYY, hh:mm a'));
            $(selectedSlotElement).show();
        }
        else {
            $('.col-xs-4.slot', slotElement).text('No time slot selected');
            $('.col-xs-4.remove', slotElement).addClass('hidden');

            $(selectedSlotElement).hide();
        }
    }

    if (selectedTimeSlots.length < 3) {
        $('.modal-footer #schedule-done').hide();
        $('.modal-footer .alert.alert-danger').show();
        $('.modal-footer .alert.alert-danger .num-slots').text('You have selected ' + selectedTimeSlots.length + ' time slot so far.');
        $('#selectedSlots .tagit-new').show();
    }
    else {
        $('.modal-footer #schedule-done').show();
        $('.modal-footer .alert.alert-danger').hide();
        $('#selectedSlots .tagit-new').hide();
    }

    $('.num-slots').text(selectedTimeSlots.length);

}

$('#caller-phone').keydown(function(event)
{
    var code = (event.keyCode ? event.keyCode : event.which)

    // Allow: backspace, delete, tab, escape, and enter
    if (code == 46 || code == 8 || code == 9 || code == 27 || code == 13 ||
        // Allow: Ctrl+A
        (code == 65 && event.ctrlKey === true) ||
        // Allow: home, end, left, right
        (code >= 35 && code <= 39) ||
        (code >= 48 && code <= 57)) {
        // let it happen, don't do anything
        return;
    }
    else {
        // Ensure that it is a number and stop the keypress
        if (event.shiftKey || (code < 48 || code > 57) && (code < 96 || code > 105 )) {
            event.preventDefault();
        }
    }
});