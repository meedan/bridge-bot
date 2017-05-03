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

* Deploy your changes: `npm run update`

* Open Viber on your mobile device, join Bridge chat at http://chats.viber.com/meedanbridge and send a message to the bot

* You should receive a response

### Localization

As usual, localization is done on [Transifex](https://www.transifex.com/meedan/check-2/bridge-viber-bot/). You must have the `tx` client [installed](http://docs.transifex.com/client/setup/) on your computer. You can send new strings to Transifex by running `npm run transifex:upload` (first add them manually to `locales/en.yml`) and you can download translations from Transifex by running `npm run transifex:download`. For languages not supported by our project on Transifex, you can run `GOOGLE_TRANSLATE_API_KEY=your_key npm run translate:auto`.
