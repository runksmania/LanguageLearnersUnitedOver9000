'use strict'

$(document).ready(function ()
{
    if(typeof(messageList) != 'undefined') {
        var intitializeString = '';

        for(var i of messageList[0]) { 
            var datetime = new Date(i.sent_date);

            intitializeString += '<tr class="messageOverview">'
                + '<td class="from">' + i.from_user + '</td>'
                + '<td class="date">' + datetime.toLocaleString('en-US', {timezone: 'PST'}) + '</td>'
                + '<td class="message">' + i.user_message + '</td>'
                + '</tr>';            
        } 

        $('#messageList').append(intitializeString);
    } 
});