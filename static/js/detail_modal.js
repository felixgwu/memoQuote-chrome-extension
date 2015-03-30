$(document).ready(function(){
    $('<div class="ui modal" id="speaker"><div class="content"><form class="ui form"><div class="field"><label>Speaker</label><input type="text" name="speaker" placeholder="Speaker"></div><input type="submit" class="ui right floated submit button"></input></form></div></div>').appendTo('body');
    $('#speaker').modal({dimPage: false});
    $('#speaker').parent().attr('id', 'script');

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log(sender.tab ?  "from a content script:" + sender.tab.url : "from the extension");
        if(!sender.tab && request.mode === 'fast'){
            console.log(request);
            $('#speaker').modal('show');
            $('#speaker form').on('submit', function(e){
                e.preventDefault(); 
                $('#speaker').modal('hide');
                var quote = {};
                quote.speaker = $(this).find('[name="speaker"]').val();
                $(this).find('[name="speaker"]').val('');
                sendResponse(quote);
            });
            return true; // Listener must return true is you want to sendResponse after returning
        }
    }); 
});
