$(document).ready(function () {

    function registerFailed() {
        $('.registerFailed').css('color', 'red');
        $('.registerFailed').effect('shake', { times: 2 }, 500);
    }

    if(issue != null){
        registerFailed();
    }
    
});