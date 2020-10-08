const wiki = require('wikijs').default

wiki()
    .page('France')
    .then(page => page.content())
    .then(x => console.log(x[1].items[0]));