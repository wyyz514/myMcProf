var background = (function(){

var baseURL = "http://www.ratemyprofessors.com/search.jsp"+"?queryoption=HEADER&queryBy=teacherName&schoolName=mcgill+university&schoolID=&query=";
    
//Will only find first instance of searchEndTerm. Will not work for nested blocks if the blocks contain the searchTerm but it's not the //one you want. Example: searchEndTerm is </p>
//<div>
//  <p>This will be found --> </p>
//</div>
//<p>What you might want --> </p>
    function capitalizeName(name)
    {
        var chunks = name.split(" ");
        for(var index = 0; index < chunks.length; index++)
        {
            chunks[index]  = chunks[index].charAt(0).toUpperCase() + chunks[index].slice(1);
        }
        var capitalizedName = chunks.join(" ");
        
        //hypen in name
        if(capitalizedName.indexOf("-") > 0)
        {
            var index = capitalizedName.indexOf("-");
            capitalizedName = capitalizedName.replace(capitalizedName[index + 1],capitalizedName[index + 1].toUpperCase());
        }
        return capitalizedName;
    }
    
    function findInPage(response,query,queryType,searchTerm,searchEndTerm)
    {
        //making assumption that class and id attributes on searchTerm,searchEndTerm remain consistent on http://www.ratemyprofessors.com
        //if no element exists with a signature similar to searchTerm then we know the                                                          //results are not what we want
        var resultIndex = response.search(searchTerm); 
        if(resultIndex < 0)
        {
            sendMessage(capitalizeName(query)+" could not be found");
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
            app.makeRequest("http://www.ratemyprofessors.com"+link).then(function(data){
                performAction(data,query,"RATINGS");
            });
        }
        else if(queryType == "RATINGS")
        {
            getProfInfo(query);
        }
    }

    function performAction(response,query,queryType)
    {
        switch(queryType)
            {
                case "PROF":
                    findInPage(response,query,queryType,'<ul class="listings">','</div>');
                break;

                case "RATINGS":
                    findInPage(response,query,queryType,'<div class="right-panel">','<script type="text/template" id="noteTemplate">');
                break;

                default:
                break;
            }
    }
    
    //Will parse the chunk of html data appended to the background page and will extract the ratings we want
    //and then send the results to the content script.
    function getProfInfo(query)
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
        
        message.name = query;
        message.profTitle = profTitle;
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
        findInPage:findInPage,
        performAction:performAction,
        getProfInfo:getProfInfo,
        sendMessage:sendMessage
    };
})();
