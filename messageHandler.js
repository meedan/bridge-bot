var config = require('./config.js');
var Lokka = require('lokka').Lokka;
var Transport = require('lokka-transport-http').Transport;
var header = require('basic-auth-header');
var util = require('util');
var i18n = require('i18n');

module.exports = function(request) {
  var errorMessage;

  try {
    console.log('DEBUG: Received request: ' + util.inspect(request));

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

    const transport = new Transport(config.checkApi.url, { handleErrors, headers, credentials: false, timeout: 120000 });
    const client = new Lokka({ transport });

    const projectQuery = `
      query project($ids: String!) {
        project(ids: $ids) {
          get_languages
        }
      }
    `;

    var projectLanguages = false;

    var formatMessage = function(phrase, locales) {
      var message = [];
      for (var i = 0; i < locales.length; i++) {
        var locale = locales[i];
        message.push(i18n.__({ phrase, locale }));
      }
      return message;
    }
  
    var messageCallback = function() {
      var locales;

      if (projectLanguages) {
        locales = projectLanguages;
      }
      else {
        try {
          locales = [request.originalRequest.sender.language];
        }
        catch(e) {
          locales = ['en'];
        }
      }

      i18n.configure({
        locales,
        directory: __dirname + '/locales',
        defaultLocale: locales[0],
        extension: '.json'
      });

      i18n.setLocale(locales[0]);

      errorMessage = formatMessage('Sorry, something went wrong. Please contact the support.', locales);

      var messageType = request.originalRequest.message.type;
      if (messageType != 'text') {
        console.log('ERROR: Message type should be "text" but was "' + messageType + '"');
        return formatMessage('Sorry! Right now, Bridge only accepts translation requests in the form of text.', locales);
      }

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
        if (resp && resp.createProjectMedia && resp.createProjectMedia.project_media && resp.createProjectMedia.project_media.dbid) {
          return formatMessage('Thank you. We have received your request for translation. You will receive a response shortly.', locales);
        }
        else {
          return '';
        }
      })
      .catch((e) => {
        console.log('ERROR: Trying to send "' + request.text + '" to the API returned an error: ' + e.toString());
        return '';
      });
    }

    return client.query(projectQuery, { ids: config.checkApi.projectId + ',' + config.checkApi.teamId })
    .then((resp, errors) => {
      if (errors) {
        console.log('ERROR: ' + util.inspect(errors));
        return messageCallback();
      }
      console.log('DEBUG: Asked for project languages and the response was: ' + util.inspect(resp));
      if (resp && resp.project && resp.project.get_languages) {
        projectLanguages = JSON.parse(resp.project.get_languages);
        return messageCallback();
      }
      else {
        return messageCallback();
      }
    })
    .catch((e) => {
      console.log('ERROR: When trying to get project languages: ' + e.toString());
      return messageCallback();
    });
  }
  catch(e) {
    console.log('EXCEPTION: ' + e.message);
    return errorMessage;
  }
};
