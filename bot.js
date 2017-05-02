var botBuilder = require('claudia-bot-builder');
var config = require('./config.js');
var Lokka = require('lokka').Lokka;
var Transport = require('lokka-transport-http').Transport;
var header = require('basic-auth-header');
var util = require('util');

module.exports = botBuilder(function(request) {
  try {
    var handleErrors = function(errors, data) {
      var message = errors[0].message;
      console.log('ERROR: ' + message);
    };
    
    var headers = {
      'X-Check-Token': config.checkApi.apiKey
    };

    if (config.checkApi.httpAuth) {
      var credentials = config.checkApi.httpAuth.split(':');
      var basic = header(credentials[0], credentials[1]);
      headers['Authorization'] = basic;
    }
    
    const client = new Lokka({ transport: new Transport(config.checkApi.url, { handleErrors, headers, credentials: false } ) });
    
    const mutationQuery = `($quote: String!, $pid: Int!, $annotation: String!, $mid: String!) {
      createProjectMedia: createProjectMedia(input: { clientMutationId: $mid, project_id: $pid, quote: $quote, url: "", set_annotation: $annotation }) {
        project_media {
          dbid
        }
      }
    }`;

    const annotation = {
      annotation_type: 'translation_request',
      set_fields: JSON.stringify({
        translation_request_type: 'viber',
        translation_request_raw_data: JSON.stringify(request)
      })
    };

    const vars = {
      quote: request.text,
      pid: config.checkApi.projectId,
      annotation: JSON.stringify(annotation),
      mid: parseInt(Math.random() * 10000, 10).toString()
    };
    
    client.mutate(mutationQuery, vars).then(resp => {
      console.log('DEBUG: Text "' + request.text + '" sent to the API, which replied with: ' + util.inspect(resp));
    });

    return 'Thank you. We have received your request for translation. You will receive a response shortly.';
  }
  catch (e) {
    console.log('EXCEPTION: ' + e.message);
    return 'Sorry, something went wrong. Please contact the support.';
  }
});
