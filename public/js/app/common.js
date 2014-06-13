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