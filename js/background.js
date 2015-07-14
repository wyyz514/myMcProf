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

//Will only find first instance of searchEndTerm. Will not work for nested blocks if the blocks contain the searchTerm but it's not the //one you want. Example: searchEndTerm is </p>
//<div>
//  <p>This will be found --> </p>
//</div>
//<p>What you might want --> </p>
function findInPage(response,queryType,searchTerm,searchEndTerm)
{
    var resultIndex = response.search(searchTerm);
    if(resultIndex < 0)
    {
        console.log("Professor could not be found");
        return;
    }
    var result = response.slice(resultIndex);
    var resultEndIndex = result.search(searchEndTerm);
    console.log(resultEndIndex);
    result = result.slice(0,resultEndIndex); 
    document.querySelector("#rmp").innerHTML = result;
    if(queryType == "PROF")
    {
        var link = document.querySelector("li a").getAttribute("href");
        console.log(link);
        makeRequest("http://www.ratemyprofessors.com"+link).then(function(data){
            performAction(data,"RATINGS");
        });
    }
    else if(queryType == "RATINGS")
    {
        getProfInfo();
    }
}

function performAction(response,queryType)
{
    switch(queryType)
        {
            case "PROF":
                findInPage(response,queryType,'<ul class="listings">','</div>');
            break;
                
            case "RATINGS":
                findInPage(response,queryType,'<div class="left-breakdown">','<div class="right-breakdown">');
            break;
            
            default:
            break;
        }
}
    
function getProfInfo()
{
    var message = {};
    var profOverall = document.querySelectorAll("div.left-breakdown div.breakdown-header");
    var profRatings = document.querySelectorAll("div.left-breakdown div.faux-slides div.rating-slider");
    var _profOverall = Array.prototype.slice.call(profOverall);
    var _profRatings = Array.prototype.slice.call(profRatings);
    for(var index = 0; index < _profOverall.length; index++)
    {
        (function(i){
            var tempArr = _profOverall[i].innerText.split("\n");
            if(tempArr[0].indexOf(" ") > -1)
                tempArr[0] = tempArr[0].replace(" ","_");
            message[tempArr[0]] = tempArr[1];
        })(index);
    }
    
    for(var index = 0; index < _profRatings.length; index++)
    {
        (function(i){
            var tempArr = _profRatings[i].innerText.split("\n");
            message[tempArr[0]] = tempArr[1];
        })(index);
    }
    chrome.tabs.query({active:true,currentWindow:true},function(tabs){
        chrome.tabs.sendMessage(tabs[0].id,{message:message},function(response){});
    });
}

chrome.runtime.onMessage.addListener(function(msg,sender,senderResp){
    //put request in a function that returns response
    var query = msg.query;
    var queryType = msg.type;
    var url = baseURL+query;
    makeRequest(url).then(function(response){
       performAction(response,queryType);
    });
    
    return true; //keep channel open
});