'use strict';

/**
 * Module Dependencies.
 */
const { Pool, Client } = require('pg');
const logger = require('../private/logger');
const User = require('../private/User');
const hash = require('../private/hash.js');
const { query } = require('express');
const util = require('util');

module.exports = class DatabaseHandler {
    constructor() {
        this.pool = new Pool(
            {
                host: 'localhost',
                user: 'postgres',
                database: 'LLUO',
                port: 5432
            });

        //Grab connection to make sure database is connected
        this.pool.query('SELECT NOW()', (err, res) => {
            if (err) {
                logger.error(err);
            }
            else {
                logger.info('Connected to database successfully.');
            }

        });
    }

    //This function returns a user if login information is valid, otherwise returns a null user.
    attemptLogin(username, pass, done) {

        this.pool.query('SELECT * FROM users WHERE username = $1', [username], function (err, result) {
            var user = new User();

            if (err) {
                //Log error and return null to show login failed.
                logger.error(err);
                return done(err, null);
            }
            else if (result.rows.length == 0) {
                //No user found return null to show login failed.
                user = null;
            }
            else {
                //Check login credentials, against database.
                result = result.rows[0]
                user.id = result.iduser;
                user.username = result.username;
                user.name = result.fname + ' ' + result.lname;
                user.email = result.email;
                user.accessToken = result.access_token;
                user.langPref = result.lang_pref;

                //Todays date - last pass change date / ms in 3 months.
                var passAge = Math.floor((Date.now() - result.pass_age) / (2592000000))
                user.resetPass = (result.first_login == null || passAge >= 3 ? true : false);

                var hashPass = hash.hashPassword(result.salt, pass);

                if (hashPass != result.pass) {
                    //Login results failed, set user null to show failed login upon returning.
                    user = null;
                }
            }

            //Log login attempt and result.
            //Then return user.
            logger.info("Login attempt.\nUsername: " + username + "\nSuccess: " + (user != null));
            return done(err, user);
        });
    }

    //This function adds a new user into the database.
    //This function defaults access token to regular user.  
    //To add an admin it must be directly into the database.
    //Returns an array containing one of the following:
    //    'success': If adding was successful.
    //    'username': If the username is taken.
    //    'email': If email is already registerd.
    addNewUser(username, fname, lname, email, lang_pref, pass) {
        
        return new Promise(function (resolve, reject){

            var queryString = 'SELECT *\n'
                + 'FROM users\n'
                + 'WHERE username = $1;';

            this.pool.query(queryString, [username])
                .then(res => {
                        res = res.rows

                        if (res.length > 0){
                            resolve(['Username']);
                            return;
                        }

                        var queryString = 'SELECT *\n'
                            + 'FROM users\n'
                            + 'WHERE email = $1;';

                        this.pool.query(queryString, [email])
                            .then(res => {
                                res = res.rows

                                if (res.length > 0){
                                    resolve(['Email']);
                                    return;
                                }

                                var salt = hash.createSalt();
                                var hashPass = hash.hashPassword(salt, pass);

                                //Set up parameterized query.
                                var queryString = 'INSERT INTO users\n'
                                + '(username, fname, lname, salt, pass, email, lang_pref, access_token, first_login)\n'
                                + 'VALUES\n'
                                + '($1,$2,$3,$4,$5,$6,$7,$8,$9);';

                                this.pool.query(queryString, [username, fname, lname,
                                salt, hashPass, email, lang_pref, 0, '1'], function (err, result) {
                                    if (!err) {
                                        resolve(['success']);
                                    }
                                    else{
                                        reject(err);
                                    }

                                });
                            })

                            .catch(err =>{
                                reject(err);
                            });
                    })

                    .catch(err =>{
                        reject(err);
                    });

        }.bind(this))
    }

    //Function to grab salt for resetting password.
    saltQuery(username, done) {
        this.pool.query('SELECT salt FROM users WHERE username = $1', [username], function (err, res) {
            return done(err, res.rows);
        });
    }

    //Function to grab prev passwords for user.
    prevPassQuery(username, pass, done) {
        this.saltQuery(username, function (err, res) {
            if (err) {
                return err;
            }

            var hashPass = hash.hashPassword(res[0].salt, pass);

            var queryString = 'SELECT prev_pass\n'
                + 'FROM user_prev_pass\n'
                + 'WHERE prev_pass = $1 AND user_num = (\n'
                + 'SELECT user_num\n'
                + 'FROM users\n'
                + 'WHERE username = $2\n'
                + ');';

            var tempDbhandler = new DatabaseHandler();

            tempDbhandler.pool.query(queryString, [hashPass, username], function (error, result) {
                return done(error, result.rows)
            });

        });
    }

    //This function changes the password in the database for the user.
    resetPassword(username, password, done) {
        this.saltQuery(username, function (err, res) {
            if (err) {
                return err;
            }

            var salt = res[0].salt;
            var tempDbhandler = new DatabaseHandler();
            var hashPass = hash.hashPassword(salt, password);

            var queryString = 'UPDATE users\n'
                + 'SET pass = $1,\n'
                + 'first_login = 1,\n'
                + 'pass_age = NOW()\n'
                + 'WHERE username = $2;'

            tempDbhandler.pool.query(queryString, [hashPass, username], function (error, result) {
                return done(error, result);
            });
        });
    }

    //This function queries all languages available.
    languageQuery() {
        return new Promise(function (resolve, reject) {
            var queryString = 'SELECT lang_name\n'
                + 'FROM languages;';

            this.pool.query(queryString, function (error, result) {
                if (error) {
                    reject(error);
                    return;
                }
                else {
                    resolve(result.rows);
                }
            });
        }.bind(this))
    }

    //This function queries the age of the words of a language.
    languageAgeQuery(lang_name) {

        return new Promise(function (resolve, reject) {
            var queryString = 'SELECT last_updated\n'
                + 'FROM languages\n'
                + 'WHERE lang_name = $1;';

            this.pool.query(queryString, [lang_name], function (err, res) {

                if (err) {
                    reject(err);
                    return;
                }
                else {
                    resolve(res);
                }
            });
        }.bind(this))
    }

    //This function queries the database for the appropriate pageName for the language and fact type specified.
    getFactPageName(lang_name, factType){

        var dict = {
            'language' : 'language_page',
            'country' : 'country_page',
            'culture' : 'culutural_page'
        };

        factType = dict[factType];

        return new Promise(function (resolve, reject){

            var queryString = 'SELECT ' + factType + '\n'
                + 'FROM facts_pages\n'
                + 'WHERE lang_name = $1;';

            this.pool.query(queryString, [lang_name], function(err, res){

                if (err){
                    logger.error(err);
                    reject(err);
                }
                else{
                    resolve(res.rows[0][factType]);

                }
            });            
        }.bind(this));
    }

    //This function updates the word table for a language.
    alterWordList(lang_name, data, alter_type) {

        return new Promise(function (resolve, reject) {
            if (alter_type == 'insert') {
                var queryString = 'INSERT INTO words_' + lang_name + '\n'
                    + 'VALUES ($1,$2,$3);';

                this.pool.query(queryString, data, function (err, res) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            }
            else if (alter_type == 'update') {
                var queryString = 'UPDATE words_' + lang_name + '\n'
                    + 'SET word = $2, eng_word = $3\n'
                    + 'WHERE rank_num = $1;';

                this.pool.query(queryString, data, function (err, res) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    else {
                        resolve(res);
                    }
                });
            }
            else {
                reject('Incorrect alter_type specified.  Must be \'insert\' or \'update\'');
            }

        }.bind(this))
    }

    //This function updates the age of the word table for a language.
    updateLanguageAge(lang_name) {
        return new Promise(function (resolve, reject) {
            var queryString = 'UPDATE languages\n'
                + 'SET last_updated = NOW()\n'
                + 'WHERE lang_name = $1';

            this.pool.query(queryString, [lang_name], function (err, res) {
                if (err) {
                    reject(err);
                    return;
                }
                else {
                    resolve(res);
                }
            });
        }.bind(this));
    }

    //This function gets the word list for a language.
    getWordList(lang_name) {
        return new Promise(function (resolve, reject) {
            var queryString = 'SELECT *\n'
                + 'FROM words_' + lang_name + '\n'
                + 'ORDER BY rank_num::int';

            this.pool.query(queryString, function (err, res) {
                if (err) {
                    reject(err);
                    return;
                }
                else {
                    resolve(res.rows);
                }
            });
        }.bind(this));
    }

    //This function gets a list of users who are fluent in the language specified.
    //Options:
    //  narrow: Uses this variable to narrow by username or fname.
    getUserList(lang_name, opts){
        return new Promise(function (resolve, reject) {
            var queryString = 'SELECT users.user_num, username, fname, lang_pref\n'
                + 'FROM users, user_languages\n'
                + 'WHERE users.user_num = user_languages.user_num\n'
                + 'AND lang_name = $1';

            var parameters = [lang_name]

            if (opts && opts['narrow']){
                var queryString = 'SELECT DISTINCT users.user_num, username, fname, lang_pref\n'
                + 'FROM users, user_languages\n'
                + 'WHERE users.user_num = user_languages.user_num\n'
                + 'AND username = $1\n'
                + 'OR fname ILIKE $2';
                parameters = [opts['narrow'], '%' + opts['narrow'] + '%'];
            }

            this.pool.query(queryString, parameters)
                .then(res => {
                    res = res.rows
                    var promises = [];

                    if (res.length > 0){
                        for (var i of res){
                            queryString = 'SELECT lang_name\n'
                                + 'FROM user_languages\n'
                                + 'WHERE user_num = $1';

                            promises.push(this.pool.query(queryString, [i['user_num']]));
                        }

                        Promise.all(promises)
                            .then(results =>{

                                for (var i = 0; i < res.length; i++){
                                    var languages = []

                                    for (var j of results[i].rows){
                                        languages.push(j['lang_name']);
                                    }
                                    
                                    res[i]['languages'] = languages.join(', ');
                                }

                                resolve(res);
                            })
                            
                            .catch(err => {
                                return Promise.reject(err);
                            });
                    }
                    else{
                        resolve([]);
                    }
                })

                .catch(err =>{
                    return Promise.reject(err);
                });
        }.bind(this));
    }
}

// The following is for debugging.
const Dbhandler = require('./DatabaseHandler.js');
const dbhandler = new Dbhandler();

/*dbhandler.addNewUser('mc1', 'hello', 'world', 'helloworld@yahoo.com', 'Italian', 'abc')
    .then(res =>{

        switch(res[0])
        {
            case 'success':
                logger.info('This was sucessful.');
                break;

            case 'username':
                logger.info('Duplicate username.');
                break;

            case 'email':
                logger.info('Duplicate email.');
                break;
        }
    })
    
    .catch(err =>{
        logger.error(err);
    });*/