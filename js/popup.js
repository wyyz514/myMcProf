document.addEventListener("DOMContentLoaded",function(){
    var regex = new RegExp(/[a-zA-Z'-]+/); //regex to avoid whitespace entries. Essentially will check for a first name
    var field = document.getElementById("popup-field");
    field.focus();
    var searchButton = document.getElementById("popup-search");
    searchButton.addEventListener("click",function(){
        var fieldValue = field.value.trim();
        if(fieldValue && regex.test(fieldValue))
        {
            console.log(regex.exec(fieldValue));
            chrome.tabs.query({active:true,currentWindow:true},function(tabs){
                chrome.tabs.sendMessage(tabs[0].id,{query:fieldValue,type:"POPUP",action:"SEARCH"},function(response){
                    console.log(response);
                });
            });
        }
    });
});