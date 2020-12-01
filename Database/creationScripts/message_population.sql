\echo 'Deleting users table data...\n'
DELETE FROM users;
\echo

\echo 'Deleting user_languages table data...\n'
DELETE FROM user_languages;
\echo

\echo 'Inserting default messages...\n'
\echo

INSERT INTO messages
VALUES
(
    1,
    2,
    'Hello World'
);

INSERT INTO messages
VALUES
(
    2,
    1,
    E'No it\'s HELLO WORLD!'
);