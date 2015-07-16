//display icon when navigating through McGill domains
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    if(tab.url.search("mcgill.ca") > -1)
    {
        chrome.pageAction.show(tabId);
    }
});

chrome.runtime.onMessage.addListener(function(msg,sender,senderResp){
    var query = msg.query;
    var queryType = msg.type;
    var url = background.baseURL+query;
    app.makeRequest(url).then(function(response){
       background.performAction(response,query,queryType);
    });
    
    return true; //keep channel open
});

