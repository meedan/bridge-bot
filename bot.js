var botBuilder = require('claudia-bot-builder');
var config = require('./config.js');
var Lokka = require('lokka').Lokka;
var Transport = require('lokka-transport-http').Transport;
var header = require('basic-auth-header');

var handleErrors = function(errors, data) {
  var message = errors[0].message;
  console.log(message);
}

var headers = {
  'X-Check-Token': config.checkApi.apiKey
};
if (config.checkApi.httpAuth) {
  var credentials = config.checkApi.httpAuth.split(':');
  var basic = header(credentials[0], credentials[1]);
  headers['Authorization'] = basic;
}

var client = new Lokka({ transport: new Transport(config.checkApi.url, { handleErrors, headers, credentials: false } ) });

const mutationQuery = `($quote: String!, $pid: Int!) {
  createProjectMedia: createProjectMedia(input: { clientMutationId: "1", project_id: $pid, quote: $quote, url: "" }) {
    project_media {
      dbid
    }
  }
}`;

module.exports = botBuilder(function(request) {
  const vars = {
    quote: request.text,
    pid: config.checkApi.projectId
  };
  
  client.mutate(mutationQuery, vars).then(resp => {
    console.log('ProjectMedia created with id ' + resp.createProjectMedia.project_media.dbid);
  });

  return 'Thank you. We have received your request for translation. You will receive a response shortly.';
});
