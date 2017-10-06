var fs = require("fs");
var tweet = require("./tweet");
var javaone2017Filename = 'javaone2017-sessions-catalog.json';

var sessionsTweetedAboutFileName = "sessionsJ1TweetedAbout.json";
// global array to hold all session data returned to us
var sessions = [];
var sessionsTweetedAbout = {};


// convenience function to delay execution in a Promise style way (see https://medium.com/oracledevs/sequential-asynchronous-calls-in-node-js-using-callbacks-async-and-es6-promises-e92cc849de46) 
function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t)
    });
}

function pollSessions() {
    var ctr = 0;
    sessions = [];
    sessions = JSON.parse(fs.readFileSync(javaone2017Filename).toString());
    handleNewSessions(sessions);
    setTimeout(pollSessions, 20 * 60 * 1000);
}

function handleNewSessions(sessions) {
    // traverse sessions
    var tweetCtr = 0;
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].files && sessions[i].files.length > 0) {
            console.log("Session #" + sessions[i].code + " :" + sessions[i].title);
            console.log("Found a file: " + sessions[i].files[0].filename);
            console.log("file URL: " + sessions[i].files[0].url);

            // for any session that has a file recorded against it
            // check if that session has been tweeted about before
            if (!sessionsTweetedAbout[sessions[i].code]) {
                // if not: 
                // - tweet
                var url = encodeURI(sessions[i].files[0].url);
                var tweetMsg =  "Slides #" 
                + sessions[i].code + " : "
                    + url + " #javaone ";
                var tweetMsg = tweetMsg.concat(sessions[i].title);
                // tweet with URL can be 117 characters long in addition to the URL itself
                var tweetMsg = tweetMsg.substr(0, 117 + url.length);
                tweetCtr++;
                setTimeout(getMessenger(tweetMsg), tweetCtr * (55 + Math.floor(Math.random() * 165)) *1000);
            }//if
            // - update the sessions cache
            sessionsTweetedAbout[sessions[i].code] = { "url": sessions[i].files[0].url };
        }//if files
    }//for
    // - write file with session entries
    fs.writeFile(sessionsTweetedAboutFileName, JSON.stringify(sessionsTweetedAbout, null, '\t'));
}

function getMessenger(message) {
    console.log('I will post tweet ' + message + ' in a little while');
    return function () {
        console.log("Tweet: " + message);
        tweet.postMessage(message);
    }
}



sessionsTweetedAbout = JSON.parse(fs.readFileSync(sessionsTweetedAboutFileName).toString());
pollSessions();