'use strict'

function changeMessageList(event){
    var intitializeString = '';
    var messages = messageList[0];

    if (event.data.type == 'sent'){
        messages = messageList[1]
    }
    
    for(var i of messages) { 
        var datetime = new Date(i.sent_date);
        var user = event.data.type == 'inbox' ? i.from_user : i.to_user

        intitializeString += '<div class="messageOverview">'
            + '<span class="from">' + user + '</span>'
            + '<span class="date">' + datetime.toLocaleString('en-US', {timezone: 'PST'}) + '</span>'
            + '<span class="message">' + i.user_message + '</span></div>';
    } 

    $('.list').empty().append(intitializeString);
    $('div .messageOverview').on('click', showMessage);
}

function showMessage(){
    var index = $('.messageOverview').index(this);
    var message = messageList[0][index].user_message;
    var clickedMessage = $(this).find('.message').text();
    var messageInfo = messageList[0][index];
    var datetime = new Date(messageInfo.sent_date);

    //If they are equal current messages listed are from the inbox else it's from sent.
    if (clickedMessage != message){
        messageInfo = messageList[1][index];
    }

    $('.messageView .to').empty().html('<strong>To:</strong> ' + messageInfo.to_user);
    $('.messageView .from').empty().html('<strong>From:</strong> ' + messageInfo.from_user);
    $('.messageView .date').empty().html('<strong>Date Sent:</strong> ' + datetime.toLocaleString('en-US', {timezone: 'PST'}));
    $('#message').empty().html('<strong>Message:</strong> <br/><br/>' + messageInfo.user_message);
    $('.reply').empty().append('<textarea type="text" id="replyBox"/>');
    $('#sendBtn').show();
}

$(document).ready(function ()
{
    $('.inlineLayout').last().css('border', 'none');   

    if(typeof(messageList) != 'undefined') {
        $('#inbox').on('click', {type: 'inbox'}, changeMessageList);
        $('#sent').on('click', {type: 'sent'}, changeMessageList);
        changeMessageList({ data: {type: 'inbox'}});
        $('div .messageOverview').on('click', showMessage);
    }
});