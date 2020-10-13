/* LLUO Project Database Default Population Script File
   Last modified: 10/13/2020
   Author: Michael Cottrell & Riley Tucker
*/

\echo 'Populating default information...'

\echo 'Running user_population.sql...'
\i user_population.sql
\echo

\echo 'Running lang_population.sql...'
\i lang_population.sql
\echo