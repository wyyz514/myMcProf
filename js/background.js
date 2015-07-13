var baseURL = "http://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=mcgill+university&schoolID=&query=";

//display icon when navigating through McGill domains
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    if(tab.url.search("mcgill.ca") > -1)
    {
        chrome.pageAction.show(tabId);
    }
});

function makeRequest(url)
{
    var result;
    var promise = new Promise(function(resolve,reject){
        var xhr = new XMLHttpRequest();
        xhr.open("GET",url,true);
        xhr.onreadystatechange = function()
        {
            if(xhr.readyState == 4 && xhr.statusText == "OK")
            {
                result = xhr.responseText;
                resolve(result);
            } 
        }
        xhr.send();
    });
    
    return promise;
}

function findInPage(response,searchTerm,searchEndTerm)
{
    var resultIndex = response.search(searchTerm);
    var result = response.slice(resultIndex);
    var resultEndIndex = result.search(searchEndTerm);
    result = result.slice(0,resultEndIndex + searchEndTerm.length + 1); 
    //e.g. </ul> has 5 characters and we add 1 since slice stops one character before specified terminate index
    //so if we had search term as <ul> and search end term is </ul> and the html block:
    //<ul>
    //  <li>Foo</li>
    //  <li>Bar</li>
    //</ul>
    //then resultIndex = 0
    //result will be everything from index 0 to the end
    //resultEndIndex will be the index of the less than character on the ul closing tag
    //so we add the length and 1 so the whole tag is included in result
    console.log(result);
    document.querySelector("#rmp").innerHTML = result;
    chrome.tabs.query({active:true,currentWindow:true},function(tabs){
        chrome.tabs.sendMessage(tabs[0].id,{message:result},function(response){
        });
    });
}

chrome.runtime.onMessage.addListener(function(msg,sender,senderResp){
    //put request in a function that returns response
    var query = msg.query;
    var queryType = msg.type;
    var url = baseURL+query;
    makeRequest(url).then(function(response){
        switch(queryType)
        {
            case "PROF":
                findInPage(response,'<ul class="listings">','</ul>');
            break;
                
            case "RATINGS":
                findInPage();
            break;
            
            default:
            break;
        }
    });
    
    return true; //keep channel open
});