const https = require('https');
const cheerio = require('cheerio');

ignoreList = ['See also', 'Notes', 'References', 'Bibliography', 'External links']

//Function wrapper for http get function to get the wiki page sections for the page provided.
//Takes a string argument which page name.
//Returns random section from the page.
function wikiGetRandomSection(pageName){
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

function wikiGetPageData(pageName, sectionNumber){

    return new Promise(function (resolve, reject){
        url = 'https://en.wikipedia.org/w/api.php?' + 
        new URLSearchParams({
            origin: '*',
            action: 'parse',
            page: pageName,
            section: sectionNumber,
            prop: 'wikitext',
            format: 'json'
        });

        https.get(url, (res) =>{
            var body = '';

            res.on('data', (chunk) =>{
                body += chunk;
            });

            res.on('end', function() {
                results = JSON.parse(body);
                resolve(results);
            });
            
            res.on('error', function(err){
                reject(err);
            });
        });
    });
}

module.exports = {

    //Function wrapper for http get function to get the wiki page content for the page provided.
    //Takes a string argument which page name.
    //Calls wikiGetRandomSection to get which sections to pull from wiki.
    //Then calls wikiGetPageData to get page data from sections.
    //Does a promisify all to wait for results for each section request
    //Returns content for a page and random section/subsections.
    getPageContent: function(pageName){

        return new Promise(function (resolve, reject){
            promiseList = [];

            wikiGetRandomSection(pageName)
                .then(sections =>{
                    
                    for (var i in sections){
                        promiseList.push(wikiGetPageData(pageName, sections[i].index));
                    }

                    Promise.all(promiseList)
                        .then((res) => {
                            resolve(res);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
        });
    }
    
}

//Example on how to use this module.
/*const getPageContent = require('./wikipediaAPIRequest.js').getPageContent;
getPageContent('Italian_language')
    .then(res => {
        for (i of res)   {
            console.log(JSON.stringify(i.parse.wikitext['*']));
        }
    })

    .catch(err => {
        console.log(err);
    });*/