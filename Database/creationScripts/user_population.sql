/* LLUO Project Database Default User Population File
   Last modified: 10/8/2020
   Author: Michael Cottrell & Riley Tucker
*/

\echo 'Deleting users table data...\n'
DELETE FROM users;
\echo

\echo 'Inserting default users...\n'
\echo
INSERT INTO users
VALUES
(57, 
'mcottrell',
'Michael',
'Cottrell',
'5b4ba79cc561a52b1483977135f93e6e498b8040',
'd4d2212f558c7b95c8078d617f4662f39d9768724463450c1aee103427f54feecc481df0f5536132777f713088c2151bb6784db371e447f41252c0d5f2374485',
'msc42@humboldt.edu',
'Italian',
1,
1,
Now()-- - INTERVAL '3 month'
);

INSERT INTO user_languages
VALUES
(
   57,
   'English'
);

INSERT INTO user_languages
VALUES
(
   57,
   'Italian'
);

INSERT INTO users
VALUES
(200, 
'rtucker',
'Riley',
'Tucker',
'186067f5f537d2cf7e57e0db4e515258861f7910',
'b514edbc0989d97b63f67e55bd10da6b94e28ddd9a076ce7d5cfbb9ff6709daadee7cc997b1cafce65222497015145ed8d5110c59bfe11e26b47065c2c7652b2',
'ret252@humboldt.edu',
'French',
1,
NULL,
Now()
);

INSERT INTO user_languages
VALUES
(
   280,
   'English'
);