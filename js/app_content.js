var content = (function(){
    
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
        var message = {};
        var _names = names.split(" ");
        
        if(names.search(",") > -1)
        {
            console.info("No support for multiple names yet");
        }
        
        if(_names.length == 2)
        {
            message.query = names;
            message.type = "PROF";
            callback(message);
        }
        
        //middle names can be ignored since RMP seems to use only first and last names for their records
        if(_names.length == 3)
        {
            //fullName = first + last
            var fullName = _names[0] +" "+ _names[2];
            message.query = fullName;
            message.type = "PROF";
            callback(message);
        }
        
    }

    function sendMessage(message)
    {
        console.log("Sending message");
        content.profDetails.toggleLoad();
        chrome.runtime.sendMessage({query:message.query,
                                    type:message.type},function(response){
            //console.log(response.message);
        });
    }
    
    var profDetails = {

        toggleLoad:function()
        {
            this.clearError();
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
        },
        addRatings:function(ratings)
        {
            //Todo add type key for error or details
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
                this.showError(ratings);
            }
        },
        showError:function(error)
        {
            document.querySelector(".error").style.display = "block";
            document.querySelector("#text").innerText = error;
        },
        clearError:function()
        {
            document.querySelector(".error").style.display = "none";
            document.querySelector("#text").innerText = "";
        }
    }
    
    return {
        profDetails:profDetails,
        makeProfNamesClickable:makeProfNamesClickable,
        findProfessor:findProfessor,
        sendMessage:sendMessage
    };
    
})();

