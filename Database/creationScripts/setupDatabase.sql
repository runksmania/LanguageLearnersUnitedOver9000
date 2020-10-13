/* LLUO Project Database Default Setup Database File
   Last modified: 10/13/2020
   Author: Michael Cottrell & Riley Tucker
*/

--Drop and Create Tables.
\echo 'Running tables.sql...\n'
\i tables.sql

--Initialize triggers.
\echo 'Running triggers.sql...\n'
\i triggers.sql

--Initialize default user entries.
\echo 'Running population.sql...\n'
\i population.sql
