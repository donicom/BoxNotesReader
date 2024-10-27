/**
 * Original code by https://www.christianengvall.se/
 */


const path = require("path")
const electron = require('electron')
const fs = require('fs');
const extension = '.json'
const location = 'assets/translations'
let loadedLanguage;
let app = electron.app ? electron.app : electron.remote.app

module.exports = i18n;

function i18n() {
    let transFileName = 'en' + extension

    if(fs.existsSync(path.join(__dirname, location, app.getLocale() + extension))) {
        transFileName = app.getLocale() + extension
    }
    loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, location, transFileName), 'utf8'))
}

i18n.prototype.__ = function(phrase) {
    let translation = loadedLanguage[phrase]
    if(translation === undefined) {
         translation = phrase
    }
    return translation
}