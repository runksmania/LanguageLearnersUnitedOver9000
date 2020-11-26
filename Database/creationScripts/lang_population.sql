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

\echo 'Populating default facts_links....'
INSERT INTO facts_links
VALUES(
   'Spanish',
   'https://en.wikipedia.org/wiki/Spanish_language',
   'https://en.wikipedia.org/wiki/Spain',
   'https://en.wikipedia.org/wiki/Culture_of_Spain'
);

INSERT INTO facts_links
VALUES(
   'French',
   'https://en.wikipedia.org/wiki/French_language',
   'https://en.wikipedia.org/wiki/France',
   'https://en.wikipedia.org/wiki/Culture_of_France'
);

INSERT INTO facts_links
VALUES(
   'Italian',
   'https://en.wikipedia.org/wiki/Italian_language',
   'https://en.wikipedia.org/wiki/Italy',
   'https://en.wikipedia.org/wiki/Culture_of_Italy'
);

INSERT INTO facts_links
VALUES(
   'Irish',
   'https://en.wikipedia.org/wiki/Irish_language',
   'https://en.wikipedia.org/wiki/Ireland',
   'https://en.wikipedia.org/wiki/Culture_of_Ireland'
);