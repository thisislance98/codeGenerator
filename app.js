
var evaluate = require('./evaluate');

evaluate('what is the date?').then ( function (date) {
  console.log('got the time: ' + date);
});