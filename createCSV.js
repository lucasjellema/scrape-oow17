var fs = require("fs");
var j12017Filename = 'javaone2017-sessions-catalog.json';

// https://technology.amis.nl/2017/02/09/nodejs-reading-and-processing-a-delimiter-separated-file-csv/

// load JSON file
var sessions  = JSON.parse(fs.readFileSync(`./${j12017Filename}`, 'utf8'));

console.log(`Number of JavaOne Sessions ${sessions.length} `);

// open a new file with j1sessions in csv format
// containing  session title, session abstract, first speaker, track, session type, ExperienceLevel

fs.appendFileSync('j1sessions.csv','session_id;session_title;first_speaker;track;session_type;experience_Level;session_abstract\n');

// iterate over all sessions

for (var i=0;i<sessions.length;i++) {
    var s= sessions[i];
    // search through s.attributevalues, find the first one with attribute_id == Tracks and take the value
    var track ="";
    var sessionType ="";
    var experienceLevel ="";
    for (var j=0;j<s.attributevalues.length;j++) {
        if (s.attributevalues[j].attribute_id =="Tracks") {
            track = s.attributevalues[j].value;
            break;
        }
     }
     for (var j=0;j<s.attributevalues.length;j++) {
        if (s.attributevalues[j].attribute_id =="ExperienceLevel") {
            experienceLevel = s.attributevalues[j].value;
            break;
        }
     }
     for (var j=0;j<s.attributevalues.length;j++) {
        if (s.attributevalues[j].attribute_id =="SessionType") {
            sessionType = s.attributevalues[j].value;
            break;
        }
     }
var line = `${s.sessionID}xqy${s.title}xqy${s.abstract}xqy${s.participants[0].firstName} ${s.participants[0].lastName}xqy${track}xqy${sessionType}xqy${experienceLevel}xqy${s.abstract.replace(/\n/g,"")}\n`;
 line = line.replace(/;/g,',');
 line = line.replace(/xqy/g,';');

     fs.appendFileSync('j1sessions.csv', line);
    
}
