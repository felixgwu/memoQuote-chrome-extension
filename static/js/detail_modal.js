$(document).ready(function(){
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log(sender.tab ?  "from a content script:" + sender.tab.url : "from the extension");
        if(!sender.tab && request.mode === 'fast'){
            console.log(request);
            var speaker = prompt('Speaker:', '');
            if(speaker != null){
                sendResponse({speaker: speaker})
            }
            return true; // Listener must return true is you want to sendResponse after returning
        }
    }); 
});
