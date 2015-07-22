var content = (function(){
    
    function makeProfNamesClickable()
    {
        var profRows = document.querySelectorAll("tr td.dddefault");
        var _profRows = Array.prototype.slice.call(profRows);
        var regex = new RegExp(/[a-z A-Z'-.]+$/);
        for(var index = 0; index < _profRows.length; index++)
        {
            (function(i){
                _profRows[i].addEventListener("click",function(e){
                    var name = e.target.innerText;
                    if(regex.exec(name) && 
                       name !== "TBA" && 
                       name.indexOf(".") != name.length - 1)
                        findProfessor(name,"MCPROF_SEARCH",sendMessage);
                });
            /*    
                _profRows[i].addEventListener("contextmenu",function(e){
                    e.preventDefault();
                    var name = e.target.innerText;
                    if(regex.exec(name) && 
                       name !== "TBA" && 
                       name.indexOf(".") != name.length - 1)
                        addCard("mcprof_compare").then(function(){
                            findProfessor(name,"MCPROF_COMPARE",sendMessage);
                        });
                });
            */
            })(index);
        }
    }

    function findProfessor(names,action,callback)
    {
        var message = {};
        var _names = names.split(" ");
        
        //some names are comma delimited on Minerva so it's not easy to search for a single prof
        if(names.search(",") > -1)
        {
            alert("No support for multiple names yet");
        }
        
        //middle names can be ignored since RMP seems to use only first and last names for their records
        if(_names.length >= 2)
        {
            var fullName = _names[0]+" "+_names[_names.length - 1]; //Just get first and last name
            message.query = fullName;
            message.type = "PROF";
            message.action = action;
            callback(message);
        }
    }

    //when message is sent to the background script, show the loading screen
    function sendMessage(message)
    {
        //show load
        content.profDetails.toggleLoad(message.action);
        chrome.runtime.sendMessage({query:message.query,
                                    type:message.type,
                                    action:message.action},function(response){
            //console.log(response.message);
        });
    }
    
    var profDetails = {

        toggleLoad:function(id)
        {
            var _id = id.toLowerCase();
            this.clearError(_id);
            var el = document.getElementById(_id+"");
            var toggle = "off";
            var container = "";
            if(id.toLowerCase() == "mcprof_search")
                container = document.querySelectorAll(".mcprof-container")[0];
            else
                container = document.querySelectorAll(".mcprof-container")[1];
            var card = el.querySelector(".mcprof-card");
            var load = el.querySelector(".mcprof-loading");
            if(load.style.display.trim() == "none" || load.style.display == "")
            {
                toggle = "on";
                container.style.display = "block";
                card.style.display = "block";
                load.style.display = "block";
                return;
            }
            if(load.style.display.trim() == "block")
            {
                toggle = "off";
                load.style.display = "none";
                return;
            }
        },
        addRatings:function(ratings,cardId)
        {
            var el = document.getElementById(cardId.toLowerCase());
            if(typeof ratings === "object" && ratings.type == "RESULTS")
            {
                el.querySelector(".prof-name").innerHTML = ratings["name"];
                el.querySelector(".prof-title").innerHTML = ratings["profTitle"];
                el.querySelector("#mcprof-overall_quality").innerHTML = ratings["Overall_Quality"];
                el.querySelector("#mcprof-avg-grade").innerHTML = ratings["Average_Grade"];
                el.querySelector("#mcprof-clarity").innerHTML = ratings["Clarity"];
                el.querySelector("#mcprof-helpf").innerHTML = ratings["Helpfulness"];
                el.querySelector("#mcprof-easiness").innerHTML = ratings["Easiness"];
            }

            //there is an error. Prof not found
            if(typeof ratings === "object" && ratings.hasOwnProperty("error"))
            {
                this.showError(ratings.error,cardId.toLowerCase());
            }
        },
        showError:function(error,id)
        {
            var _id = id.toLowerCase();
            var el = document.getElementById(_id);
            var errorEl = el.querySelector(".mcprof-error");
            var errorText = el.querySelector(".mcprof-text");
            errorEl.style.display = "block";
            errorText.innerText = error;
        },
        clearError:function(id)
        {
            console.log("Clearing error");
            var _id = id.toLowerCase();
            var el = document.getElementById(_id);
            console.log(el);
            var errorEl = el.querySelector(".mcprof-error");
            var errorText = el.querySelector(".mcprof-text");
            var search = el.querySelector(".mcprof-search");
            errorEl.style.display = "none";
            errorText.innerText = "";
            search.value = "";
        }
    }
    
    function addCard(id)
    {
        var promise = new Promise(function(resolve,reject){
            console.log("Adding card");
            var el = document.getElementById(id);
            if(el && el.classList.contains("mcprof"))
            {
                console.log(el+" exists");
                reject();
                return;
            }
            else
            {
                app.makeRequest(chrome.extension.getURL("../templates/card.html")).then(function(response){
                    var divContainer = document.createElement("div");
                    divContainer.classList.add("mcprof-container");
                    divContainer.innerHTML = divContainer.innerHTML+response;
                    divContainer.setAttribute("id",id);
                    document.body.appendChild(divContainer);
                    var card = divContainer.querySelector(".mcprof");
                    console.log(divContainer);
                    //search handler for error page search
                    card.querySelector(".mcprof-search").addEventListener("keyup",function(e){
                        var el = e.target;
                        console.log(e.keyCode);
                        if(e.keyCode == 13)
                        {
                            content.sendMessage({
                                type:"PROF",
                                query:el.value,
                                action:id.toUpperCase()
                            });
                        }
                    });
                    //close handler
                    var closeButton = card.querySelector(".mcprof-close");
                    closeButton.addEventListener("click",function(){
                        var mymcProf = card.parentElement;
                        mymcProf.style.display = "none";
                    });
                });
                //when the page realizes it has the second card added, resolve the promise
                //without the promise, the app will try to add the ratings to a card that doesn't exist
                document.addEventListener("DOMSubtreeModified",function(e){
                    resolve();
                });
            }
        });
        return promise;
    }
    
    return {
        profDetails:profDetails,
        makeProfNamesClickable:makeProfNamesClickable,
        findProfessor:findProfessor,
        sendMessage:sendMessage,
        addCard:addCard
    };
    
})();

