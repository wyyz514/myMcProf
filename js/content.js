chrome.runtime.onMessage.addListener(function(msg,sender,senderResp){
    console.log(msg.message);
    return true;
});


app.content.makeProfNamesClickable();