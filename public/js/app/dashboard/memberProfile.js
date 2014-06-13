$(function() {
    $('form#AddUserSkillForm #spinningWheel').hide();
});

$('.datepicker').datetimepicker();

$('#addSkillbtn').click(function()
{
    $('#AddUserSkillCard').show();
    $('#basicInfo').hide();

    $('form#AddUserSkillForm').trigger('reset');
    $('form#AddUserSkillForm').data('bootstrapValidator').resetForm();
});

$('#cancelAddUserSkill').click(function()
{
    $('#basicInfo').show();
    $('#AddUserSkillCard').hide();
});

$('#ChangePasswordModal form').bootstrapValidator({
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

$('#EditUserProfileModal form').bootstrapValidator({
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
$('form#AddUserSkillForm .typeahead').keypress(function(event)
{
    if(event.key == 'Backspace')
    {
        if(count > 0)
            count--;
    }
    else
        count++;
    if(count>0)
        $('form#AddUserSkillForm #spinningWheel').show();
    else
        $('form#AddUserSkillForm #spinningWheel').hide();
});

$('form#AddUserSkillForm .typeahead').typeahead(
    {
        items: 'all',
        name: 'skillName',
        source : fetchedSkill.ttAdapter()
    }
);

$('form#AddUserSkillForm').bootstrapValidator({
    submitHandler : function()
    {
        var updatedSkill = $('#AddUserSkillForm input[name="skill_name"]').val();
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
    },
    feedbackIcons: {
        valid     : 'glyphicon glyphicon-ok',
        invalid   : 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields         : {
        skill_name : {
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
        data: {
            id              : skillId,
            profileId       : userProfile.id
        },
        success: function()
        {
            location.reload();
        }
    });
});

$('#fetchSkill,#fetchEmployment,#fetchEducation,#fetchBasic').click(function(event)
{
   bootbox.confirm('Are you sure you want to replace the current information with information from LinkedIn?', function(result)
   {
      if (result)
      {
          location.href = '/member/profileFromLinkedIn/' + userProfile.id + '?memberId=' + memberId + '&' + $(event.currentTarget).attr('id')+ '=on';
      }
   });
});