chrome.runtime.onMessage.addListener(function(msg,sender,senderResp){
    console.log(msg);
    if(msg.type == "POPUP" && msg.action == "SEARCH")
    {
        content.findProfessor(msg.query,msg.action,content.sendMessage);
        return;
    }
    
    if(msg.type == "POPUP" && msg.action == "COMPARE")
    {
        if(!document.getElementById("compare"))
            content.addCard("compare").then(function(){
                content.findProfessor(msg.query,msg.action,content.sendMessage);
            });
        else
            content.findProfessor(msg.query,msg.action,content.sendMessage);
        return;
    }
    
    if(msg.type == "NOT_FOUND")
    {
        content.profDetails.toggleLoad(msg.action);
        content.profDetails.showError(msg.error,msg.action);
        return;
    }
    
    if(msg.type == "NO_RATINGS")
    {
        content.profDetails.toggleLoad(msg.action);
        content.profDetails.showError(msg,msg.action);
        return;
    }
    
    else
    {
        //hide load
        content.profDetails.toggleLoad(msg.action);
        //show ratings
        content.profDetails.addRatings(msg,msg.action);
        return;
    }
    return true;
});

content.makeProfNamesClickable();

//inject GUI into page
content.addCard("search");