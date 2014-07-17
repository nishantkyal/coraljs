var card = $('#userSchedule').card();

$('#userSchedule .editScheduleBtn').click(function(event)
{
    var ruleId = $(event.currentTarget).data('id');
    var rule = _.findWhere(rules, {id: ruleId});

    card.edit(rule);

    // Populate data since this is not a form
    $('#userSchedule .edit-card .title').text(rule.title);
    $('#userSchedule .edit-card').data('id', ruleId);

    $('#userSchedule .edit-card li').removeClass('active');
    var daysOfWeek = rule.values[5];
    _.each(daysOfWeek, function(index)
    {
        $($('#userSchedule .edit-card li')[parseInt(index)]).addClass('active');
    });

    $('#userSchedule .edit-card input[name=start_time]').val(moment().hour(rule.values[2]).minute(rule.values[1]).format('hh:mm a'));
    $('#userSchedule .edit-card input[name=end_time]').val(moment().hour(rule.values[2]).minute(rule.values[1]).add({milliseconds: rule.duration}).format('hh:mm a'));
});

$('#userSchedule .edit-card .done-editing-schedule').click(function()
{
    var startTime = moment($('#userSchedule .edit-card input[name=start_time]').val(), 'hh:mm a');
    var endTime = moment($('#userSchedule .edit-card input[name=end_time]').val(), 'hh:mm a');
    var duration = moment(endTime).diff(startTime).valueOf();

    var hours = moment(startTime).hour();
    var minutes = moment(startTime).minute();

    var daysOfWeek = [];
    for (var i = 0; i < 7; i++) {
        var element = $('#userSchedule .edit-card li')[i];
        if ($(element).hasClass('active'))
            daysOfWeek.push(i);
    }

    var values = ['*', minutes, hours, '*', '*', daysOfWeek];
    var cronPattern = fromValues(values);

    var scheduleRuleId = $('#userSchedule .edit-card').data('id');
    var method = scheduleRuleId ? 'post' : 'put';
    var url = scheduleRuleId ? '/rest/scheduleRule/' + scheduleRuleId : '/rest/scheduleRule';

    $.ajax({
        url        : url,
        method     : method,
        dataType   : 'json',
        contentType: 'application/json',
        data       : JSON.stringify({
            'scheduleRule': {
                duration : duration,
                cron_rule: cronPattern
            }
        }),
        success    : function()
        {
            location.reload();
        },
        error      : function()
        {

        }
    });
});

$('#userSchedule .edit-card .delete-schedule').click(function()
{
    var scheduleRuleId = $('#userSchedule .edit-card').data('id');
    var url = '/rest/scheduleRule/' + scheduleRuleId;

    $.ajax({
        url        : url,
        method     : 'delete',
        success    : function()
        {
            location.reload();
        },
        error      : function()
        {

        }
    });
});

$('.datepicker').datetimepicker({
    pickDate      : false,
    useSeconds    : false,
    minuteStepping: 15
});

$('#userSchedule .edit-card li').click(function(event)
{
    $(event.currentTarget).toggleClass('active');
});

function fromValues(values)
{
    return _.map(values, function(vals)
    {
        return valuesToPattern(vals);
    }).join(' ');
}

function valuesToPattern(values)
{
    if (values == null || values == undefined)
        return '*';
    else
        if (_.isArray(values))
            return values.join(',');
        else
            return values;
}

$('form#pricingSchemeForm').bootstrapValidator({
    fields: {
        'charging_rate': {
            validators: {
                digits: {message: 'Please enter a valid number'},
                required: {message: 'This is a required field'}
            }
        }
    },
    submitHandler: function()
    {
        var schemeId = $('form#pricingSchemeForm input[type=hidden]').val();
        var method = schemeId ? 'post' : 'put';
        var url = schemeId ? '/rest/pricingScheme/' + schemeId : '/rest/pricingScheme';

        $.ajax({
            url: url,
            method: method,
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                pricingScheme: {
                    charging_rate: $('form#pricingSchemeForm input[name=charging_rate]').val(),
                    unit: $('form#pricingSchemeForm input[name=unit]').val(),
                    min_duration: $('form#pricingSchemeForm input[name=min_duration]').val(),
                    chunk_size: $('form#pricingSchemeForm input[name=chunk_size]').val(),
                    user_id:userId
                }
            }),
            success: function()
            {
                location.reload();
            },
            error: function(jqXhr)
            {
                bootbox.alert(jqXhr.responseText);
            }
        });
    }
});
