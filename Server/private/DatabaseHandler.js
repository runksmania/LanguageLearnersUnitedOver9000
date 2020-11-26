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
    addNewUser(emp_id, username, fname, lname, dept, email, pass, accessToken, done) {
        var salt = hash.createSalt();
        var hashPass = hash.hashPassword(salt, pass);

        //Set up parameterized query.
        var queryString = 'INSERT INTO emp\n'
            + 'VALUES\n'
            + '($1,$2,$3,$4,$5,$6,$7,$8,$9);';

        var query = this.pool.query(queryString, [emp_id, username, fname, lname,
            dept, salt, hashPass, email, accessToken], function (err, result) {
                if (!err) {
                    logger.info('Created new user for user: ' + username);
                }

                return done(err, true);

            });
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

    getFactPageName(lang_name, factType){

        var dict = {
            'language' : 'language_page',
            'country' : 'country_page',
            'culture' : 'culture_page'
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
}