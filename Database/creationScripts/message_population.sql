\echo 'Deleting messages table data...\n'
DELETE FROM messages;
\echo

\echo 'Inserting default messages...\n'

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
\echo