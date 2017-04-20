## Bridge Bot

A bot for Bridge using [Claudia Bot Builder](https://github.com/claudiajs/claudia-bot-builder).

### Installation / hacking / usage

* Save a credentials file at `~/.aws/credentials` with the following contents:

```
[claudia]
aws_access_key_id=<id>
aws_secret_access_key=<key>
```

You can ask a Meedani for a credentials file.

* Install `claudia` globally: `$ npm install claudia -g`

* Copy `config.js.example` to `config.js` and set your configurations

* Make some change in the code (`bot.js` is the main file)

* Deploy your changes: `$ AWS_PROFILE=claudia claudia update`

* Open Viber on your mobile device, join Bridge chat at http://chats.viber.com/meedanbridge and send a message to the bot

* You should receive a response
