$(document).ready(function(){
    // Saves options to chrome.storage.sync.
    function save_options() {
        var options = {};
        options.url = $('input[name="url"]').val().trim();
        while(options.url.charAt(options.url.length - 1) === '/')
            options.url = options.url.substr(0, options.url.length - 1);

        options.mode = $('input[name="mode"]:checked').val();

        options.autoUrl = $('input[name="autoUrl"]').prop('checked');

        console.log(options);
        chrome.storage.local.set({
            setting_options: options
        }, function() {
            // Update status to let user know options were saved.
            var status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(function() {
                status.textContent = '';
            }, 750);
        });
    }

    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    function restore_options() {
        // Use default value color = 'red' and likesColor = true.
        chrome.storage.local.get({
            setting_options: {
                url: 'http://localhost:8000',
                mode: 'fast',
                autoUrl: true
            }
        }, function(items) {
            var options = items.setting_options;
            console.log(options);

            $('input[name="url"]').val(options.url);
            $('input[name="mode"][value="' + options.mode + '"]').prop('checked', true);

            $('input[name="autoUrl"]').prop('checked', options.autoUrl);
        });
    }
    console.log('load');
    restore_options();
    $('#save').click(save_options); 
});


//document.addEventListener('DOMContentLoaded', restore_options);
//document.getElementById('save').addEventListener('click', save_options);
