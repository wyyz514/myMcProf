document.addEventListener("DOMContentLoaded",function(){
    var regex = new RegExp(/^[a-zA-Z'-]+/); //regex to avoid whitespace entries and special symbols
    var field = document.getElementById("popup-field");
    console.log(field);
    field.focus();
    field.addEventListener("keyup",function(e){
        console.log(e);
        var el = e.target;
        if(e.keyCode == 13 && el.value !== "" && regex.exec(el.value)) //enter key was pressed
        {
            chrome.tabs.query({active:true,currentWindow:true},function(tabs){
               chrome.tabs.sendMessage(tabs[0].id,{type:"POPUP",query:el.value},function(response){
                                       
                }); 
            });
        }
    });
});