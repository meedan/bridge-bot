var botBuilder = require('claudia-bot-builder');
var messageHandler = require('./messageHandler.js');

module.exports = botBuilder(messageHandler);
