const https = require('https');
const cheerio = require('cheerio');

module.exports = {
    //Function wrapper for http get function to get the list of most common words from the website.
    //Takes a string argument which is the language you wish to draw the words from.
    //Returns an array of the column names and the words.
    wordsHttpRequest: function (language) {

        //Create a promise so that .then() can be used to wait for the http.get request to be finished and data parsed.
        return new Promise(function (resolve, reject) {
            https.get('https://1000mostcommonwords.com/1000-most-common-' + language + '-words/', (res) => {
                var body = '';

                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', function () {
                    const $ = cheerio.load(body);
                    words = []

                    //Find each tr element and then get its children.
                    $('tr').each(function (i, elem) {
                        var x = $(this).children()

                        //Create a sub-array of the text of the children and push the sub-array into words.
                        //Children are td elements.
                        temp = [$(x[0]).text(), $(x[1]).text(), $(x[2]).text()];
                        words.push(temp);
                    });

                    //Resolve the words so that the array of words is returned to calling function.
                    resolve(words);
                });

                res.on('error', function (err) {

                    //If there is an error reject with the error so it is returned to calling function.
                    reject(err);
                });
            });
        });
    }
};

//Example on how to use the function above.

/*wordsHttpRequest('italian')
    .then(res => {
        console.log(res[0]);
    })

    .catch(err => {
        console.log(err);
    });*/