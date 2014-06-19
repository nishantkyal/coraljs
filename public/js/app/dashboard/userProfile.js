$('#editUserProfileBtn').click(function()
{
    $('#basicInfo').hide();
    $('#editBasicInfo').show();
});

$('#cancelEditUserProfile').click(function()
{
    $('#basicInfo').show();
    $('#editBasicInfo').hide();
});

$('#addSkillbtn').click(function()
{
    $('#addSkill').show();
    $('#basicInfo').hide();

    $('form#AddUserSkillForm').trigger('reset');
    $('form#AddUserSkillForm').trigger('reset');
    $('form#AddUserSkillForm').data('bootstrapValidator').resetForm();
});

$('#cancelAddUserSkill').click(function()
{
    $('#basicInfo').show();
    $('#editBasicInfo').hide();
});

$('form#editUserProfileForm').bootstrapValidator({
    submitHandler: function()
    {
        $.ajax({
            url    : '/rest/user/' + user.id,
            type   : 'post',
            data   : {
                user: {
                    title        : $('form#editUserProfileForm select[name="title"]').val(),
                    first_name   : $('form#editUserProfileForm input[name="first_name"]').val(),
                    last_name    : $('form#editUserProfileForm input[name="last_name"]').val(),
                    industry     : $('form#editUserProfileForm select[name="industry"]').val(),
                    timezone     : $('form#editUserProfileForm select[name="timezone"]').val(),
                    date_of_birth: $('form#editUserProfileForm input[name="birthDate"]').val()
                }
            },
            success: function()
            {
                $.ajax({
                    url    : '/rest/user/profile/' + userProfile.id,
                    type   : 'post',
                    data   : {
                        userProfile: {
                            id        : userProfile.id,
                            short_desc: $('form#editUserProfileForm input[name="short_desc"]').val(),
                            long_desc : $('form#editUserProfileForm input[name="long_desc"]').val()
                        }
                    },
                    success: function()
                    {
                        location.reload();
                    },
                    error  : function(error)
                    {
                        bootbox.alert(error.responseText);
                    }
                })
            },
            error  : function(error)
            {
                bootbox.alert(error.responseText);
            }
        })
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields       : {
        first_name: {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        },
        last_name : {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        }
    }
});

/* FILE UPLOAD */

// Proxy for file upload control
$('#selectFileBtn').click(function()
{
    $('#selectFile').click();
});

// Trigger form submit on file select
$('#selectFile').change(function uploadFiles(event)
{
    var files = event.target.files;

    // START A LOADING SPINNER HERE

    // Create a formdata object and add the files
    var data = new FormData();
    $.each(files, function(key, value)
    {
        data.append('image', value);
    });

    $.ajax({
        url        : $('#fileUploadForm').attr('action'),
        type       : 'POST',
        data       : data,
        cache      : false,
        dataType   : 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        success    : function(data, textStatus, jqXHR)
        {
            if (typeof data.error === 'undefined')
                $('#profileImage').attr('src', data.url + '?' + Math.random());
            else
                console.log('ERRORS: ' + data.error);
        },
        error      : function(jqXHR, textStatus, errorThrown)
        {
            // Handle errors here
            console.log('ERRORS: ' + textStatus);
            // STOP LOADING SPINNER
        }
    });
});

function submitForm(event, data)
{
    // Create a jQuery object from the form
    var form = $('#fileUploadForm');

    // Serialize the form data
    var formData = form.serialize();

    // You should sterilise the file names
    $.each(data.files, function(key, value)
    {
        formData = formData + '&filenames[]=' + value;
    });

    $.ajax({
        url     : 'submit.php',
        type    : 'POST',
        data    : formData,
        cache   : false,
        dataType: 'json',
        success : function(data, textStatus, jqXHR)
        {
            if (typeof data.error === 'undefined')
                $('#profileImage').attr('src', data.url);
            else
                console.log('ERRORS: ' + data.error);
        },
        error   : function(jqXHR, textStatus, errorThrown)
        {
            console.log('ERRORS: ' + textStatus);
        },
        complete: function()
        {
            // STOP LOADING SPINNER
        }
    });
}

var skillSet = [];
var fetchedSkill = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit         : 10,
    remote        : {
        url    : 'http://www.linkedin.com/ta/skill?query=',
        replace: function(url, query)
        {
            return url + query;
        },
        ajax   : {
            dataType: 'jsonp',
            method  : 'get'
        },
        filter : function(response)
        {
            $('form#AddUserSkillForm #spinningWheel').hide();
            skillSet = _.map(response.resultList, function(skill)
            {
                return {
                    value: skill.displayName,
                    code : skill.id
                };
            });

            return _.pluck(skillSet, 'value');
        }
    }
});

fetchedSkill.initialize();

