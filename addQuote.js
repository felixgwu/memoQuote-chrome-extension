var id = chrome.contextMenus.create({"title": "Add to memoQuote", "contexts":["selection"], "onclick": genericOnClick});

function genericOnClick(info, tab) {
    console.log('clicked');
//  console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));
    var xhr = new XMLHttpRequest();
    var url = 'http://localhost:8000';
    chrome.cookies.get({url: url, name: 'csrftoken'}, function(cookie){
        csrftoken = cookie.value;
        console.log(csrftoken);
        xhr.open('POST', url + '/quotes/.json', true);
        xhr.setRequestHeader('X-CSRFToken', csrftoken);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
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
        }
        xhr.send(JSON.stringify({text: info.selectionText, referenceURL: info.pageUrl}));
    });
}
