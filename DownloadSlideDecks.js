var fs = require("fs");
var tweet = require("./tweet");
var oow2017Filename = 'oow2017-sessions-catalog.json';
var javaone2017Filename = 'javaone2017-sessions-catalog.json';
const download = require('download');
var sessionsDowloadedFileName = "sessionsSlideDownloaded.json";
// global array to hold all session data returned to us
var sessions = [];
var sessionsSlidesDownloaded = {};


// convenience function to delay execution in a Promise style way (see https://medium.com/oracledevs/sequential-asynchronous-calls-in-node-js-using-callbacks-async-and-es6-promises-e92cc849de46) 
function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t)
    });
}

function downloadSessionSlides() {
    var ctr = 0;
    sessions = [];
    sessions = JSON.parse(fs.readFileSync(oow2017Filename).toString());
    handleNewSessions(sessions);
    sessions = JSON.parse(fs.readFileSync(javaone2017Filename).toString());
    handleNewSessions(sessions);
    setTimeout(downloadSessionSlides, 20 * 60 * 1000);
}

function handleNewSessions(sessions) {
    // traverse sessions
    var sessionCtr = 0;
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].files && sessions[i].files.length > 0) {
            console.log("Session #" + sessions[i].code + " :" + sessions[i].title);
            console.log("Found a file: " + sessions[i].files[0].filename);
            console.log("file URL: " + sessions[i].files[0].url);

            // for any session that has a file recorded against it
            // check if that session has been downloaded 
            if (!sessionsSlidesDownloaded[sessions[i].code]) {
                var url = encodeURI(sessions[i].files[0].url);
                var localFileName = `${sessions[i].code} - ${sessions[i].title}
                    ${sessions[i].files[0].url.substring(sessions[i].files[0].url.length - 5)}`;
                setTimeout(getDownloader(url, localFileName.replace(/\s/g,'')), sessionCtr++ * (60 * 1000));
            }//if
            // - update the sessions cache
            sessionsSlidesDownloaded[sessions[i].code] = { "url": sessions[i].files[0].url };
        }//if files
    }//for
    // - write file with session entries
    fs.writeFile(sessionsDowloadedFileName, JSON.stringify(sessionsSlidesDownloaded, null, '\t'));
}

function getDownloader(url, filename) {
    console.log('I will download slides ' + url + ' in a little while; then save as '+filename+".");
    return function () {
        console.log("*** Download : " + url);
        download(url).then(data => {
            fs.writeFileSync('slides/' + filename, data);
            console.log('-----------++++++++++ Done Downloading '+filename)
        })
    }
}



sessionsSlidesDownloaded = JSON.parse(fs.readFileSync(sessionsDowloadedFileName).toString());
downloadSessionSlides();