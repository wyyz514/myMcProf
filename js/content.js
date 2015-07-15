chrome.runtime.onMessage.addListener(function(msg,sender,senderResp){
    app.profDetails.toggleLoad.call(this);
    app.profDetails.addRatings(msg.message);
    return true;
});

app.content.makeProfNamesClickable();

app.background.makeRequest(chrome.extension.getURL("../templates/card.html")).then(function(response){
    var divContainer = document.createElement("div");
    divContainer.classList.add("container");
    divContainer.innerHTML = response;
    document.body.appendChild(divContainer);
});
