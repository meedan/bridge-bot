var botBuilder = require('claudia-bot-builder');
var config = require('./config.js');
var Lokka = require('lokka').Lokka;
var Transport = require('lokka-transport-http').Transport;
var header = require('basic-auth-header');
var util = require('util');
var i18n = require('i18n');

var errorMessage;

module.exports = botBuilder(function(request) {
  try {
    console.log('DEBUG: Received request: ' + util.inspect(request));

    var locale;
    try {
      locale = request.originalRequest.sender.language;
    }
    catch(e) {
      locale = 'en';
    }

    i18n.configure({
      locales: ['en', locale],
      directory: __dirname + '/locales',
      defaultLocale: locale,
      extension: '.json'
    });

    i18n.setLocale(locale);

    errorMessage = i18n.__('Sorry, something went wrong. Please contact the support.');

    var handleErrors = function(errors, data) {
      console.log('ERROR: ' + util.inspect(errors));
    };
    
    var headers = {
      'X-Check-Token': config.checkApi.apiKey
    };

    if (config.checkApi.httpAuth) {
      var credentials = config.checkApi.httpAuth.split(':');
      var basic = header(credentials[0], credentials[1]);
      headers['Authorization'] = basic;
    }
    
    const client = new Lokka({ transport: new Transport(config.checkApi.url, { handleErrors, headers, credentials: false, timeout: 120000 } ) });
    
    const mutationQuery = `($quote: String!, $pid: Int!, $annotation: String!) {
      createProjectMedia: createProjectMedia(input: { clientMutationId: "1", project_id: $pid, quote: $quote, url: "", set_annotation: $annotation }) {
        project_media {
          dbid
        }
      }
    }`;

    const annotation = {
      annotation_type: 'translation_request',
      set_fields: JSON.stringify({
        translation_request_type: 'viber',
        translation_request_id: request.originalRequest['message_token'],
        translation_request_raw_data: JSON.stringify(request)
      })
    };

    const vars = {
      quote: request.text,
      pid: config.checkApi.projectId,
      annotation: JSON.stringify(annotation)
    };
    
    console.log('DEBUG: Sending "' + request.text + '" to the server');
    return client.mutate(mutationQuery, vars)
    .then((resp, errors) => {
      if (errors) {
        console.log('ERROR: ' + util.inspect(errors));
        return '';
      }
      console.log('DEBUG: Text "' + request.text + '" sent to the API, which replied with: ' + util.inspect(resp));
      return i18n.__('Thank you. We have received your request for translation. You will receive a response shortly.');
    })
    .catch((e) => {
      console.log('ERROR: Trying to send "' + request.text + '" to the API returned an error: ' + e.toString());
      return '';
    });
  }
  catch(e) {
    console.log('EXCEPTION: ' + e.message);
    return errorMessage;
  }
});
