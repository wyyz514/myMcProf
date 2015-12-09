var background = (function(){

var baseURL = "http://www.ratemyprofessors.com/search.jsp"+"?queryoption=HEADER&queryBy=teacherName&schoolName=mcgill+university&schoolID=&query=";
    
    function getURL()
    {
        return baseURL;
    }
//Will only find first instance of searchEndTerm. Will not work for nested blocks if the blocks contain the searchTerm but it's not the //one you want. Example: searchEndTerm is </p>
//<div>
//  <p>This will be found --> </p>
//</div>
//<p>What you might want --> </p>

    function findInPage(response,msg,searchTerm,searchEndTerm)
    {
        //searchTerm and searchEndTerm are html tags
        //We are making the assumption that class and id attributes on searchTerm,searchEndTerm remain consistent on http://www.ratemyprofessors.com
        //if no element exists with a signature similar to searchTerm then we know the                                                          //results are not what we want
        var resultIndex = response.search(searchTerm); 
        console.log(resultIndex,searchTerm,msg.type);
        //this condition means the user requested a professor but nothing was found
        if(resultIndex < 0 && msg.type == "PROF")
        {
            sendMessage({error:app.capitalize(msg.query)+" could not be found",type:"NOT_FOUND",action:msg.action});
            return;
        }
        else
        {
            //the professor was found!
            var result = response.slice(resultIndex);
            var resultEndIndex = result.search(searchEndTerm);
            result = result.slice(0,resultEndIndex); 
            document.querySelector("#rmp").innerHTML = result;
            //if a prof has not been rated, the html still contains a div with class attr. 'right-panel' but 
            //lacks the searchEndTerm
            if(resultEndIndex < 0 && msg.type == "RATINGS")
            {
                sendMessage({error:app.capitalize(msg.query)+" has not been rated",type:"NO_RATINGS",action:msg.action});
                return;
            }
            if(msg.type == "PROF" && resultEndIndex > 0)
            {
                //the prof has been rated -\o/-Let's get them results shall we?
                var link = document.querySelector("li a").getAttribute("href"); //the link is on this link tag
                app.makeRequest("http://www.ratemyprofessors.com"+link).then(function(data){
                    //we've found the professor's ratings so type is no longer PROF but instead RATINGS
                    msg.type = "RATINGS";
                    performAction(data,msg);
                });
            }
            else if(msg.type == "RATINGS" && resultEndIndex > 0)
            {
                //we've extracted the chunk of html we want. Now for ratings extraction.
                getProfInfo(msg.query,msg.action);
            }
        }
    }

    function performAction(response,msg)
    {
        switch(msg.type)
        {
            case "PROF":
                findInPage(response,msg,'<ul class="listings">','</div>');
            break;

            case "RATINGS":
                findInPage(response,msg,'<div class="right-panel">','<script type="text/template" id="noteTemplate">');
            break;

            default:
            break;
        }
    }
    
    //Will parse the chunk of html data appended to the background page and will extract the ratings we want
    //and then send the results to the content script.
    function getProfInfo(query,action)
    {
        var message = {};
        var profTitle = document.querySelector("div.result-title").innerText.split(" at ")[0]; //remove at McGill Univesity...
        profTitle = profTitle.replace("in the","of");
        var departmentIndex = profTitle.search("department");
        profTitle = profTitle.slice(0,departmentIndex);
        var profOverall = document.querySelectorAll("div.left-breakdown div.breakdown-header");
        var profRatings = document.querySelectorAll("div.left-breakdown div.faux-slides div.rating-slider");
        var _profOverall = Array.prototype.slice.call(profOverall); //making the returned object iterable
        var _profRatings = Array.prototype.slice.call(profRatings);
        
        //begin extraction
        for(var index = 0; index < _profOverall.length; index++)
        {
            (function(i){
                var tempArr = _profOverall[i].innerText.split("\n");
                tempArr[0] = tempArr[0].replace(/[.,']/g," ");
                tempArr[0] = tempArr[0].replace(/\s{1,}/g,"_");
              console.log(tempArr);
                if(tempArr[0].indexOf(" ") == -1 || tempArr[0].indexOf(".") == -1)
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
      console.log(message);
        message.action = action;
        message.type = "RESULTS";
        message.name = query;
        message.profTitle = profTitle;
        sendMessage(message);
    }

    function sendMessage(message)
    {
        chrome.tabs.query({active:true,currentWindow:true},function(tabs){
            chrome.tabs.sendMessage(tabs[0].id,message,function(response){
                //don't have to do anything
            });
        });
    }
    
    return {
        getURL:getURL,
        findInPage:findInPage,
        performAction:performAction,
        getProfInfo:getProfInfo,
        sendMessage:sendMessage
    };
})();
