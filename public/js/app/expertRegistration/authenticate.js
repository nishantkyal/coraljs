$(function(){
    var offset = new Date().getTimezoneOffset() * -60;
    var zone = _.find(Timezone, function(zone){
        return zone.gmt_offset == offset;
    });
    $("#timezone").val(zone.zone_id).prop('selected',true);
    $("#linkedInLink").attr('href', linkedInUrl + '?zone=' + zone.zone_id);
});

$("#login-form").validate({
    onkeyup: false,
    rules: {
        username: {
            required: true,
            email: true
        },
        login_password: {
            required: true
        }
    },
    errorPlacement: function(error, element) {
        $(element).attr('title', error[0].innerHTML);
        $(element).tooltip('show');
    },
    highlight: function(element) {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        $(element).closest('.form-group').removeClass('has-error');
    }
});

$("#registration-form").validate({
    onkeyup: false,
    rules: {
        email: {
            required: true,
            email: true
        },
        first_name: {
            required: true
        },
        password: {
            required: true
        },
        confirm_password: {
            required:true,
            equalTo: '#password'
        }

    },
    errorPlacement: function(error, element) {
        $(element).attr('title', error[0].innerHTML);
        $(element).tooltip('show');
    },
    highlight: function(element) {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        $(element).closest('.form-group').removeClass('has-error');
    }
});