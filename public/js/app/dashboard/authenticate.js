setCookie('offset', -new Date().getTimezoneOffset() * 60);

$(function(){
    var offset = new Date().getTimezoneOffset() * -60;
    var zone = _.find(Timezone, function(zone){
        return zone.gmt_offset == offset;
    });
    $('[name="timezone"]').val(zone.zone_id).prop('selected',true);
});

$("#login-form").bootstrapValidator({
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields         : {
        username : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                },
                emailAddress: {
                    message: 'This field should be a valid Email Address'
                }
            }
        },
        password : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        }
    }
});

$("#registration-form").bootstrapValidator({
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields         : {
        email : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                },
                emailAddress: {
                    message: 'This field should be a valid Email Address'
                }
            }
        },
        first_name : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        password: {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                },
                regexp: { // also used in usersetting.js (change password)
                    regexp: /^(?=.*\d+)(?=.*[@#$%&*-])([a-zA-Z0-9@#$%&*-]{7,})$/,
                    message: 'Password must have 8 or more characters, contain a digit(0-9) and a special character(@,#,$,%,&,- or *).'
                }
            }
        },
        confirm_password: {
            validators: {
                identical: {
                    field:'password',
                    message:'Please re-enter same password'
                },
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        }
    }
});