var botBuilder = require('claudia-bot-builder');

module.exports = botBuilder(function (request) {
  return 'Hey! Thanks for sending ' + request.text;
});
