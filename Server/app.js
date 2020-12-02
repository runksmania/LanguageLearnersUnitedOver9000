'use strict';

/**
 * Import Classes and functions.
 */
const databaseHandler = require('./private/DatabaseHandler');
const logger = require('./private/logger');
const Constants = require('./private/Constants');
const updateWordList = require('./private/updateWordsList.js').updateWordsList;
const getPageContent = require('./private/wikipediaAPIRequest.js').getPageContent;

/**
* Instantiate Classes.
*/
const constants = new Constants();
const dbhandler = new databaseHandler();
//const mailer = new Mailer();

/**
 * Program Dependencies.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { body } = require('express-validator');
const { sanitizeBody } = require('express-validator');
var flash = require('connect-flash');

/**
 *
 *
 * App setup.
 *
 *
 */
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({

    name: 'session',
    secret: ['256a9ae4fdd162057d57ced6ab92364e80f2192e',
        '09fff925f85c1cbcfd8e4253f529e9c86e016d79',
        '6d82f4dad615e281ad5a66962b18235848328c4c',
        '8c4ebb0d757847a26563fa83b0404b16acf008d9',
        '6f2ab0cb1fa0b14c7d34c53f28bbf9be2510868b',
        '4b537365299488fb980c33fc0e96411872fb03c7',
        'dcf4c762ec035acc5094eb3c8e0e8ec9ac1700fa',
        '7aed3340f1511c72caf3512ffdbd75e1a8abeaab',
        '77efceadd5ef67f798f7c1f13e74344ee69dcf3c'
    ],
    secure: true,
    resave: false,
    saveUninitialized: true,
    cookie: { sameSite: 'lax' },
}));

app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));

/************************************************************************************
 ************************************************************************************
 ************************************************************************************
 ******************************* BEGIN APP.GETS *************************************
 ************************************************************************************
 ************************************************************************************
 ************************************************************************************
 ************************************************************************************/

app.get('/', (req, res) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    if (req.session.flash) {
        var flash = req.flash('info');
        var message = req.flash(flash);
        req.session.flash = null;
        logger.info(message);

        if (req.session.user) {
            logger.info(req.session.user.username)
        }

        res.render('flash', { flashTitle: flash.toString(), flashMessage: message.toString() });
    }
    else if (req.session && req.session.user) {
        res.redirect('/main');
    }
    else {
        req.session.destroy();
        res.render('login');
    }
});

app.get('/login', (req, res) => {
    res.redirect('/');
});

app.get('/resetPassword', (req, res) => {
    if (req.session && req.session.user) {
        res.render('resetPassword', { failed: false });
    }
    else {
        res.redirect('/');
    }

});

app.get('/main', (req, res) => {
    if (req.session && req.session.user) {
        let data = { name: req.session.user.name, langPref: req.session.user.langPref, accessToken: req.session.user.accessToken };

        if (req.session.user.resetPass == true) {
            res.redirect('/resetPassword');
        }
        else {
            res.render('main', data);
        }
    }
    else {
        res.redirect('/');
    }
});

app.get('/main/flashCardGames/?:lang', (req, res) => {
    if (req.session && req.session.user) {

        //Get words list for the language and render the view.
        dbhandler.getWordList(req.session.user.langPref)
            .then((result) => {
                var words = [];

                for (var i = 0; i < result.length; i++) {
                    words.push([result[i].word, result[i].eng_word]);
                }

                res.render('flashCardGame', { words_list: words, language: req.session.user.langPref });
            })
            .catch((err) => {
                logger.error('There was an error attempting to get words list for language:\n' + req.session.user.langPref);
                logger.error(err);
                var flashMessage = 'There was an error processing that request. Please try again or contact a site administrator'
                    + ' should this issue persist.';
                req.flash('info', 'requestError');
                req.flash('requestError', flashMessage);
                res.redirect('/');
            });

        //After rendering the view check if words_* table needs updated.
        updateWordList(dbhandler, req.session.user.langPref);
    }
    else {
        res.redirect('/');
    }
});

app.get('/main/facts/type/?:factType/', (req, res) => {
    if (req.session && req.session.user) {

        //Get page name from database for language and fact type.
        dbhandler.getFactPageName(req.session.user.langPref, req.params.factType)
            .then(pageName => {

                //Get facts list for the language and and fact type then render to view.
                getPageContent(pageName)
                .then(results => {
                    res.render('languageFacts', {facts: results, language: req.session.user.langPref, factType: req.params.factType});
                })

                .catch(err => {
                    logger.error('There was an error attempting to get words list for language:\n' + req.session.user.langPref);
                    logger.error(err);
                    var flashMessage = 'There was an error processing that request. Please try again or contact a site administrator'
                        + ' should this issue persist.';
                    req.flash('info', 'requestError');
                    req.flash('requestError', flashMessage);
                    res.redirect('/');
                });
            })

            .catch(err => {

            });        
    }
    else {
        res.redirect('/');
    }
});

