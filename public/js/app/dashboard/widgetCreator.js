var expertId = loggedInUser ? loggedInUser.id : null;

var WIDGET_SIZES = {
    'tiny': {width: 160, height: 115},
    'small': {width: 160, height: 251},
    'tall': {width: 160, height: 392}
};

$('input,select').on('change', updateWidget);

function updateWidget() {
    var theme = $('select[name="theme"]').val();
    var size = $('select[name="size"]').val();
    var verb = $('select[name="verb"] option:selected').text();
    expertId = $('input[name="expertId"]').val();

    var widgetUrl = widgetBaseUrl + '/widget?size=' + size + '&theme=' + theme + '&userId=' + expertId + '&verb=' + escape(verb);
    var iframeCode = '<iframe scrolling="no" style="overflow: hidden" style="border: none;" class="snt-expert-iframe" src=' + widgetUrl  + ' width=' + WIDGET_SIZES[size].width +
        ' height=' + WIDGET_SIZES[size].height  + '></iframe>';

    $('#widgetEmbedCode').text('<div class="snt-expert" data-id="' + expertId + '" data-theme="' + theme + '" data-size="' + size + '" data-verb="' + verb + '"></div>');
    $('#iframeContent').html(iframeCode);
}
$(document).ready(function() {
    if (expertId)
        updateWidget();
});