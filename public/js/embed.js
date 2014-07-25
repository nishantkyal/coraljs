(function () {

    var scriptName = "embed.js";
    var jQuery;
    var jqueryPath = "http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js";
    var jqueryVersion = "1.8.3";

    /******** Get reference to self (scriptTag) *********/
    var allScripts = document.getElementsByTagName('script');
    var targetScripts = [];
    for (var i in allScripts) {
        var name = allScripts[i].src
        if(name && name.indexOf(scriptName) > 0)
            targetScripts.push(allScripts[i]);
    }

    /******** helper function to load external scripts *********/
    function loadScript(src, onLoad) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", src);

        if (script_tag.readyState) {
            script_tag.onreadystatechange = function () {
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    onLoad();
                }
            };
        } else {
            script_tag.onload = onLoad;
        }
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    }

    /******** helper function to load external css  *********/
    function loadCss(href) {
        var link_tag = document.createElement('link');
        link_tag.setAttribute("type", "text/css");
        link_tag.setAttribute("rel", "stylesheet");
        link_tag.setAttribute("href", href);
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(link_tag);
    }

    /******** load jquery into 'jQuery' variable then call main ********/
    if (window.jQuery === undefined || window.jQuery.fn.jquery !== jqueryVersion) {
        loadScript(jqueryPath, initjQuery);
    } else {
        initjQuery();
    }

    function initjQuery() {
        jQuery = window.jQuery.noConflict(true);
        main();
    }

    function main() {
        jQuery(document).ready(function ($) {

            var WIDGET_SIZES = {
                'tiny': {width: 160, height: 115},
                'small': {width: 160, height: 251},
                'tall': {width: 160, height: 392}
            };

            // 1. Get embedded widget tags
            // 2. Process each by creating iframe inside each of those tags
            var widgetTags = jQuery('.snt-expert');
            for (var i = 0; i < widgetTags.length; i++)
            {
                var widgetTag = widgetTags[i];
                var widgetId = jQuery(widgetTag).data('id');
                var widgetTheme = jQuery(widgetTag).data('theme') || '';
                var widgetSize = jQuery(widgetTag).data('size') || 'tall';
                var widgetVerb = jQuery(widgetTag).data('verb');
                var widgetUrl = '//searchntalk.com/widget?userId=' + widgetId + '&size=' + widgetSize + '&theme=' + widgetTheme + '&verb=' + escape(widgetVerb);

                if (widgetId)
                    jQuery(widgetTag).append('<iframe scrolling="no" style="overflow: hidden, border: none;" frameBorder="0" class="snt-expert-iframe" src="' + widgetUrl + '" width="' + WIDGET_SIZES[widgetSize].width + '" height="' + WIDGET_SIZES[widgetSize].height + '"></iframe>');
            }
        });

    }

})();