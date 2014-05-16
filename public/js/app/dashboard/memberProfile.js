$(function() {
    $('#AddUserSkillModal form #spinningWheel').hide();
    $('#EditUserSkillModal form #spinningWheel').hide();
});

$('.datepicker').datepicker({
    format: 'dd/mm/yyyy'
});

$('#ChangePasswordModal form').validate({
    rules         : {
        oldPassword: {required: true },
        password: { required: true},
        confirm_password : { required: true, equalTo: "#password"}
    },
    errorPlacement: function(error, element)
    {
        $(element).attr('title', error[0].innerHTML);
        $(element).tooltip('show');
    },
    highlight     : function(element)
    {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight   : function(element)
    {
        $(element).closest('.form-group').removeClass('has-error');
    },
    submitHandler : function()
    {
        $.ajax({
            url : '/member/' + memberId + '/changePassword',
            type: 'post',
            data: {
                oldPass: $('#ChangePasswordModal form #oldPassword').val(),
                pass: $('#ChangePasswordModal form #password').val()
            },
            success: function(res)
            {
                bootbox.alert(res, function(){
                    location.reload();
                });
            },
            error: function(error)
            {
                bootbox.alert(error.responseText, function(){
                    location.reload();
                });
            }
        })
    }
});

$('#SendProfile').click(function(){
    if(userProfile.status == 1)
        bootbox.confirm("Are you sure you want to send your profile for approval?", function(result){
            if(result)
            {
                $.ajax({
                    url : '/member/' + memberId + '/changeProfileStatus',
                    type: 'post',
                    data: {profileId:userProfile.id},
                    success: function()
                    {
                        location.reload();
                    }
                })
            }
        })
});

$('#publishProfile').click(function(){
        bootbox.confirm("Are you sure you want to publish this profile?", function(result){
            if(result)
            {
                $.ajax({
                    url : '/member/' + memberId + '/publishProfile',
                    type: 'post',
                    data: {profileId:userProfile.id, userId:user.id},
                    success: function()
                    {
                        location.reload();
                    }
                })
            }
        })
});

$('#EditUserProfileModal form').validate({
    rules         : {
        first_name: { required: true},
        last_name : { required: true}
    },
    errorPlacement: function(error, element)
    {
        $(element).attr('title', error[0].innerHTML);
        $(element).tooltip('show');
    },
    highlight     : function(element)
    {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight   : function(element)
    {
        $(element).closest('.form-group').removeClass('has-error');
    },
    submitHandler : function()
    {
        $.ajax({
            url : '/member/' + memberId + '/profile',
            type: 'post',
            data: {
                user: {
                    title           : $('#EditUserProfileModal form #title').val(),
                    first_name      : $('#EditUserProfileModal form #first_name').val(),
                    last_name       : $('#EditUserProfileModal form #last_name').val(),
                    industry        : $('#EditUserProfileModal form #industry').val(),
                    date_of_birth   : $('#EditUserProfileModal form #birthDate').val()
                },
                userProfile: {
                    id              : userProfile.id,
                    short_desc      : $('#EditUserProfileModal form #short_desc').val(),
                    long_desc       : $('#EditUserProfileModal form #long_desc').val()
                }
            },
            success: function()
            {
                location.reload();
            }
        })
    }
});

$('select').selectpicker();

/* FILE UPLOAD */

// Proxy for file upload control
$('#selectFileBtn').click(function() {
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
        url: $('#fileUploadForm').attr('action'),
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        success: function(data, textStatus, jqXHR)
        {
            if(typeof data.error === 'undefined')
                $('#profileImage').attr('src', data.url + '?' + Math.random());
            else
                console.log('ERRORS: ' + data.error);
        },
        error: function(jqXHR, textStatus, errorThrown)
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
        url: 'submit.php',
        type: 'POST',
        data: formData,
        cache: false,
        dataType: 'json',
        success: function(data, textStatus, jqXHR)
        {
            if(typeof data.error === 'undefined')
                $('#profileImage').attr('src', data.url);
            else
                console.log('ERRORS: ' + data.error);
        },
        error: function(jqXHR, textStatus, errorThrown)
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
    limit:10,
    remote: {
        url     : 'http://www.linkedin.com/ta/skill?query=',
        replace: function(url, query) {
            return url + query;
        },
        ajax:{
            dataType: 'jsonp',
            method: 'get'
        },
        filter: function(response) {
            $('#AddUserSkillModal form #spinningWheel').hide();
            $('#EditUserSkillModal form #spinningWheel').hide();
            skillSet =  $.map(response.resultList, function (skill){
                return {
                    value: skill.displayName,
                    code: skill.id
                };
            });
            var skillString = $.map(skillSet,  function(skill){
                return skill.value
            });
            return skillString;
        }
    }
});

fetchedSkill.initialize();

var count = 0;
$('#AddUserSkillModal .typeahead').keypress(function(event)
{
    if(event.key == 'Backspace')
    {
        if(count > 0)
            count--;
    }
    else
        count++;
    if(count>0)
        $('#AddUserSkillModal form #spinningWheel').show();
    else
        $('#AddUserSkillModal form #spinningWheel').hide();
});

$('#AddUserSkillModal .typeahead').typeahead(
    {
        items: 'all',
        name: 'skillName',
        source : fetchedSkill.ttAdapter()
    }
);

$('#AddUserSkillModal form').validate({
    rules         : {
        skill_name : { required: true}
    },
    errorPlacement: function(error, element)
    {
        $(element).attr('title', error[0].innerHTML);
        $(element).tooltip('show');
    },
    highlight     : function(element)
    {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight   : function(element)
    {
        $(element).closest('.form-group').removeClass('has-error');
    },
    submitHandler : function()
    {
        var updatedSkill = $('#AddUserSkillModal [name="skill_name"]').val();
        var skillLkinCode;
        $.each(skillSet, function(key,skill){
            if(skill.value == updatedSkill)
                skillLkinCode = skill.code;
        });
        $.ajax({
            url : '/rest/user/skill',
            type: 'put',
            data: {
                skill: {
                    skill_linkedin_code     :   skillLkinCode,
                    skill_name              :   updatedSkill
                },
                profileId: userProfile.id
            },
            success: function()
            {
                location.reload();
            }
        })
    }
});

var countEditSkill = 0;
$('#EditUserSkillModal .typeahead').keypress(function(event)
{
    if(event.key == 'Backspace')
    {
        if(countEditSkill > 0)
            countEditSkill--;
    }
    else
        countEditSkill++;
    if(countEditSkill>0)
        $('#EditUserSkillModal form #spinningWheel').show();
    else
        $('#EditUserSkillModal form #spinningWheel').hide();
});

$('.editUserSkill').click(function()
{
    var selectedUserSkill;
    var userSkillId = $(this).data('id');
    for(var i = 0; i<userSkill.length; i++)
        if(userSkill[i].id == userSkillId)
            selectedUserSkill = userSkill[i];
    if (selectedUserSkill) {
        $('#EditUserSkillModal .btn-primary').attr('data-id', selectedUserSkill.id);
        $('#EditUserSkillModal [name="skill_name"]').val(selectedUserSkill.skill_name);
    }
});

$('#EditUserSkillModal .typeahead').typeahead(
    {
        items: 'all',
        name: 'skills',
        source : fetchedSkill.ttAdapter()
    }
);

$('#EditUserSkillModal form').validate({
    rules         : {
        skill_name : { required: true}
    },
    errorPlacement: function(error, element)
    {
        $(element).attr('title', error[0].innerHTML);
        $(element).tooltip('show');
    },
    highlight     : function(element)
    {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight   : function(element)
    {
        $(element).closest('.form-group').removeClass('has-error');
    },
    submitHandler : function()
    {
        var skillId = $('#EditUserSkillModal form .btn-primary').attr('data-id');
        var updatedSkill = $('#EditUserSkillModal [name="skill_name"]').val();
        var skillLkinCode;
        $.each(skillSet, function(key,skill){
            if(skill.value == updatedSkill)
                skillLkinCode = skill.code;
        });
        $.ajax({
            url : '/rest/user/skill/' + skillId,
            type: 'post',
            data: {
                skill: {
                    skill_linkedin_code              :   skillLkinCode,
                    skill_name              :   updatedSkill
                }
            },
            success: function()
            {
                location.reload();
            }
        })
    }
});

$('.deleteUserSkill').click(function()
{
    var skillId = $(this).data('id');
    $('#DeleteUserSkillModal .btn-primary').attr('data-id', skillId);
});

function handleSkillDeleteClicked(event)
{
    var skillId = $(event.currentTarget).attr('data-id');
    $.ajax({
        url    : '/rest/user/skill/' + skillId,
        type   : 'DELETE',
        data: {
            id              : skillId,
            profileId       : userProfile.id
        },
        success: function()
        {
            location.reload();
        }
    });
};

$('#fetchSkill,#fetchEmployment,#fetchEducation,#fetchBasic').click(function(event)
{
   bootbox.confirm('Are you sure you want to replace the current information with information from LinkedIn?', function(result)
   {
      if (result)
      {
          location.href = '/member/profileFromLinkedIn/' + userProfile.id + '?memberId' + memberId + '&' + $(event.currentTarget).attr('id')+ '=on';
      }
   });
});

$('#deleteUserSkill').click(handleSkillDeleteClicked);