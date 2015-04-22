var id = chrome.contextMenus.create({"title": "Add to memoQuote", "contexts":["selection"], "onclick": genericOnClick});

function genericOnClick(info, tab) {
    console.log('clicked');
//  console.log("item " + info.menuItemId + " was clicked");
    getTagList();
    chrome.storage.local.get({
        setting_options: {
            url: 'http://memoquote.herokuapp.com',
            mode: 'detail',
            autoUrl: true
        },
        quote_options: {},
        tag_list: []
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
            if(items.setting_options.mode === 'fast'){
                var quote = items.quote_options;
                if(quote.preserved)
                    delete quote.preserved;
                else
                    chrome.storage.local.set({'quote_options': {}});
                chrome.tabs.executeScript( {
                    code: "window.getSelection().toString();"
                }, function(selection) {
                    // selected contains text including line breaks
                    quote.text = selection[0];
                    if(!('autoUrl' in items.setting_options) || items.setting_options.autoUrl)
                        quote.referenceURL = info.pageUrl;
                    console.log(quote);
                    //xhr.send(JSON.stringify(quote));
                });
            }
            else{
                // TODO: Add speaker or tag
                items.quote_options.text = info.selectionText;
                if(!('autoUrl' in items.setting_options) || items.setting_options.autoUrl)
                    items.quote_options.referenceURL = info.pageUrl; 
                chrome.tabs.sendMessage(tab.id, items, function(response){
                    console.log(response);
                    console.log('back');
                    if (response === null)
                        return;
                    var quote = $.extend({}, response);
                    if (quote.preserved) {
                        delete response.text;
                        delete response.referenceURL;
                        chrome.storage.local.set({'quote_options': response});
                    }
                    else {
                        chrome.storage.local.set({'quote_options': {}});
                    }

                    if (quote.hasOwnProperty('preserved')) {
                        delete quote.preserved;
                    }
                    console.log('quote:')
                    console.log(quote);
                    //xhr.send(JSON.stringify(quote)); 
                });
            }
        });
    }); 
}

function getTagList () {
    chrome.storage.local.get({
        setting_options: {
            url: 'http://memoquote.herokuapp.com',
            mode: 'detail',
            autoUrl: true
        },
        quote_options: {}
    }, function(items){
        var url = items.setting_options.url;
        console.log(url);

        chrome.cookies.get({url: url, name: 'csrftoken'}, function(cookie){
            csrftoken = cookie.value;
            console.log(csrftoken);

            // set up XMLHttpRequest
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url + '/users/list_tags/.json', true);
            xhr.setRequestHeader('X-CSRFToken', csrftoken);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function(){
                console.log('getTagList');
                console.log(xhr);
                var tag_list = JSON.parse(xhr.response);
                chrome.storage.local.set({
                    tag_list: tag_list
                }, function() {
                    console.log('tag_list:');
                    console.log(tag_list);
                });
            }
            xhr.onerror = function(e){
                console.log(e);
            }
            xhr.send();
        });
    }); 
}
