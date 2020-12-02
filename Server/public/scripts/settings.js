$(document).ready(function () {

    function changesFailed() {
        $('.changesFailed').css('color', 'red');
        $('.changesFailed').effect('shake', { times: 2 }, 500);
    }

    if(issue != 'null'){
        changesFailed();
    }
    
});