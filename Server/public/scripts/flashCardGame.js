$(document).ready(function () {
    var index = Math.floor(Math.random() * word_list.length);
    var words_seen = [word_list[index]]
    var prev_index = 0

    //Function to handle when the flashcard is clicked.
    $('.content').on('click', function () {

        if ($('#word').text() == word_list[0]) {
            $('#word').text(word_list[1]);
        }
        else {
            $('#word').text(word_list[0]);
        }
    });

    //Function to handle if the previous word button is clicked.
    $('#prev').on('click', function () {

        if (prev_index > 0) {
            prev_index--;
            $('#word').text(words_seen[prev_index]);
        }
    });

    //Function to handle if the next word button is clicked.
    $('#next').on('click', function () {

        if (prev_index == words_seen.length - 1) {
            index = Math.floor(Math.random() * word_list.length);
            words_seen.push(word_list[index]);
            $('#word').text(words_seen[prev_index]);
        }
        else {
            prev_index++;
            $('#word').text(words_seen[prev_index]);
        }
    });

    $('#word').text(words_seen[prev_index]);
});