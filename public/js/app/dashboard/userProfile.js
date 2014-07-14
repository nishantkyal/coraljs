var basicProfileCard = $('#basicProfile').card();

$('#addSkillBtn').click(function()
{
    $('#addSkill').show();
    $('#basicProfile').hide();

    $('form#AddUserSkillForm').trigger('reset');
    $('form#AddUserSkillForm').trigger('reset');
    $('form#AddUserSkillForm').data('bootstrapValidator').resetForm();
});

$('#cancelAddUserSkill').click(function()
{
    $('#basicProfile').show();
    $('#addSkill').hide();
});

$('#basicProfile .edit-card form').bootstrapValidator({
    submitHandler: function()
    {
        $.ajax({
            url        : '/rest/user/' + user.id,
            type       : 'post',
            dataType   : 'json',
            contentType: 'application/json',
            data       : JSON.stringify({
                user       : {
                    title        : $('#basicProfile .edit-card form select[name="title"]').val(),
                    first_name   : $('#basicProfile .edit-card form input[name="first_name"]').val(),
                    last_name    : $('#basicProfile .edit-card form input[name="last_name"]').val(),
                    industry     : $('#basicProfile .edit-card form select[name="industry"]').val(),
                    timezone     : $('#basicProfile .edit-card form select[name="timezone"]').val(),
                    date_of_birth: $('#basicProfile .edit-card form input[name="birthDate"]').val()
                },
                userProfile: {
                    short_desc: $('#basicProfile .edit-card form input[name="short_desc"]').val(),
                    long_desc : $('#basicProfile .edit-card form input[name="long_desc"]').val()
                }
            }),
            success    : function()
            {
                location.reload();
            },
            error      : function(error)
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

$('.deleteUserSkill').click(function()
{
    var skillId = $(this).data('id');
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

$('#fetchFromLinkedin').click(function(event)
{
    $('#linkedinFetch').show();

    $('form#linkedinFetch').trigger('reset');
    $('form#linkedinFetch').data('bootstrapValidator').resetForm();
});

$('#cancelLinkedinFetch').click(function(event)
{
    $('#linkedinFetch').hide();
})

$('form#linkedinFetch').bootstrapValidator({
    submitHandler: function()
    {
        bootbox.confirm('Are you sure you want to replace the current information with information from LinkedIn?', function(result)
        {
            if (result) {
                var fetchFields = '';
                if ($('input[name="fetchBasic"]').is(':checked'))
                    fetchFields += 'fetchBasic:';
                if ($('input[name="fetchEducation"]').is(':checked'))
                    fetchFields += 'fetchEducation:';
                if ($('input[name="fetchEmployment"]').is(':checked'))
                    fetchFields += 'fetchEmployment:';
                if ($('input[name="fetchProfilePicture"]').is(':checked'))
                    fetchFields += 'fetchProfilePicture:';
                if ($('input[name="fetchSkill"]').is(':checked'))
                    fetchFields += 'fetchSkill:';

                setCookie('linkedin_fetch_fields', fetchFields);
                setCookie('profileId', userProfile.id);

                IN.User.authorize(linkedInLogin);
            }
        });
    }
});

var expertiseCard = $('#expertise').card();
$('#expertise .edit-card form').bootstrapValidator({
    fields       : {
        'title'            : {
            validators: {
                notEmpty: { message: 'This field is required'}
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
                        if ($('#expertise .edit-card form input[name=session_toggle]:checked').val() == '1')
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
                        if ($('#expertise .edit-card form input[name=session_toggle]:checked').val() == '1')
                            return val && parseFloat(val) > 0;
                        return true;
                    }
                }
            }
        },
        description        : {
            validators: {
                notEmpty: { message: 'This field is required'}
            }
        },
        years_of_experience: {
            validators: {
                digits: { message: 'Please enter a valid number'}
            }
        }
    },
    submitHandler: function()
    {
        var expertiseId = $('#expertise .edit-card form input[name=id]').val();
        var method = expertiseId ? 'post' : 'put';
        var expertiseUrl = expertiseId ? '/rest/user/expertise/' + expertiseId : '/rest/user/expertise';

        $.ajax({
            url        : expertiseUrl,
            method     : method,
            dataType   : 'json',
            contentType: 'application/json',
            data       : JSON.stringify({
                expertise: {
                    session_duration   : $('#expertise .edit-card form input[name=session_duration]').val(),
                    session_price      : $('#expertise .edit-card form input[name=session_price]').val(),
                    session_price_unit : $('#expertise .edit-card form input[name=session_price_unit]').val(),
                    title              : $('#expertise .edit-card form input[name=title]').val(),
                    description        : $('#expertise .edit-card form textarea[name=description]').val(),
                    years_of_experience: $('#expertise .edit-card form input[name=years_of_experience]').val()
                }
            }),
            success    : function()
            {
                location.reload();
            },
            error      : function(jqXHR)
            {
                bootbox.alert(jqXHR.responseText);
            }
        });

    }
});

$('#addExpertiseBtn').click(expertiseCard.create);
$('.editExpertiseBtn').click(function()
{
    var expertiseId = $(this).data('id');
    var expertise = _.findWhere(userExpertise, {id: expertiseId});

    populate($('#expertise .edit-card form'), expertise);
    expertiseCard.edit(expertise, this)
});

$('.deleteExpertiseBtn').click(function()
{
    var expertiseId = $('#expertise .edit-card form input[name=id]').val();
    var expertiseUrl = expertiseId ? '/rest/user/expertise/' + expertiseId : '/rest/user/expertise';
    $.ajax({
        url        : expertiseUrl,
        method     : 'delete',
        dataType   : 'json',
        contentType: 'application/json',
        success    : function()
        {
            location.reload();
        },
        error      : function(jqXHR)
        {
            bootbox.alert(jqXHR.responseText);
        }
    });
});

$('#sessionToggle input').change(function()
{
    $('#expertiseDetails #pricing').toggle($('#sessionToggle input[name=pricing_scheme_id]:checked').val() != '0');
    $('#expertise .edit-card form').data('bootstrapValidator').validate();
});
