const https = require('https');
const cheerio = require('cheerio');
const fs= require('fs');

ignoreList = ['See also', 'Notes', 'References', 'Bibliography', 'External links']

module.exports = {

    //Function wrapper for http get function to get the wiki page sections for the page provided.
    //Takes a string argument which page name.
    //Returns random section from the page.
    wikiGetRandomSection: function(pageName){
        //Create a promise so that .then() can be used to wait for the http.get request to be finished and data parsed.
        return new Promise(function (resolve, reject){
            url = 'https://en.wikipedia.org/w/api.php?' + 
                new URLSearchParams({
                    origin: '*',
                    action: 'parse',
                    page: pageName,
                    format: 'json'
                });
            https.get(url, (res) =>{
                var body = '';

                res.on('data', (chunk) =>{
                    body += chunk;
                });

                res.on('end', function() {
                    results = JSON.parse(body);
                    sectionList = results.parse.sections
                    sections = []
                    count = 0
                    
                    for (i in sectionList){
                        
                        if (i == 0){
                            sections.push([sectionList[i]]);
                        }
                        else if (sections[count][0].number == Math.floor(sectionList[i].number)){
                            sections[count].push(sectionList[i]);
                        }
                        else if (!ignoreList.includes(sectionList[i].line)){
                            sections.push([sectionList[i]]);
                            count++;
                        }
                    }

                    var index = Math.floor(Math.random() * sections.length);
                    resolve(sections[index]);
                    
                });

                res.on('error', function(err){
                    reject(err);
                });
            });
        });
    }
}

//Example on how to use the function above.
const wikiGetRandomSection = require('./wikipediaAPIRequest.js').wikiGetRandomSection;
wikiGetRandomSection('Italian_language')
    .then(res => {
        console.log(res);        
    })

    .catch(err => {
        console.log(err);
    });