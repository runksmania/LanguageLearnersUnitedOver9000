/* LLUO Project Database Default Setup Database File
   Last modified: 10/8/2020
   Author: Michael Cottrell & Riley Tucker
*/

--Drop and Create Tables.
\echo 'Running tables.sql...\n'
\i tables.sql

--Initialize default user entries.
\echo 'Running user_population.sql...\n'
\i user_population.sql