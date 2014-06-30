function populate(frm, data) {
    $.each(data, function(key, value){
        $('[name='+key+']', frm).val(value);
    });
    $(frm).bootstrapValidator('validate');
}

function getFormData(form)
{
    var data = {};
    _.each($('input,select', form), function(element)
    {
        data[$(element).attr('name')] = $(element).val();
    });

    return data;
}

function addTimezoneInLinkedInLink()
{
    var offset = new Date().getTimezoneOffset() * -60;
    var zone = _.find(Timezone, function(zone){
        return zone.gmt_offset == offset;
    });
    $('[name="timezone"]').val(zone.zone_id).prop('selected',true);
    $("#linkedInLink").attr('href', linkedInUrl + '?zone=' + zone.zone_id);
}

function addTimezoneInFacebookLink()
{
    var offset = new Date().getTimezoneOffset() * -60;
    var zone = _.find(Timezone, function(zone){
        return zone.gmt_offset == offset;
    });
    $('[name="timezone"]').val(zone.zone_id).prop('selected',true);
    $("#facebookLink").attr('href', facebookUrl + '?zone=' + zone.zone_id);
}