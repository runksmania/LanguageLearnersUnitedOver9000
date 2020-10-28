module.exports = class User {
    constructor(id, username, name, email, accessToken, langPref) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.email = email;
        this.accessToken = accessToken;
        this.resetPass = false;
        this.langPref = langPref;
    }
}