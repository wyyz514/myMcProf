//display icon when navigating through McGill domains
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    if(tab.url.search("mcgill.ca") > -1)
    {
        chrome.pageAction.show(tabId);
    }
});

chrome.runtime.onMessage.addListener(function(msg,sender,senderResp){
    //put request in a function that returns response
    var query = msg.query;
    var queryType = msg.type;
    var url = app.background.baseURL+query;
    app.background.makeRequest(url).then(function(response){
       app.background.performAction(response,queryType);
    });
    
    return true; //keep channel open
});

app.backgroundContext = this;
