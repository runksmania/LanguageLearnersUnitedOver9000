/* LLUO Project Database Default Table Creation File
   Last modified: 11/30/2020
   Author: Michael Cottrell & Riley Tucker
*/

\echo 'Dropping previous user table if exists...'
DROP TABLE IF EXISTS users CASCADE;
\echo

\echo 'Creating user table...'
CREATE TABLE users
(
    user_num      SERIAL   PRIMARY KEY,
    username      VARCHAR(20)  UNIQUE NOT NULL,
    fname         VARCHAR(40)  NOT NULL,
    lname         VARCHAR(40)  NOT NULL,
    salt          VARCHAR(40)  NOT NULL,
    pass          VARCHAR(128) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    lang_pref     VARCHAR(30)  REFERENCES languages(lang_name),
    access_token  INTEGER,
    first_login   CHAR(1) DEFAULT NULL,
    pass_age      DATE DEFAULT NOW() NOT NULL,
    security_code CHAR(4) DEFAULT NULL
);
\echo

\echo 'Dropping previous user_prev_pass table if exists...'
DROP TABLE IF EXISTS user_prev_pass CASCADE;
\echo

\echo 'Creating user_prev_pass table...'
CREATE TABLE user_prev_pass
(
    user_num    INTEGER REFERENCES users,
    prev_pass   VARCHAR(128),
    PRIMARY KEY (user_num, prev_pass)
);
\echo

\echo 'Dropping previous user_languages table if exists...'
DROP TABLE IF EXISTS user_languages CASCADE;
\echo

\echo 'Creating user_languages table...'
CREATE TABLE user_languages
(
    user_num    INTEGER  REFERENCES users,
    lang_name   VARCHAR(30) REFERENCES languages,
    PRIMARY KEY (user_num, lang_name)
);
\echo

\echo 'Dropping languages table if exists...'
DROP TABLE IF EXISTS languages CASCADE;
\echo

\echo 'Creating languages table...'
CREATE TABLE languages
(
    lang_name    VARCHAR(30),
    last_updated DATE DEFAULT NULL,
    PRIMARY KEY   (lang_name)
);
\echo

\echo 'Dropping all language word tables if exists...'
\i dropWordsTables.sql
\echo

\echo 'Dropping facts_pages table if exists...'
DROP TABLE IF EXISTS facts_pages CASCADE;
\echo

\echo 'Creating facts_pages table...'
CREATE TABLE facts_pages
(
    lang_name      VARCHAR(30) REFERENCES languages,
    language_page  VARCHAR,
    country_page   VARCHAR,
    culutural_page VARCHAR    
);
\echo

\echo 'Dropping messages table if exists...'
DROP TABLE IF EXISTS messages CASCADE;
\echo

\echo 'Creating messages table...'
CREATE TABLE messages
(
    user_to_num   INTEGER REFERENCES users,
    user_from_num INTEGER REFERENCES users,
    user_message  VARCHAR,
    sent_date     TIMESTAMP(0) WITH TIME ZONE DEFAULT (current_timestamp)
);
\echo