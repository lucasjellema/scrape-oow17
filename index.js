var request = require("request");
var fs = require("fs");
// this options object is constructed based on the network calls the web application at https://events.rainfocus.com/catalog/oracle/oow17/catalogoow17 is making to its backend API
var options = {
  method: 'POST',
  url: 'https://events.rainfocus.com/api/search',
  headers:
  {
    'cache-control': 'no-cache',
    'content-type': 'application/x-www-form-urlencoded'
  },
  form:
  {
    showMyInterest: 'false',
    size: '500',
    search: '',
    showEnrolled: 'false',
    type: 'session',
    rfWidgetId: 'NVQmYf90S4Dn2gZBDCIVYksWMc6ORlQ9',
    rfApiProfileId: 'lwEkJf6GCYTu72vvGPhIOtMGDYl3xTeT'
  }
};

// delay between requests
var requestdelay = 500;
var oow2017Filename = 'oow2017-sessions-catalog.json';
// global array to hold all session data returned to us
var sessions = [];

function getSessionData(search) {
  var callOptions = options;
  callOptions.form.search = search;
  request(callOptions, function (error, response, body) {
    if (error) throw new Error(error);
    var results = JSON.parse(body);
    sessions = sessions.concat(results.sectionList[0].items);
    //return (results.sectionList && results.sectionList[0].numItems > 0) ? results.sectionList[0].items : [];
  });
}

// convenience function to delay execution in a Promise style way (see https://medium.com/oracledevs/sequential-asynchronous-calls-in-node-js-using-callbacks-async-and-es6-promises-e92cc849de46) 
function delay(t) {
  return new Promise(function (resolve) {
    setTimeout(resolve, t)
  });
}
// the function to call to have the data fetched after some suitable delay for the appropriate call context
var delayedGetSessionData = function (ctr, type, firstDigit) {
  getSessionData(type + firstDigit)
}

// loop over SUN, CON, TUT, GEN, BOF, HOL, SIG for session type
// loop over 1..9 for session id
var sessionTypes = ['SUN', 'CON', 'TUT', 'GEN', 'BOF', 'HOL', 'SIG'];
var ctr = 0;
for (sessionType of sessionTypes) {
  for (var i = 1; i < 9; i++)
    // delay each request with requestdelay milisecs compared to its predecessor, in order to not overflow the backend server
    delay(requestdelay * ctr++).then(delayedGetSessionData(ctr, sessionType, i));
}

//when all requests have been made and all responses have been received
//the sessions variable is loaded with all details for all sessions
//and we can serialize it to file
//allow an arbitrary 2.5 seconds for the final request to complete 
delay(2500 + requestdelay * ctr++).then(function () {
  fs.writeFile(oow2017Filename, JSON.stringify(sessions, null, '\t'));
  console.log("Written file "+oow2017Filename);
}) 
