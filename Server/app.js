'use strict';

/**
 * Import Classes.
 */
const databaseHandler = require('./private/DatabaseHandler');
const logger = require('./private/logger');
const Constants = require('./private/Constants');

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
        let data = { name: req.session.user.name, accessToken: req.session.user.accessToken };

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
            logger.error('Therer was an error attempting to login:\n' + req.body.username);
            logger.error(err);
            var flashMessage = 'There was an error processing that request. Please try again or contact an administrator'
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

app.post('/resetPassword', (req, res) => {
    if (req.session && req.session.user) {
        var user = req.session.user;

        if (user.firstLogin || user.resetPass) {
            dbhandler.prevPassQuery(user.username, req.body.pass, function (error, result) {
                if (result.length == 0) {

                    dbhandler.resetPassword(user.username, req.body.pass, function (err, bool) {
                        if (err) {
                            logger.error('Therer was an error attempting to reset password:\n' + user.username);
                            logger.error(err);
                            var flashMessage = 'There was an error processing that request. Please try again or contact an administrator'
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
    logger.error('There was an an attempt to reach a page that doesn\'t exist. (404 error) by user (undefined no username):\n' + req.body.username);
    var flashMessage = 'ERROR 404 PAGE NOT FOUND\nThere was an error processing that request. Please try again or contact an administrator'
        + ' should this issue persist.';
    req.flash('info', '404Error');
    req.flash('404Error', flashMessage);
    res.redirect('/');
});

app.listen(constants.port, constants.host, () => {
    logger.info('Server is now listening on: ' + constants.host + ':' + constants.port);
});