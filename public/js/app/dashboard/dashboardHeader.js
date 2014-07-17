$(function(){
    var url = $(location).attr('href');

    if (url.search('dashboard') != -1)
        $('.dashboard').addClass('active');

    else if(url.search('network') != -1)
        $('.networks').addClass('active');

    else if(url.search('profile') != -1)
        $('.profile').addClass('active');

    else if(url.search('payments') != -1)
        $('.payments').addClass('active');

    else if(url.search('setting') != -1)
        $('.settings').addClass('active');
});