app.get('/main/users/search/', (req, res) =>{
    if (req.session && req.session.user) {

        //Get list of users that speak specified language.
        dbhandler.getUserList(req.session.user.langPref, {})
            .then(results => {
                res.render('searchUsers', {users: results, langPref : req.session.user.langPref});
            })

            .catch(err => {
                logger.error('There was an error attempting to get user list for language:\n' + req.session.user.langPref);
                logger.error(err);
                var flashMessage = 'There was an error processing that request. Please try again or contact a site administrator'
                    + ' should this issue persist.';
                req.flash('info', 'requestError');
                req.flash('requestError', flashMessage);
                res.redirect('/');
            });        
    }
    else {
        res.redirect('/');
    }
});

app.get('/main/users/search/ajax', (req, res) =>{
    if (req.session && req.session.user) {

        //Get list of users that speak specified language.
        dbhandler.getUserList(req.query.langPref, req.query)
            .then(results => {
                res.send(results);
            })

            .catch(err => {
                logger.error('There was an error attempting to get user list for language:\n' + req.params.langPref);
                logger.error(err);
            });        
    }
    else {
        res.redirect('/');
    }
});

app.get('/register', (req, res) => {
    if (!req.session || !req.session.user) {
        
        dbhandler.languageQuery()
            .then(results =>{
                var resultsAlphabetical = []
                
                for (var i = 0; i < results.length; i++){
                    resultsAlphabetical.push(results[i].lang_name);
                }

                resultsAlphabetical.sort();
                res.render('register', {langList: resultsAlphabetical, issue: null});
            })

            .catch(err =>{
                logger.error('There was an error attempting to get the list of languages:\n');
                logger.error(err);
                var flashMessage = 'There was an error processing that request. Please try again or contact an site administrator'
                    + ' should this issue persist.';
                req.flash('info', 'requestError');
                req.flash('requestError', flashMessage);
                res.redirect('/');
            });
    }
    else{
        res.redirect('/main');
    }
});

app.get('/main/webmail', (req, res) => {
    if (req.session && req.session.user) {

        dbhandler.getMessages(req.session.user.id)
            .then(results => {
                res.render('webmail', {messageList: results, userNum: req.session.user.id});
            })

            .catch(err =>{
                logger.error('There was an error attempting to get the list of messages for user: ' + req.session.user.username + '\n');
                logger.error(err);
                var flashMessage = 'There was an error processing that request. Please try again or contact an site administrator'
                    + ' should this issue persist.';
                req.flash('info', 'requestError');
                req.flash('requestError', flashMessage);
                res.redirect('/');
            });
    }
    else{
        res.redirect('/');
    }
});

app.get('/main/webmail/ajax', (req, res) => {
    if (req.session && req.session.user) {
        logger.debug(req.query);

        dbhandler.getMessages(req.query.id)
            .then(results => {
                res.send(results);
            })

            .catch(err =>{
                logger.error('There was an error attempting to get the list of messages for ajax request');
                logger.error(err);
            });
    }
    else{
        res.redirect('/');
    }
});

app.get('/main/settings', (req, res) =>{
    if (req.session && req.session.user) {
        res.render('settings');
    }
    else{
        res.redirect('/');
    }
});

