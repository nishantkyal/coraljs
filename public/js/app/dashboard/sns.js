$('.tokeninput').tokenInput('//www.linkedin.com/ta/skill', {
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

function callValidate()
{
    $('form#search').data('bootstrapValidator').validate();
}

$('#years_of_experience').slider({
    min:0,
    max:50,
    step:1,
    range:true,
    value:[0,50]
});

$('#years_of_experience').on('slideStop', function(){
    console.log($('#years_of_experience').slider('getValue'));
});

$('#price').slider({
    min:0,
    max:500,
    step:5,
    range:true,
    value:[0,500]
});
