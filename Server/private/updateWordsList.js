const logger = require('../private/logger');
const wordsRequest = require('./wordsHttpRequest').wordsHttpRequest;

module.exports = {
    updateWordsList: function (dbhandler, lang_name) {
        dbhandler.languageAgeQuery(lang_name)
            .then(res => {
                if (res.rows.length == 1) {
                    var needs_updated = res.rows[0].last_updated == null || Math.floor((Date.now() - res.rows[0].last_updated) / (2592000000)) >= 3 ? true : false
                    //If words_* table for language is older than 3 months update it.
                    if (needs_updated) {
                        logger.info('Updating or inserting word list for: ' + lang_name);
                        logger.info('Grabbing word list... for : ' + lang_name + '\n');
                        wordsRequest(lang_name.toLowerCase())
                            .then(words => {
                                logger.info('List grabbed successfully for : ' + lang_name);
                                var promises = [];

                                if (res.rows[0].last_updated == null) {
                                    logger.info('Inserting words into database for : ' + lang_name);

                                    for (var i = 1; i < words.length; i++) {
                                        promises.push(dbhandler.alterWordList(lang_name.toLowerCase(), words[i], 'insert'));
                                    }
                                }
                                else {
                                    logger.info('Updating words in database for : ' + lang_name);

                                    for (var i = 1; i < words.length; i++) {
                                        promises.push(dbhandler.alterWordList(lang_name.toLowerCase(), words[i], 'update'));
                                    }
                                }

                                Promise.all([promises])
                                    .then(values => {
                                        logger.info('Words inserted/updated successfully for : ' + lang_name);
                                        logger.info('Updating age of language for : ' + lang_name + '\n');
                                        dbhandler.updateLanguageAge(lang_name)
                                            .then((res) => {
                                                logger.info('Language Age updated successfully for: ' + lang_name);
                                            })
                                            .catch((err) => {
                                                logger.error('Problem updating language age for: ' + lang_name);
                                                logger.error(err);
                                            });
                                    })
                                    .catch(err => {
                                        logger.error('Problem inserting/updating words into database: \n' + lang_name);
                                        logger.error(err);
                                    });
                            })
                            .catch(err => {
                                logger.error('Problem with grabbing words list: \n' + lang_name);
                                logger.error(err);
                            });
                    }
                }
                else {
                    logger.error('No language found for: ' + lang_name);
                }
            })
            .catch(err => {
                logger.error('There was an error attempting to get language age for:\n' + lang_name);
                logger.error(err);
            });
    }
}