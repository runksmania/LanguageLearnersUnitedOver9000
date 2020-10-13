/* LLUO Project Database Default Trigger Creation File
   Last modified: 10/13/2020
   Author: Michael Cottrell & Riley Tucker
*/

\echo "Creating function prev_pass_procedure..."
CREATE OR REPLACE FUNCTION prev_pass_procedure()
    RETURNS TRIGGER AS $prev_pass_procedure$
    BEGIN
        INSERT INTO user_prev_pass
        VALUES
        (NEW.user_num, NEW.pass);
        RETURN NEW;
    END;
$prev_pass_procedure$ LANGUAGE plpgsql;
\echo

\echo "Dropping prev_pass_trigger if exists..."
DROP TRIGGER IF EXISTS prev_pass_trig ON languages CASCADE;
\echo

\echo "Creating prev_pass_trigger..."
CREATE  TRIGGER prev_pass_trig 
    AFTER UPDATE OR INSERT
    ON users
    FOR EACH ROW EXECUTE PROCEDURE prev_pass_procedure();
\echo

\echo "Creating function create_lang_tbl_procedure..."
CREATE OR REPLACE FUNCTION create_lang_tble_procedure()
    RETURNS TRIGGER AS $create_lang_tble_procedure$
    BEGIN
        EXECUTE format('
        CREATE TABLE  IF NOT EXISTS %I
        (
            rank_num  VARCHAR(5),
            word      VARCHAR(120),
            eng_word  VARCHAR(120),
            PRIMARY KEY   (rank_num)
        )', 'words_' || LOWER(NEW.lang_name));
        RETURN NEW;
    END;
$create_lang_tble_procedure$ LANGUAGE plpgsql;
\echo

\echo "Dropping create_lang_tbl_trigger if exists..."
DROP TRIGGER IF EXISTS create_lang_tbl_trig ON languages CASCADE;
\echo

\echo "Creating create_lang_tbl_trig..."
CREATE  TRIGGER create_lang_tbl_trig 
    AFTER INSERT
    ON languages
    FOR EACH ROW EXECUTE PROCEDURE create_lang_tble_procedure();
\echo