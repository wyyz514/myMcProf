var app = app || {};

app.makeRequest  = function(url)
{
    var promise = new Promise(function(resolve,reject){
        var xhr = new XMLHttpRequest();
        xhr.open("GET",url,true);
        xhr.onreadystatechange = function()
        {
            if(xhr.readyState == 4 && xhr.statusText == "OK")
            {
                resolve(xhr.responseText);
            }
        }
        xhr.send();
    });
    return promise;
}