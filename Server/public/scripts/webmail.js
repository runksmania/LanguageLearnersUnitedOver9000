'use strict'

var contacts = {};
var contactList = [];
var viewState = 'inbox';

function changeMessageList(event){
    var intitializeString = '';
    var messages = messageList[0];
    viewState = 'inbox';

    if (event.data.type == 'sent'){
        messages = messageList[1]
        viewState = 'sent';
    }
    
    for(var i of messages) { 
        var datetime = new Date(i.sent_date);
        var user = event.data.type == 'inbox' ? i.from_user : i.to_user

        intitializeString += '<div class="messageOverview">'
            + '<span class="from">' + user + '</span>'
            + '<span class="date">' + datetime.toLocaleString('en-US', {timezone: 'PST'}) + '</span>'
            + '<span class="message">' + i.user_message + '</span></div>';

        if (contacts[user] != 1){
            contacts[user] = 1;
            contactList.push(user);
        }
    } 

    $('.list').empty().append(intitializeString);
    $('div .messageOverview').on('click', showMessage);
}

function showMessage(){
    var index = $('.messageOverview').index(this);
    var clickedMessage = $(this).find('.message').text();
    var message = null;
    var messageInfo = null;

    if (messageList[0].length > 0){
        message = messageList[0][index].user_message;
        messageInfo = messageList[0][index];
    }

    //If clickedMessage != message current messages listed are from the sent messages.
    if (clickedMessage != message){

        //Swap message info to sent messages.
        messageInfo = messageList[1][index];
    }

    
    var datetime = new Date(messageInfo.sent_date);

    $('.messageView .to').empty().html(`<p style="display: none" id="to">${messageInfo.to_user}</p><p><strong>To:</strong> ${messageInfo.to_user}</p>`);
    $('.messageView .from').empty().html(`<p style="display: none"id="from">${messageInfo.from_user}</p><p><strong>From:</strong> ${messageInfo.from_user}</p>`);
    $('.messageView .date').empty().html('<strong>Date Sent:</strong> ' + datetime.toLocaleString('en-US', {timezone: 'PST'}));
    $('#message').empty().show().html('<strong>Message:</strong> <br/><br/>' + messageInfo.user_message);
    $('.reply').empty().show().height('20%').append('<textarea type="text" id="replyBox"/>');
    $('#sendBtn').show();
}

function composeView(event){
    
    if (contactList.length <= 2){

        if(messageList[1].length != 0) {

            if (contacts[messageList[1][0].to_user] != 1){

                for (var i of messageList[1]){

                    if(contacts[i.to_user] != 1){
                        contacts[i.to_user] = 1;
                        contactList.push(i.to_user);
                    }
                }
            }
        }

        contactList.sort();
        var toLineString = '<p style="display: none" id="to"></p><p><strong>To: </strong><select id="contactSelect" name="contactSelect">'
            + '<option value="" disabled selected="selected">Select a contact--</option>'

        for(var i of contactList) toLineString += `<option value="${i}">${i}</option></p>`;

        $('.messageView .to').empty().html(toLineString);
        $('.messageView .from').empty().html(`<p style="display: none"id="from">${username}</p><p><strong>From:</strong> ${username}</p>`);
        $('.messageView .date').empty();
        $('#message').css('display', 'none');
        $('.reply').show().empty().height('80%').append('<textarea type="text" id="replyBox"/>');
        $('#sendBtn').show();
        $('#contactSelect').on('change', function(e){
            $('#to').text($(this).val());
        });
    }
    else{
        $('#message').empty().show().html('<strong>Oops. You have no one in your contacts, please message new users'
            + ' by finding them on the search user screen and clicking their name.</strong>');
    }
}

function sendMessage(event){
    var urlString = window.location.origin + '/main/webmail/send';
    var to = $('#to').text();
    var from = $('#from').text();

    //If replying to an inbox message to and from need to be swapped.
    if(!$('#contactSelect').length && viewState == 'inbox'){
        var from = $('#to').text();
        var to = $('#from').text();
    }

    var reply = $('#replyBox').val();

    if (reply != ""){


        $.ajax({
            method: "post",
            url: urlString,
            data: {toUser: to, fromUser: from, message: reply}
        })
            .done(function (result)
            {
                $('.messageView .to').empty();
                $('.messageView .from').empty();
                $('.messageView .date').empty();
                $('#message').empty()
                $('.reply').empty().hide().height('20%');
                $('#sendBtn').hide();
                
                if (result == true){    
                    $('#message').show().html('<strong>Your message was successfully sent.</strong>');
                    getMessages();
                }
                else{
                    $('#message').show().html('<strong>There was an error sending the message. Please try again or contact a site administrator.</strong>');
                }
            });
    }
}

function getMessages(){
    var urlString = window.location.origin + '/main/webmail/ajax';

    $.ajax({
        method: "get",
        url: urlString,
        data: {id: userNum}
    })
        .done(function (result)
        {
            messageList = result;
            changeMessageList({data: {type: 'inbox'}});
        });
}

$(document).ready(function ()
{
    $('.inlineLayout').last().css('border', 'none');
    
    if(contacts[username] != 1){
        contacts[username] = 1;
        contactList.push(username);
    }

    if(typeof(messageList) != 'undefined') {
        $('#inbox').on('click', {type: 'inbox'}, changeMessageList);
        $('#sent').on('click', {type: 'sent'}, changeMessageList);
        $('#compose').on('click', {}, composeView);
        changeMessageList({ data: {type: 'inbox'}});
        $('div .messageOverview').on('click', showMessage);
        $('#sendBtn').on('click', sendMessage);
    }

    if(typeof(username) != 'undefined' && typeof(toUsername) != 'undefined'){
        $('.messageView .to').empty().html(`<p style="display: none" id="to">${toUsername}</p><p><strong>To:</strong> ${toUsername}</p>`);
        $('.messageView .from').empty().html(`<p style="display: none"id="from">${username}</p><p><strong>From:</strong> ${username}</p>`);
        $('#message').css('display', 'none');
        $('.reply').empty().height('80%').append('<textarea type="text" id="replyBox"/>');
        $('#sendBtn').show();

        if(contacts[toUsername] != 1){
            contacts[toUsername] = 1;
            contactList.push(toUsername);
        }
    }
});