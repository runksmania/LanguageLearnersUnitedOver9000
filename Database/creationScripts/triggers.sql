/* LLUO Project Database Default Trigger Creation File
   Last modified: 10/8/2020
   Author: Michael Cottrell & Riley Tucker
*/

CREATE OR REPLACE FUNCTION prev_pass_procedure()
    RETURNS TRIGGER AS $prev_pass_procedure$
    BEGIN
        INSERT INTO user_prev_pass
        VALUES
        (NEW.user_num, NEW.pass);
        RETURN NEW;
    END;
$prev_pass_procedure$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prev_pass_trig ON users CASCADE;

CREATE  TRIGGER prev_pass_trig 
    AFTER UPDATE OR INSERT
    ON users
    FOR EACH ROW EXECUTE PROCEDURE prev_pass_procedure();