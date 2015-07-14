chrome.runtime.onMessage.addListener(function(msg,sender,senderResp){
    console.log(msg.message);
    return true;
});

function appendPanel()
{
    var div = document.createElement("div");
    div.style.position = "fixed";
    div.style.top = "30vh";
    div.style.height = "30vh";
    div.style.width = "30vw";
    div.style.backgroundColor = "#F5EAEA";
    div.style.opacity = 0.8;
    div.style.zIndex = 1000;
    document.body.appendChild(div);
}

app.content.makeProfNamesClickable();

app.background.makeRequest(chrome.extension.getURL("../templates/card.html")).then(function(response){
    var divContainer = document.createElement("div");
    divContainer.classList.add("container");
    divContainer.innerHTML = response;
    document.body.appendChild(divContainer);
});