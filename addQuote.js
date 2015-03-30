var id = chrome.contextMenus.create({"title": "Add to memoQuote", "contexts":["selection"], "onclick": genericOnClick});

function genericOnClick(info, tab) {
    console.log('clicked');
//  console.log("item " + info.menuItemId + " was clicked");
    chrome.storage.local.get({
        setting_options: {
            url: 'http://localhost:8000',
            mode: 'fast',
            autoUrl: true
        },
        quote_options: {}
    }, function(items){
        console.log("info: " + JSON.stringify(info));
        console.log("tab: " + JSON.stringify(tab));
        var url = items.setting_options.url;
        console.log(url);

        chrome.cookies.get({url: url, name: 'csrftoken'}, function(cookie){
            csrftoken = cookie.value;
            console.log(csrftoken);

            // set up XMLHttpRequest
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url + '/quotes/.json', true);
            xhr.setRequestHeader('X-CSRFToken', csrftoken);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function(){
                console.log(xhr);
                var quote = JSON.parse(xhr.response);
                if(xhr.status === 201){
                    alert('"' + quote.text + '"' + ' has been added to memoQuote!');
                }
                else if(xhr.status === 403){
                    alert('You haven\'t login to memoQuote');
                    chrome.tabs.create({url: url, index: tab.index + 1});
                }
            }
            xhr.onerror = function(e){
                console.log(e);
                alert('Error occur');
            }
            if(items.setting_options.mode == 'detail'){
                var quote = items.quote_options;
                if(quote.preserved)
                    delete quote.preserved;
                else
                    chrome.storage.local.set({'quote_options': {}});
                quote.text = info.selectionText;
                if(!('autoUrl' in items.setting_options) || items.setting_options.autoUrl)
                    quote.referenceURL = info.pageUrl;
                console.log(quote);
                xhr.send(JSON.stringify(quote));
            }
            else{
                // TODO: Add speaker or tag
                chrome.tabs.sendMessage(tab.id, items.setting_options, function(response){
                    console.log(response);
                    console.log('back');
                    var quote = $.extend({}, response);
                    quote.text = info.selectionText;
                    if(!('autoUrl' in items.setting_options) || items.setting_options.autoUrl)
                        quote.referenceURL = info.pageUrl; 

                    console.log(quote);
                    xhr.send(JSON.stringify(quote)); 
                });
            }
        });
    }); 
}
