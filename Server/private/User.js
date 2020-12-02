module.exports = class User {
    constructor(id, username, fname, lname, name, email, accessToken, langPref) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.lname = lname;
        this.fname = fname;
        this.email = email;
        this.accessToken = accessToken;
        this.resetPass = false;
        this.langPref = langPref;
    }
}