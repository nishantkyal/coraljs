$(function(){
    if(searchParameters.priceRange)
        $('#price').slider('setValue',searchParameters.priceRange)

    if(searchParameters.skill)
        for(var i=0; i< searchParameters.skill.length; i++)
        {
            $('form .tokeninput').tokenInput(("add"),{
                name:searchParameters.skill[i]
            });
        }

    if(searchParameters.availability)
        $('#availability').prop('checked', true);
});

$('#reset').click(function(){
    location.href = $(location).attr('href').split('?')[0];
});

$('.tokeninput').tokenInput('//www.linkedin.com/ta/skill', {
    theme: "facebook",
    queryParam: 'query',
    onResult:processLinkedInResponse,
    onCachedResult:processLinkedInResponse,
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

$('#years_of_experience').slider({
    min:0,
    max:50,
    step:1,
    range:true,
    value:[0,50]
});

$('#price').slider({
    min:0,
    max:500,
    step:5,
    range:true,
    value:[0,500]
});

$('form#search').submit(function()
    {
        var selectedSkills = _.map($('form .tokeninput').tokenInput("get"), function(skill) {
            return skill.name;
        });
        $('form .tokeninput').val(selectedSkills.join(','));
    }
);