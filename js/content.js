var indices = {};

indices.profCell = 16;
indices.courseName = 2;
indices.courseNumber = 3;

chrome.runtime.onMessage.addListener(function(msg,sender,senderResp){
    console.log(msg);
});

function makeProfNamesClickable()
{
    var profRows = document.querySelectorAll("tr td.dddefault");
    var _profRows = Array.prototype.slice.call(profRows);
    var regex = new RegExp(/^[a-z A-Z'-.]+$/);
    for(var index = 0; index < _profRows.length; index++)
    {
        (function(i){
            _profRows[i].addEventListener("click",function(e){
                if(regex.exec(e.target.innerHTML) && e.target.innerHTML !== "TBA")
                    findProfessor(e.target.innerHTML,sendMessage);
            });
        })(index);
    }
        
}

function findProfessor(names,callback)
{
    console.log(names);
    if(names.search(",") > -1)
    {
        console.log("Multiple names");
    }
    else
    {
        callback(names);
    }
}

function sendMessage(name)
{
    console.log("Sending message");
    chrome.runtime.sendMessage({query:name,
                                type:"prof"},function(response){
        console.log(response);
    });
}

makeProfNamesClickable();