app.get('*/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

/************************************************************************************
 ************************************************************************************
 ************************************************************************************
 ******************************* BEGIN APP.POSTS ************************************
 ************************************************************************************
 ************************************************************************************
 ************************************************************************************
 ************************************************************************************/

app.post('/login', [body('username').trim().escape()], (req, res) => {
    var user;

    dbhandler.attemptLogin(req.body.username, req.body.password, function (err, result) {
        if (err) {
            logger.error('There was an error attempting to login:\n' + req.body.username);
            logger.error(err);
            var flashMessage = 'There was an error processing that request. Please try again or contact a site administrator'
                + ' should this issue persist.';
            req.flash('info', 'requestError');
            req.flash('requestError', flashMessage);
            res.redirect('/');
        }
        else {
            user = result;

            if (user == null) {
                res.render('loginFailed');
            }
            else {
                req.session.user = user;
                user.resetPass == false ? res.redirect('/main') : res.redirect('/resetPassword')
            }
        }
    });

});

app.post('/registerUser', (req, res) => {
    if (!req.session || !req.session.user){

        dbhandler.addNewUser(req.body.username, req.body.fname, req.body.lname, req.body.email, req.body.langPref, req.body.password)
            .then(result =>{

                switch(result[0]){

                    case('success'):
                        logger.info('There has been a new user registered for user: ' + req.body.username);
                        var flashMessage = 'You have now been registered. Please login to your new account.';
                        req.flash('info', 'Successful Registration');
                        req.flash('Successful Registration', flashMessage);
                        res.redirect('/');
                        return;

                    case('Username'):
                        logger.info('Duplicate username found when attempting to register user: ' + req.body.username);
                        break;

                    case('Email'):
                        logger.info('Duplicate email found when attempting to register user: ' + req.body.username);
                        logger.info('Duplicate email: ' + req.body.email);
                        break;
                }

                dbhandler.languageQuery()
                    .then(results =>{
                        var resultsAlphabetical = []
                        
                        for (var i = 0; i < results.length; i++){
                            resultsAlphabetical.push(results[i].lang_name);
                        }

                        resultsAlphabetical.sort();
                        res.render('register', {langList: resultsAlphabetical, issue: result[0]});
                    })

                    .catch(err =>{
                        logger.error('There was an error attempting to get the list of languages:\n');
                        logger.error(err);
                        var flashMessage = 'There was an error processing that request. Please try again or contact an site administrator'
                            + ' should this issue persist.';
                        req.flash('info', 'requestError');
                        req.flash('requestError', flashMessage);
                        res.redirect('/');
                    });
            })

            .catch(err =>{
                logger.error('There was an error attempting to register a new user:\n');
                    logger.error(err);
                    var flashMessage = 'There was an error processing that request. Please try again or contact a site administrator'
                        + ' should this issue persist.';
                    req.flash('info', 'requestError');
                    req.flash('requestError', flashMessage);
                    res.redirect('/');
            });
    }
    else{
        res.redirect('/');
    }
});

app.post('/main/webmail/send', (req, res) => {

    logger.debug(req.body);
    
    if (req.session && req.session.user) {
        dbhandler.insertMessage(req.body.toUser, req.body.fromUser, req.body.message)
            .then(result => {
                res.send(result);
            })

            .catch(err => {
                logger.error('There was an error attempting to insert a new message:\n');
                logger.error(err);
            });
    }
    else{
        res.redirect('/');
    }
});

app.post('/resetPassword', (req, res) => {
    if (req.session && req.session.user) {
        var user = req.session.user;

        if (user.firstLogin || user.resetPass) {
            dbhandler.prevPassQuery(user.username, req.body.pass, function (error, result) {
                if (result.length == 0) {

                    dbhandler.resetPassword(user.username, req.body.pass, function (err, bool) {
                        if (err) {
                            logger.error('There was an error attempting to reset password:\n' + user.username);
                            logger.error(err);
                            var flashMessage = 'There was an error processing that request. Please try again or contact a site administrator'
                                + ' should this issue persist.';
                            req.flash('info', 'requestError');
                            req.flash('requestError', flashMessage);
                            res.redirect('/');

                        }
                        else {
                            req.flash('info', 'passwordReset');
                            req.flash('passwordReset', 'Your password has been reset');
                            req.session.user.resetPass = false;
                            res.redirect('/');
                        }
                    })
                }
                else {
                    res.render('resetPassword', { failed: true });
                }
            });
        }
        else {
            res.redirect('/main');
        }
    }
    else {
        res.redirect('/');
    }
});

//Default page to show if user requests a page that doesn't exist.
//Add flash message to show 404 error.
app.use((req, res) => {
    var user = req.session.user ? req.session.user : { 'username': undefined }
    logger.error('There was an an attempt to reach a page for [' + req.path + '] that doesn\'t exist. (404 error) by user (undefined no username): '
        + user.username);
    var flashMessage = 'ERROR 404 PAGE NOT FOUND\nThere was an error processing that request. Please try again or contact a site administrator'
        + ' should this issue persist.';
    req.flash('info', '404Error');
    req.flash('404Error', flashMessage);
    res.redirect('/');
});

app.listen(constants.port, constants.host, () => {
    dbhandler.languageQuery()
        .then((res) => {
            var promises = [];

            for (var i = 0; i < res.length; i++) {

                if (res[i].lang_name != 'English'){
                    promises.push(updateWordList(dbhandler, res[i].lang_name));
                }
            }

            Promise.all(promises)
                .then((res) => {
                    logger.info('Server is now listening on: ' + constants.host + ':' + constants.port + '\n');
                })
                .catch((err) => {
                    logger.err('There was an issue attempting to update or initialize words in the database.');
                    logger.error(err);
                });
        })
        .catch((err) => {
            throw new Error(err);
        });

});