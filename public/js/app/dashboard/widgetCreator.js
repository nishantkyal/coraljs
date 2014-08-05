var expertId = loggedInUser ? loggedInUser.id : null;

$('input,select').on('change', updateWidget);

function updateWidget() {
    var theme = $('select[name=theme]').val();
    var width = $('select[name=width]').val();
    var verb = $('select[name=verb] option:selected').text();
    expertId = $('input[name=expertId]').val();

    var widgetUrl = widgetBaseUrl + '/widget?width=' + width + '&theme=' + theme + '&userId=' + expertId + '&verb=' + escape(verb);
    var iframeCode = '<iframe scrolling="no" style="overflow: hidden" style="border: none;" class="snt-expert-iframe" src=' + widgetUrl  + '></iframe>';

    $('#widgetEmbedCode').text('<div class="snt-expert" data-id="' + expertId + '" data-theme="' + theme + '" data-width="' + width + '" data-verb="' + verb + '"></div>');
    $('#iframeContent').html(iframeCode);
    $('#iframeContent iframe').iFrameResize({
        sizeWidth: true
    });
}
$(document).ready(function() {
    if (expertId)
        updateWidget();
});

