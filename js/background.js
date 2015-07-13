var baseURL = "http://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=mcgill+university&schoolID=&query=";

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
    var xhr = new XMLHttpRequest();
    xhr.open("GET",baseURL+query,true);
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4 && xhr.statusText === "OK")
        {
            //move to a function
            senderResp(xhr.responseText);
        }
    };
    xhr.send();
    return true; //keep channel open
});