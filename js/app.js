var app = app || {};

app.content = (function(){
    
    function makeProfNamesClickable()
    {
        var profRows = document.querySelectorAll("tr td.dddefault");
        var _profRows = Array.prototype.slice.call(profRows);
        var regex = new RegExp(/^[a-z A-Z'-.]+$/);
        for(var index = 0; index < _profRows.length; index++)
        {
            (function(i){
                _profRows[i].addEventListener("click",function(e){
                    if(regex.exec(e.target.innerHTML) && e.target.innerHTML !== "TBA")
                        findProfessor(e.target.innerHTML,sendMessage);
                });
            })(index);
        }
    }

    function findProfessor(names,callback)
    {
        if(names.search(",") > -1)
        {
            console.log("Multiple names");
        }
        else
        {
            callback(names);
        }
    }

    function sendMessage(name)
    {
        console.log("Sending message");
        chrome.runtime.sendMessage({query:name,
                                    type:"PROF"},function(response){
            console.log(response.message);
        });
    }
    
    return {
        makeProfNamesClickable:makeProfNamesClickable,
        findProfessor:findProfessor,
        sendMessage:sendMessage
    };
    
})();

app.background = (function(){
    
    var baseURL = "http://www.ratemyprofessors.com/search.jsp?          queryoption=HEADER&queryBy=teacherName&schoolName=mcgill+university&schoolID=&query=";
    
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
            sendMessage("Professor could not be found");
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
        sendMessage(message);
    }

    function sendMessage(message)
    {
        chrome.tabs.query({active:true,currentWindow:true},function(tabs){
            chrome.tabs.sendMessage(tabs[0].id,{message:message},function(response){
                //don't have to do anything
            });
        });
    }
    
    return {
        baseURL:baseURL,
        makeRequest:makeRequest,
        findInPage:findInPage,
        performAction:performAction,
        getProfInfo:getProfInfo,
        sendMessage:sendMessage
    };
})();

app.profDetails = (function(){
    
    function showSpinner()
    {
        
    }
    
    function addCard()
    {
        
    }
    
})();