var messageHandler = require('./messageHandler.js');

var request = {
  text: 'Mocked text message',
  originalRequest: {
    message_token: '123456',
    sender: {
      language: 'pt'
    },
    message: {
      type: 'sticker'
    }
  }
}

console.log(messageHandler(request));
