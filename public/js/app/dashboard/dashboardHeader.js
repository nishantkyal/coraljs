$(function(){
    var url = $(location).attr('href');

    $('[name="dashboard"]').removeClass('active');

    if(url.search('dashboard') != -1)
        $('[name="dashboard"]').addClass('active');

    else if(url.search('networks') != -1)
        $('[name="networks"]').addClass('active').siblings().removeClass('active');

    else if(url.search('profile') != -1)
        $('[name="profile"]').addClass('active').siblings().removeClass('active');

    else if(url.search('payments') != -1)
        $('[name="payments"]').addClass('active').siblings().removeClass('active');

    else if(url.search('setting') != -1)
        $('[name="settings"]').addClass('active').siblings().removeClass('active');
});