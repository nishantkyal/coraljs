var expertId = loggedInUser ? loggedInUser.id : null;

$('input,select,textarea').on('change', updateWidget);

function updateWidget() 
{
    var queryStringObject = {
        theme : $('select[name=theme]').val(),
        width : $('select[name=width]').val(),
        verb : $('select[name=verb] option:selected').text(),
        title : $('textarea[name=title]').val(),
        user_id : $('input[name=user_id]').val(),
        profile_picture : $('input[name=profile_picture]:checked').length != 0,
        timezone : $('input[name=timezone]:checked').length != 0,
        availability : $('input[name=availability]:checked').length != 0,
        pricing : $('input[name=pricing]:checked').length != 0,
        skills : $('input[name=skills]:checked').length != 0
    };

    var widgetUrl = widgetBaseUrl + '/widget?' + decodeURIComponent($.param(queryStringObject));
    var iframeCode = '<iframe scrolling="no" style="overflow: hidden" style="border: none;" class="snt-expert-iframe" src=' + widgetUrl  + '></iframe>';
    var widgetEmbedCode = '<div class="snt-expert" ' + _.map(_.keys(queryStringObject), function(key) { return "data-" + key + "=\"" + queryStringObject[key] + "\""}).join(" ") + '></div>';

    $('#widgetEmbedCode').text(widgetEmbedCode);
    $('#iframeContent').html(iframeCode);
    $('#iframeContent iframe').iFrameResize({
        sizeWidth: true
    });
}
$(document).ready(function() {
    if (expertId)
        updateWidget();
});

