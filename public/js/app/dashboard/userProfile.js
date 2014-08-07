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

$('.editCardBtn').click(function(event)
{
    basicProfileCard.edit(unEscapeObject(userProfile), $(event.currentTarget))
});

$('#basicProfile .edit-card form').bootstrapValidator({
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
})
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

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
        });
    });

$('form#AddUserSkillForm').bootstrapValidator({
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
})
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

        var selectedSkills = _.map($('form#AddUserSkillForm .tokeninput').tokenInput("get"), function(skill) {
            return {
                skill_name         : skill.name
            }
        });
        $.ajax({
            url    : '/rest/user/skill',
            type   : 'put',
            data   : {
                skill    : selectedSkills
            },
            success: function()
            {
                location.reload();
            }
        });
    });

$('.deleteUserSkill').click(function()
{
    var skillId = $(this).data('id');
    $.ajax({
        url    : '/rest/user/skill/' + skillId,
        type   : 'DELETE',
        data   : {
            id       : skillId,
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

})
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

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
    });

$('#expertise .edit-card form .tokeninput, form#AddUserSkillForm .tokeninput').tokenInput('//www.linkedin.com/ta/skill', {
    theme: "facebook",
    queryParam: 'query',
    onResult:processLinkedInResponse,
    onCachedResult:processLinkedInResponse,
    onAdd:callValidate,
    onDelete:callValidate,
    crossDomain:true,
    caching:false
});

function processLinkedInResponse(response)
{
    return _.map(response.resultList, function(skill)
    {
        return {
            name: skill.displayName,
            id : skill.id
        };
    });
}

function preFillValues(expertiseId)
{
    for(var i = 0; i < userExpertise.length; i++ )
    {
        if(userExpertise[i].id == expertiseId)
        {
            if(userExpertise[i].skill && userExpertise[i].skill.length != 0)
                for(var j=0; j< userExpertise[i].skill.length; j++)
                {
                    $('#expertise .edit-card form .tokeninput').tokenInput(("add"),{id:userExpertise[i].skill[j].skill.id, name:userExpertise[i].skill[j].skill.skill});
                }
        }
    }
}

function callValidate()
{
    $('#expertise .edit-card form').data('bootstrapValidator').validate();
}

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
        },
        skill_name: {
            validators: {
                notEmpty: { message: 'This field is required'}
            }
        }
    }
})
    .on('success.form.bv', function(e) {
        // Prevent form submission
        e.preventDefault();

        var $form        = $(e.target),
            validator    = $form.data('bootstrapValidator'),
            submitButton = validator.getSubmitButton();

        var expertiseId = $('#expertise .edit-card form input[name=id]').val();
        var method = expertiseId ? 'post' : 'put';
        var expertiseUrl = expertiseId ? '/rest/user/expertise/' + expertiseId : '/rest/user/expertise';
        var selectedSkills = _.map($('#expertise .edit-card form .tokeninput').tokenInput("get"), function(skill) {
            return {
                skill_name         : skill.name
            }
        });
        $.ajax({
            url        : expertiseUrl,
            method     : method,
            dataType   : 'json',
            contentType: 'application/json',
            data       : JSON.stringify({
                expertise: {
                    session_duration   : parseInt($('#expertise .edit-card form input[name=session_duration]').val()),
                    session_price      : parseFloat($('#expertise .edit-card form input[name=session_price]').val()),
                    session_price_unit : $('#expertise .edit-card form select[name=session_price_unit]').val(),
                    title              : $('#expertise .edit-card form input[name=title]').val(),
                    description        : $('#expertise .edit-card form textarea[name=description]').val(),
                    years_of_experience: $('#expertise .edit-card form input[name=years_of_experience]').val()
                }
            }),
            success    : function(response)
            {
                $.ajax({
                    url        : '/rest/user/expertise/skill',
                    method     : 'put',
                    dataType   : 'json',
                    contentType: 'application/json',
                    data       : JSON.stringify({
                        skills             : selectedSkills,
                        expertiseId        : response.id || expertiseId
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
            },
            error      : function(jqXHR)
            {
                bootbox.alert(jqXHR.responseText);
            }
        });
    });

$('#addExpertiseBtn').click(expertiseCard.create);
$('.editExpertiseBtn').click(function()
{
    var expertiseId = $(this).data('id');
    var expertise = _.findWhere(userExpertise, {id: expertiseId});

    preFillValues(expertiseId);
    populate($('#expertise .edit-card form'), expertise);
    expertiseCard.edit(expertise, this);
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
    $('#expertise .edit-card form #pricing').toggle($(this).val() != '0');
    $('#expertise .edit-card form').data('bootstrapValidator').revalidateField('session_price');
    $('#expertise .edit-card form').data('bootstrapValidator').revalidateField('session_duration');
});
