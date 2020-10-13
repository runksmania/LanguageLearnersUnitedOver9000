/* LLUO Project Database Default Trigger Creation File
   Last modified: 10/12/2020
   Author: Michael Cottrell & Riley Tucker
*/

\echo "Creating function prev_pass_procedure...\n"
CREATE OR REPLACE FUNCTION prev_pass_procedure()
    RETURNS TRIGGER AS $prev_pass_procedure$
    BEGIN
        INSERT INTO user_prev_pass
        VALUES
        (NEW.user_num, NEW.pass);
        RETURN NEW;
    END;
$prev_pass_procedure$ LANGUAGE plpgsql;

\echo "Dropping prev_pass_trigger if exists...\n"
DROP TRIGGER IF EXISTS prev_pass_trig ON users CASCADE;

\echo "Creating prev_pass_trigger...\n"
CREATE  TRIGGER prev_pass_trig 
    AFTER UPDATE OR INSERT
    ON users
    FOR EACH ROW EXECUTE PROCEDURE prev_pass_procedure();