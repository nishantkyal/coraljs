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
                console.log('ERRORS: ' + data.error);
        },
        error      : function(jqXHR, textStatus, errorThrown)
        {
            // Handle errors here
            console.log('ERRORS: ' + textStatus);
            // STOP LOADING SPINNER
        }
    });
});

function submitForm(event, data)
{
    // Create a jQuery object from the form
    var form = $('#fileUploadForm');

    // Serialize the form data
    var formData = form.serialize();

    // You should sterilise the file names
    $.each(data.files, function(key, value)
    {
        formData = formData + '&filenames[]=' + value;
    });

    $.ajax({
        url     : 'submit.php',
        type    : 'POST',
        data    : formData,
        cache   : false,
        dataType: 'json',
        success : function(data, textStatus, jqXHR)
        {
            if (typeof data.error === 'undefined')
                $('#profileImage').attr('src', data.url);
            else
                console.log('ERRORS: ' + data.error);
        },
        error   : function(jqXHR, textStatus, errorThrown)
        {
            console.log('ERRORS: ' + textStatus);
        },
        complete: function()
        {
            location.reload();
            // STOP LOADING SPINNER
        }
    });
}
