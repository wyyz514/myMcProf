var app = app || {};

app.capitalize = function(name)
{
    var chunks = name.split(" ");
    for(var index = 0; index < chunks.length; index++)
    {
        chunks[index]  = chunks[index].charAt(0).toUpperCase() + chunks[index].slice(1);
    }
    var capitalizedName = chunks.join(" ");

    //hypen in name
    if(capitalizedName.indexOf("-") > 0)
    {
        var index = capitalizedName.indexOf("-");
        capitalizedName = capitalizedName.replace(capitalizedName[index + 1],capitalizedName[index + 1].toUpperCase());
    }
    return capitalizedName;
}
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