/* Index schedules */
/* Index schedules */
var userGmtOffset = new Date().getTimezoneOffset() * -60 * 1000;

schedules = schedules || [moment()];
var timeSlotsByDate = _.groupBy(schedules, function(schedule) { return moment(schedule.start_time).format('DD-MM-YYYY') });
var exceptionsByDate = _.groupBy(exceptions, function(exception) { return moment(exception.start_time).format('DD-MM-YYYY') });

/* Duration select - Event handler */
$('.duration li').click(function(event)
{
    duration = $('a', event.currentTarget).text();
    selectDuration(duration);
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

/* Schedule selected - Event Handler */
$('#schedule-done').click(function()
{
    $('#scheduler').modal('hide');
});

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

    if (slots.length != 0) {
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
    $('form#call-details input[name=slots]').val(selectedTimeSlots);
}

$('form#call-details').bootstrapValidator({
    fields: {
        agenda: {
            validators: {
                notEmpty: { message: 'This is a required field'}
            }
        },
        phone : {
            validators: {
                notEmpty: { message: 'Phone number is a required field'},
                digits  : { message: 'Phone number can only contain digits'}
            }
        },
        slots : {
            validators: {
                notEmpty: { message: 'Please select at least three time slots'},
                callback: function(val)
                {
                    return {
                        valid  : val.length == 3,
                        message: 'Please select at least three time slots'
                    };
                }
            }
        }
    },
    excluded: ':disabled'
})
    .on('success.form.bv', function(e) {
    // Prevent form submission
    e.preventDefault();

    var $form        = $(e.target),
    validator    = $form.data('bootstrapValidator'),
    submitButton = validator.getSubmitButton();

    var agenda = $('textarea[name=agenda]').val().trim();
    var areaCode = $('input[name=area_code]').val().trim();
    var countryCode = $('select[name=country_code]').val().trim();
    var callerPhone = $('input[name=phone]').val().trim();

    var form = $('<form action="/payment" method="POST">' +
        '<input type="hidden" name="agenda" value="' + agenda + '">' +
        '<input type="hidden" name="duration" value="' + duration + '">' +
        '<input type="hidden" name="area_code" value="' + areaCode + '">' +
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
});

function selectDuration(duration)
{
    $('.duration li').removeClass('active');
    $('.duration li:contains(' + duration + ')').addClass('active');

    //clear time slots as duration has changed
    selectedTimeSlots = [];
    updateSelectedTimeSlots();

    var dateElement = $('a.date-link.active');
    var selectedDate = parseInt($(dateElement).parent().attr('value'));
    selectDate(selectedDate, dateElement);
}

setMonth(schedules[0].start_time);
selectDuration(duration + 15 - (duration % 15));