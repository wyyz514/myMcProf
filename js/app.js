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
                    if(regex.exec(e.target.innerText) && e.target.innerText !== "TBA")
                        findProfessor(e.target.innerText,sendMessage);
                });
            })(index);
        }
    }

    function findProfessor(names,callback)
    {
        var _names = names.split(" ");
        
        if(names.search(",") > -1)
        {
            console.info("No support for multiple names yet");
        }
        
        if(_names.length == 2)
        {
            callback(names);
        }
        
        //middle names can be ignored since RMP seems to use only first and last names for their records
        if(_names.length == 3)
        {
            //fullName = first + last
            var fullName = _names[0] +" "+ _names[2];
            console.log(fullName);
            callback(fullName);
        }
        
    }

    function sendMessage(name)
    {
        console.log("Sending message");
        app.profDetails.toggleLoad();
        chrome.runtime.sendMessage({query:name,
                                    type:"PROF"},function(response){
            //console.log(response.message);
        });
    }
    
    return {
        makeProfNamesClickable:makeProfNamesClickable,
        findProfessor:findProfessor,
        sendMessage:sendMessage
    };
    
})();

app.background = (function(){

var baseURL = "http://www.ratemyprofessors.com/search.jsp"+"?queryoption=HEADER&queryBy=teacherName&schoolName=mcgill+university&schoolID=&query=";
    
    function makeRequest(url)
    {
        console.log("Making request for "+url);
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
        console.log("Looking for "+searchTerm+" in page"+":"+queryType);
        var resultIndex = response.search(searchTerm);
        if(resultIndex < 0)
        {
            sendMessage.call(app.backgroundContext,"Professor could not be found");
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
        sendMessage.call(app.backgroundContext,message);
    }

    function sendMessage(message)
    {
        console.log(message);
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
    function toggleLoad()
    {
        var toggle = "off";
        var container = document.querySelector(".container");
        var card = document.querySelector(".card");
        var load = document.querySelector("#loading");
        if(load.style.display.trim() == "none" || load.style.display == "")
        {
            toggle = "on";
            console.log("Loading is now on");
            container.style.display = "block";
            card.style.display = "block";
            load.style.display = "block";
            return;
        }
        if(load.style.display.trim() == "block")
        {
            toggle = "off";
            console.log("Loading is now off");
            load.style.display = "none";
            return;
        }
    }
    
    function addRatings(ratings)
    {
        if(typeof ratings === "object")
        {
            document.getElementById("overall_quality").innerHTML = ratings["Overall_Quality"];
            document.getElementById("avg-grade").innerHTML = ratings["Average_Grade"];
            document.getElementById("clarity").innerHTML = ratings["Clarity"];
            document.getElementById("helpf").innerHTML = ratings["Helpfulness"];
            document.getElementById("easiness").innerHTML = ratings["Easiness"];
        }
        
        //there is an error. Prof not found
        if(typeof ratings === "string")
        {
            
        }
    }
    
    function showError()
    {
        
    }
    
    function addCard()
    {
        
    }
    
    return {
        toggleLoad:toggleLoad,
        addRatings:addRatings
    };
    
})();