var count = 0;
$('form#AddUserSkillForm .typeahead').keypress(function(event)
{
    if (event.key == 'Backspace') {
        if (count > 0)
            count--;
    }
    else
        count++;
    if (count > 0)
        $('form#AddUserSkillForm #spinningWheel').show();
    else
        $('form#AddUserSkillForm #spinningWheel').hide();
});

$('form#AddUserSkillForm .typeahead').typeahead(
    {
        items : 'all',
        name  : 'skillName',
        source: fetchedSkill.ttAdapter()
    }
);

$('form#AddUserSkillForm').bootstrapValidator({
    submitHandler: function()
    {
        var updatedSkill = $('#AddUserSkillForm input[name="skill_name"]').val();
        var skillLkinCode;
        $.each(skillSet, function(key, skill)
        {
            if (skill.value == updatedSkill)
                skillLkinCode = skill.code;
        });
        $.ajax({
            url    : '/rest/user/skill',
            type   : 'put',
            data   : {
                skill    : {
                    skill_linkedin_code: skillLkinCode,
                    skill_name         : updatedSkill
                },
                profileId: userProfile.id
            },
            success: function()
            {
                location.reload();
            }
        })
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields       : {
        skill_name: {
            validators: {
                notEmpty: {
                    message: 'This field is required and cannot be empty'
                }
            }
        }
    }
});

$('[name="deleteUserSkill"]').click(function()
{
    var skillId = $(this).attr('data-id');
    $.ajax({
        url    : '/rest/user/skill/' + skillId,
        type   : 'DELETE',
        data   : {
            id       : skillId,
            profileId: userProfile.id
        },
        success: function()
        {
            location.reload();
        }
    });
});

$('#fetchProfilePicture,#fetchSkill,#fetchEmployment,#fetchEducation,#fetchBasic').click(function(event)
{
    bootbox.confirm('Are you sure you want to replace the current information with information from LinkedIn?', function(result)
    {
        if (result) {
            location.href = '/member/profileFromLinkedIn/' + userProfile.id + '?userId=' + user.id + '&' + $(event.currentTarget).attr('id') + '=on';
        }
    });
});

$('form#expertiseDetails').bootstrapValidator({
    fields       : {
        'title'            : {
            validators: {
                required: { message: 'This field is required'}
            }
        },
        session_price      : {
            validators: {
                digits  : {
                    message: "Please enter a valid number"
                },
                callback: {
                    message : 'This field is required to define a session',
                    callback: function(val)
                    {
                        if ($('form#expertiseDetails input[name=session_toggle]:checked').val() == '1')
                            return val && parseFloat(val) > 0;
                        return true;
                    }
                }
            }
        },
        session_duration   : {
            validators: {
                digits  : {
                    message: "Please enter a valid number"
                },
                callback: {
                    message : 'This field is required to define a session',
                    callback: function(val)
                    {
                        if ($('form#expertiseDetails input[name=session_toggle]:checked').val() == '1')
                            return val && parseFloat(val) > 0;
                        return true;
                    }
                }
            }
        },
        description        : {
            validators: {
                required: { message: 'This field is required'}
            }
        },
        years_of_experience: {
            validators: {
                digits: { message: 'This field is required'}
            }
        }
    },
    submitHandler: function()
    {
        var expertiseId = '';
        var method = expertiseId ? 'post' : 'put';
        var expertiseUrl = expertiseId ? '/rest/user/expertise/' + expertiseId : '/rest/user/expertise';

        $.ajax({
            url        : expertiseUrl,
            method     : method,
            dataType   : 'json',
            contentType: 'application/json',
            data       : JSON.stringify({
                expertise: {
                    session_duration: $('form#expertiseDetails input[name=session_duration]').val(),
                    session_price: $('form#expertiseDetails input[name=session_price]').val(),
                    session_price_unit: $('form#expertiseDetails input[name=session_price_unit]').val(),
                    title: $('form#expertiseDetails input[name=title]').val(),
                    description: $('form#expertiseDetails input[name=description]').val(),
                    years_of_experience: $('form#expertiseDetails input[name=years_of_experience]').val()
                }
            }),
            success    : function()
            {
                location.reload();
            }
        })
    }
});

$('#addExpertiseBtn').click(function()
{
    $('form#expertiseDetails').trigger('reset');
    $('form#expertiseDetails').data('bootstrapValidator').resetForm();

    $('#expertiseDetails').show();
});

$('#editExpertiseBtn').click(function()
{
    var expertiseId = '';
    var expertise = _.findWhere(expertiseList, {id: expertiseId});

    populateForm($('form#userExpertise'), expertise);
    $('form#expertiseDetails').data('bootstrapValidator').resetForm();

    $('#expertiseDetails').show();
});

$('#cancelExpertiseDetails').click(function()
{
    $('#expertiseDetails').hide();
});

$('#sessionToggle input').change(function()
{
    $('#expertiseDetails #pricing').toggle($('#sessionToggle input[name=pricing_scheme_id]:checked').val() != '0');
    $('form#expertiseDetails').data('bootstrapValidator').validate();
});