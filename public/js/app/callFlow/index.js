$('#duration').selectpicker();

/* Render schedules */
var dateGroups = {};
_.each(schedules, function(schedule)
{
    var scheduleDate = moment(schedule.start_time).format('DD-MM-YYYY');
    dateGroups[scheduleDate] = [] || dateGroups[scheduleDate];
    dateGroups[scheduleDate].push(schedule)
});

_.each(_.keys(dateGroups), function(date)
{
    $('.dateSelect').append('<option>' + date + '</option>');
});

// Initialize start times
startTimes = startTimes || [null];
while (startTimes.length > 0)
{
    var timestamp = startTimes.shift();
    if (parseInt(timestamp) != -1)
        createSchedulePicker(timestamp);
}

function handleDateSelected(event)
{
    updatePicker($(event.target));
 }

function updatePicker(dateSelect)
{
    var selectedDate = $(dateSelect).val();
    var timeSelect = $(dateSelect).closest('.schedulePicker').find('select.timeSelect');
    $(timeSelect).empty();
    $(timeSelect).append('<option value="-1">Pick a time</option>');

    _.each(dateGroups[selectedDate], function(schedule)
    {
        $(timeSelect).append('<option value="' + schedule.start_time + '">' + moment(schedule.start_time).format('hh:mm A') + '</option>');
        $(timeSelect).selectpicker('refresh');
    });

}

function handleTimeSelected(event)
{
    // Create a new picker if last element
    var index = $('select.timeSelect').index($(event.currentTarget));
    if (index == $('select.timeSelect').length - 2)
        createSchedulePicker($(event.currentTarget).val());
}

function createSchedulePicker(timestamp)
{
    $('#appointmentPickers').append($('#schedulePickerTemplate').clone().attr('id', null).addClass('schedulePicker'));

    var lastSchedulePicker = $('#appointmentPickers .schedulePicker').last();
    lastSchedulePicker.show();

    $('.dateSelect', lastSchedulePicker).selectpicker();
    $('.dateSelect', lastSchedulePicker).change(handleDateSelected);
    $('.timeSelect', lastSchedulePicker).change(handleTimeSelected);

    if (timestamp)
    {
        $('.dateSelect', lastSchedulePicker).val(moment(parseInt(timestamp)).format('DD-MM-YYYY'));
        $('.dateSelect', lastSchedulePicker).selectpicker('refresh');

        updatePicker($('.dateSelect', lastSchedulePicker));

        $('.timeSelect', lastSchedulePicker).val(timestamp);
        $('.timeSelect', lastSchedulePicker).selectpicker('refresh');
    }
    else
        $('.timeSelect', lastSchedulePicker).selectpicker();

    return lastSchedulePicker;
}