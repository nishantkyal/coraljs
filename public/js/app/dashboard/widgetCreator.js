var currentTheme = 'dark';
var currentSize = 'tall';
var expertId = loggedInUser ? loggedInUser.id : null;

var WIDGET_SIZES = {
    'tiny': {width: 160, height: 115},
    'small': {width: 160, height: 251},
    'tall': {width: 160, height: 392}
};

$('[name="theme"]').on('change', function() {
    currentTheme = $('select[name="theme"]').val();
    insertIframe(currentTheme, currentSize, expertId);
});

$('[name="size"]').on('change', function() {
    currentSize = $('select[name="size"]').val();
    insertIframe(currentTheme, currentSize, expertId);
});

$('[name="expertId"]').on('change', function() {
    expertId = $('input[name="expertId"]').val();
    $('#helpText').hide();
    insertIframe(currentTheme, currentSize, expertId);
});

function insertIframe(widgetTheme, widgetSize,expertId){
    $('#embedCode').show();

    var widgetUrl = widgetBaseUrl + '/widget?size=' + widgetSize + '&theme=' + widgetTheme + '&userId=' + expertId;
    var embedCode = '<iframe scrolling="no" style="overflow: hidden" style="border: none;" class="snt-expert-iframe" src=' + widgetUrl  + ' width=' + WIDGET_SIZES[widgetSize].width +
        ' height=' + WIDGET_SIZES[widgetSize].height  + '></iframe>';

    $('#iframeContent').empty();
    $('#iframeContent').append(embedCode);
    $('[name="embedCodeText"]').val(embedCode);
}

$(document).ready(function() {
    $('#embedCode').hide();
    if (expertId)
        insertIframe(currentTheme, currentSize, expertId);
});