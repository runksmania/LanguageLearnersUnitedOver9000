$(document).ready(function () {
    if(facts){
        for (var i of facts){
            $('.content').append(i.parse.text['*'])
        }
    }

    $('.content a').each(function(){
        originalUrl = $(this).attr('href');
        urlSplit = $(this).attr('href').split('/')

        if(urlSplit[0][0] != 'h' && $(this).attr('href').split('#').length == 1){
            $(this).attr('href', 'https://en.wikipedia.org/wiki/' + urlSplit[urlSplit.length - 1])
        }
    });
});