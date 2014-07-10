/* FILE UPLOAD */

// Proxy for file upload control
$('#selectFileBtn').click(function()
{
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
        url        : $('#fileUploadForm').attr('action'),
        type       : 'POST',
        data       : data,
        cache      : false,
        dataType   : 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        success    : function(data, textStatus, jqXHR)
        {
            if (typeof data.error === 'undefined')
            {
                $('#profileImage').attr('src', data.url + '?' + Math.random());
                location.reload();
            }
            else
                bootbox.alert('Error in uploading image.');
        },
        error      : function(jqXHR, textStatus, errorThrown)
        {
            // Handle errors here
            bootbox.alert('Error in uploading image.')
            // STOP LOADING SPINNER
        }
    });
});