chrome.runtime.onMessage.addListener(function(msg,sender,senderResp){
    console.log(msg);
    if(msg.type == "POPUP" && msg.action == "SEARCH")
    {
        content.sendMessage({type:"PROF",query:msg.query,action:msg.action});
        senderResp("ENABLE_BUTTON");
        return;
    }
    
    if(msg.type == "POPUP" && msg.action == "COMPARE")
    {
        content.sendMessage({type:"PROF",query:msg.query,action:msg.action});
        return;
    }
    
    if(msg.type == "NOT_FOUND")
    {
        content.profDetails.toggleLoad();
        content.profDetails.showError(msg.error);
        return;
    }
    
    if(msg.type == "NO_RATINGS")
    {
        content.profDetails.toggleLoad();
        content.profDetails.showError(msg);
        return;
    }
    
    if(msg.type == "RESULTS" && msg.action == "COMPARE")
    {
        console.log("Need to add card and add ratings to said card");
    }
    
    else
    {
        //hide load
        content.profDetails.toggleLoad();
        //show ratings
        content.profDetails.addRatings(msg);
        return;
    }
    return true;
});

content.makeProfNamesClickable();

//inject GUI into page
app.makeRequest(chrome.extension.getURL("../templates/card.html")).then(function(response){
    var divContainer = document.createElement("div");
    divContainer.classList.add("mcprof-container");
    divContainer.innerHTML = response;
    document.body.appendChild(divContainer);
    
    //search handler for error page search
    document.querySelector("#mcprof-search").addEventListener("keydown",function(e){
        var el = e.target;
        console.log(e.keyCode);
        if(e.keyCode == 13)
        {
            content.sendMessage({
                type:"PROF",
                query:el.value
            });
        }
    });
    
    //close handler
    var closeButton = document.querySelector("#mcprof-close");
    closeButton.addEventListener("click",function(){
    var mymcProf = document.querySelector(".mcprof-container");
    mymcProf.style.display = "none";
});

});

