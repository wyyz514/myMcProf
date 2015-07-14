chrome.runtime.onMessage.addListener(function(msg,sender,senderResp){
    if(msg.message == "LOAD")
    {
        document.querySelector(".card").style.display = "block";
        document.querySelector("#loading").style.display = "block";
    }
    else
    {
        console.log(msg.message);
    }
    return true;
});

app.content.makeProfNamesClickable();

app.background.makeRequest(chrome.extension.getURL("../templates/card.html")).then(function(response){
    var divContainer = document.createElement("div");
    divContainer.classList.add("container");
    divContainer.innerHTML = response;
    document.body.appendChild(divContainer);
});