document.addEventListener("DOMContentLoaded",function(){
    var field = document.getElementById("popup-field");
    console.log(field);
    field.addEventListener("keyup",function(e){
        console.log(e);
        var el = e.target;
        if(e.keyCode == 13) //enter key was pressed
        {
            chrome.tabs.query({active:true,currentWindow:true},function(tabs){
               chrome.tabs.sendMessage(tabs[0].id,{type:"POPUP",query:el.value},function(response){
                                       
                }); 
            });
        }
    });
});