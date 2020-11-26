/* LLUO Project Database Default languages Population File
   Last modified: 10/14/2020
   Author: Michael Cottrell & Riley Tucker
*/

\echo 'Populating Default languages...'
INSERT INTO languages
VALUES('Spanish'--, NOW() - INTERVAL '3 month'
);

INSERT INTO languages
VALUES('French'--, NOW() - INTERVAL '3 month'
);

INSERT INTO languages
VALUES('Italian'--, NOW()
);

INSERT INTO languages
VALUES('Irish'--, NOW()
);
\echo

\echo 'Populating default facts_pages....'
INSERT INTO facts_pages
VALUES(
   'Spanish',
   'Spanish_language',
   'Spain',
   'Culture_of_Spain'
);

INSERT INTO facts_pages
VALUES(
   'French',
   'French_language',
   'France',
   'Culture_of_France'
);

INSERT INTO facts_pages
VALUES(
   'Italian',
   'Italian_language',
   'Italy',
   'Culture_of_Italy'
);

INSERT INTO facts_pages
VALUES(
   'Irish',
   'Irish_language',
   'Ireland',
   'Culture_of_Ireland'
);