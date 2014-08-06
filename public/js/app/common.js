function populate(form, data) {
    $.each(data, function(key, value){
        $('[name=' + key + ']', form).val(value);
    });
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

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";path=/;"  + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
            setCookie("username", user, 365);
        }
    }
}

// Custom validator to do conditional validation
// Make a field required if another field has specified value
(function($) {
    $.fn.bootstrapValidator.validators.requiredIf = {
        html5Attributes: {
            message: 'message',
            field: 'field',
            value: 'value'
        },

        validate: function(validator, $field, options)
        {
            var value = ($field.val() || '').trim();

            var sourceField = validator.getFieldElements(options.field);
            if (sourceField == null)
                return true;

            var sourceFieldValue = $(sourceField).attr('type') == 'radio' ? $(sourceField).filter(':checked').val() : $(sourceField).val();
            sourceFieldValue = sourceFieldValue ? sourceFieldValue.trim() : sourceFieldValue;

            if (sourceFieldValue != options.value)
                return true;

            return value.length != 0;
        }
    }
}(window.jQuery));