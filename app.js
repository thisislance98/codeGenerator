
var evaluate = require('./evaluate');

evaluate('what is the date?', function (date) {
  console.log('got the time: ' + date);
});