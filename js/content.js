chrome.runtime.onMessage.addListener(function(msg,sender,senderResp){
    content.profDetails.toggleLoad();
    content.profDetails.addRatings(msg.message);
    return true;
});

content.makeProfNamesClickable();

app.makeRequest(chrome.extension.getURL("../templates/card.html")).then(function(response){
    var divContainer = document.createElement("div");
    divContainer.classList.add("mcprof-container");
    divContainer.innerHTML = response;
    document.body.appendChild(divContainer);
    
    document.querySelector("#search").addEventListener("keydown",function(e){
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
});

app.contentContext = this;
