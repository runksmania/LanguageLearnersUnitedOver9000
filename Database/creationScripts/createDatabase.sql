/* LLUO Project Database Creation File
   Last modified: 10/8/2020
   Author: Michael Cottrell & Riley Tucker
*/
\echo Dropping database if exists.
DROP DATABASE IF EXISTS "LLUO";

\echo Creating database.
CREATE DATABASE "LLUO"
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;