const https = require('https');
const cheerio = require('cheerio');

https.get('https://1000mostcommonwords.com/1000-most-common-irish-words/', (res) => {
    var body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', function () {
        const $ = cheerio.load(body);
        words = []
        $('tr').each(function (i, elem) {
            words.push($(this).children());
            console.log(words[0].text());
            console.log(words[1].text());
            console.log(words[2].text());
        });
    });
});