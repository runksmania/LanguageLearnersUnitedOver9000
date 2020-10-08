/* LLUO Project Database Default Table Creation File
   Last modified: 10/8/2020
   Author: Michael Cottrell & Riley Tucker
*/

\echo 'Dropping previous user table if exists...\n'
DROP TABLE IF EXISTS users CASCADE;

\echo 'Creating user table...\n'
CREATE TABLE users
(
    user_num      VARCHAR(4)   PRIMARY KEY,
    username      VARCHAR(20)  UNIQUE NOT NULL,
    fname         VARCHAR(40)  NOT NULL,
    lname         VARCHAR(40)  NOT NULL,
    salt          VARCHAR(40)  NOT NULL,
    pass          VARCHAR(128) NOT NULL,
    email         VARCHAR(100),
    access_token  INTEGER,
    first_login   CHAR(1) DEFAULT NULL,
    pass_age      DATE DEFAULT NOW() NOT NULL,
    security_code CHAR(4) DEFAULT NULL
);

\echo 'Dropping previous user_prev_pass table if exists...\n'
DROP TABLE IF EXISTS user_prev_pass CASCADE;

\echo 'Creating user_prev_pass table...\n'
CREATE TABLE user_prev_pass
(
    user_num     VARCHAR(4) REFERENCES users,
    prev_pass   VARCHAR(128),
    PRIMARY KEY (user_num, prev_pass)
);